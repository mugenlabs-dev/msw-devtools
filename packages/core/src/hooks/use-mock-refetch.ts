import { useEffect } from "react";
import { onMockUpdate } from "#/adapter/event-bus";
import { affectsOperation } from "#/adapter/types";
import type { OperationHandle } from "#/registry/types";

/**
 * Automatically refetches when a mock configuration changes for the
 * given operation. This is the plain-fetch equivalent of the library
 * adapters (URQL, TanStack Query, SWR, Apollo).
 *
 * Accepts either a raw operation name or — preferred — an {@link OperationHandle}
 * returned from `registerRestMocks` / `registerGraphqlMocks`, which keeps the
 * name type-safe and avoids silent no-ops on typos.
 *
 * `refetch` should drop the data on screen before it requests. The hook does
 * not own that state. A callback that only fires the request leaves the mocked
 * payload up while the request runs, and after the request fails.
 *
 * ```tsx
 * const [users] = registerRestMocks({ handler: usersHandler });
 * const { data, refetch } = useMyFetch("/api/users");
 * useMockRefetch(users, refetch); // or useMockRefetch("GET /api/users", refetch)
 * ```
 */
export const useMockRefetch = (operation: OperationHandle | string, refetch: () => void): void => {
  const operationName = typeof operation === "string" ? operation : operation.operationName;
  useEffect(
    () =>
      onMockUpdate((event) => {
        if (affectsOperation(event, operationName)) {
          refetch();
        }
      }),
    [operationName, refetch]
  );
};
