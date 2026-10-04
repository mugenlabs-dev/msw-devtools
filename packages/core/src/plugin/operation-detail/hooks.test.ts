import { renderHook } from "@testing-library/react";
import type { ChangeEvent } from "react";
import { onMockUpdate } from "#/adapter/event-bus";
import { defaultConfig, useMockStore } from "#/store/store";
import { useErrorOverrideHandler, useFieldHandlers } from "./hooks";

const inputChange = (value: string): ChangeEvent<HTMLInputElement> =>
  ({
    target: { value },
  }) as ChangeEvent<HTMLInputElement>;

describe("operation-detail handlers", () => {
  beforeEach(() => {
    useMockStore.setState({
      operations: {
        GetUser: { ...defaultConfig, enabled: true },
      },
    });
  });

  it("dispatches delay-override when the delay input changes", () => {
    const listener = vi.fn();
    const unsubscribe = onMockUpdate(listener);
    const { result } = renderHook(() => useFieldHandlers("GetUser"));

    result.current.handleDelayChange(inputChange("250"));

    expect(useMockStore.getState().operations.GetUser.delay).toBe(250);
    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith({
      changeType: "delay-override",
      operationName: "GetUser",
    });
    unsubscribe();
  });

  it("dispatches delay-override with delay 0 when the input is not a number", () => {
    const listener = vi.fn();
    const unsubscribe = onMockUpdate(listener);
    const { result } = renderHook(() => useFieldHandlers("GetUser"));

    result.current.handleDelayChange(inputChange(""));

    expect(useMockStore.getState().operations.GetUser.delay).toBe(0);
    expect(listener).toHaveBeenCalledWith({
      changeType: "delay-override",
      operationName: "GetUser",
    });
    unsubscribe();
  });

  it("dispatches error-override instead of toggle", () => {
    const listener = vi.fn();
    const unsubscribe = onMockUpdate(listener);
    const { result } = renderHook(() => useErrorOverrideHandler("GetUser"));

    result.current.handleErrorOverrideChange(500);

    expect(useMockStore.getState().operations.GetUser.errorOverride).toBe(500);
    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith({
      changeType: "error-override",
      operationName: "GetUser",
    });
    unsubscribe();
  });
});
