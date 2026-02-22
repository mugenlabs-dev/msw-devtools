import type { SetupWorker } from "msw/browser";
import { mockRegistry } from "../registry/registry";
import { useMockStore } from "../store/store";
import { createDynamicHandler } from "./create-handler";
import { setupOperationTracker } from "./operation-tracker";

let worker: SetupWorker | null = null;
let started = false;

export type WorkerOptions = {
	/** Custom path to the service worker script. Default: '/mockServiceWorker.js' */
	serviceWorkerUrl?: string;
	/** Suppress MSW console logging. Default: true */
	quiet?: boolean;
	/** Behavior for unhandled requests. Default: 'bypass' */
	onUnhandledRequest?: "bypass" | "warn" | "error";
};

export async function startWorker(
	options?: WorkerOptions,
): Promise<SetupWorker> {
	if (started && worker) return worker;

	const { setupWorker } = await import("msw/browser");

	const descriptors = mockRegistry.getAll();
	const handlers = descriptors.map(createDynamicHandler);

	worker = setupWorker(...handlers);

	try {
		useMockStore.getState().setWorkerStatus("starting");

		await worker.start({
			onUnhandledRequest: options?.onUnhandledRequest ?? "bypass",
			serviceWorker: {
				url: options?.serviceWorkerUrl ?? "/mockServiceWorker.js",
			},
			quiet: options?.quiet ?? true,
		});

		started = true;
		useMockStore.getState().setWorkerStatus("active");

		useMockStore
			.getState()
			.syncWithRegistry(descriptors.map((d) => d.operationName));

		setupOperationTracker(worker);
	} catch {
		useMockStore.getState().setWorkerStatus("error");
	}

	return worker;
}

export function getWorker(): SetupWorker | null {
	return worker;
}

/**
 * Refresh handlers when registry changes.
 * Called when new descriptors are registered after initial startup.
 */
export function refreshHandlers(): void {
	if (!worker) return;
	const descriptors = mockRegistry.getAll();
	worker.resetHandlers(...descriptors.map(createDynamicHandler));
	useMockStore
		.getState()
		.syncWithRegistry(descriptors.map((d) => d.operationName));
}
