import { test, expect } from "@playwright/test";
import {
	enableAllMocksViaStorage,
	waitForDemoReady,
	openDevToolsPanel,
} from "./helpers";

test.describe("Mock Toggling", () => {
	test.beforeEach(async ({ page }) => {
		await enableAllMocksViaStorage(page);
		await page.goto("./playground");
		await waitForDemoReady(page);
		await openDevToolsPanel(page);
	});

	test("All On enables all mocks", async ({ page }) => {
		// First disable all to have a known state
		await page.locator("button").filter({ hasText: "All Off" }).click();
		await page.waitForTimeout(500);

		// Click "All On"
		await page.locator("button").filter({ hasText: "All On" }).click();
		await page.waitForTimeout(500);

		// The active count should show 8/8
		await expect(
			page.locator("text=8/8 active").first(),
		).toBeVisible();
	});

	test("All Off disables all mocks", async ({ page }) => {
		// Click "All Off"
		await page.locator("button").filter({ hasText: "All Off" }).click();
		await page.waitForTimeout(500);

		// The active count should show 0/8
		await expect(
			page.locator("text=0/8 active").first(),
		).toBeVisible();
	});

	test("Clear seen button removes LIVE badges", async ({ page }) => {
		// Wait for fetches to populate LIVE badges
		await page.waitForTimeout(3000);

		// Count LIVE badges before clear
		const liveBadgesBefore = await page
			.locator("span")
			.filter({ hasText: /^LIVE$/ })
			.count();
		expect(liveBadgesBefore).toBeGreaterThan(0);

		// Click "Clear seen"
		await page.locator("button").filter({ hasText: "Clear seen" }).click();
		await page.waitForTimeout(500);

		// LIVE badges should be gone
		const liveBadgesAfter = await page
			.locator("span")
			.filter({ hasText: /^LIVE$/ })
			.count();
		expect(liveBadgesAfter).toBe(0);
	});
});
