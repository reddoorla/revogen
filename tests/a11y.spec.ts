import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Real-route accessibility gate.
 *
 * The `reddoor-maint audit --only a11y` check in CI only scans the synthetic
 * `/dev/a11y-fixtures` route, so it says nothing about real user-facing pages.
 * This spec closes that gap: it crawls the links reachable from the home page
 * and runs axe-core against each real route.
 *
 * Threshold: we fail on `serious` and `critical` violations and merely report
 * `moderate`/`minor` ones. This is an intentional ratchet — tighten it (drop to
 * include `moderate`, then all) as the real pages are cleaned up.
 *
 * KNOWN_BACKLOG: rules with a pre-existing, content-driven backlog that can't be
 * fixed in code alone (e.g. `image-alt` needs alt text authored per-image in
 * Prismic). These are reported loudly but don't block CI yet, so the gate stays
 * green for Renovate/auto-merge while the backlog is worked down. Remove a rule
 * from this set once its pages are clean to make it blocking. GOAL: empty set.
 */

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const FAIL_IMPACTS = new Set(["serious", "critical"]);
const KNOWN_BACKLOG = new Set(["image-alt"]);

// Always covered, even if the crawl misses them.
const SEED_ROUTES = ["/"];

/** Same-origin routes we never want to audit here. */
function isAuditable(path: string): boolean {
  if (!path.startsWith("/") || path.startsWith("//")) return false;
  if (path.startsWith("/dev/")) return false; // owned by the maintenance fixture audit
  if (path.startsWith("/slice-simulator")) return false;
  if (path.startsWith("/api/")) return false;
  return true;
}

/** Discover real routes by reading the links the home page actually renders. */
async function discoverRoutes(page: Page): Promise<string[]> {
  await page.goto("/", { waitUntil: "load" });
  await page.waitForSelector("main");
  const hrefs = await page.$$eval("a[href]", (anchors) =>
    anchors.map((a) => a.getAttribute("href") ?? ""),
  );
  const routes = new Set<string>(SEED_ROUTES);
  for (const href of hrefs) {
    const path = href.split(/[?#]/)[0];
    if (isAuditable(path)) routes.add(path);
  }
  return [...routes].sort();
}

test("no serious/critical axe-core violations on public routes", async ({ page }) => {
  // Emulate reduced motion: a realistic AT condition, and it lets the intro
  // animation settle immediately so axe sees a stable DOM.
  await page.emulateMedia({ reducedMotion: "reduce" });

  const routes = await discoverRoutes(page);
  expect(routes.length, "expected to discover at least the home route").toBeGreaterThan(0);

  const failures: string[] = [];

  for (const route of routes) {
    await test.step(`axe: ${route}`, async () => {
      await page.goto(route, { waitUntil: "load" });
      await page.waitForSelector("main").catch(() => {});

      const { violations } = await new AxeBuilder({ page })
        .withTags(WCAG_TAGS)
        // The Prismic preview toolbar is third-party and only present in dev;
        // its a11y is out of our control, so don't let it red the gate.
        .exclude("prismic-preview")
        .analyze();

      const blocking = violations.filter(
        (v) => FAIL_IMPACTS.has(v.impact ?? "") && !KNOWN_BACKLOG.has(v.id),
      );
      const advisory = violations.filter(
        (v) => !FAIL_IMPACTS.has(v.impact ?? "") || KNOWN_BACKLOG.has(v.id),
      );

      if (advisory.length) {
        console.log(
          `[a11y] ${route} — ${advisory.length} non-blocking (backlog/moderate/minor):\n` +
            advisory.map((v) => `    · [${v.impact}] ${v.id}: ${v.help}`).join("\n"),
        );
      }

      if (blocking.length) {
        failures.push(
          `\n${route} — ${blocking.length} serious/critical:\n` +
            blocking
              .map((v) => `    ✗ [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s))`)
              .join("\n"),
        );
      }
    });
  }

  expect(failures, `axe-core violations:\n${failures.join("\n")}`).toHaveLength(0);
});
