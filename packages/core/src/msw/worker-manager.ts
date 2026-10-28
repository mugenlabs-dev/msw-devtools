import type { SetupWorker } from "msw/browser";

import { mockRegistry } from "#/registry/registry";
import { useMockStore } from "#/store/store";

import { createDynamicHandler } from "./create-handler";
import { setupOperationTracker, teardownOperationTracker } from "./operation-tracker";

let worker: SetupWorker | null = null;
let started = false;
let starting: Promise<SetupWorker> | null = null;
let unsubscribeFromRegistry: (() => void) | null = null;
/** Options of the call that started the worker, to spot later calls whose options are ignored. */
let startOptions: WorkerOptions | undefined;
/** The handlers the devtools installed, as opposed to ones the app added with `worker.use()`. */
let devtoolsHandlers = new Set<unknown>();

export interface WorkerOptions {
  /** Behavior for unhandled requests. Default: 'bypass' */
  onUnhandledRequest?: "bypass" | "warn" | "error";
  /** Suppress MSW console logging. Default: true */
  quiet?: boolean;
  /** Custom path to the service worker script. Default: '/mockServiceWorker.js' */
  serviceWorkerUrl?: string;
}

const initializeWorker = async (options?: WorkerOptions): Promise<SetupWorker> => {
  const { setupWorker } = await import("msw/browser");
  const descriptors = mockRegistry.getAll();
  const handlers = descriptors.map(createDynamicHandler);
  devtoolsHandlers = new Set(handlers);

  // Handlers are real MSW instances; structural DynamicHandler is dual-major-safe.
  const instance = setupWorker(...(handlers as never[]));
  const onUnhandled = options?.onUnhandledRequest ?? "bypass";

  // MSW 2 reads `onUnhandledRequest`; MSW 3 renamed it to `onUnhandledFrame`
  // and ignores the old key. Pass both so the public WorkerOptions API works
  // on either major without the caller branching.
  await instance.start({
    onUnhandledFrame: onUnhandled,
    onUnhandledRequest: onUnhandled,
    quiet: options?.quiet ?? true,
    serviceWorker: {
      url: options?.serviceWorkerUrl ?? "/mockServiceWorker.js",
    },
  } as Parameters<SetupWorker["start"]>[0]);

  return instance;
};

const syncAndTrack = (instance: SetupWorker): void => {
  const descriptors = mockRegistry.getAll();
  useMockStore.getState().syncWithRegistry(descriptors.map((d) => d.operationName));
  setupOperationTracker(instance);
};

const activateWorker = (instance: SetupWorker): void => {
  started = true;
  useMockStore.getState().setWorkerStatus("active");
  syncAndTrack(instance);
  // Mocks registered after start (route-level or code-split registrations)
  // need their handlers installed on the running worker too.
  unsubscribeFromRegistry?.();
  unsubscribeFromRegistry = mockRegistry.subscribe(refreshHandlers);
};

const warnIfOptionsIgnored = (options: WorkerOptions | undefined): void => {
  if (options && JSON.stringify(options) !== JSON.stringify(startOptions)) {
    console.warn(
      "msw-devtools: startWorker() was called with options after the worker had already started, so they were ignored. Call startWorker(options) before the devtools plugin mounts."
    );
  }
};

export const startWorker = (options?: WorkerOptions): Promise<SetupWorker> => {
  if ((started && worker) || starting) {
    warnIfOptionsIgnored(options);
  }
  if (started && worker) {
    return Promise.resolve(worker);
  }

  // Reuse the in-flight start so concurrent callers don't each create a worker
  // and attach duplicate `request:start` listeners.
  if (starting) {
    return starting;
  }

  startOptions = options;
  starting = (async () => {
    try {
      useMockStore.getState().setWorkerStatus("starting");
      const instance = await initializeWorker(options);
      worker = instance;
      activateWorker(instance);
      return instance;
    } catch (caughtError: unknown) {
      useMockStore.getState().setWorkerStatus("error");
      throw caughtError;
    } finally {
      starting = null;
    }
  })();

  return starting;
};

/** Returns the current MSW worker instance, or `null` before `startWorker()` resolves. */
export const getWorker = (): SetupWorker | null => worker;

/**
 * Stops the MSW service worker started by {@link startWorker} and tears down
 * everything the devtools attached to it: the registry subscription, the
 * request tracker and the SPA navigation patch. Registered mocks and persisted
 * configuration are kept, so a later `startWorker()` picks up where it left off.
 */
export const stopWorker = async (): Promise<void> => {
  if (starting) {
    // Let an in-flight start settle so we never leave a half-initialised worker.
    await starting.catch(() => undefined);
  }
  unsubscribeFromRegistry?.();
  unsubscribeFromRegistry = null;
  teardownOperationTracker();
  // MSW 3's stop() returns a Promise; MSW 2 returns void. Always await.
  await worker?.stop();
  worker = null;
  started = false;
  useMockStore.getState().setWorkerStatus("idle");
};

/**
 * @internal — Refresh handlers when registry changes.
 * Called automatically when descriptors are registered or unregistered after
 * initial startup. Not part of the public API.
 */
export const refreshHandlers = (): void => {
  if (!worker) {
    return;
  }
  // resetHandlers() also drops handlers the app added with worker.use(), so
  // put those back in front of the devtools handlers, in the same order.
  const appHandlers = worker.listHandlers().filter((handler) => !devtoolsHandlers.has(handler));
  const descriptors = mockRegistry.getAll();
  const handlers = descriptors.map(createDynamicHandler);
  devtoolsHandlers = new Set(handlers);
  worker.resetHandlers(...(handlers as never[]));
  if (appHandlers.length > 0) {
    worker.use(...appHandlers);
  }
  useMockStore.getState().syncWithRegistry(descriptors.map((d) => d.operationName));
};
