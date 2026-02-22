import { type Page, expect } from "@playwright/test";

/**
 * Pre-enable all mocks via localStorage before the page loads.
 * The Zustand store persists under key "msw-devtool-store".
 * This ensures cards always show mock data instead of relying on real APIs.
 */
export async function enableAllMocksViaStorage(page: Page) {
	const operations: Record<
		string,
		{
			enabled: boolean;
			activeVariantId: string;
			customJsonOverride: null;
			delay: number;
			statusCode: null;
			customHeaders: null;
		}
	> = {};

	const names = [
		"GetSnorlax",
		"GetPancham",
		"GetSalamence",
		"GetMewtwo",
		"GET Gengar",
		"GET Charizard",
		"GET Tyranitar",
		"GET Eevee",
	];

	for (const name of names) {
		operations[name] = {
			enabled: true,
			activeVariantId: "success",
			customJsonOverride: null,
			delay: 0,
			statusCode: null,
			customHeaders: null,
		};
	}

	await page.addInitScript((ops) => {
		const state = {
			state: { operations: ops },
			version: 0,
		};
		localStorage.setItem("msw-devtool-store", JSON.stringify(state));
	}, operations);
}

/**
 * Wait for the demo app to fully load (all 6 Pokemon card names rendered).
 */
export async function waitForDemoReady(page: Page) {
	// Wait for at least 6 h3 elements inside the card grid
	// The grid is a div with style "grid-template-columns"
	await page.waitForFunction(
		() => {
			const h3s = document.querySelectorAll("h3");
			let count = 0;
			for (const h3 of h3s) {
				const text = h3.textContent?.trim().toLowerCase() ?? "";
				// Exclude DevTools headings
				if (
					text &&
					text !== "msw mocks" &&
					!text.includes("add more")
				) {
					count++;
				}
			}
			return count >= 6;
		},
		{ timeout: 30000 },
	);
}

/**
 * Ensure the MSW DevTools panel is open.
 * With config={{ defaultOpen: true }}, the panel may already be open.
 * If not, click the toggle button to open it.
 */
export async function openDevToolsPanel(page: Page) {
	// Check if the panel is already open (defaultOpen: true)
	const mswActive = page.locator("text=MSW Active").first();
	if (await mswActive.isVisible({ timeout: 3000 }).catch(() => false)) {
		return; // Panel is already open
	}

	// Panel is closed — try to open it
	const openButton = page.getByRole("button", {
		name: "Open TanStack Devtools",
	});
	if (await openButton.isVisible({ timeout: 3000 }).catch(() => false)) {
		await openButton.click();
		await expect(mswActive).toBeVisible({ timeout: 5000 });
	}
}

/**
 * Get Pokemon card h3 names only (excludes devtools panel headings).
 */
export async function getCardNames(page: Page): Promise<string[]> {
	const h3s = page.locator("h3");
	const count = await h3s.count();
	const names: string[] = [];
	for (let i = 0; i < count; i++) {
		const text = (await h3s.nth(i).textContent())?.trim().toLowerCase() ?? "";
		if (text && text !== "msw mocks" && !text.includes("add more")) {
			names.push(text);
		}
	}
	return names;
}

/**
 * Count only the Pokemon card h3 elements (exclude devtools headings).
 */
export async function getCardCount(page: Page): Promise<number> {
	return (await getCardNames(page)).length;
}
