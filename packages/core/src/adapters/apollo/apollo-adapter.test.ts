import { createApolloAdapter } from "./apollo-adapter";

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
});
