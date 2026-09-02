// Pixel-level before/after check for any change that claims "no visual change".
// Screenshots a selector on a page from two builds and reports exactly how many
// pixels differ, writing a magenta diff image per element. No deps beyond
// @playwright/test (already a devDependency); diffing runs in-browser.
//
//   node scripts/pixel-diff.mjs serve <buildDir> <port>
//   node scripts/pixel-diff.mjs shoot <baseUrl> <path> <selector> <outDir> [--wait-canvas] [--hide <selector>]
//   node scripts/pixel-diff.mjs diff  <dirA> <dirB> <outDir>
//
// `serve` hosts an adapter-netlify `build/` statically. It stubs /_app/env.js
// (Netlify normally serves that from the function, so a plain static server
// breaks hydration) and maps clean URLs to their prerendered .html.
//
// Typical run — baseline is the commit BEFORE your change, built in a worktree:
//
//   git worktree add --detach /tmp/px-base <base-sha>
//   cp .env /tmp/px-base/ && (cd /tmp/px-base && pnpm install --frozen-lockfile && pnpm build)
//   pnpm build
//   node scripts/pixel-diff.mjs serve /tmp/px-base/build 4182 &
//   node scripts/pixel-diff.mjs serve build 4181 &
//   node scripts/pixel-diff.mjs shoot http://127.0.0.1:4182 /ocular "div:has(> canvas)" /tmp/px/base --wait-canvas
//   node scripts/pixel-diff.mjs shoot http://127.0.0.1:4181 /ocular "div:has(> canvas)" /tmp/px/head --wait-canvas
//   node scripts/pixel-diff.mjs diff /tmp/px/base /tmp/px/head /tmp/px/diff
//   git worktree remove --force /tmp/px-base
//
// Read the numbers, not the vibe: `changed=0` is the only "identical". Shoot the
// same build twice first to learn the animation noise floor for that element
// (a subtly animating Rive shows a few % of pixels at maxDelta ≤ ~10).
import { chromium } from "@playwright/test";
import { createServer } from "node:http";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";

const [, , cmd, ...rest] = process.argv;

function serve() {
  const [dir, portArg] = rest;
  const port = Number(portArg ?? 4173);
  const MIME = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript",
    ".mjs": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".webp": "image/webp",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
    ".wasm": "application/wasm",
    ".riv": "application/octet-stream",
    ".xml": "application/xml",
    ".txt": "text/plain",
    ".webmanifest": "application/manifest+json",
  };
  createServer((req, res) => {
    const p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p === "/_app/env.js") {
      res.writeHead(200, { "content-type": "text/javascript" });
      return res.end("export const env = {};\n");
    }
    const hit = [p, p + ".html", join(p, "index.html")]
      .map((c) => join(dir, c))
      .find((c) => existsSync(c) && statSync(c).isFile());
    if (!hit) {
      res.writeHead(404, { "content-type": "text/plain" });
      return res.end("not found");
    }
    res.writeHead(200, {
      "content-type": MIME[extname(hit)] ?? "application/octet-stream",
      "cache-control": "no-store",
    });
    res.end(readFileSync(hit));
  }).listen(port, "127.0.0.1", () => console.log(`serving ${dir} on http://127.0.0.1:${port}`));
}

/** Resolve once every canvas has a backing store and at least one painted pixel. */
async function waitForCanvasPaint(page, timeout = 30_000) {
  await page.waitForFunction(
    () => {
      const canvases = [...document.querySelectorAll("canvas")];
      if (canvases.length === 0) return false;
      return canvases.every((c) => {
        if (c.width === 0 || c.height === 0) return false;
        const ctx = c.getContext("2d");
        if (!ctx) return false;
        const { data } = ctx.getImageData(0, 0, c.width, c.height);
        for (let i = 3; i < data.length; i += 4) if (data[i] !== 0) return true;
        return false;
      });
    },
    undefined,
    { timeout, polling: 250 },
  );
}

async function shoot() {
  const [baseUrl, pagePath, selector, outDir] = rest;
  const waitCanvas = rest.includes("--wait-canvas");
  const hideIdx = rest.indexOf("--hide");
  const hide = hideIdx >= 0 ? rest[hideIdx + 1] : null;
  mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
  });
  await page.goto(baseUrl + pagePath, { waitUntil: "load" });
  // Walk the page so lazy images and scroll reveals fire, then come back up.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  if (waitCanvas) await waitForCanvasPaint(page);
  await page.evaluate(() =>
    Promise.all(
      [...document.images]
        .filter((i) => !i.complete)
        .map(
          (i) =>
            new Promise((r) => {
              i.onload = i.onerror = r;
            }),
        ),
    ),
  );
  if (hide) await page.addStyleTag({ content: `${hide} { visibility: hidden !important; }` });
  await page.waitForTimeout(1500); // let any intro state settle

  const targets = page.locator(selector);
  const n = await targets.count();
  const meta = [];
  for (let i = 0; i < n; i++) {
    const el = targets.nth(i);
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const file = join(outDir, `el-${i}.png`);
    await el.screenshot({ path: file, animations: "disabled" });
    const box = await el.boundingBox();
    meta.push({ i, file, box });
  }
  writeFileSync(join(outDir, "meta.json"), JSON.stringify(meta, null, 2));
  console.log(
    `shot ${n} × "${selector}" on ${pagePath} → ${outDir}${hide ? ` (hid ${hide})` : ""}`,
  );
  for (const m of meta)
    console.log(`  el-${m.i}: ${Math.round(m.box.width)}×${Math.round(m.box.height)}`);
  await browser.close();
}

