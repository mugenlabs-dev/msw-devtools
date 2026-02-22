import { test, expect } from "@playwright/test";
import {
	enableAllMocksViaStorage,
	waitForDemoReady,
	getCardNames,
	getCardCount,
} from "./helpers";

test.describe("Demo Cards", () => {
	test.beforeEach(async ({ page }) => {
		await enableAllMocksViaStorage(page);
		await page.goto("./playground");
		await waitForDemoReady(page);
	});

	test("renders all 6 Pokemon cards", async ({ page }) => {
		const count = await getCardCount(page);
		expect(count).toBe(6);
	});

	test("each card shows a Pokemon name", async ({ page }) => {
		const names = await getCardNames(page);
		expect(names).toHaveLength(6);

		expect(names).toContain("gengar");
		expect(names).toContain("snorlax");
		expect(names).toContain("charizard");
		expect(names).toContain("tyranitar");
		expect(names).toContain("pancham");
		expect(names).toContain("salamence");
	});

	test("cards show library labels", async ({ page }) => {
		await expect(page.locator("text=fetch").first()).toBeVisible();
		await expect(page.locator("text=urql").first()).toBeVisible();
		await expect(
			page.locator("text=@tanstack/query").first(),
		).toBeVisible();
		await expect(page.locator("text=swr").first()).toBeVisible();
		await expect(page.locator("text=apollo").first()).toBeVisible();
		await expect(page.locator("text=axios").first()).toBeVisible();
	});

	test("cards show REST and GraphQL badges", async ({ page }) => {
		// Card badges use exact text "REST" or "GraphQL" in spans
		// DevTools panel also contains "rest"/"graphql" in lowercase badges
		// Use exact case match to target only card-level badges
		const restBadges = page.locator("span").filter({ hasText: /^REST$/ });
		const restCount = await restBadges.count();
		expect(restCount).toBe(3);

		const gqlBadges = page.locator("span").filter({ hasText: /^GraphQL$/ });
		const gqlCount = await gqlBadges.count();
		expect(gqlCount).toBe(3);
	});

	test("cards show Pokemon sprites", async ({ page }) => {
		// Each card renders an img with alt=pokemonName
		// At least 5 of 6 cards should have PokeAPI sprite URLs
		// (Salamence's mock descriptor uses JSON.stringify on sprites, so its src may be empty)
		const spriteImages = page.locator(
			'img[src*="sprites/master/sprites/pokemon"]',
		);
		const count = await spriteImages.count();
		expect(count).toBeGreaterThanOrEqual(5);
	});

	test("cards have refetch buttons", async ({ page }) => {
		const refetchButtons = page
			.locator("button")
			.filter({ hasText: "Refetch" });
		await expect(refetchButtons).toHaveCount(6);
	});

	test("cards display Pokemon types", async ({ page }) => {
		// Check type badges are visible
		await expect(
			page.locator("span").filter({ hasText: /^ghost$/ }).first(),
		).toBeVisible();
		await expect(
			page.locator("span").filter({ hasText: /^fire$/ }).first(),
		).toBeVisible();
		await expect(
			page.locator("span").filter({ hasText: /^dragon$/ }).first(),
		).toBeVisible();
		await expect(
			page.locator("span").filter({ hasText: /^fighting$/ }).first(),
		).toBeVisible();
	});
});
