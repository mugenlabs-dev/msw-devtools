import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { StartClient } from "@tanstack/react-start/client";
import { enableMocking } from "msw-devtool";

// Register mocks before enabling mocking so the worker starts with handlers
import "./mocks/setup";

enableMocking({
	serviceWorkerUrl: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
}).then(() => {
	hydrateRoot(
		document,
		<StrictMode>
			<StartClient />
		</StrictMode>,
	);
});
