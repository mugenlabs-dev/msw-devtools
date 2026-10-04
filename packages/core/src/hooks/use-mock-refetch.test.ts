import { renderHook } from "@testing-library/react";
import { dispatchMockUpdate } from "#/adapter/event-bus";
import { ALL_OPERATIONS } from "#/adapter/types";
import type { OperationHandle } from "#/registry/types";
import { useMockRefetch } from "./use-mock-refetch";

describe("useMockRefetch", () => {
  it("refetches when a matching operation-name string updates", () => {
    const refetch = vi.fn();
    renderHook(() => useMockRefetch("GetUser", refetch));

    dispatchMockUpdate("GetUser", "toggle");

    expect(refetch).toHaveBeenCalledOnce();
  });

  it("refetches when a matching OperationHandle updates", () => {
    const refetch = vi.fn();
    const handle: OperationHandle = { operationName: "GetUser" };
    renderHook(() => useMockRefetch(handle, refetch));

    dispatchMockUpdate("GetUser", "json-override");

    expect(refetch).toHaveBeenCalledOnce();
  });

  it("refetches on ALL_OPERATIONS bulk events", () => {
    const refetch = vi.fn();
    renderHook(() => useMockRefetch("GetUser", refetch));

    dispatchMockUpdate(ALL_OPERATIONS, "enable-all");

    expect(refetch).toHaveBeenCalledOnce();
  });

  it("does not refetch for a different operation", () => {
    const refetch = vi.fn();
    renderHook(() => useMockRefetch("GetUser", refetch));

    dispatchMockUpdate("GetPosts", "toggle");

    expect(refetch).not.toHaveBeenCalled();
  });

  it("unsubscribes on unmount", () => {
    const refetch = vi.fn();
    const { unmount } = renderHook(() => useMockRefetch("GetUser", refetch));

    unmount();
    dispatchMockUpdate("GetUser", "toggle");

    expect(refetch).not.toHaveBeenCalled();
  });
});
