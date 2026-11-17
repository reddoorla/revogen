import { test, expect, type Page } from "@playwright/test";

/**
 * The space between the two columns of every TwoCol slice. Erik (11-17) asked
 * for about 100px on laptop and desktop, sitewide; the `tableText` variant had
 * none at all (its text ran up to the spec table), and the media + text
 * variants had 80px. From `lg` (1024px) up every side-by-side TwoCol now has
 * 100px between its columns' content boxes. Tablet keeps what it had (0 for
 * `tableText`, 80 for the media + text variants) and phone stays stacked.
 *
 * The pages cover all three side-by-side variants, and two pages of
 * `tableText`, so a fix applied to one page instead of the slice fails a row.
 */
const PAGES = [
  "/surgical-grafts/allografts", // tableText (BioStruXure, Erik's screenshot)
  "/surgical-grafts/sports-medicine", // tableText
  "/about", // default
  "/wound-care", // imageTableText
];

type Measured = { variation: string; sideBySide: boolean; gap: number };

/** The gap between the two columns' content boxes (padding excluded), per TwoCol. */
async function measure(page: Page): Promise<Measured[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('section[data-slice-type="two_col"]')]
      .filter((s) => s.dataset.sliceVariation !== "contactForm")
      .map((s) => {
        const cols = [...(s.firstElementChild?.children ?? [])].filter(
          (c) => getComputedStyle(c).position !== "absolute",
        ) as HTMLElement[];
        const boxes = cols
          .map((c) => {
            const r = c.getBoundingClientRect();
            const cs = getComputedStyle(c);
            return {
              left: r.left + parseFloat(cs.paddingLeft),
              right: r.right - parseFloat(cs.paddingRight),
              top: r.top,
            };
          })
          .sort((a, b) => a.left - b.left);
        const [a, b] = boxes;
        const sideBySide =
          boxes.length === 2 && Math.abs(a.left - b.left) > 1 && Math.abs(a.top - b.top) < 100;
        return {
          variation: s.dataset.sliceVariation ?? "",
          sideBySide,
          gap: sideBySide ? Math.round(b.left - a.right) : 0,
        };
      }),
  );
}

for (const width of [1024, 1440, 1920]) {
  test(`TwoCol columns are ~100px apart at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of PAGES) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      const slices = await measure(page);
      expect(slices.length, `TwoCol slices on ${path}`).toBeGreaterThan(0);
      for (const [i, s] of slices.entries()) {
        expect(s.sideBySide, `${path} #${i} (${s.variation}) side by side`).toBe(true);
        expect(s.gap, `${path} #${i} (${s.variation}) gap at ${width}px`).toBeGreaterThanOrEqual(
          98,
        );
        expect(s.gap, `${path} #${i} (${s.variation}) gap at ${width}px`).toBeLessThanOrEqual(102);
      }
    }
  });
}

test("TwoCol at 768px keeps its tablet spacing", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  for (const path of PAGES) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    for (const [i, s] of (await measure(page)).entries()) {
      expect(s.sideBySide, `${path} #${i} side by side`).toBe(true);
      expect(s.gap, `${path} #${i} (${s.variation}) gap at 768px`).toBe(
        s.variation === "tableText" ? 0 : 80,
      );
    }
  }
});

test("TwoCol at 390px stays stacked", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of PAGES) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    for (const [i, s] of (await measure(page)).entries()) {
      expect(s.sideBySide, `${path} #${i} (${s.variation}) stacked at 390px`).toBe(false);
    }
  }
});
