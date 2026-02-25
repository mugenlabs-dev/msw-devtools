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
    void mutate(() => true, undefined, { revalidate: true });
  },
});
