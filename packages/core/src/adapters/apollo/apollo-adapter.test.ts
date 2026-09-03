import { createApolloAdapter } from "./apollo-adapter";

const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("apollo adapter", () => {
  it("returns an adapter with id 'apollo'", () => {
    const client = { refetchQueries: vi.fn() };
    const adapter = createApolloAdapter(
      client as unknown as Parameters<typeof createApolloAdapter>[0]
    );
    expect(adapter.id).toBe("apollo");
  });

  it("calls client.refetchQueries with active queries on mock update", () => {
    const client = { refetchQueries: vi.fn() };
    const adapter = createApolloAdapter(
      client as unknown as Parameters<typeof createApolloAdapter>[0]
    );

    adapter.onMockUpdate("GetUser", "toggle");

    expect(client.refetchQueries).toHaveBeenCalledOnce();
    expect(client.refetchQueries).toHaveBeenCalledWith({ include: "active" });
  });

  it("does not surface a failed refetch as an unhandled rejection", async () => {
    const client = { refetchQueries: vi.fn().mockRejectedValue(new Error("network error")) };
    const adapter = createApolloAdapter(
      client as unknown as Parameters<typeof createApolloAdapter>[0]
    );

    adapter.onMockUpdate("GetUser", "toggle");
    await flushMicrotasks();

    expect(client.refetchQueries).toHaveBeenCalledOnce();
  });
});
