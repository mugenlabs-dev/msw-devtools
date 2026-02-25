import { expect, test } from "@playwright/test";

import {
  enableAllMocksViaStorage,
  openDevToolsPanel,
  selectOperation,
  waitForDemoReady,
  waitForLiveBadges,
} from "./helpers";

test.describe("Operation Detail Panel", () => {
  test.beforeEach(async ({ page }) => {
    await enableAllMocksViaStorage(page);
    await page.goto("./playground/query");
    await waitForDemoReady(page);
    await openDevToolsPanel(page);
  });

  test("clicking an operation row opens the detail panel", async ({ page }) => {
    await selectOperation(page, "GET Gengar");

    await expect(page.locator("text=GET Gengar").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Toggle mock" })).toBeVisible();
  });

  test("variant dropdown shows options", async ({ page }) => {
    await selectOperation(page, "GetSnorlax");

    const variantSelect = page.locator("select[id^='variant-']");
    await expect(variantSelect).toBeVisible();

    const options = variantSelect.locator("option");
    const count = await options.count();
    expect(count).toBe(2);

    await variantSelect.selectOption("variant-1");
    await expect(variantSelect).toHaveValue("variant-1");
  });

  test("Mocked/Passthrough toggle works", async ({ page }) => {
    await selectOperation(page, "GET Gengar");

    const toggleBtn = page.getByRole("button", { name: "Toggle mock" });
    await expect(toggleBtn).toBeVisible();
    await expect(toggleBtn).toHaveAttribute("aria-pressed", "true");
    await expect(toggleBtn).toContainText("Mocked");

    await toggleBtn.click();
    await expect(toggleBtn).toHaveAttribute("aria-pressed", "false");
    await expect(toggleBtn).toContainText("Passthrough");

    await toggleBtn.click();
    await expect(toggleBtn).toHaveAttribute("aria-pressed", "true");
    await expect(toggleBtn).toContainText("Mocked");
  });

  test("delay input accepts numeric values", async ({ page }) => {
    await selectOperation(page, "GET Gengar");

    const delayInput = page.locator("input[id^='delay-']");
    await expect(delayInput).toBeVisible();
    await expect(delayInput).toHaveValue("0");

    await delayInput.fill("500");
    await expect(delayInput).toHaveValue("500");
  });

  test("status code input allows override and shows Reset button", async ({ page }) => {
    await selectOperation(page, "GET Gengar");

    const statusInput = page.locator("input[id^='status-']");
    await expect(statusInput).toBeVisible();

    await statusInput.fill("418");

    const resetBtn = page.locator("button").filter({ hasText: /reset/i }).first();
    await expect(resetBtn).toBeVisible({ timeout: 3000 });

    await resetBtn.click();

    await expect(page.locator("button").filter({ hasText: /reset/i }).first()).not.toBeVisible({
      timeout: 2000,
    });
  });

  test("JSON editor displays captured response data after fetch", async ({ page }) => {
    await waitForLiveBadges(page, 6);
    await selectOperation(page, "GET Gengar");

    await expect(page.locator("text=Response JSON").first()).toBeVisible();

    const jsonTextarea = page.locator("textarea").last();
    await expect(jsonTextarea).toBeVisible();
    const jsonValue = await jsonTextarea.inputValue();
    expect(jsonValue).toContain("gengar");
  });

  test("editing JSON shows Reset to Default button", async ({ page }) => {
    await waitForLiveBadges(page, 6);
    await selectOperation(page, "GET Gengar");

    const jsonTextarea = page.locator("textarea").last();
    await expect(jsonTextarea).toBeVisible();

    await expect(page.locator("button").filter({ hasText: "Reset to Default" })).not.toBeVisible();

    await jsonTextarea.fill('{"custom":"data"}');

    // Wait for debounce — "Reset to Default" button appears
    await expect(page.locator("button").filter({ hasText: "Reset to Default" })).toBeVisible({
      timeout: 5000,
    });

    await page.locator("button").filter({ hasText: "Reset to Default" }).click();

    // Wait for store update to propagate back to the textarea
    await expect(jsonTextarea).not.toHaveValue('{"custom":"data"}', { timeout: 5000 });

    const resetValue = await jsonTextarea.inputValue();
    expect(resetValue).toContain("gengar");

    await expect(page.locator("button").filter({ hasText: "Reset to Default" })).not.toBeVisible();
  });

  test("error override buttons are visible and toggle correctly", async ({ page }) => {
    await selectOperation(page, "GET Gengar");

    await expect(page.locator("text=Error Override").first()).toBeVisible();

    for (const label of ["401", "404", "429", "500", "Network Error"]) {
      await expect(
        page.getByRole("button", { name: `Set error override to ${label}` })
      ).toBeVisible();
    }

    const btn500 = page.getByRole("button", { name: "Set error override to 500" });
    await btn500.click();

    await expect(btn500).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("text=Response JSON")).not.toBeVisible();
    await expect(page.locator("text=Error override active: 500")).toBeVisible();

    await btn500.click();

    await expect(btn500).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("text=Response JSON").first()).toBeVisible();
  });

  test("Network Error override shows network error message", async ({ page }) => {
    await selectOperation(page, "GET Gengar");

    const networkBtn = page.getByRole("button", {
      name: "Set error override to Network Error",
    });
    await networkBtn.click();

    await expect(page.locator("text=Network error -- no response body")).toBeVisible();
    await expect(page.locator("text=Response JSON")).not.toBeVisible();
  });
});