async function diff() {
  const [dirA, dirB, outDir] = rest;
  mkdirSync(outDir, { recursive: true });
  const files = readdirSync(dirA)
    .filter((f) => f.endsWith(".png"))
    .sort();
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent("<canvas id=a></canvas><canvas id=b></canvas><canvas id=d></canvas>");
  const results = [];
  for (const f of files) {
    if (!existsSync(join(dirB, f))) {
      results.push({ file: f, error: "missing in B" });
      continue;
    }
    const a = readFileSync(join(dirA, f)).toString("base64");
    const b = readFileSync(join(dirB, f)).toString("base64");
    const r = await page.evaluate(
      async ([a, b]) => {
        const load = (src) =>
          new Promise((res, rej) => {
            const i = new Image();
            i.onload = () => res(i);
            i.onerror = rej;
            i.src = "data:image/png;base64," + src;
          });
        const [ia, ib] = await Promise.all([load(a), load(b)]);
        if (ia.width !== ib.width || ia.height !== ib.height)
          return { sizeMismatch: `${ia.width}×${ia.height} vs ${ib.width}×${ib.height}` };
        const w = ia.width,
          h = ia.height;
        const ctxOf = (id, img) => {
          const c = document.getElementById(id);
          c.width = w;
          c.height = h;
          const x = c.getContext("2d");
          if (img) x.drawImage(img, 0, 0);
          return x;
        };
        const da = ctxOf("a", ia).getImageData(0, 0, w, h).data;
        const db = ctxOf("b", ib).getImageData(0, 0, w, h).data;
        const xd = ctxOf("d", null);
        const out = xd.createImageData(w, h);
        let changed = 0,
          maxDelta = 0;
        for (let i = 0; i < da.length; i += 4) {
          const delta = Math.max(
            Math.abs(da[i] - db[i]),
            Math.abs(da[i + 1] - db[i + 1]),
            Math.abs(da[i + 2] - db[i + 2]),
          );
          if (delta > 0) {
            changed++;
            if (delta > maxDelta) maxDelta = delta;
            out.data[i] = 255;
            out.data[i + 1] = 0;
            out.data[i + 2] = 200;
          } else {
            const g = Math.round(
              (da[i] * 0.299 + da[i + 1] * 0.587 + da[i + 2] * 0.114) * 0.35 + 150,
            );
            out.data[i] = out.data[i + 1] = out.data[i + 2] = g;
          }
          out.data[i + 3] = 255;
        }
        xd.putImageData(out, 0, 0);
        return {
          w,
          h,
          changed,
          total: w * h,
          maxDelta,
          png: document.getElementById("d").toDataURL().split(",")[1],
        };
      },
      [a, b],
    );
    if (r.png) {
      writeFileSync(join(outDir, f.replace(/\.png$/, ".diff.png")), Buffer.from(r.png, "base64"));
      delete r.png;
    }
    results.push({ file: f, ...r });
  }
  await browser.close();
  writeFileSync(join(outDir, "diff.json"), JSON.stringify(results, null, 2));
  let worst = 0;
  for (const r of results) {
    if (r.error || r.sizeMismatch) {
      console.log(`${r.file}: ${r.error ?? "size mismatch " + r.sizeMismatch}`);
      worst = Infinity;
      continue;
    }
    worst = Math.max(worst, r.changed);
    const pct = ((100 * r.changed) / r.total).toFixed(3);
    console.log(
      `${r.file}: ${r.w}×${r.h} changed=${r.changed}/${r.total} (${pct}%) maxDelta=${r.maxDelta}`,
    );
  }
  process.exitCode = worst === 0 ? 0 : 1;
}

if (cmd === "serve") serve();
else if (cmd === "shoot") await shoot();
else if (cmd === "diff") await diff();
else {
  console.error(
    "usage: serve <buildDir> <port> | shoot <baseUrl> <path> <selector> <outDir> [--wait-canvas] [--hide <sel>] | diff <dirA> <dirB> <outDir>",
  );
  process.exit(2);
}
