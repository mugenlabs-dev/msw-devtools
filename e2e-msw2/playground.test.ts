import { expect, test } from "@playwright/test";

import { enableAllMocksViaStorage, openDevToolsPanel, waitForDemoReady } from "../e2e/helpers";

test.describe("MSW 2 playground", () => {
  test("query page shows Charizard and Gengar", async ({ page }) => {
    await enableAllMocksViaStorage(page);
    await page.goto("./query");
    await waitForDemoReady(page);
    await expect(page.locator("h3", { hasText: "Charizard" }).first()).toBeVisible();
    await expect(page.locator("h3", { hasText: "Gengar" }).first()).toBeVisible();
  });

  test("devtools panel lists operations and the MSW 2 pill is active", async ({ page }) => {
    await enableAllMocksViaStorage(page);
    await page.goto("./query");
    await waitForDemoReady(page);
    await openDevToolsPanel(page);
    await expect(page.getByText("GET Charizard").first()).toBeAttached();
    await expect(page.getByText("GET Gengar").first()).toBeAttached();
    await expect(page.getByText("GetPancham").first()).toBeAttached();
    await expect(page.getByText("MSW Active").first()).toBeAttached();
    await expect(page.getByTestId("msw-switch-2")).toHaveAttribute("data-active", "true");
    await expect(page.getByTestId("msw-switch-2")).toHaveAttribute("aria-current", "page");
    await expect(page.getByTestId("msw-switch-2")).toHaveText("2.x");
    await expect(page.getByTestId("msw-switch-3")).toHaveAttribute("data-active", "false");
    await expect(page.getByTestId("msw-switch-3")).toHaveText("3.x");
    await expect(page.getByTestId("msw-switch-2")).toHaveAttribute("href", "/msw2/query");
    await expect(page.getByTestId("msw-switch-3")).toHaveAttribute("href", "/playground/query");
  });

  test("turning a mock off refetches from PokeAPI", async ({ page }) => {
    await enableAllMocksViaStorage(page);
    await page.goto("./query");
    await waitForDemoReady(page);
    await openDevToolsPanel(page);

    const row = page.locator("[data-testid='operation-row']").filter({ hasText: "GET Gengar" });
    const rowToggle = row.getByRole("button", { name: /Toggle.*mock/ });
    await expect(rowToggle).toHaveAttribute("aria-pressed", "true");

    const refetch = page.waitForRequest(
      (request) => request.url() === "https://pokeapi.co/api/v2/pokemon/94"
    );
    await rowToggle.click();
    await refetch;

    await expect(rowToggle).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("h3", { hasText: "Gengar" }).first()).toBeVisible();
    await expect(page.locator("h3", { hasText: "Charizard" }).first()).toBeVisible();
  });

  test("library tabs open each shared page", async ({ page }) => {
    await enableAllMocksViaStorage(page);
    await page.goto("./query");
    await waitForDemoReady(page);

    const libraries = page.getByRole("navigation", { name: "Libraries" });
    const pages = [
      ["SWR", "SWR"],
      ["URQL", "URQL"],
      ["RTK Query", "RTK Query"],
      ["Apollo", "Apollo Client"],
      ["Fetch + Axios", "Fetch + Axios"],
      ["TanStack Query", "TanStack Query"],
    ] as const;

    for (const [tab, heading] of pages) {
      await libraries.getByRole("link", { exact: true, name: tab }).click();
      await expect(page.getByRole("heading", { exact: true, name: heading })).toBeVisible();
    }
  });

  test("index opens the query page", async ({ page }) => {
    await enableAllMocksViaStorage(page);
    await page.goto("./");
    await expect(page).toHaveURL(/\/msw2\/query\/?$/);
    await waitForDemoReady(page);
    await expect(page.locator("h3", { hasText: "Charizard" }).first()).toBeVisible();
  });
});
