import { expect, test } from "@playwright/test";

import {
  enableAllMocksViaStorage,
  openDevToolsPanel,
  waitForDemoReady,
  waitForLiveBadges,
} from "./helpers";

const LIVE_BADGE_REGEX = /^LIVE$/;

test.describe("DevTools Panel", () => {
  test.beforeEach(async ({ page }) => {
    await enableAllMocksViaStorage(page);
    await page.goto("./playground/query");
    await waitForDemoReady(page);
    await openDevToolsPanel(page);
  });

  test("MSW worker status is active", async ({ page }) => {
    await expect(page.locator("text=MSW Active").first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("lists all 30 registered operations", async ({ page }) => {
    const opRows = page.locator("[data-testid='operation-row']");
    await expect(opRows).toHaveCount(30, { timeout: 10_000 });

    const pageText = await page.textContent("body");
    expect(pageText).toContain("GetSnorlax");
    expect(pageText).toContain("GetPancham");
    expect(pageText).toContain("GetSalamence");
    expect(pageText).toContain("GET Gengar");
    expect(pageText).toContain("GET Charizard");
    expect(pageText).toContain("GET Tyranitar");
    expect(pageText).toContain("GET Mimikyu");
    expect(pageText).toContain("GET Mewtwo");
    expect(pageText).toContain("GetRayquaza");
    expect(pageText).toContain("GetEevee");
  });

  test("shows LIVE badges for fetched operations", async ({ page }) => {
    await waitForLiveBadges(page, 6);

    const liveBadges = page.locator("span").filter({ hasText: LIVE_BADGE_REGEX });
    const count = await liveBadges.count();
    expect(count).toBeGreaterThanOrEqual(6);
  });

  test("shows active/enabled count", async ({ page }) => {
    await expect(page.locator("text=/\\d+\\/30 active/").first()).toBeVisible();
  });

  test("has All On and All Off buttons", async ({ page }) => {
    await expect(page.locator("button").filter({ hasText: "All On" })).toBeVisible();
    await expect(page.locator("button").filter({ hasText: "All Off" })).toBeVisible();
  });

  test("has Clear seen button after operations are fetched", async ({ page }) => {
    await waitForLiveBadges(page, 1);
    await expect(page.locator("button").filter({ hasText: "Clear seen" })).toBeVisible();
  });
});
