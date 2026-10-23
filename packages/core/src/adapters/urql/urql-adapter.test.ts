import { createUrqlAdapter } from "./urql-adapter";

describe("urql adapter", () => {
  it("returns an adapter with id 'urql'", () => {
    expect(createUrqlAdapter().id).toBe("urql");
  });

  it("leaves refetching to mockRefetchExchange", () => {
    const adapter = createUrqlAdapter();

    expect(() => adapter.onMockUpdate("GetUser", "toggle")).not.toThrow();
  });
});
