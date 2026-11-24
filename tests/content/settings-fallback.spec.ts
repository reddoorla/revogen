import { test, expect } from "@playwright/test";

// P1-120 phase 3: every `settings` field falls back to the code's wording when
// it is empty (the operator's 2026-11-21 answer), and a filled field wins.
// /dev/settings-fixture hands the root layout a settings document with some
// fields empty and some filled (src/routes/dev/settings-fixture).

test("an empty settings field renders the code's wording; a filled one wins", async ({ page }) => {
  await page.goto("/dev/settings-fixture");
  const footer = page.locator("footer");

  // Empty footer_tagline: the code's tagline.
  await expect(footer.locator("h4")).toHaveText("Revolutionizing Bioregeneration");

  // Filled copyright_name, address and footer_links: the fixture's, not the code's.
  await expect(footer).toContainText("Fixture Biologics");
  await expect(footer).not.toContainText("RevoGen Biologics");
  await expect(footer).toContainText("1 Fixture Way");
  await expect(footer).not.toContainText("4903 Golden Quail");
  await expect(footer.locator('a[href="https://example.com/fixture"]')).toHaveText("fixture link");
  // A row with no label is skipped, and the code's links are gone.
  await expect(footer.locator('a[href="https://example.com/x"]')).toHaveCount(0);
  await expect(footer.locator('a[href="/about"]')).toHaveCount(0);
});

test("an empty menu group renders the code's menu", async ({ page }) => {
  await page.goto("/dev/settings-fixture");
  // The layout marks <html> once hydrated; a click before that does nothing.
  await expect(page.locator("html[data-hydrated]")).toBeAttached({ timeout: 20_000 });
  await page.getByRole("button", { name: "toggle menu" }).click();
  for (const label of ["About", "Surgical Grafts", "Allografts", "Ocular Grafts"]) {
    await expect(page.getByRole("heading", { name: label, exact: true })).toBeVisible();
  }
});
