import { test } from "@playwright/test";

import { playgroundPersistenceKey } from "../apps/demo/src/playground-persistence";
import { expectMockPayloadLeaves, STALE_MOCK_CASES } from "../e2e/helpers";

test.describe("stale mock after toggle off", () => {
  for (const [slug, operation, override] of STALE_MOCK_CASES) {
    test(`${slug} ${operation} drops the override when the mock is turned off`, async ({
      page,
    }) => {
      await expectMockPayloadLeaves(page, {
        operation,
        override,
        path: `./${slug}`,
        persistenceKey: playgroundPersistenceKey("2"),
      });
    });
  }
});
