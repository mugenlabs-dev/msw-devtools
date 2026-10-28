import { expect, test } from "@playwright/test";

import {
  enableAllMocksViaStorage,
  openDevToolsPanel,
  REST_MISSINGNO,
  waitForDemoReady,
  waitForLiveBadges,
} from "./helpers";

test.describe("entry navigation", () => {
  test("header Playground link from the docs home serves mocks", async ({ page }) => {
    await enableAllMocksViaStorage(page, {
      overrides: { "GET Charizard": REST_MISSINGNO },
    });
    await page.goto("./");
    const scopesBefore = await page.evaluate(async () =>
      (await navigator.serviceWorker.getRegistrations()).map((registration) => registration.scope)
    );
    expect(scopesBefore).toEqual([]);

    await page.getByRole("link", { exact: true, name: "Playground" }).click();

    await expect(page).toHaveURL(/\/playground\/query\/?$/);
    await waitForDemoReady(page);
    await expect(page.locator("h3", { hasText: /missingno/i })).toHaveCount(1);
    await openDevToolsPanel(page);
    await waitForLiveBadges(page, 6);

    const controller = await page.evaluate(
      () => navigator.serviceWorker.controller?.scriptURL ?? ""
    );
    expect(controller).toMatch(/\/mockServiceWorker\.js$/);
    expect(controller).not.toContain("/playground/");
  });
});
