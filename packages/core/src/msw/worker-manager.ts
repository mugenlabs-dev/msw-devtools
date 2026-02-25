import type { SetupWorker } from "msw/browser";

import { mockRegistry } from "#/registry/registry";
import { useMockStore } from "#/store/store";

import { createDynamicHandler } from "./create-handler";
import { setupOperationTracker } from "./operation-tracker";

let worker: SetupWorker | null = null;
let started = false;

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
};

export const startWorker = async (options?: WorkerOptions): Promise<SetupWorker> => {
  if (started && worker) {
    return worker;
  }

  try {
    useMockStore.getState().setWorkerStatus("starting");
    worker = await initializeWorker(options);
    activateWorker(worker);
  } catch (caughtError: unknown) {
    useMockStore.getState().setWorkerStatus("error");
    throw caughtError;
  }

  return worker;
};

/** @internal — Returns the current MSW worker instance. Not part of the public API. */
export const getWorker = (): SetupWorker | null => worker;

/**
 * @internal — Refresh handlers when registry changes.
 * Called when new descriptors are registered after initial startup.
 * Not part of the public API.
 */
export const refreshHandlers = (): void => {
  if (!worker) {
    return;
  }
  const descriptors = mockRegistry.getAll();
  worker.resetHandlers(...descriptors.map(createDynamicHandler));
  useMockStore.getState().syncWithRegistry(descriptors.map((d) => d.operationName));
};
