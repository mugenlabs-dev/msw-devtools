import type { MockVariant } from "./types";

/** Standard success + error variants for GraphQL operations. */
export function withStandardVariants(data: unknown): MockVariant[] {
	return [
		{ id: "success", label: "Success", data, statusCode: 200 },
		{
			id: "networkError",
			label: "Network Error",
			data: null,
			isNetworkError: true,
		},
		{
			id: "graphqlError",
			label: "GraphQL Error",
			data,
			isGraphQLError: true,
			statusCode: 200,
		},
	];
}

/** Standard success + error variants for REST operations. */
export function withRestVariants(data: unknown): MockVariant[] {
	return [
		{ id: "success", label: "Success (200)", data, statusCode: 200 },
		{
			id: "networkError",
			label: "Network Error",
			data: null,
			isNetworkError: true,
		},
	];
}
