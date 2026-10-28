import { test } from "@playwright/test";

import {
  expectAllOffReturnsLive,
  expectAllOffShowsLiveCharizardSprite,
  expectMockPayloadLeaves,
  STALE_MOCK_CASES,
} from "./helpers";

test.describe("stale mock after toggle off", () => {
  for (const [slug, operation, override] of STALE_MOCK_CASES) {
    test(`${slug} ${operation} drops the override when the mock is turned off`, async ({
      page,
    }) => {
      await expectMockPayloadLeaves(page, {
        operation,
        override,
        path: `./playground/${slug}`,
      });
    });
  }

  test("All Off then Charizard Refetch returns live PokeAPI", async ({ page }) => {
    test.setTimeout(60_000);
    await expectAllOffReturnsLive(page, { path: "./playground/query" });
  });

  test("All On → Refetch → All Off → Refetch shows live Charizard sprite", async ({ page }) => {
    test.setTimeout(60_000);
    await expectAllOffShowsLiveCharizardSprite(page, { path: "./playground/query" });
  });
});
