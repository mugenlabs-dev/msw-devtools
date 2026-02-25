import { expect, test } from "@playwright/test";

import {
  enableAllMocksViaStorage,
  openDevToolsPanel,
  waitForDemoReady,
  waitForOperationCount,
} from "./helpers";

test.describe("Filter & Sort Persistence", () => {
  test("filter and sort state persists across page reload", async ({ page }) => {
    await enableAllMocksViaStorage(page, { seedOnce: true });
    await page.goto("./playground/query");
    await waitForDemoReady(page);
    await openDevToolsPanel(page);

    // Set filter to "rest"
    await page
      .locator("button")
      .filter({ hasText: /^rest$/i })
      .first()
      .click();
    await waitForOperationCount(page, 12);

    // Set sort to "a-z"
    await page.locator("select").first().selectOption("a-z");

    // Verify current state shows only REST operations
    const opTexts = await page.locator("[data-testid='operation-row']").allTextContents();
    const combinedText = opTexts.join(" ");
    expect(combinedText).toContain("GET Gengar");
    expect(combinedText).not.toContain("GetSnorlax");

    // Reload the page to verify persistence
    await page.reload();
    await waitForDemoReady(page);
    await openDevToolsPanel(page);

    // Verify filter is still "rest" — only REST operations visible
    await waitForOperationCount(page, 12);
    const opTextsAfter = await page.locator("[data-testid='operation-row']").allTextContents();
    const combinedTextAfter = opTextsAfter.join(" ");
    expect(combinedTextAfter).toContain("GET Gengar");
    expect(combinedTextAfter).not.toContain("GetSnorlax");

    // Verify sort is still "a-z"
    const sortSelect = page.locator("select").first();
    await expect(sortSelect).toHaveValue("a-z");
  });
});
