import { test, expect, type Page } from "@playwright/test";

// The fleet's nightly form-e2e probe enters at /contact, waits for
// html[data-hydrated], injects a hidden `testMode=true` input into the first
// <form>, fills it, submits, and waits for [role="status"]. Central ingest drops
// a payload carrying `testMode` instead of emailing the client, so the marker
// must survive from the form element to the JSON body. /api/forms is
// intercepted here: no submission leaves the browser.

type Posted = Record<string, unknown>;

async function interceptForms(page: Page): Promise<Posted[]> {
  const posted: Posted[] = [];
  await page.route("**/api/forms", async (route) => {
    posted.push(route.request().postDataJSON() as Posted);
    await route.fulfill({ json: { ok: true } });
  });
  return posted;
}

async function fillAndSubmit(page: Page, { probe }: { probe: boolean }) {
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
  await form.locator('[name="message"]').fill("Smoke test, please ignore.");
  await page.locator('button[type="submit"], input[type="submit"]').first().click();
}

test("/contact lands on the distributor form", async ({ page }) => {
  await page.goto("/contact");
  expect(new URL(page.url()).pathname).toBe("/distribution-opportunities");
  await expect(page.locator("form").first().locator('input[name="email"]')).toBeAttached();
});

test("a probe submission forwards testMode and shows role=status", async ({ page }) => {
  const posted = await interceptForms(page);
  await page.goto("/contact");
  await fillAndSubmit(page, { probe: true });
  await expect(page.locator('[role="status"]').first()).toBeVisible();
  expect(posted).toHaveLength(1);
  expect(posted[0].testMode).toBe("true");
});

test("a visitor submission carries no testMode", async ({ page }) => {
  const posted = await interceptForms(page);
  await page.goto("/distribution-opportunities");
  await fillAndSubmit(page, { probe: false });
  await expect(page.locator('[role="status"]').first()).toBeVisible();
  expect(posted).toHaveLength(1);
  expect(posted[0]).not.toHaveProperty("testMode");
});
