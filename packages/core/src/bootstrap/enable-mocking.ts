import { startWorker, type WorkerOptions } from "../msw/worker-manager";

/**
 * Starts the MSW service worker and resolves when it's ready.
 * Call this in your entry point before `createRoot()` to ensure
 * the worker intercepts all requests from the start.
 *
 * For production-safe usage, conditionally import your mock setup
 * behind a dev-mode check so the entire MSW code path is
 * tree-shaken from production bundles:
 *
 * ```ts
 * // main.tsx
 * async function bootstrap() {
 *   if (import.meta.env.DEV) {
 *     await import("./mocks/setup");              // registers descriptors
 *     const { enableMocking } = await import("msw-devtool");
 *     await enableMocking();
 *   }
 *
 *   createRoot(document.getElementById("root")!).render(<App />);
 * }
 *
 * bootstrap();
 * ```
 *
 * Or for simpler setups where MSW is always available (e.g. dev-only apps):
 *
 * ```ts
 * import { enableMocking } from "msw-devtool";
 *
 * enableMocking().then(() => {
 *   createRoot(document.getElementById("root")!).render(<App />);
 * });
 * ```
 */
export async function enableMocking(options?: WorkerOptions): Promise<void> {
	await startWorker(options);
}
