import { ignoreRejection } from "#/adapter/ignore-rejection";
import type { MockChangeType, MswDevToolAdapter } from "#/adapter/types";

type SWRMutateFn = (
  matcher: (key: string) => boolean,
  data?: unknown,
  opts?: { revalidate: boolean }
) => Promise<unknown>;

/**
 * Creates an SWR adapter for MSW DevTools.
 * When mock configuration changes, it revalidates all SWR cache entries.
 */
export const createSwrAdapter = (mutate: SWRMutateFn): MswDevToolAdapter => ({
  id: "swr",
  onMockUpdate(_operationName: string, _changeType: MockChangeType): void {
    // No data argument: SWR revalidates every key and keeps the cached data on
    // screen. Passing `undefined` as data would clear every key first.
    ignoreRejection(mutate(() => true));
  },
});
