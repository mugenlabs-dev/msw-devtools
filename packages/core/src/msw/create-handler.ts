import { HttpResponse, delay, graphql, http, passthrough } from "msw";
import type { MockOperationDescriptor } from "../registry/types";
import type { MockVariant } from "../registry/types";
import { isGraphQLDescriptor, isRestDescriptor } from "../registry/types";
import { useMockStore } from "../store/store";
import type { OperationMockConfig } from "../store/types";

function resolveResponseOptions(
	config: OperationMockConfig,
	variant: MockVariant,
): { status: number; headers: Record<string, string> } {
	const status = config.statusCode ?? variant.statusCode ?? 200;

	let headers: Record<string, string> = variant.headers ?? {};
	if (config.customHeaders) {
		try {
			headers = JSON.parse(config.customHeaders);
		} catch {
			// Invalid JSON — fall back to variant default headers
		}
	}

	return { status, headers };
}

export function createDynamicHandler(descriptor: MockOperationDescriptor) {
	if (isGraphQLDescriptor(descriptor)) {
		return createGraphQLHandler(descriptor);
	}
	if (isRestDescriptor(descriptor)) {
		return createRestHandler(descriptor);
	}
	throw new Error(
		`Unknown descriptor type for operation: ${(descriptor as MockOperationDescriptor).operationName}`,
	);
}

function createGraphQLHandler(
	descriptor: Extract<MockOperationDescriptor, { type: "graphql" }>,
) {
	const gqlMethod =
		descriptor.operationType === "query" ? graphql.query : graphql.mutation;

	return gqlMethod(descriptor.operationName, async () => {
		const config =
			useMockStore.getState().operations[descriptor.operationName];

		if (!config?.enabled) return passthrough();

		const variant = descriptor.variants.find(
			(v) => v.id === config.activeVariantId,
		);
		if (!variant) return passthrough();

		if (config.delay > 0) await delay(config.delay);

		if (variant.isNetworkError) return HttpResponse.error();

		let responseData = variant.data;
		if (config.customJsonOverride) {
			try {
				responseData = JSON.parse(config.customJsonOverride);
			} catch {
				// Invalid JSON — fall back to variant default data
			}
		}

		const options = resolveResponseOptions(config, variant);

		return HttpResponse.json(
			{
				data: responseData as Record<string, unknown>,
				errors: variant.isGraphQLError
					? [{ message: "Mocked GraphQL error" }]
					: undefined,
			},
			options,
		);
	});
}

function createRestHandler(
	descriptor: Extract<MockOperationDescriptor, { type: "rest" }>,
) {
	const httpMethod = http[descriptor.method];

	return httpMethod(descriptor.path, async () => {
		const config =
			useMockStore.getState().operations[descriptor.operationName];

		if (!config?.enabled) return passthrough();

		const variant = descriptor.variants.find(
			(v) => v.id === config.activeVariantId,
		);
		if (!variant) return passthrough();

		if (config.delay > 0) await delay(config.delay);

		if (variant.isNetworkError) return HttpResponse.error();

		let responseData = variant.data;
		if (config.customJsonOverride) {
			try {
				responseData = JSON.parse(config.customJsonOverride);
			} catch {
				// Invalid JSON — fall back to variant default data
			}
		}

		const options = resolveResponseOptions(config, variant);

		return HttpResponse.json(
			responseData as Record<string, unknown>,
			options,
		);
	});
}
