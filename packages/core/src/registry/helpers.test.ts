import { describe, it, expect } from "vitest";
import { withStandardVariants, withRestVariants } from "./helpers";

describe("withStandardVariants", () => {
	const data = { users: [{ id: 1 }] };

	it("returns 3 variants", () => {
		const variants = withStandardVariants(data);
		expect(variants).toHaveLength(3);
	});

	it("returns a success variant with the data", () => {
		const variants = withStandardVariants(data);
		const success = variants.find((v) => v.id === "success");
		expect(success).toBeDefined();
		expect(success!.label).toBe("Success");
		expect(success!.data).toEqual(data);
		expect(success!.statusCode).toBe(200);
	});

	it("returns a network error variant", () => {
		const variants = withStandardVariants(data);
		const networkError = variants.find((v) => v.id === "networkError");
		expect(networkError).toBeDefined();
		expect(networkError!.label).toBe("Network Error");
		expect(networkError!.data).toBeNull();
		expect(networkError!.isNetworkError).toBe(true);
	});

	it("returns a GraphQL error variant", () => {
		const variants = withStandardVariants(data);
		const graphqlError = variants.find((v) => v.id === "graphqlError");
		expect(graphqlError).toBeDefined();
		expect(graphqlError!.label).toBe("GraphQL Error");
		expect(graphqlError!.data).toEqual(data);
		expect(graphqlError!.isGraphQLError).toBe(true);
		expect(graphqlError!.statusCode).toBe(200);
	});
});

describe("withRestVariants", () => {
	const data = { id: 1, name: "Test" };

	it("returns 2 variants", () => {
		const variants = withRestVariants(data);
		expect(variants).toHaveLength(2);
	});

	it("returns a success variant with statusCode 200", () => {
		const variants = withRestVariants(data);
		const success = variants.find((v) => v.id === "success");
		expect(success).toBeDefined();
		expect(success!.label).toBe("Success (200)");
		expect(success!.data).toEqual(data);
		expect(success!.statusCode).toBe(200);
	});

	it("returns a network error variant", () => {
		const variants = withRestVariants(data);
		const networkError = variants.find((v) => v.id === "networkError");
		expect(networkError).toBeDefined();
		expect(networkError!.label).toBe("Network Error");
		expect(networkError!.data).toBeNull();
		expect(networkError!.isNetworkError).toBe(true);
	});

	it("does NOT include a GraphQL error variant", () => {
		const variants = withRestVariants(data);
		const graphqlError = variants.find((v) => v.id === "graphqlError");
		expect(graphqlError).toBeUndefined();
	});
});
