import type { Page } from "@playwright/test";

import { expect } from "@playwright/test";
import { playgroundPersistenceKey } from "../apps/demo/src/playground-persistence";

export const REST_MISSINGNO = JSON.stringify({ name: "missingno", types: [] });

export const GQL_MISSINGNO = JSON.stringify({
  data: {
    pokemon_v2_pokemon: [
      {
        name: "missingno",
        pokemon_v2_pokemonsprites: [],
        pokemon_v2_pokemontypes: [],
      },
    ],
  },
});

/** One row per playground cache. The override is a body the live API does not return. */
export const STALE_MOCK_CASES = [
  ["query", "GET Gengar", REST_MISSINGNO],
  ["swr", "GetScizor", GQL_MISSINGNO],
  ["urql", "GetEevee", GQL_MISSINGNO],
  ["rtk-query", "GET Weavile", REST_MISSINGNO],
  ["apollo", "GetAbsol", GQL_MISSINGNO],
  ["fetch", "GET Mimikyu", REST_MISSINGNO],
  ["fetch", "GET Sylveon", REST_MISSINGNO],
] as const;

/**
 * Charizard body the live API does not return.
 * The default mock uses the real species name, so a heading of "charizard" cannot show the difference.
 */
export const FIXTURE_CHARIZARD = JSON.stringify({
  name: "fixture-charizard",
  sprites: { front_default: "https://example.invalid/fixture-charizard.png" },
  types: [{ type: { name: "fixture" } }],
});

/** Seed one distinctive override, then turn that mock off and require the name to leave. */
export const expectMockPayloadLeaves = async (
  page: Page,
  options: { operation: string; override: string; path: string; persistenceKey?: string }
) => {
  await enableAllMocksViaStorage(page, {
    overrides: { [options.operation]: options.override },
    persistenceKey: options.persistenceKey,
  });
  await page.goto(options.path);
  await waitForDemoReady(page);
  await openDevToolsPanel(page);
  await expect(page.locator("h3", { hasText: /missingno/i })).toHaveCount(1);

  const row = page.locator("[data-testid='operation-row']").filter({ hasText: options.operation });
  await row.getByRole("button", { name: /Toggle.*mock/ }).click();

  await expect(page.locator("h3", { hasText: /missingno/i })).toHaveCount(0);
};

/**
 * Turn every mock off, then require the Charizard card's next read to be the live PokeAPI document.
 * Live Charizard has `abilities`. The fixture and the default mock do not.
 */
export const expectAllOffReturnsLive = async (
  page: Page,
  options: { path: string; persistenceKey?: string }
) => {
  await enableAllMocksViaStorage(page, {
    overrides: { "GET Charizard": FIXTURE_CHARIZARD },
    persistenceKey: options.persistenceKey,
  });
  await page.goto(options.path);
  await waitForDemoReady(page);
  await openDevToolsPanel(page);
  await expect(page.locator("h3", { hasText: "fixture-charizard" })).toHaveCount(1);

  const bodies: string[] = [];
  const pending: Promise<void>[] = [];
  let collect = false;
  page.on("response", (response) => {
    if (!(collect && response.url().includes("/api/v2/pokemon/6"))) {
      return;
    }
    pending.push(
      response.text().then(
        (text) => {
          bodies.push(text);
        },
        () => undefined
      )
    );
  });

  collect = true;
  await page.locator("button").filter({ hasText: "All Off" }).click();
  await expect(page.locator(`text=0/${TOTAL_OPERATIONS} active`).first()).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.locator("h3", { hasText: "fixture-charizard" })).toHaveCount(0);

  await Promise.all(pending);
  const beforeRefetch = bodies.length;
  const card = page.locator(".pokemon-card").first();
  await card.getByRole("button", { name: "Refetch" }).click();

  await expect
    .poll(
      async () => {
        await Promise.all(pending);
        if (bodies.length <= beforeRefetch) {
          return "";
        }
        return bodies.at(-1) ?? "";
      },
      { timeout: 20_000 }
    )
    .toContain('"abilities"');

  const liveBody = bodies.at(-1) ?? "";
  expect(liveBody).not.toContain("fixture-charizard");
  await expect(card.locator("h3")).toHaveText("charizard", { timeout: 20_000 });
};

/** Live Charizard `front_default` from PokeAPI (normal orange sprite). */
export const LIVE_CHARIZARD_SPRITE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png";

/** Demo mock Charizard uses the shiny asset as `front_default` so All On is visible. */
export const MOCK_CHARIZARD_SPRITE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/6.png";

/**
 * All On, refetch Charizard, All Off, refetch again.
 * The rendered `img[data-sprite="default"]` src has to move from the mock shiny
 * file to PokeAPI's normal sprite. A network body that contains `abilities` can
 * pass while this src stays on the mock.
 */
