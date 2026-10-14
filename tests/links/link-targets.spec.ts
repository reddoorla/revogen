import { test, expect } from "@playwright/test";
import { isPdfUrl, linkTargetAttrs } from "../../src/lib/links";
import * as fixtures from "./fixtures";

const NEW_WINDOW = { target: "_blank", rel: "noopener noreferrer" };

const expected: Record<keyof typeof fixtures, { target?: string; rel?: string }> = {
  mediaPdf: NEW_WINDOW,
  mediaPdfNoExtension: NEW_WINDOW,
  webPdfWithQuery: NEW_WINDOW,
  dropboxPdf: NEW_WINDOW,
  nonPdf: {},
  internalPage: {},
  editorBlankNonPdf: NEW_WINDOW,
};

test.describe("linkTargetAttrs", () => {
  for (const [name, field] of Object.entries(fixtures)) {
    test(name, () => {
      const href = "url" in field ? field.url : undefined;
      expect(linkTargetAttrs(href, field)).toEqual(expected[name as keyof typeof fixtures]);
    });
  }

  test("an href alone is enough for a PDF", () => {
    expect(linkTargetAttrs("https://www.dropbox.com/scl/fi/abc/Brochure.pdf?rlkey=x&dl=0")).toEqual(
      NEW_WINDOW,
    );
    expect(linkTargetAttrs("/about")).toEqual({});
  });

  test("an explicit target wins", () => {
    expect(linkTargetAttrs("https://example.com/a.pdf", undefined, "_self")).toEqual({
      target: "_self",
    });
  });

  test("isPdfUrl reads the path, not the query", () => {
    expect(isPdfUrl("https://example.com/download?file=a.pdf")).toBe(false);
    expect(isPdfUrl("/brochures/a.pdf")).toBe(true);
    expect(isPdfUrl("")).toBe(false);
  });
});

test.describe("rendered links on /dev/link-fixtures", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dev/link-fixtures");
  });

  for (const [name, field] of Object.entries(fixtures)) {
    const want = expected[name as keyof typeof fixtures];
    const text = "text" in field ? String(field.text) : name;

    test(`button: ${name}`, async ({ page }) => {
      const link = page.locator(`[data-case="${name}"] a`);
      await expect(link).toHaveCount(1);
      expect(await link.getAttribute("target")).toBe(want.target ?? null);
      expect(await link.getAttribute("rel")).toBe(want.rel ?? null);
    });

    test(`rich text: ${name}`, async ({ page }) => {
      const link = page.getByTestId("rich-text").getByRole("link", { name: text, exact: true });
      await expect(link).toHaveCount(1);
      expect(await link.getAttribute("target")).toBe(want.target ?? null);
      if (want.rel) expect(await link.getAttribute("rel")).toBe(want.rel);
      else expect((await link.getAttribute("rel")) ?? "").not.toContain("noopener");
    });
  }

  test("a PDF button does not start the page transition", async ({ page, context }) => {
    const popup = context.waitForEvent("page");
    await page.locator('[data-case="internalPage"]').waitFor();
    await page.route("**/*.pdf*", (route) => route.fulfill({ status: 200, body: "%PDF-1.4" }));
    await context.route("**/*.pdf*", (route) => route.fulfill({ status: 200, body: "%PDF-1.4" }));
    await page.locator('[data-case="mediaPdf"] a').click();
    await popup;
    expect(page.url()).toContain("/dev/link-fixtures");
  });
});
