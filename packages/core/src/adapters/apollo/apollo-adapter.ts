import { ignoreRejection } from "#/adapter/ignore-rejection";
import type { MockChangeType, MswDevToolAdapter } from "#/adapter/types";

/**
 * The subset of `ApolloClient` the adapter relies on. Typed structurally so the
 * adapter works with both Apollo Client 3 (generic `ApolloClient<TCache>`) and
 * Apollo Client 4 (non-generic `ApolloClient`).
 */
export interface ApolloClientLike {
  refetchQueries: (options: { include: "active" }) => unknown;
}

/**
 * Creates an Apollo Client adapter for MSW DevTools.
 * When mock configuration changes, it refetches all active queries.
 */
export const createApolloAdapter = (client: ApolloClientLike): MswDevToolAdapter => ({
  id: "apollo",
  onMockUpdate(_operationName: string, _changeType: MockChangeType): void {
    ignoreRejection(client.refetchQueries({ include: "active" }));
  },
});
