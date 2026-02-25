import { expect, test } from "@playwright/test";

import {
  enableAllMocksViaStorage,
  openDevToolsPanel,
  waitForDemoReady,
  waitForLiveBadges,
} from "./helpers";

const LIVE_BADGE_REGEX = /^LIVE$/;

test.describe("Mock Toggling", () => {
  test.beforeEach(async ({ page }) => {
    await enableAllMocksViaStorage(page);
    await page.goto("./playground/query");
    await waitForDemoReady(page);
    await openDevToolsPanel(page);
  });

  test("All On enables all mocks", async ({ page }) => {
    await page.locator("button").filter({ hasText: "All Off" }).click();
    await expect(page.locator("text=0/30 active").first()).toBeVisible({ timeout: 5000 });

    await page.locator("button").filter({ hasText: "All On" }).click();
    await expect(page.locator("text=30/30 active").first()).toBeVisible({ timeout: 5000 });
  });

  test("All Off disables all mocks", async ({ page }) => {
    await page.locator("button").filter({ hasText: "All Off" }).click();
    await expect(page.locator("text=0/30 active").first()).toBeVisible({ timeout: 5000 });
  });

  test("individual operation toggle via row switch", async ({ page }) => {
    const row = page.locator("[data-testid='operation-row']").filter({ hasText: "GET Gengar" });
    await expect(row).toBeVisible();

    const rowToggle = row.getByRole("button", { name: /Toggle.*mock/ });
    await expect(rowToggle).toBeVisible();
    await expect(rowToggle).toHaveAttribute("aria-pressed", "true");

    // Disable
    await rowToggle.click();
    await expect(rowToggle).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("text=29/30 active").first()).toBeVisible({ timeout: 5000 });

    // Re-enable
    await rowToggle.click();
    await expect(rowToggle).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("text=30/30 active").first()).toBeVisible({ timeout: 5000 });
  });

  test("Clear seen button removes LIVE badges", async ({ page }) => {
    await waitForLiveBadges(page, 6);

    const liveBadgesBefore = await page
      .locator("span")
      .filter({ hasText: LIVE_BADGE_REGEX })
      .count();
    expect(liveBadgesBefore).toBeGreaterThan(0);

    await page.locator("button").filter({ hasText: "Clear seen" }).click();

    // Wait for LIVE badges to disappear
    await expect(page.locator("span").filter({ hasText: LIVE_BADGE_REGEX })).toHaveCount(0, {
      timeout: 5000,
    });
  });
});
