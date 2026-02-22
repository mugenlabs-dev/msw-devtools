import type { SetupWorker } from "msw/browser";
import { mockRegistry } from "../registry/registry";
import { useMockStore } from "../store/store";

/**
 * Sets up request:start event tracking on the MSW worker.
 * For GraphQL: extracts operationName from URL params (GET) or body (POST).
 * For REST: matches the request URL against registered REST descriptors.
 */
export function setupOperationTracker(worker: SetupWorker): void {
	worker.events.on("request:start", ({ request }) => {
		const markSeen = (name: string) =>
			useMockStore.getState().markOperationSeen(name);

		// Try GraphQL operation name extraction
		if (request.method === "GET") {
			try {
				const url = new URL(request.url);
				const opName = url.searchParams.get("operationName");
				if (opName) {
					markSeen(opName);
					return;
				}
			} catch {
				// Not a valid URL — ignore
			}
		}

		if (request.method === "POST") {
			request
				.clone()
				.json()
				.then((body: { operationName?: string }) => {
					if (body?.operationName) markSeen(body.operationName);
				})
				.catch(() => {
					// Not JSON — ignore
				});
		}

		// Try REST operation matching
		const restDescriptors = mockRegistry
			.getAll()
			.filter((d) => d.type === "rest");

		for (const descriptor of restDescriptors) {
			if (descriptor.type !== "rest") continue;
			if (request.method.toLowerCase() !== descriptor.method) continue;

			try {
				// Escape special regex chars in path, then replace :params with wildcard
				const escaped = descriptor.path.replace(
					/[.*+?^${}()|[\]\\]/g,
					"\\$&",
				);
				const pathPattern = escaped.replace(/:[^/]+/g, "[^/]+");
				const regex = new RegExp(`^${pathPattern}(\\?.*)?$`);
				// Match against the full request URL (handles both absolute and relative paths)
				if (regex.test(request.url)) {
					markSeen(descriptor.operationName);
				}
			} catch {
				// ignore
			}
		}
	});
}
