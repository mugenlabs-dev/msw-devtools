export type MockVariant = {
	id: string;
	label: string;
	/** The mock response data. null for network error variants. */
	data: unknown | null;
	/** If true, MSW returns HttpResponse.error() (simulates fetch failure). */
	isNetworkError?: boolean;
	/** GraphQL-only: wraps response in { data, errors: [...] }. */
	isGraphQLError?: boolean;
	/** HTTP status code for this variant. Default: 200. */
	statusCode?: number;
	/** Response headers for this variant. */
	headers?: Record<string, string>;
};

export type GraphQLOperationType = "query" | "mutation";

export type RestMethod = "get" | "post" | "put" | "delete" | "patch";

type MockOperationDescriptorBase = {
	/** Unique identifier for this operation. Used as the store key. */
	operationName: string;
	/** Optional grouping label (e.g., journey name, feature area). */
	group?: string;
	/** Mock response variants available for this operation. */
	variants: MockVariant[];
};

export type GraphQLMockDescriptor = MockOperationDescriptorBase & {
	type: "graphql";
	operationType: GraphQLOperationType;
};

export type RestMockDescriptor = MockOperationDescriptorBase & {
	type: "rest";
	method: RestMethod;
	/**
	 * The URL path pattern, exactly as passed to msw's http.get/post/etc.
	 * e.g., '/api/users/:id', 'https://api.example.com/products'
	 */
	path: string;
};

export type MockOperationDescriptor =
	| GraphQLMockDescriptor
	| RestMockDescriptor;

export function isGraphQLDescriptor(
	d: MockOperationDescriptor,
): d is GraphQLMockDescriptor {
	return d.type === "graphql";
}

export function isRestDescriptor(
	d: MockOperationDescriptor,
): d is RestMockDescriptor {
	return d.type === "rest";
}
