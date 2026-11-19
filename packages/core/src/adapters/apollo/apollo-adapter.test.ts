import { createApolloAdapter } from "./apollo-adapter";

const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("apollo adapter", () => {
  it("returns an adapter with id 'apollo'", () => {
    const client = { resetStore: vi.fn() };
    const adapter = createApolloAdapter(
      client as unknown as Parameters<typeof createApolloAdapter>[0]
    );
    expect(adapter.id).toBe("apollo");
  });

  it("calls client.resetStore on mock update", () => {
    const client = { resetStore: vi.fn() };
    const adapter = createApolloAdapter(
      client as unknown as Parameters<typeof createApolloAdapter>[0]
    );

    adapter.onMockUpdate("GetUser", "toggle");

    expect(client.resetStore).toHaveBeenCalledOnce();
  });

  it("does not surface a failed reset as an unhandled rejection", async () => {
    const client = { resetStore: vi.fn().mockRejectedValue(new Error("network error")) };
    const adapter = createApolloAdapter(
      client as unknown as Parameters<typeof createApolloAdapter>[0]
    );

    adapter.onMockUpdate("GetUser", "toggle");
    await flushMicrotasks();

    expect(client.resetStore).toHaveBeenCalledOnce();
  });
});
