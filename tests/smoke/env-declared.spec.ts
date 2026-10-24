import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// Kit 3 exposes only the variables src/env.ts declares; a read of any other
// through $env/dynamic/* or $app/env/* is undefined even when Netlify sets it,
// and the build only warns. So every variable src/ reads from those modules
// must be declared there, and a computed-key read (env[name]) is refused
// because this check cannot see which variable it names.

const ENV_MODULE =
  /from\s+["'](\$env\/dynamic\/(?:public|private)|\$app\/env\/(?:public|private))["']/;

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|js|svelte)$/.test(entry)) out.push(full);
  }
  return out;
}

const declared = () => {
  const source = readFileSync("src/env.ts", "utf8");
  return new Set([...source.matchAll(/^\s{2}([A-Z][A-Z0-9_]*):\s*\{/gm)].map((m) => m[1]));
};

/** Each file that imports an env module: the names it binds, and what it reads through them. */
const reads = () =>
  walk("src")
    .filter((file) => file !== join("src", "env.ts"))
    .flatMap((file) => {
      const text = readFileSync(file, "utf8");
      if (!ENV_MODULE.test(text)) return [];
      const imported = [
        ...text.matchAll(
          /import\s*\{([^}]*)\}\s*from\s*["'](?:\$env\/dynamic|\$app\/env)\/(?:public|private)["']/g,
        ),
      ].flatMap((m) =>
        m[1]
          .split(",")
          .map((part) => part.trim().split(/\s+as\s+/))
          .filter((p) => p[0]),
      );
      // `import { FORMS_INGEST_URL } from "$app/env/private"` names the variable itself.
      const direct = imported
        .filter(([source]) => /^[A-Z][A-Z0-9_]*$/.test(source))
        .map(([source]) => ({ file, variable: source }));
      // `import * as env from "$app/env/private"`, the form this site uses.
      const namespaces = [
        ...text.matchAll(
          /import\s*\*\s*as\s+([\w$]+)\s+from\s*["'](?:\$env\/dynamic|\$app\/env)\/(?:public|private)["']/g,
        ),
      ].map((m) => m[1]);
      const bindings = [
        ...namespaces,
        ...imported
          .filter(([source]) => !/^[A-Z][A-Z0-9_]*$/.test(source))
          .map((parts) => parts[parts.length - 1]),
      ];
      return [
        ...direct,
        ...bindings.flatMap((name) => {
          const dotted = [
            ...text.matchAll(new RegExp(`(?<![.\\w$])${name}\\.([A-Z][A-Z0-9_]*)`, "g")),
          ].map((m) => ({ file, variable: m[1] }));
          const computed = [...text.matchAll(new RegExp(`(?<![.\\w$])${name}\\[`, "g"))].map(
            () => ({
              file,
              variable: `${name}[…]`,
            }),
          );
          return [...dotted, ...computed];
        }),
      ];
    });

test.describe("environment variables (kit 3)", () => {
  test("every variable src/ reads is declared in src/env.ts", () => {
    const names = declared();
    const all = reads();
    // The control: this site reads the form-ingest pair and the Turnstile key,
    // so a scan that found nothing has stopped seeing the reads.
    expect(all.length, "found no env reads in src/").toBeGreaterThanOrEqual(3);
    const missing = all.filter((r) => !names.has(r.variable));
    expect(missing, "read in src/ but not declared in src/env.ts").toEqual([]);
  });
});
