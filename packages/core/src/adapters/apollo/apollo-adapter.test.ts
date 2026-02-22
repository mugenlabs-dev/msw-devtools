import { describe, it, expect, vi } from "vitest";
import { createApolloAdapter } from "./apollo-adapter";

describe("createApolloAdapter", () => {
	it("returns an adapter with id 'apollo'", () => {
		const client = { refetchQueries: vi.fn() };
		const adapter = createApolloAdapter(client as any);
		expect(adapter.id).toBe("apollo");
	});

	it("calls client.refetchQueries with active queries on mock update", () => {
		const client = { refetchQueries: vi.fn() };
		const adapter = createApolloAdapter(client as any);

		adapter.onMockUpdate("GetUser", "toggle");

		expect(client.refetchQueries).toHaveBeenCalledTimes(1);
		expect(client.refetchQueries).toHaveBeenCalledWith({ include: "active" });
	});
});
