import { ignoreRejection } from "#/adapter/ignore-rejection";
import type { MockChangeType, MswDevToolAdapter } from "#/adapter/types";

/**
 * The subset of `ApolloClient` the adapter relies on. Typed structurally so the
 * adapter works with both Apollo Client 3 (generic `ApolloClient<TCache>`) and
 * Apollo Client 4 (non-generic `ApolloClient`).
 */
export interface ApolloClientLike {
  /** Clears the normalized cache, then refetches queries that are mounted. */
  resetStore: () => unknown;
}

/**
 * Creates an Apollo Client adapter for MSW DevTools.
 * When mock configuration changes, it clears the store and refetches active
 * queries. `refetchQueries` alone would keep the cached payload on screen.
 */
export const createApolloAdapter = (client: ApolloClientLike): MswDevToolAdapter => ({
  id: "apollo",
  onMockUpdate(_operationName: string, _changeType: MockChangeType): void {
    ignoreRejection(client.resetStore());
  },
});
