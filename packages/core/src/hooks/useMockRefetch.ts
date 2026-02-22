import { useEffect } from "react";
import { onMockUpdate } from "../adapter/event-bus";

/**
 * Automatically refetches when a mock configuration changes for the
 * given operation. This is the plain-fetch equivalent of the library
 * adapters (URQL, TanStack Query, SWR, Apollo).
 *
 * ```tsx
 * const { data, refetch } = useMyFetch("/api/users");
 * useMockRefetch("GET Users", refetch);
 * ```
 *
 * @param operationName  The exact operation name as registered in your descriptors.
 * @param refetch        A stable callback that re-triggers the request.
 */
export function useMockRefetch(
	operationName: string,
	refetch: () => void,
): void {
	useEffect(() => {
		return onMockUpdate((event) => {
			if (event.operationName === operationName) {
				refetch();
			}
		});
	}, [operationName, refetch]);
}
