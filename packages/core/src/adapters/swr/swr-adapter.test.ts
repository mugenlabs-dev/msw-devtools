import { describe, it, expect, vi } from "vitest";
import { createSwrAdapter } from "./swr-adapter";

describe("createSwrAdapter", () => {
	it("returns an adapter with id 'swr'", () => {
		const mutate = vi.fn();
		const adapter = createSwrAdapter(mutate);
		expect(adapter.id).toBe("swr");
	});

	it("calls mutate with revalidate on mock update", () => {
		const mutate = vi.fn();
		const adapter = createSwrAdapter(mutate);

		adapter.onMockUpdate("GetUser", "toggle");

		expect(mutate).toHaveBeenCalledTimes(1);
		expect(mutate).toHaveBeenCalledWith(
			expect.any(Function),
			undefined,
			{ revalidate: true },
		);
	});

	it("passes a matcher function that returns true for all keys", () => {
		const mutate = vi.fn();
		const adapter = createSwrAdapter(mutate);

		adapter.onMockUpdate("GetUser", "toggle");

		const matcher = mutate.mock.calls[0][0];
		expect(matcher("any-key")).toBe(true);
		expect(matcher("")).toBe(true);
	});
});
