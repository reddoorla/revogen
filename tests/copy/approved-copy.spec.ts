import { test, expect } from "@playwright/test";
import manifest from "./approved-copy.json" with { type: "json" };

// The client's approved lines, checked against what the built site renders.
// A line that drifts by one character (a dropped ™, a straight quote turned
// curly) fails here; a held line that reaches the page fails here too.

type Applied = {
  id: string;
  route: string;
  selector?: string;
  text?: string;
  contains?: string;
  absent?: string[];
  title?: string;
  mobile?: boolean;
  expectStatus?: number;
};

const norm = (s: string | null) => (s ?? "").replace(/\s+/g, " ").trim();

for (const row of manifest.applied as Applied[]) {
  test(`approved copy ${row.id} renders exactly`, async ({ page }) => {
    if (row.mobile) await page.setViewportSize({ width: 390, height: 844 });
    const res = await page.goto(row.route);
    expect(res?.status()).toBe(row.expectStatus ?? 200);
    if (row.title) await expect(page).toHaveTitle(row.title);
    if (!row.selector) return;
    const el = page.locator(row.selector).first();
    // The home cards render after the ~6.5 s intro animation on a first visit.
    await expect(el).toBeAttached({ timeout: 20_000 });
    const text = norm(await el.textContent());
    if (row.text) expect(text).toBe(row.text);
    if (row.contains) expect(text).toContain(row.contains);
    for (const bad of row.absent ?? []) expect(text).not.toContain(bad);
  });
}

test("held annotations have not reached the home page", async ({ page }) => {
  await page.goto("/");
  const body = norm(await page.locator("body").textContent());
  for (const row of manifest.held) {
    expect(body, `${row.id} (${row.source}) is held`).not.toContain(row.text);
  }
});
