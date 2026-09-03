import type { SetupWorker } from "msw/browser";

import { mockRegistry } from "#/registry/registry";
import { useMockStore } from "#/store/store";

import { createDynamicHandler } from "./create-handler";
import { setupOperationTracker, teardownOperationTracker } from "./operation-tracker";

let worker: SetupWorker | null = null;
let started = false;
let starting: Promise<SetupWorker> | null = null;
let unsubscribeFromRegistry: (() => void) | null = null;

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

  const instance = setupWorker(...handlers);

  await instance.start({
    onUnhandledRequest: options?.onUnhandledRequest ?? "bypass",
    quiet: options?.quiet ?? true,
    serviceWorker: {
      url: options?.serviceWorkerUrl ?? "/mockServiceWorker.js",
    },
  });

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

export const startWorker = (options?: WorkerOptions): Promise<SetupWorker> => {
  if (started && worker) {
    return Promise.resolve(worker);
  }

  // Reuse the in-flight start so concurrent callers don't each create a worker
  // and attach duplicate `request:start` listeners.
  if (starting) {
    return starting;
  }

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
  worker?.stop();
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
  const descriptors = mockRegistry.getAll();
  worker.resetHandlers(...descriptors.map(createDynamicHandler));
  useMockStore.getState().syncWithRegistry(descriptors.map((d) => d.operationName));
};
