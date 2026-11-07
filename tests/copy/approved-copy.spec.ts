import { test, expect, type Page } from "@playwright/test";
import manifest from "./approved-copy.json" with { type: "json" };

// The client's approved lines, checked against what the built site renders.
// A line that drifts by one character (a dropped ™, a straight quote turned
// curly) fails here; a held line that reaches a page fails here too.

type Applied = {
  id: string;
  route: string;
  selector?: string;
  attr?: string;
  text?: string;
  contains?: string;
  absent?: string[];
  title?: string;
  json?: Record<string, string>;
  mobile?: boolean;
  expectStatus?: number;
};

const norm = (s: string | null) => (s ?? "").replace(/\s+/g, " ").trim();

// The home category cards render their copy only below 768 px (or on hover),
// and only after the ~6.5 s intro animation on a first visit.
async function homeCardsReady(page: Page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("a[href='/surgical-grafts'] p").first()).toBeAttached({
    timeout: 20_000,
  });
}

for (const row of manifest.applied as Applied[]) {
  test(`approved copy ${row.id} renders exactly`, async ({ page, request }) => {
    if (row.json) {
      const res = await request.get(row.route);
      expect(res.status()).toBe(200);
      const body = JSON.parse(await res.text()) as Record<string, string>;
      for (const [k, v] of Object.entries(row.json)) expect(body[k]).toBe(v);
      return;
    }
    if (row.mobile) await page.setViewportSize({ width: 390, height: 844 });
    const res = await page.goto(row.route);
    expect(res?.status()).toBe(row.expectStatus ?? 200);
    if (row.title) await expect(page).toHaveTitle(row.title);
    if (!row.selector) return;
    const el = page.locator(row.selector).first();
    await expect(el).toBeAttached({ timeout: 20_000 });
    // Text checks keep the string as rendered: only the template's own
    // indentation around it is trimmed, never whitespace inside the line.
    const raw = row.attr ? await el.getAttribute(row.attr) : await el.textContent();
    const text = (raw ?? "").trim();
    if (row.text) expect(text).toBe(row.text);
    if (row.contains) expect(text).toContain(row.contains);
    for (const bad of row.absent ?? []) expect(text).not.toContain(bad);
  });
}

for (const route of manifest.heldRoutes) {
  test(`held annotations have not reached ${route}`, async ({ page }) => {
    if (route === "/") await homeCardsReady(page);
    else await page.goto(route);
    const body = norm(await page.locator("body").textContent()).toLowerCase();
    for (const row of manifest.held) {
      expect(body, `${row.id} (${row.source}) is held`).not.toContain(row.text.toLowerCase());
    }
  });
}
