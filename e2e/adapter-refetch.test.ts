import { expect, test } from "@playwright/test";

import { enableAllMocksViaStorage, openDevToolsPanel, waitForDemoReady } from "./helpers";

test.describe("Adapter refetch", () => {
  test("toggling a mock triggers a TanStack Query client refetch", async ({ page }) => {
    await enableAllMocksViaStorage(page);
    await page.goto("./playground/query");
    await waitForDemoReady(page);
    await openDevToolsPanel(page);

    await expect(page.locator("h3", { hasText: "Gengar" }).first()).toBeVisible();

    const row = page.locator("[data-testid='operation-row']").filter({ hasText: "GET Gengar" });
    const rowToggle = row.getByRole("button", { name: /Toggle.*mock/ });
    await expect(rowToggle).toHaveAttribute("aria-pressed", "true");

    const refetch = page.waitForRequest(
      (request) => request.url() === "https://pokeapi.co/api/v2/pokemon/94"
    );
    await rowToggle.click();
    await refetch;

    await expect(rowToggle).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("h3", { hasText: "Charizard" }).first()).toBeVisible();
  });
});
