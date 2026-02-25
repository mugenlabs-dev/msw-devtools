import { expect, test } from "@playwright/test";

import { enableAllMocksViaStorage, waitForDemoReady } from "./helpers";

const REST_BADGE_REGEX = /^REST$/;
const GRAPHQL_BADGE_REGEX = /^GraphQL$/;
const NORMAL_TYPE_REGEX = /^normal$/;
const FIRE_TYPE_REGEX = /^fire$/;
const DRAGON_TYPE_REGEX = /^dragon$/;
const FIGHTING_TYPE_REGEX = /^fighting$/;

test.describe("Demo Cards", () => {
  test.beforeEach(async ({ page }) => {
    await enableAllMocksViaStorage(page);
    await page.goto("./playground/query");
    await waitForDemoReady(page);
  });

  test("renders all 6 Pokemon cards", async ({ page }) => {
    const refetchButtons = page.locator("button").filter({ hasText: "Refetch" });
    await expect(refetchButtons).toHaveCount(6, { timeout: 10_000 });
  });

  test("each card shows a Pokemon name", async ({ page }) => {
    for (const name of ["Charizard", "Gengar", "Tyranitar", "Pancham", "Salamence", "Snorlax"]) {
      await expect(page.locator("h3", { hasText: name }).first()).toBeVisible({ timeout: 10_000 });
    }
  });

  test("cards show library labels", async ({ page }) => {
    await expect(page.locator("text=@tanstack/query").first()).toBeVisible();
  });

  test("cards show REST and GraphQL badges", async ({ page }) => {
    const restBadges = page.locator("span").filter({ hasText: REST_BADGE_REGEX });
    await expect(restBadges).toHaveCount(3, { timeout: 10_000 });

    const gqlBadges = page.locator("span").filter({ hasText: GRAPHQL_BADGE_REGEX });
    await expect(gqlBadges).toHaveCount(3, { timeout: 10_000 });
  });

  test("cards show Pokemon sprites", async ({ page }) => {
    const spriteImages = page.locator('img[src*="sprites/master/sprites/pokemon"]');
    await expect(spriteImages.first()).toBeVisible({ timeout: 10_000 });
    const count = await spriteImages.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test("cards have refetch buttons", async ({ page }) => {
    const refetchButtons = page.locator("button").filter({ hasText: "Refetch" });
    await expect(refetchButtons).toHaveCount(6, { timeout: 10_000 });
  });

  test("cards display Pokemon types", async ({ page }) => {
    await expect(page.locator("span").filter({ hasText: FIRE_TYPE_REGEX }).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.locator("span").filter({ hasText: DRAGON_TYPE_REGEX }).first()).toBeVisible();
    await expect(
      page.locator("span").filter({ hasText: FIGHTING_TYPE_REGEX }).first()
    ).toBeVisible();
    await expect(page.locator("span").filter({ hasText: NORMAL_TYPE_REGEX }).first()).toBeVisible();
  });
});