export const expectAllOffShowsLiveCharizardSprite = async (
  page: Page,
  options: { path: string }
) => {
  const consoleErrors: string[] = [];
  const onConsole = (msg: { type: () => string; text: () => string }) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  };
  const onPageError = (err: Error) => {
    consoleErrors.push(`PAGEERROR: ${err.message}`);
  };
  page.on("console", onConsole);
  page.on("pageerror", onPageError);

  try {
    await page.goto(options.path);
    await waitForDemoReady(page);
    await openDevToolsPanel(page);

    await page.locator("button").filter({ hasText: "All On" }).click();
    await expect(
      page.locator(`text=${TOTAL_OPERATIONS}/${TOTAL_OPERATIONS} active`).first()
    ).toBeVisible({
      timeout: 15_000,
    });

    const card = page
      .locator(".pokemon-card")
      .filter({ hasText: /charizard/i })
      .first();
    const sprite = card.locator('img[data-sprite="default"]');
    await card.getByRole("button", { name: "Refetch" }).click();
    await expect(sprite).toHaveAttribute("src", MOCK_CHARIZARD_SPRITE, { timeout: 20_000 });

    const errorsBeforeOff = consoleErrors.length;
    await page.locator("button").filter({ hasText: "All Off" }).click();
    await expect(page.locator(`text=0/${TOTAL_OPERATIONS} active`).first()).toBeVisible({
      timeout: 15_000,
    });

    await card.getByRole("button", { name: "Refetch" }).click();
    await expect(sprite).toHaveAttribute("src", LIVE_CHARIZARD_SPRITE, { timeout: 20_000 });
    await expect(card.locator("h3")).toHaveText("charizard");

    await card.hover();
    await expect(card.locator('img[data-sprite="shiny"]')).toHaveCount(0);
    await expect(sprite).toHaveAttribute("src", LIVE_CHARIZARD_SPRITE);
    await page.mouse.move(5, 5);

    const allSprites = page.locator('img[data-sprite="default"]');
    await expect(allSprites).toHaveCount(6);
    for (let i = 0; i < 6; i += 1) {
      await expect(allSprites.nth(i)).not.toHaveAttribute("src", /\/shiny\//, {
        timeout: 20_000,
      });
    }

    const newErrors = consoleErrors.slice(errorsBeforeOff);
    expect(newErrors, `console errors after All Off: ${newErrors.join(" | ")}`).toEqual([]);
  } finally {
    page.off("console", onConsole);
    page.off("pageerror", onPageError);
  }
};

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
  // RTK Query page — 3 REST + 3 GraphQL
  "GET Infernape",
  "GET Weavile",
  "GET Zoroark",
  "GetVolcarona",
  "GetHydreigon",
  "GetChandelure",
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

/** Number of operations the demo registers. */
export const TOTAL_OPERATIONS = ALL_OPERATION_NAMES.length;

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
  "rtk-query": [
    "GET Infernape",
    "GET Weavile",
    "GET Zoroark",
    "GetVolcarona",
    "GetHydreigon",
    "GetChandelure",
  ],
  swr: ["GET Garchomp", "GET Lucario", "GET Blaziken", "GetGardevoir", "GetScizor", "GetTogekiss"],
  urql: ["GetEevee", "GetLapras", "GetAlakazam", "GetArcanine", "GetSteelix", "GetHeracross"],
};

/**
 * Pre-enable all mocks via localStorage before the page loads.
 * The demo reads `msw-devtools-store:3` and the MSW 2 host reads `msw-devtools-store:2`.
 *
 * When `seedOnce` is true, localStorage is only set if not already present,
 * preserving any state changes (e.g. filter/sort) across navigations.
 * `overrides` maps an operation name to a `customJsonOverride` string.
 */
export const enableAllMocksViaStorage = async (
  page: Page,
  options?: {
    overrides?: Record<string, string>;
    persistenceKey?: string;
    seedOnce?: boolean;
  }
) => {
  const seedOnce = options?.seedOnce ?? false;
  const persistenceKey = options?.persistenceKey ?? playgroundPersistenceKey("3");
  const overrides = options?.overrides;

  const operations: Record<
    string,
    {
      activeVariantId: string;
      customHeaders: null;
      customJsonOverride: string | null;
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
      customJsonOverride: overrides?.[name] ?? null,
      delay: 0,
      enabled: true,
      errorOverride: null,
      statusCode: null,
    };
  }

  await page.addInitScript(
    ({ onlyIfEmpty, ops, storageKey }) => {
      if (onlyIfEmpty && localStorage.getItem(storageKey) !== null) {
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
      localStorage.setItem(storageKey, JSON.stringify(state));
    },
    { onlyIfEmpty: seedOnce, ops: operations, storageKey: persistenceKey }
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
