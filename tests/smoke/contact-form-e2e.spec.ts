import { test, expect, type Page } from "@playwright/test";
import { capturedWith } from "./ingest-capture";

// The fleet's nightly form-e2e probe enters at /contact, waits for
// html[data-hydrated], injects a hidden `testMode=true` input into the first
// <form>, fills it, submits, and waits for [role="status"]. Central ingest drops
// a payload carrying top-level boolean `testMode: true` instead of emailing the
// client, so the marker must survive from the form element, through the client's
// JSON and /api/forms, to the ingest body. That body lands on the local capture
// server (playwright.config.ts), so nothing leaves the machine.
//
// The form is the TwoCol `contactForm` slice on the Prismic page
// `distribution-opportunities`: removing that slice in Prismic turns this red.

// The first navigation can meet a cold dev server that compiles for well over
// the default 30 s before it hydrates.
test.describe.configure({ timeout: 90_000 });

async function fillAndSubmit(page: Page, marker: string, { probe }: { probe: boolean }) {
  await page.locator("html[data-hydrated]").waitFor({ state: "attached" });
  const form = page.locator("form").first();
  if (probe) {
    await form.evaluate((f) => {
      const el = document.createElement("input");
      el.type = "hidden";
      el.name = "testMode";
      el.value = "true";
      f.appendChild(el);
    });
  }
  await form.locator('[name="first-name"]').fill("Reddoor");
  await form.locator('[name="last-name"]').fill("Monitor");
  await form.locator('[name="city"]').fill("Los Angeles");
  await form.locator('[name="state"]').selectOption({ index: 1 });
  await form.locator('[name="email"]').fill("monitor+e2e@reddoorla.com");
  await form.locator('[name="distributorship"]').fill("Smoke test");
  await form.locator('[name="message"]').fill(marker);
  await page.locator('button[type="submit"], input[type="submit"]').first().click();
}

test("/contact 301s to the distributor form", async ({ page, request }) => {
  const res = await request.get("/contact", { maxRedirects: 0 });
  expect(res.status()).toBe(301);
  expect(res.headers().location).toBe("/distribution-opportunities");
  const utm = await request.get("/contact?utm_source=x", { maxRedirects: 0 });
  expect(utm.headers().location).toBe("/distribution-opportunities?utm_source=x");
  await page.goto("/contact");
  expect(new URL(page.url()).pathname).toBe("/distribution-opportunities");
  await expect(page.locator("form").first().locator('input[name="email"]')).toBeAttached();
});

test("a probe submission reaches ingest marked testMode, and shows role=status", async ({
  page,
}, info) => {
  const marker = `smoke probe ${info.testId}`;
  await page.goto("/contact");
  await fillAndSubmit(page, marker, { probe: true });
  await expect(page.locator('[role="status"]').first()).toBeVisible();
  const bodies = await capturedWith(marker);
  expect(bodies).toHaveLength(1);
  expect(bodies[0].testMode).toBe(true);
});

test("a visitor submission reaches ingest without testMode", async ({ page }, info) => {
  const marker = `smoke visitor ${info.testId}`;
  await page.goto("/distribution-opportunities");
  await fillAndSubmit(page, marker, { probe: false });
  await expect(page.locator('[role="status"]').first()).toBeVisible();
  const bodies = await capturedWith(marker);
  expect(bodies).toHaveLength(1);
  expect(bodies[0]).not.toHaveProperty("testMode");
});
