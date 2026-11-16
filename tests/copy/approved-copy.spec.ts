import { test, expect, type Page } from "@playwright/test";

test.setTimeout(120_000);
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
  nth?: number;
  pattern?: string;
  opaque?: boolean;
  mobile?: boolean;
  expectStatus?: number;
  css?: Record<string, string>;
  count?: number;
};

// Held lines are matched loosely (case, whitespace, hyphens and dashes, curly or straight
// apostrophe), so a retyped held line is still caught. Applied lines are exact.
const fold = (s: string | null) =>
  (s ?? "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[-\u2010-\u2014]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

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
    // An element the page must no longer render (the hero wordmark, since 11-12).
    if (row.count !== undefined) {
      await expect(page.locator(row.selector)).toHaveCount(row.count);
      return;
    }
    const el = page.locator(row.selector).nth(row.nth ?? 0);
    await expect(el).toBeAttached({ timeout: 20_000 });
    // Text checks keep the string as rendered: only the template's own
    // indentation around it is trimmed, never whitespace inside the line.
    const raw = row.attr ? await el.getAttribute(row.attr) : await el.textContent();
    const text = (raw ?? "").trim();
    if (row.text) expect(text).toBe(row.text);
    if (row.pattern) expect(text).toMatch(new RegExp(row.pattern));
    // The hero fades in after the intro; a tagline stuck at opacity 0 fails.
    if (row.opaque) await expect(el).toHaveCSS("opacity", "1", { timeout: 20_000 });
    for (const [prop, value] of Object.entries(row.css ?? {}))
      await expect(el).toHaveCSS(prop, value);
    if (row.contains) expect(text).toContain(row.contains);
    for (const bad of row.absent ?? []) expect(text).not.toContain(bad);
  });
}

// Every page the sitemap lists, plus any listed by hand, so a page added
// later is covered without editing this file.
test("held annotations have not reached any page", async ({ page, request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const fromSitemap = [...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (m) => new URL(m[1]).pathname,
  );
  expect(fromSitemap.length, "sitemap lists pages").toBeGreaterThan(5);
  const routes = [...new Set([...manifest.heldRoutes, ...fromSitemap])];
  for (const route of routes) {
    if (route === "/") await homeCardsReady(page);
    else expect((await page.goto(route))?.status(), `${route} must exist`).toBe(200);
    // The visible text, plus the head a search result or a share card shows.
    const head = await page
      .locator("title, meta[name='description'], meta[property^='og:']")
      .evaluateAll((els) => els.map((e) => e.textContent || e.getAttribute("content") || ""));
    const body = fold([await page.locator("body").textContent(), ...head].join(" "));
    for (const row of manifest.held) {
      expect(body, `${row.id} (${row.source}) is held, found on ${route}`).not.toContain(
        fold(row.text),
      );
    }
  }
});
