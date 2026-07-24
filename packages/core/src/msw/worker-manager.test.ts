import type { startWorker as StartWorker } from "./worker-manager";

const { setupWorkerMock, startMock, setupTrackerMock } = vi.hoisted(() => ({
  setupWorkerMock: vi.fn(),
  startMock: vi.fn(),
  setupTrackerMock: vi.fn(),
}));

vi.mock("msw/browser", () => ({ setupWorker: setupWorkerMock }));
vi.mock("./operation-tracker", () => ({ setupOperationTracker: setupTrackerMock }));

describe("worker-manager - startWorker", () => {
  let startWorkerFn: typeof StartWorker;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    setupWorkerMock.mockReturnValue({ events: { on: vi.fn() }, start: startMock });
    // Simulate an async worker start so concurrent callers overlap in flight.
    startMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(resolve, 10);
        })
    );

    ({ startWorker: startWorkerFn } = await import("./worker-manager"));
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
});
