import type { Exchange, Operation } from "@urql/core";
import { makeOperation } from "@urql/core";
import { pipe, tap } from "wonka";
import { MOCK_UPDATE_EVENT_NAME } from "#/adapter/event-bus";
import { ALL_OPERATIONS, type MockUpdateEvent } from "#/adapter/types";
import { mockRegistry } from "#/registry/registry";

const getOperationName = (op: Operation): string | undefined => {
  for (const def of op.query.definitions) {
    if (def.kind === "OperationDefinition" && def.name?.value != null && def.name.value !== "") {
      return def.name.value;
    }
  }
  return undefined;
};

/**
 * Whether a mock update affects a query. The event carries the devtools name,
 * which can differ from the GraphQL document's name (a custom `operationName`
 * or a RegExp handler), so match through the registered handler's pattern.
 */
const affectsQuery = (event: MockUpdateEvent, documentName: string): boolean => {
  if (event.operationName === ALL_OPERATIONS) {
    return true;
  }
  const descriptor = mockRegistry.get(event.operationName);
  if (descriptor?.type !== "graphql") {
    return event.operationName === documentName;
  }
  const pattern = descriptor.graphqlOperationName;
  if (typeof pattern === "string") {
    return pattern === documentName;
  }
  pattern.lastIndex = 0;
  return pattern.test(documentName);
};

/**
 * URQL exchange that listens for mock update events and re-executes
 * matching active queries with network-only policy.
 *
 * Add to your URQL client's exchange chain:
 * ```ts
 * exchanges: [cacheExchange, mockRefetchExchange, fetchExchange]
 * ```
 *
 * Each client gets its own listener, so multiple clients on one page all
 * refetch. The listener only holds a weak reference to the client and removes
 * itself once the client has been garbage collected.
 */
export const mockRefetchExchange: Exchange = ({ client, forward }) => {
  // Only queries are re-executed, so only queries are tracked. Mutations never
  // emit a teardown and would otherwise accumulate for the page's lifetime.
  const activeQueries = new Map<number, Operation>();

  if (typeof window !== "undefined") {
    const clientRef = new WeakRef(client);

    const listener = ((event: CustomEvent<MockUpdateEvent>) => {
      const liveClient = clientRef.deref();
      if (!liveClient) {
        window.removeEventListener(MOCK_UPDATE_EVENT_NAME, listener);
        activeQueries.clear();
        return;
      }

      for (const [, op] of activeQueries) {
        const name = getOperationName(op);
        if (name === undefined || !affectsQuery(event.detail, name)) {
          continue;
        }
        liveClient.reexecuteOperation(
          makeOperation(op.kind, op, {
            ...op.context,
            requestPolicy: "network-only",
          })
        );
      }
    }) as EventListener;

    window.addEventListener(MOCK_UPDATE_EVENT_NAME, listener);
  }

  return (ops$) =>
    pipe(
      ops$,
      tap((op) => {
        if (op.kind === "teardown") {
          activeQueries.delete(op.key);
        } else if (op.kind === "query") {
          activeQueries.set(op.key, op);
        }
      }),
      forward
    );
};
