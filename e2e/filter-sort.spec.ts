import { test, expect } from "@playwright/test";
import {
	enableAllMocksViaStorage,
	waitForDemoReady,
	openDevToolsPanel,
} from "./helpers";

test.describe("Filter & Sort", () => {
	test.beforeEach(async ({ page }) => {
		await enableAllMocksViaStorage(page);
		await page.goto("./playground");
		await waitForDemoReady(page);
		await openDevToolsPanel(page);
	});

	test("filter buttons are visible", async ({ page }) => {
		for (const label of ["all", "live", "enabled", "rest", "graphql"]) {
			await expect(
				page
					.locator("button")
					.filter({ hasText: new RegExp(`^${label}$`, "i") })
					.first(),
			).toBeVisible();
		}
	});

	test("sort dropdown is visible with default option", async ({ page }) => {
		const sortSelect = page.locator("select").first();
		await expect(sortSelect).toBeVisible();
		await expect(sortSelect).toHaveValue("default");
	});

	test("REST filter shows only REST operations", async ({ page }) => {
		await page
			.locator("button")
			.filter({ hasText: /^rest$/i })
			.first()
			.click();
		await page.waitForTimeout(300);

		const opTexts = await page
			.locator("[role='button']")
			.allTextContents();
		const combinedText = opTexts.join(" ");

		expect(combinedText).toContain("GET Gengar");
		expect(combinedText).toContain("GET Charizard");
		expect(combinedText).toContain("GET Tyranitar");
		expect(combinedText).toContain("GET Eevee");
		expect(combinedText).not.toContain("GetSnorlax");
		expect(combinedText).not.toContain("GetPancham");
	});

	test("GraphQL filter shows only GraphQL operations", async ({ page }) => {
		await page
			.locator("button")
			.filter({ hasText: /^graphql$/i })
			.first()
			.click();
		await page.waitForTimeout(300);

		const opTexts = await page
			.locator("[role='button']")
			.allTextContents();
		const combinedText = opTexts.join(" ");

		expect(combinedText).toContain("GetSnorlax");
		expect(combinedText).toContain("GetPancham");
		expect(combinedText).toContain("GetSalamence");
		expect(combinedText).toContain("GetMewtwo");
		expect(combinedText).not.toContain("GET Gengar");
		expect(combinedText).not.toContain("GET Charizard");
	});

	test("LIVE filter shows only fetched operations", async ({ page }) => {
		// Wait for fetches to complete
		await page.waitForTimeout(3000);

		await page
			.locator("button")
			.filter({ hasText: /^live$/i })
			.first()
			.click();
		await page.waitForTimeout(300);

		const opTexts = await page
			.locator("[role='button']")
			.allTextContents();
		const combinedText = opTexts.join(" ");

		// Non-live operations should NOT appear
		expect(combinedText).not.toContain("GetMewtwo");
		expect(combinedText).not.toContain("GET Eevee");
	});

	test("Enabled filter shows only enabled operations", async ({ page }) => {
		// All mocks are pre-enabled via localStorage
		await page
			.locator("button")
			.filter({ hasText: /^enabled$/i })
			.first()
			.click();
		await page.waitForTimeout(300);

		const opTexts = await page
			.locator("[role='button']")
			.allTextContents();
		const combinedText = opTexts.join(" ");

		expect(combinedText).toContain("GetSnorlax");
		expect(combinedText).toContain("GET Gengar");
		expect(combinedText).toContain("GetMewtwo");
		expect(combinedText).toContain("GET Eevee");
	});

	test("A-Z sort orders operations alphabetically", async ({ page }) => {
		await page.locator("select").first().selectOption("a-z");
		await page.waitForTimeout(300);

		const opElements = page.locator("[role='button']");
		const count = await opElements.count();
		expect(count).toBeGreaterThanOrEqual(2);

		const texts: string[] = [];
		for (let i = 0; i < count; i++) {
			const text = await opElements.nth(i).textContent();
			if (text) texts.push(text);
		}

		for (let i = 1; i < texts.length; i++) {
			expect(
				texts[i].localeCompare(texts[i - 1]),
			).toBeGreaterThanOrEqual(0);
		}
	});

	test("Z-A sort orders operations in reverse", async ({ page }) => {
		await page.locator("select").first().selectOption("z-a");
		await page.waitForTimeout(300);

		const opElements = page.locator("[role='button']");
		const count = await opElements.count();
		expect(count).toBeGreaterThanOrEqual(2);

		const texts: string[] = [];
		for (let i = 0; i < count; i++) {
			const text = await opElements.nth(i).textContent();
			if (text) texts.push(text);
		}

		for (let i = 1; i < texts.length; i++) {
			expect(
				texts[i].localeCompare(texts[i - 1]),
			).toBeLessThanOrEqual(0);
		}
	});

	test("switching back to All filter shows all operations", async ({
		page,
	}) => {
		await page
			.locator("button")
			.filter({ hasText: /^rest$/i })
			.first()
			.click();
		await page.waitForTimeout(300);

		await page
			.locator("button")
			.filter({ hasText: /^all$/i })
			.first()
			.click();
		await page.waitForTimeout(300);

		const opTexts = await page
			.locator("[role='button']")
			.allTextContents();
		const combinedText = opTexts.join(" ");
		expect(combinedText).toContain("GetSnorlax");
		expect(combinedText).toContain("GET Gengar");
		expect(combinedText).toContain("GetMewtwo");
		expect(combinedText).toContain("GET Eevee");
	});
});
