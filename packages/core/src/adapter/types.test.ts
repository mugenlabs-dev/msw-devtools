import { ALL_OPERATIONS, affectsOperation } from "./types";

describe("affectsOperation", () => {
  it("matches the exact operation name", () => {
    expect(affectsOperation({ changeType: "toggle", operationName: "GetUser" }, "GetUser")).toBe(
      true
    );
    expect(affectsOperation({ changeType: "toggle", operationName: "GetUser" }, "GetPosts")).toBe(
      false
    );
  });

  it("matches every operation for bulk events", () => {
    const event = { changeType: "enable-all" as const, operationName: ALL_OPERATIONS };
    expect(affectsOperation(event, "GetUser")).toBe(true);
    expect(affectsOperation(event, "GetPosts")).toBe(true);
  });
});
