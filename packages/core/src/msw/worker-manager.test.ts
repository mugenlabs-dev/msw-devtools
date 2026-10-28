import { HttpResponse, http } from "msw";
import type { mockRegistry } from "#/registry/registry";
import type { useMockStore } from "#/store/store";
import type { startWorker as StartWorker, stopWorker as StopWorker } from "./worker-manager";

const {
  setupWorkerMock,
  startMock,
  stopMock,
  setupTrackerMock,
  teardownTrackerMock,
  resetHandlersMock,
  listHandlersMock,
  useMock,
} = vi.hoisted(() => ({
  listHandlersMock: vi.fn(() => []),
  resetHandlersMock: vi.fn(),
  setupTrackerMock: vi.fn(),
  setupWorkerMock: vi.fn(),
  startMock: vi.fn(),
  stopMock: vi.fn(),
  teardownTrackerMock: vi.fn(),
  useMock: vi.fn(),
}));

vi.mock("msw/browser", () => ({ setupWorker: setupWorkerMock }));
vi.mock("./operation-tracker", () => ({
  setupOperationTracker: setupTrackerMock,
  teardownOperationTracker: teardownTrackerMock,
}));

describe("worker-manager - startWorker", () => {
  let startWorkerFn: typeof StartWorker;
  let stopWorkerFn: typeof StopWorker;
  let registry: typeof mockRegistry;
  let store: typeof useMockStore;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    setupWorkerMock.mockReturnValue({
      events: { on: vi.fn() },
      listHandlers: listHandlersMock,
      resetHandlers: resetHandlersMock,
      start: startMock,
      stop: stopMock,
      use: useMock,
    });
    // Simulate an async worker start so concurrent callers overlap in flight.
    startMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(resolve, 10);
        })
    );

    ({ startWorker: startWorkerFn, stopWorker: stopWorkerFn } = await import("./worker-manager"));
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

  it("keeps handlers the app added with worker.use() when mocks are registered later", async () => {
    registry.register({
      method: "get",
      operationName: "GET /early",
      path: "http://localhost/early",
      type: "rest",
      variants: [],
    });
    await startWorkerFn();
    const appHandler = http.get("http://localhost/override", () => HttpResponse.json({}));
    const [devtoolsHandler] = setupWorkerMock.mock.calls[0] as unknown[];
    listHandlersMock.mockReturnValue([appHandler, devtoolsHandler] as never);

    registry.register({
      method: "get",
      operationName: "GET /late",
      path: "http://localhost/late",
      type: "rest",
      variants: [],
    });

    expect(useMock).toHaveBeenCalledExactlyOnceWith(appHandler);
  });

  it("warns when options are passed after the worker has started without them", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    await startWorkerFn();

    await startWorkerFn({ serviceWorkerUrl: "/custom/mockServiceWorker.js" });

    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it("does not warn when the same options are passed again", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const options = { serviceWorkerUrl: "/custom/mockServiceWorker.js" };

    await Promise.all([startWorkerFn(options), startWorkerFn(options), startWorkerFn()]);

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("passes onUnhandledRequest and onUnhandledFrame so both MSW majors work", async () => {
    await startWorkerFn({ onUnhandledRequest: "warn" });

    expect(startMock).toHaveBeenCalledWith(
      expect.objectContaining({
        onUnhandledFrame: "warn",
        onUnhandledRequest: "warn",
      })
    );
  });

  it("stops the worker, tears down tracking and allows a fresh start", async () => {
    stopMock.mockResolvedValue(undefined);
    await startWorkerFn();
    await stopWorkerFn();

    expect(stopMock).toHaveBeenCalledTimes(1);
    expect(teardownTrackerMock).toHaveBeenCalledTimes(1);
    expect(store.getState().workerStatus).toBe("idle");

    // Registry changes must no longer touch the stopped worker.
    registry.register({
      method: "get",
      operationName: "GET /after-stop",
      path: "http://localhost/after-stop",
      type: "rest",
      variants: [],
    });
    expect(resetHandlersMock).not.toHaveBeenCalled();

    await startWorkerFn();
    expect(setupWorkerMock).toHaveBeenCalledTimes(2);
    expect(store.getState().workerStatus).toBe("active");
  });

  it("waits for an in-flight start before stopping", async () => {
    const starting = startWorkerFn();
    await stopWorkerFn();
    await starting;

    expect(stopMock).toHaveBeenCalledTimes(1);
    expect(store.getState().workerStatus).toBe("idle");
  });
});
