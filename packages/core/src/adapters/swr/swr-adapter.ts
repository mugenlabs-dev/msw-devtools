import { ignoreRejection } from "#/adapter/ignore-rejection";
import type { MockChangeType, MswDevToolAdapter } from "#/adapter/types";

type SWRMutateFn = (
  matcher: (key: string) => boolean,
  data?: unknown,
  opts?: { revalidate: boolean }
) => Promise<unknown>;

/**
 * Creates an SWR adapter for MSW DevTools.
 * When mock configuration changes, it clears every cache entry and revalidates.
 * `undefined` is the data argument on purpose. Omitting it leaves the previous
 * payload on screen for the whole revalidation.
 */
export const createSwrAdapter = (mutate: SWRMutateFn): MswDevToolAdapter => ({
  id: "swr",
  onMockUpdate(_operationName: string, _changeType: MockChangeType): void {
    ignoreRejection(mutate(() => true, undefined, { revalidate: true }));
  },
});
