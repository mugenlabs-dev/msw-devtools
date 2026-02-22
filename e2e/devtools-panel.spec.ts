import { test, expect } from "@playwright/test";
import {
	enableAllMocksViaStorage,
	waitForDemoReady,
	openDevToolsPanel,
} from "./helpers";

test.describe("DevTools Panel", () => {
	test.beforeEach(async ({ page }) => {
		await enableAllMocksViaStorage(page);
		await page.goto("./playground");
		await waitForDemoReady(page);
		await openDevToolsPanel(page);
	});

	test("MSW worker status is active", async ({ page }) => {
		await expect(
			page.locator("text=MSW Active").first(),
		).toBeVisible({ timeout: 10000 });
	});

	test("lists all 8 registered operations", async ({ page }) => {
		// All 8 operations should appear as role="button" elements in the panel
		const pageText = await page.textContent("body");
		expect(pageText).toContain("GetSnorlax");
		expect(pageText).toContain("GetPancham");
		expect(pageText).toContain("GetSalamence");
		expect(pageText).toContain("GetMewtwo");
		expect(pageText).toContain("GET Gengar");
		expect(pageText).toContain("GET Charizard");
		expect(pageText).toContain("GET Tyranitar");
		expect(pageText).toContain("GET Eevee");
	});

	test("shows LIVE badges for fetched operations", async ({ page }) => {
		// Wait for all fetches to complete
		await page.waitForTimeout(3000);

		// LIVE badges should appear for the 6 operations that are actually fetched
		const liveBadges = page.locator("span").filter({ hasText: /^LIVE$/ });
		const count = await liveBadges.count();
		// 6 LIVE badges: GetSnorlax, GetPancham, GetSalamence, GET Gengar, GET Charizard, GET Tyranitar
		expect(count).toBeGreaterThanOrEqual(6);
	});

	test("shows active/enabled count", async ({ page }) => {
		// We pre-enabled all 8 mocks via localStorage
		await expect(
			page.locator("text=/\\d+\\/8 active/").first(),
		).toBeVisible();
	});

	test("has All On and All Off buttons", async ({ page }) => {
		await expect(
			page.locator("button").filter({ hasText: "All On" }),
		).toBeVisible();
		await expect(
			page.locator("button").filter({ hasText: "All Off" }),
		).toBeVisible();
	});

	test("has Clear seen button after operations are fetched", async ({
		page,
	}) => {
		await page.waitForTimeout(2000);
		await expect(
			page.locator("button").filter({ hasText: "Clear seen" }),
		).toBeVisible();
	});
});
