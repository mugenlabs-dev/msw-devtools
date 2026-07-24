import { useEffect } from "react";
import { onMockUpdate } from "#/adapter/event-bus";
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
        if (event.operationName === operationName) {
          refetch();
        }
      }),
    [operationName, refetch]
  );
};
