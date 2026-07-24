import type { Exchange, Operation } from "@urql/core";
import { makeOperation } from "@urql/core";
import { pipe, tap } from "wonka";
import { MOCK_UPDATE_EVENT_NAME } from "#/adapter/event-bus";
import type { MockUpdateEvent } from "#/adapter/types";

const getOperationName = (op: Operation): string | undefined => {
  for (const def of op.query.definitions) {
    if (def.kind === "OperationDefinition" && def.name?.value != null && def.name.value !== "") {
      return def.name.value;
    }
  }
  return undefined;
};

/**
 * URQL exchange that listens for mock update events and re-executes
 * matching active queries with network-only policy.
 *
 * Add to your URQL client's exchange chain:
 * ```ts
 * exchanges: [cacheExchange, mockRefetchExchange, fetchExchange]
 * ```
 */
// Tracks the listener from the most recently created exchange so recreating the
// URQL client removes the previous listener instead of stacking a new one.
let activeListener: EventListener | null = null;

export const mockRefetchExchange: Exchange = ({ client, forward }) => {
  const activeOps = new Map<number, Operation>();

  if (typeof window !== "undefined") {
    if (activeListener) {
      window.removeEventListener(MOCK_UPDATE_EVENT_NAME, activeListener);
    }

    const listener = ((event: CustomEvent<MockUpdateEvent>) => {
      const { operationName } = event.detail;

      for (const [, op] of activeOps) {
        if (op.kind !== "query") {
          continue;
        }
        if (getOperationName(op) !== operationName) {
          continue;
        }

        client.reexecuteOperation(
          makeOperation(op.kind, op, {
            ...op.context,
            requestPolicy: "network-only",
          })
        );
      }
    }) as EventListener;

    activeListener = listener;
    window.addEventListener(MOCK_UPDATE_EVENT_NAME, listener);
  }

  return (ops$) =>
    pipe(
      ops$,
      tap((op) => {
        if (op.kind === "teardown") {
          activeOps.delete(op.key);
        } else {
          activeOps.set(op.key, op);
        }
      }),
      forward
    );
};
