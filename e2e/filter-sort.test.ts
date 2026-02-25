import type { Page } from "@playwright/test";

import { expect, test } from "@playwright/test";

import {
  enableAllMocksViaStorage,
  openDevToolsPanel,
  waitForDemoReady,
  waitForLiveBadges,
  waitForOperationCount,
} from "./helpers";

const REST_FILTER_REGEX = /^rest$/i;
const GRAPHQL_FILTER_REGEX = /^graphql$/i;
const LIVE_FILTER_REGEX = /^live$/i;
const ENABLED_FILTER_REGEX = /^enabled$/i;
const ALL_FILTER_REGEX = /^all$/i;

const collectOperationTexts = async (page: Page): Promise<string[]> => {
  const opElements = page.locator("[data-testid='operation-row']");
  const count = await opElements.count();
  expect(count).toBeGreaterThanOrEqual(2);

  const allTexts = await opElements.allTextContents();
  return allTexts.filter(Boolean);
};

test.describe("Filter & Sort", () => {
  test.beforeEach(async ({ page }) => {
    await enableAllMocksViaStorage(page);
    await page.goto("./playground/query");
    await waitForDemoReady(page);
    await openDevToolsPanel(page);
  });

  test("filter buttons are visible", async ({ page }) => {
    for (const label of ["all", "live", "enabled", "rest", "graphql"]) {
      await expect(
        page
          .locator("button")
          .filter({ hasText: new RegExp(`^${label}$`, "i") })
          .first()
      ).toBeVisible();
    }
  });

  test("sort dropdown is visible with default option", async ({ page }) => {
    const sortSelect = page.locator("select").first();
    await expect(sortSelect).toBeVisible();
    await expect(sortSelect).toHaveValue("default");
  });

  test("REST filter shows only REST operations", async ({ page }) => {
    await page.locator("button").filter({ hasText: REST_FILTER_REGEX }).first().click();
    await waitForOperationCount(page, 12);

    const opTexts = await page.locator("[data-testid='operation-row']").allTextContents();
    const combinedText = opTexts.join(" ");

    expect(opTexts).toHaveLength(12);
    expect(combinedText).toContain("GET Gengar");
    expect(combinedText).toContain("GET Charizard");
    expect(combinedText).toContain("GET Tyranitar");
    expect(combinedText).toContain("GET Mewtwo");
    expect(combinedText).toContain("GET Dragonite");
    expect(combinedText).toContain("GET Mimikyu");

    expect(combinedText).not.toContain("GetSnorlax");
    expect(combinedText).not.toContain("GetPancham");
    expect(combinedText).not.toContain("GetRayquaza");
  });

  test("GraphQL filter shows only GraphQL operations", async ({ page }) => {
    await page.locator("button").filter({ hasText: GRAPHQL_FILTER_REGEX }).first().click();
    await waitForOperationCount(page, 18);

    const opTexts = await page.locator("[data-testid='operation-row']").allTextContents();
    const combinedText = opTexts.join(" ");

    expect(opTexts).toHaveLength(18);
    expect(combinedText).toContain("GetSnorlax");
    expect(combinedText).toContain("GetPancham");
    expect(combinedText).toContain("GetSalamence");
    expect(combinedText).toContain("GetRayquaza");
    expect(combinedText).toContain("GetEevee");

    expect(combinedText).not.toContain("GET Gengar");
    expect(combinedText).not.toContain("GET Charizard");
  });

  test("LIVE filter shows only fetched operations", async ({ page }) => {
    await waitForLiveBadges(page, 6);

    await page.locator("button").filter({ hasText: LIVE_FILTER_REGEX }).first().click();
    await waitForOperationCount(page, 6);

    const opTexts = await page.locator("[data-testid='operation-row']").allTextContents();
    const combinedText = opTexts.join(" ");

    expect(opTexts).toHaveLength(6);
    expect(combinedText).toContain("GET Charizard");
    expect(combinedText).toContain("GetSnorlax");

    expect(combinedText).not.toContain("GET Mimikyu");
    expect(combinedText).not.toContain("GetRayquaza");
    expect(combinedText).not.toContain("GetEevee");
  });

  test("Enabled filter shows only enabled operations", async ({ page }) => {
    await page.locator("button").filter({ hasText: ENABLED_FILTER_REGEX }).first().click();
    await waitForOperationCount(page, 30);

    const opTexts = await page.locator("[data-testid='operation-row']").allTextContents();
    expect(opTexts).toHaveLength(30);

    const combinedText = opTexts.join(" ");
    expect(combinedText).toContain("GetSnorlax");
    expect(combinedText).toContain("GET Gengar");
    expect(combinedText).toContain("GET Mewtwo");
    expect(combinedText).toContain("GetRayquaza");
  });

  test("A-Z sort orders operations alphabetically", async ({ page }) => {
    await page.locator("[data-testid='group-toggle']").click();
    // Wait for grouping to toggle off — row count stays at 30
    await waitForOperationCount(page, 30);

    await page.locator("select").first().selectOption("a-z");
    // Wait for sort to apply — still 30 rows, just reordered
    await waitForOperationCount(page, 30);

    const texts = await collectOperationTexts(page);

    for (let i = 1; i < texts.length; i += 1) {
      expect(texts[i].localeCompare(texts[i - 1])).toBeGreaterThanOrEqual(0);
    }
  });

  test("Z-A sort orders operations in reverse", async ({ page }) => {
    await page.locator("[data-testid='group-toggle']").click();
    await waitForOperationCount(page, 30);

    await page.locator("select").first().selectOption("z-a");
    await waitForOperationCount(page, 30);

    const texts = await collectOperationTexts(page);

    for (let i = 1; i < texts.length; i += 1) {
      expect(texts[i].localeCompare(texts[i - 1])).toBeLessThanOrEqual(0);
    }
  });

  test("switching back to All filter shows all operations", async ({ page }) => {
    await page.locator("button").filter({ hasText: REST_FILTER_REGEX }).first().click();
    await waitForOperationCount(page, 12);

    await page.locator("button").filter({ hasText: ALL_FILTER_REGEX }).first().click();
    await waitForOperationCount(page, 30);

    const opTexts = await page.locator("[data-testid='operation-row']").allTextContents();
    expect(opTexts).toHaveLength(30);

    const combinedText = opTexts.join(" ");
    expect(combinedText).toContain("GetSnorlax");
    expect(combinedText).toContain("GET Gengar");
    expect(combinedText).toContain("GET Mewtwo");
    expect(combinedText).toContain("GetRayquaza");
  });
});
