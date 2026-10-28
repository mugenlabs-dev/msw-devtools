import { test } from "@playwright/test";

import { expectMockPayloadLeaves, STALE_MOCK_CASES } from "./helpers";

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
});
