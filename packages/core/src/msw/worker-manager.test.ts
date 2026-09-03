import { HttpResponse, http } from "msw";
import type { mockRegistry } from "#/registry/registry";
import type { useMockStore } from "#/store/store";
import type { startWorker as StartWorker } from "./worker-manager";

const { setupWorkerMock, startMock, setupTrackerMock, resetHandlersMock } = vi.hoisted(() => ({
  resetHandlersMock: vi.fn(),
  setupTrackerMock: vi.fn(),
  setupWorkerMock: vi.fn(),
  startMock: vi.fn(),
}));

vi.mock("msw/browser", () => ({ setupWorker: setupWorkerMock }));
vi.mock("./operation-tracker", () => ({ setupOperationTracker: setupTrackerMock }));

describe("worker-manager - startWorker", () => {
  let startWorkerFn: typeof StartWorker;
  let registry: typeof mockRegistry;
  let store: typeof useMockStore;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    setupWorkerMock.mockReturnValue({
      events: { on: vi.fn() },
      resetHandlers: resetHandlersMock,
      start: startMock,
    });
    // Simulate an async worker start so concurrent callers overlap in flight.
    startMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(resolve, 10);
        })
    );

    ({ startWorker: startWorkerFn } = await import("./worker-manager"));
    ({ mockRegistry: registry } = await import("#/registry/registry"));
    ({ useMockStore: store } = await import("#/store/store"));
  });

  it("creates a single worker for concurrent start calls", async () => {
    const [a, b, c] = await Promise.all([startWorkerFn(), startWorkerFn(), startWorkerFn()]);

    expect(setupWorkerMock).toHaveBeenCalledTimes(1);
    expect(startMock).toHaveBeenCalledTimes(1);
    expect(setupTrackerMock).toHaveBeenCalledTimes(1);
    expect(a).toBe(b);
    expect(b).toBe(c);
  });

  it("reuses the worker on subsequent calls after start", async () => {
    const first = await startWorkerFn();
    const second = await startWorkerFn();

    expect(setupWorkerMock).toHaveBeenCalledTimes(1);
    expect(first).toBe(second);
  });

  it("installs handlers for mocks registered after the worker started", async () => {
    await startWorkerFn();
    expect(resetHandlersMock).not.toHaveBeenCalled();

    registry.register({
      method: "get",
      operationName: "GET /late",
      path: "http://localhost/late",
      type: "rest",
      variants: [
        {
          handler: http.get("http://localhost/late", () => HttpResponse.json({})),
          id: "variant-0",
          label: "Default",
        },
      ],
    });

    expect(resetHandlersMock).toHaveBeenCalledTimes(1);
    expect(resetHandlersMock.mock.calls[0]).toHaveLength(1);
    expect(store.getState().operations["GET /late"]).toBeDefined();
  });
});
