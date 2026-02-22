import type { RequestHandler } from "msw";
import type {
	GraphQLMockDescriptor,
	MockOperationDescriptor,
	RestMethod,
	RestMockDescriptor,
} from "./types";
import { withRestVariants, withStandardVariants } from "./helpers";
import { mockRegistry } from "./registry";

/**
 * Introspects MSW request handlers and generates MockOperationDescriptors
 * for any handlers not already in the registry.
 *
 * Works by inspecting the `info` property on each handler:
 * - GraphQLHandler.info has { operationType, operationName }
 * - HttpHandler.info has { method, path }
 */
export function discoverFromHandlers(
	handlers: ReadonlyArray<RequestHandler>,
	options?: {
		/** If true, skip handlers whose operationName is already registered. Default: true */
		skipExisting?: boolean;
		/** Default group to assign to auto-discovered descriptors. Default: 'Auto-discovered' */
		group?: string;
	},
): MockOperationDescriptor[] {
	const { skipExisting = true, group = "Auto-discovered" } = options ?? {};
	const discovered: MockOperationDescriptor[] = [];
	const validRestMethods = ["get", "post", "put", "delete", "patch"];

	for (const handler of handlers) {
		const info = handler.info as unknown as Record<string, unknown>;
		if (!info?.header) continue;

		let descriptor: MockOperationDescriptor | null = null;

		if ("operationType" in info && "operationName" in info) {
			const opName =
				typeof info.operationName === "string"
					? info.operationName
					: null;
			if (!opName) continue;
			if (info.operationType === "all") continue;
			if (skipExisting && mockRegistry.get(opName)) continue;

			descriptor = {
				type: "graphql",
				operationName: opName,
				operationType: info.operationType as "query" | "mutation",
				group,
				variants: withStandardVariants(null),
			} satisfies GraphQLMockDescriptor;
		} else if ("method" in info && "path" in info) {
			const method = (
				typeof info.method === "string"
					? info.method.toLowerCase()
					: null
			) as RestMethod | null;
			const path = typeof info.path === "string" ? info.path : null;

			if (!method || !path) continue;
			if (!validRestMethods.includes(method)) continue;

			const opName = `${method.toUpperCase()} ${path}`;
			if (skipExisting && mockRegistry.get(opName)) continue;

			descriptor = {
				type: "rest",
				operationName: opName,
				method,
				path,
				group,
				variants: withRestVariants(null),
			} satisfies RestMockDescriptor;
		}

		if (descriptor) {
			discovered.push(descriptor);
		}
	}

	if (discovered.length > 0) {
		mockRegistry.register(...discovered);
	}

	return discovered;
}
