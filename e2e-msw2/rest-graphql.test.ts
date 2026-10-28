import { expect, test } from "@playwright/test";

test.describe("MSW 2 fixture", () => {
  test("REST mock serves Charizard", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("rest-result")).toContainText("charizard", { timeout: 15_000 });
  });

  test("GraphQL link mock serves Pancham", async ({ page }) => {
    await page.goto("/graphql");
    await expect(page.getByTestId("graphql-result")).toContainText("pancham", { timeout: 15_000 });
  });

  test("devtools panel lists both operations", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("rest-result")).toContainText("charizard", { timeout: 15_000 });
    // Panel content may be in the DOM before the shell finishes animating open.
    await expect(page.getByText("GET Charizard").first()).toBeAttached({ timeout: 15_000 });
    await expect(page.getByText("GetPancham").first()).toBeAttached({ timeout: 15_000 });
    await expect(page.getByText("MSW Active").first()).toBeAttached({ timeout: 15_000 });
  });
});
