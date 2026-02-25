import { expect, test } from "@playwright/test";

import {
  enableAllMocksViaStorage,
  openDevToolsPanel,
  PAGE_OPERATIONS,
  waitForDemoReady,
  waitForLiveBadges,
  waitForOperationCount,
} from "./helpers";

const LIVE_FILTER_REGEX = /^live$/i;

/**
 * Get operation names currently shown in the devtools panel.
 * Assumes filter is already set (e.g. LIVE).
 */
const getVisibleOperationTexts = (page: import("@playwright/test").Page) => {
  const rows = page.locator("[data-testid='operation-row']");
  return rows.allTextContents();
};

test.describe("LIVE badges per playground page", () => {
  test.beforeEach(async ({ page }) => {
    await enableAllMocksViaStorage(page);
  });

  test("query page shows only its 6 operations as LIVE", async ({ page }) => {
    await page.goto("./playground/query");
    await waitForDemoReady(page);
    await openDevToolsPanel(page);
    await waitForLiveBadges(page, 6);

    await page.locator("button").filter({ hasText: LIVE_FILTER_REGEX }).first().click();
    await waitForOperationCount(page, 6);

    const opTexts = await getVisibleOperationTexts(page);
    const combined = opTexts.join(" ");

    expect(opTexts).toHaveLength(6);
    for (const op of PAGE_OPERATIONS.query) {
      expect(combined).toContain(op);
    }
    for (const op of PAGE_OPERATIONS.fetch) {
      expect(combined).not.toContain(op);
    }
    for (const op of PAGE_OPERATIONS.urql) {
      expect(combined).not.toContain(op);
    }
  });

  test("navigating to SWR page resets LIVE badges to SWR operations only", async ({ page }) => {
    await page.goto("./playground/query");
    await waitForDemoReady(page);
    await openDevToolsPanel(page);
    await waitForLiveBadges(page, 6);

    // Navigate to SWR
    await page.locator("a", { hasText: "SWR" }).first().click();
    await waitForDemoReady(page);
    await waitForLiveBadges(page, 6);

    await page.locator("button").filter({ hasText: LIVE_FILTER_REGEX }).first().click();
    await waitForOperationCount(page, 6);

    const opTexts = await getVisibleOperationTexts(page);
    const combined = opTexts.join(" ");

    expect(opTexts).toHaveLength(6);
    for (const op of PAGE_OPERATIONS.swr) {
      expect(combined).toContain(op);
    }
    for (const op of PAGE_OPERATIONS.query) {
      expect(combined).not.toContain(op);
    }
  });

  test("URQL page operations are detected as LIVE", async ({ page }) => {
    await page.goto("./playground/urql");
    await waitForDemoReady(page);
    await openDevToolsPanel(page);
    await waitForLiveBadges(page, 6);

    await page.locator("button").filter({ hasText: LIVE_FILTER_REGEX }).first().click();
    await waitForOperationCount(page, 6);

    const opTexts = await getVisibleOperationTexts(page);
    const combined = opTexts.join(" ");

    expect(opTexts).toHaveLength(6);
    for (const op of PAGE_OPERATIONS.urql) {
      expect(combined).toContain(op);
    }
  });

  test("fetch page operations are detected as LIVE", async ({ page }) => {
    await page.goto("./playground/fetch");
    await waitForDemoReady(page);
    await openDevToolsPanel(page);
    await waitForLiveBadges(page, 6);

    await page.locator("button").filter({ hasText: LIVE_FILTER_REGEX }).first().click();
    await waitForOperationCount(page, 6);

    const opTexts = await getVisibleOperationTexts(page);
    const combined = opTexts.join(" ");

    expect(opTexts).toHaveLength(6);
    for (const op of PAGE_OPERATIONS.fetch) {
      expect(combined).toContain(op);
    }
  });

  test("apollo page operations are detected as LIVE", async ({ page }) => {
    await page.goto("./playground/apollo");
    await waitForDemoReady(page);
    await openDevToolsPanel(page);
    await waitForLiveBadges(page, 6);

    await page.locator("button").filter({ hasText: LIVE_FILTER_REGEX }).first().click();
    await waitForOperationCount(page, 6);

    const opTexts = await getVisibleOperationTexts(page);
    const combined = opTexts.join(" ");

    expect(opTexts).toHaveLength(6);
    for (const op of PAGE_OPERATIONS.apollo) {
      expect(combined).toContain(op);
    }
  });
});
