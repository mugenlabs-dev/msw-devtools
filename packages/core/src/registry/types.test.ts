import { describe, it, expect } from "vitest";
import { isGraphQLDescriptor, isRestDescriptor } from "./types";
import type { MockOperationDescriptor } from "./types";

describe("type guards", () => {
	const graphqlDescriptor: MockOperationDescriptor = {
		type: "graphql",
		operationName: "GetUser",
		operationType: "query",
		variants: [],
	};

	const restDescriptor: MockOperationDescriptor = {
		type: "rest",
		operationName: "GET Users",
		method: "get",
		path: "/api/users",
		variants: [],
	};

	describe("isGraphQLDescriptor", () => {
		it("returns true for GraphQL descriptors", () => {
			expect(isGraphQLDescriptor(graphqlDescriptor)).toBe(true);
		});

		it("returns false for REST descriptors", () => {
			expect(isGraphQLDescriptor(restDescriptor)).toBe(false);
		});
	});

	describe("isRestDescriptor", () => {
		it("returns true for REST descriptors", () => {
			expect(isRestDescriptor(restDescriptor)).toBe(true);
		});

		it("returns false for GraphQL descriptors", () => {
			expect(isRestDescriptor(graphqlDescriptor)).toBe(false);
		});
	});
});
