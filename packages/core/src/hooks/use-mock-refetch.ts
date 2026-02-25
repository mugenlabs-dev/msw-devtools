import { useEffect } from "react";
import { onMockUpdate } from "#/adapter/event-bus";

/**
 * Automatically refetches when a mock configuration changes for the
 * given operation. This is the plain-fetch equivalent of the library
 * adapters (URQL, TanStack Query, SWR, Apollo).
 *
 * ```tsx
 * const { data, refetch } = useMyFetch("/api/users");
 * useMockRefetch("GET Users", refetch);
 * ```
 */
export const useMockRefetch = (operationName: string, refetch: () => void): void => {
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
