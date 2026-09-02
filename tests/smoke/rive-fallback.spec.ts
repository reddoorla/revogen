import { test, expect, type Page } from "@playwright/test";

/**
 * TwoCol Rive slices carry both a .riv and a product still. The still is a
 * fallback for when Rive fails to load — it must never be in the DOM while the
 * Rive canvas is live. The artboard is transparent outside its artwork, so
 * anything rendered behind the canvas shows straight through (PR #69 shipped
 * the still *behind* the canvas on the assumption that Rive would paint over
 * it; it didn't, and the still's own baked-in labels ghosted through every
 * product render).
 *
 * /ocular carries two Rive slices and is the smallest page that has any.
 */
const ROUTE = "/ocular";
/** The aspect-ratio box that wraps each Rive canvas (TwoCol/index.svelte). */
const RIVE_BOX = "div:has(> canvas)";

/** Resolve once every Rive canvas has a backing store and a painted pixel. */
async function waitForRivePaint(page: Page) {
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
    { timeout: 30_000, polling: 250 },
  );
}

test("Rive slices render the canvas alone — no fallback still behind it", async ({ page }) => {
  await page.goto(ROUTE, { waitUntil: "domcontentloaded" });
  await waitForRivePaint(page);

  const boxes = page.locator(RIVE_BOX);
  expect(await boxes.count(), "Rive slices on the page").toBeGreaterThan(0);
  for (const box of await boxes.all()) {
    await expect(
      box.locator("img"),
      "fallback still must not render alongside a live Rive",
    ).toHaveCount(0);
  }
});

test("Rive slices show the product still when the .riv fails to load", async ({ page }) => {
  // Abort only real .riv fetches. In dev, Vite also serves the intro
  // animation's static .riv as an ES module (`RevgroPutty.riv?import`);
  // aborting that breaks the page's client module and SvelteKit renders its
  // 500 page instead of the slice.
  await page.route(
    (url) => url.pathname.endsWith(".riv") && !url.searchParams.has("import"),
    (route) => route.abort(),
  );
  await page.goto(ROUTE, { waitUntil: "domcontentloaded" });

  const boxes = page.locator(RIVE_BOX);
  expect(await boxes.count(), "Rive slices on the page").toBeGreaterThan(0);
  for (const box of await boxes.all()) {
    await box.scrollIntoViewIfNeeded();
    await expect(box.locator("img"), "fallback still after Rive load error").toBeVisible();
  }
});
