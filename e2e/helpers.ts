import type { Page } from "@playwright/test";

import { expect } from "@playwright/test";

/** All registered operation names in the demo app. */
export const ALL_OPERATION_NAMES = [
  // TanStack Query page — 3 REST + 3 GraphQL
  "GET Charizard",
  "GET Gengar",
  "GET Tyranitar",
  "GetPancham",
  "GetSalamence",
  "GetSnorlax",
  // SWR page — 3 REST + 3 GraphQL
  "GET Garchomp",
  "GET Lucario",
  "GET Blaziken",
  "GetGardevoir",
  "GetScizor",
  "GetTogekiss",
  // URQL page — all GraphQL
  "GetEevee",
  "GetLapras",
  "GetAlakazam",
  "GetArcanine",
  "GetSteelix",
  "GetHeracross",
  // Apollo page — all GraphQL
  "GetRayquaza",
  "GetMetagross",
  "GetMilotic",
  "GetAbsol",
  "GetFlygon",
  "GetAggron",
  // Fetch + Axios page — all REST
  "GET Mimikyu",
  "GET Umbreon",
  "GET Espeon",
  "GET Sylveon",
  "GET Mewtwo",
  "GET Dragonite",
];

/** Operation names per playground page — for LIVE badge assertions. */
export const PAGE_OPERATIONS: Record<string, string[]> = {
  apollo: ["GetRayquaza", "GetMetagross", "GetMilotic", "GetAbsol", "GetFlygon", "GetAggron"],
  fetch: ["GET Mimikyu", "GET Umbreon", "GET Espeon", "GET Sylveon", "GET Mewtwo", "GET Dragonite"],
  query: [
    "GET Charizard",
    "GET Gengar",
    "GET Tyranitar",
    "GetPancham",
    "GetSalamence",
    "GetSnorlax",
  ],
  swr: ["GET Garchomp", "GET Lucario", "GET Blaziken", "GetGardevoir", "GetScizor", "GetTogekiss"],
  urql: ["GetEevee", "GetLapras", "GetAlakazam", "GetArcanine", "GetSteelix", "GetHeracross"],
};

/**
 * Pre-enable all mocks via localStorage before the page loads.
 * The Zustand store persists under key "msw-devtool-store".
 * This ensures cards always show mock data instead of relying on real APIs.
 *
 * When `seedOnce` is true, localStorage is only set if not already present,
 * preserving any state changes (e.g. filter/sort) across navigations.
 */
export const enableAllMocksViaStorage = async (page: Page, options?: { seedOnce?: boolean }) => {
  const seedOnce = options?.seedOnce ?? false;

  const operations: Record<
    string,
    {
      activeVariantId: string;
      customHeaders: null;
      customJsonOverride: null;
      delay: number;
      enabled: boolean;
      errorOverride: null;
      statusCode: null;
    }
  > = {};

  for (const name of ALL_OPERATION_NAMES) {
    operations[name] = {
      activeVariantId: "variant-0",
      customHeaders: null,
      customJsonOverride: null,
      delay: 0,
      enabled: true,
      errorOverride: null,
      statusCode: null,
    };
  }

  await page.addInitScript(
    ({ ops, onlyIfEmpty }) => {
      if (onlyIfEmpty && localStorage.getItem("msw-devtool-store") !== null) {
        return;
      }
      const state = {
        state: {
          collapsedGroups: [],
          filter: "all",
          isGrouped: true,
          operations: ops,
          sort: "default",
        },
        version: 0,
      };
      localStorage.setItem("msw-devtool-store", JSON.stringify(state));
    },
    { onlyIfEmpty: seedOnce, ops: operations }
  );
};

/**
 * Wait for the demo app to fully load (at least 6 Pokemon card names rendered).
 */
export const waitForDemoReady = async (page: Page) => {
  await page.waitForFunction(
    () => {
      const h3s = document.querySelectorAll("h3");
      let count = 0;
      for (const h3 of h3s) {
        const text = h3.textContent?.trim().toLowerCase() ?? "";
        if (text && text !== "msw mocks" && !text.includes("add more")) {
          count += 1;
        }
      }
      return count >= 6;
    },
    { timeout: 30_000 }
  );
};

/**
 * Ensure the MSW DevTools panel is open.
 * With config={{ defaultOpen: true }}, the panel may already be open.
 * If not, click the toggle button to open it.
 */
export const openDevToolsPanel = async (page: Page) => {
  const mswActive = page.locator("text=MSW Active").first();
  if (await mswActive.isVisible({ timeout: 3000 }).catch(() => false)) {
    return;
  }

  const openButton = page.getByRole("button", {
    name: "Open TanStack Devtools",
  });
  if (await openButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await openButton.click();
    await expect(mswActive).toBeVisible({ timeout: 5000 });
  }
};

/**
 * Wait until at least `count` LIVE badges are visible in the devtools panel.
 * Replaces hardcoded `waitForTimeout(3000)` with a targeted wait.
 */
export const waitForLiveBadges = async (page: Page, count = 1) => {
  await page.waitForFunction(
    (minCount) => {
      const badges = document.querySelectorAll("span");
      let found = 0;
      for (const badge of badges) {
        if (badge.textContent?.trim() === "LIVE") {
          found += 1;
        }
      }
      return found >= minCount;
    },
    count,
    { timeout: 15_000 }
  );
};

/**
 * Wait for the operation row count to match `count` after a filter change.
 */
export const waitForOperationCount = async (page: Page, count: number) => {
  await expect(page.locator("[data-testid='operation-row']")).toHaveCount(count, {
    timeout: 5000,
  });
};

/**
 * Get Pokemon card h3 names only (excludes devtools panel headings).
 */
export const getCardNames = async (page: Page): Promise<string[]> => {
  const h3s = page.locator("h3");
  const count = await h3s.count();
  const names: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const rawText = await h3s.nth(i).textContent();
    const text = rawText?.trim().toLowerCase() ?? "";
    if (text && text !== "msw mocks" && !text.includes("add more")) {
      names.push(text);
    }
  }
  return names;
};

/**
 * Count only the Pokemon card h3 elements (exclude devtools headings).
 */
export const getCardCount = async (page: Page): Promise<number> => {
  const names = await getCardNames(page);
  return names.length;
};

/**
 * Select an operation in the DevTools panel by its name.
 * Clicks the operation row to open the detail panel.
 */
export const selectOperation = async (page: Page, operationName: string) => {
  const row = page.locator("[data-testid='operation-row']").filter({
    hasText: operationName,
  });
  await expect(row).toBeVisible({ timeout: 5000 });
  await row.click();
  // Wait for detail panel to render
  await expect(page.getByRole("button", { name: "Toggle mock" })).toBeVisible({ timeout: 3000 });
};
