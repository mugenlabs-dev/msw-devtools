import { type PropsWithChildren, type ReactElement, useEffect, useState } from "react";
import { startWorker, type WorkerOptions } from "../msw/worker-manager";

export type MswBootstrapProps = PropsWithChildren<{
	workerOptions?: WorkerOptions;
}>;

/**
 * @deprecated Use `enableMocking()` in your entry point instead.
 * This component blocks rendering until the MSW worker starts,
 * which cannot be tree-shaken from production bundles.
 *
 * Recommended pattern:
 * ```ts
 * import { enableMocking } from "msw-devtool";
 *
 * enableMocking().then(() => {
 *   createRoot(document.getElementById("root")!).render(<App />);
 * });
 * ```
 */
export function MswBootstrap({
	children,
	workerOptions,
}: MswBootstrapProps): ReactElement {
	const [ready, setReady] = useState(false);

	useEffect(() => {
		startWorker(workerOptions).then(() => setReady(true));
	}, [workerOptions]);

	if (!ready) return <></>;
	return <>{children}</>;
}
