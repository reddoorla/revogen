import { test, expect, type Page } from "@playwright/test";

// P1-120 phase 3: a `settings` field the page reads falls back to the code's
// wording when it is empty (the operator's 2026-11-21 answer), and a filled
// field wins. /dev/settings-fixture hands the root layout a settings document
// (src/routes/dev/settings-fixture); `?filled` fills the tagline and the menu.
// Covered here: footer tagline, copyright name, address, footer links and nav
// items. The rest share the same `field || "literal"` shape.

async function openMenu(page: Page) {
  // The layout marks <html> once hydrated; a click before that does nothing.
  await expect(page.locator("html[data-hydrated]")).toBeAttached({ timeout: 20_000 });
  await page.getByRole("button", { name: "toggle menu" }).click();
}

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
  // A row with no label, or no link, is skipped; the code's links are gone.
  await expect(footer.locator('a[href="https://example.com/x"]')).toHaveCount(0);
  await expect(footer.getByText("no link")).toHaveCount(0);
  await expect(footer.locator('a[href=""]')).toHaveCount(0);
  await expect(footer.locator('a[href="/about"]')).toHaveCount(0);
});

test("filled tagline and menu items replace the code's", async ({ page }) => {
  await page.goto("/dev/settings-fixture?filled");
  await expect(page.locator("footer h4")).toHaveText("Fixture tagline");
  await openMenu(page);
  const item = page.getByRole("heading", { name: "Fixture menu item", exact: true });
  await expect(item).toBeVisible();
  // column "right" puts it in the second column; the editor's new-tab setting carries through.
  await expect(
    page.locator(".nav + div").getByRole("heading", { name: "Fixture menu item" }),
  ).toBeVisible();
  await expect(page.locator('a[href="https://example.com/menu"]')).toHaveAttribute(
    "target",
    "_blank",
  );
  await expect(page.getByRole("heading", { name: "About", exact: true })).toHaveCount(0);
});

test("a filled company name keeps its period on both copyright lines", async ({ page }) => {
  await page.goto("/dev/settings-fixture?filled");
  const year = new Date().getFullYear();
  const lines = page.locator("footer .copywright");
  // Desktop: one period after "Inc.", never "Inc.." and never none.
  await expect(lines.nth(0)).toHaveText(`© ${year} Fixture Biologics, Inc. All rights reserved.`);
  // Mobile: the name as the editor typed it, then the rights line.
  await expect(lines.nth(1)).toHaveText(`© ${year} Fixture Biologics, Inc.All rights reserved.`);
});

test("a filled LinkedIn link keeps the editor's new-tab setting", async ({ page }) => {
  await page.goto("/dev/settings-fixture?filled");
  const li = page.locator('footer a[href="https://example.com/li"]');
  await expect(li).toHaveAttribute("target", "_blank");
  await expect(li).toHaveAttribute("rel", "noopener noreferrer");
});

test("an empty menu group renders the code's menu", async ({ page }) => {
  await page.goto("/dev/settings-fixture");
  await openMenu(page);
  for (const label of ["About", "Surgical Grafts", "Allografts", "Ocular Grafts"]) {
    await expect(page.getByRole("heading", { name: label, exact: true })).toBeVisible();
  }
});

test("with no settings document the footer reads exactly as the code wrote it", async ({
  page,
}) => {
  await page.goto("/dev/settings-fixture?none");
  const footer = page.locator("footer");
  await expect(footer.locator("h4")).toHaveText("Revolutionizing Bioregeneration");
  const year = new Date().getFullYear();
  await expect(footer.locator(".copywright").first()).toHaveText(
    `© ${year} RevoGen Biologics. All Rights Reserved.`,
  );
  await expect(footer.locator(".leading-normal")).toHaveText(
    /^\s*4903 Golden Quail,\s*Suite 120\s*San Antonio, TX 78240\s*sales@revogen\.com\s*210\.607\.4037\s*LinkedIn\s*$/,
  );
  await expect(footer.locator('a[href="mailto:sales@revogen.com"]')).toHaveCount(1);
  await expect(footer.locator('a[href="tel:210.607.4037"]')).toHaveCount(1);
  await expect(
    footer.locator('a[href="https://www.linkedin.com/company/revogen-biologics"]'),
  ).toHaveText("LinkedIn");
  // The code's LinkedIn link opens in the same tab, as it always has.
  await expect(
    footer.locator('a[href="https://www.linkedin.com/company/revogen-biologics"]'),
  ).not.toHaveAttribute("target", /.*/);
  await expect(footer.locator(".copywright").nth(1)).toHaveText(
    `© ${year} RevoGen BiologicsAll Rights Reserved`,
  );
  await expect(footer.locator('a[href="/surgical-grafts/allografts"]')).toHaveClass(/ml-5/);
  await expect(footer.locator('a[href="/distribution-opportunities"] br')).toHaveCount(1);
});
