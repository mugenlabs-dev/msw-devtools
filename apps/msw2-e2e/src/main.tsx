import { startWorker } from "@mugenlabs/msw-devtools";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerPlaygroundMocks } from "#demo/mocks/register-playground-mocks";
import { msw2PlaygroundConfig, PlaygroundConfigProvider } from "#demo/playground-config";
import "#demo/styles.css";

import { router } from "./router";

registerPlaygroundMocks();

// /msw2/mockServiceWorker.js scopes to /msw2/ and does not control /playground/.
void startWorker({
  serviceWorkerUrl: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
});

const root = document.getElementById("root");
if (!root) {
  throw new Error("missing #root");
}

createRoot(root).render(
  <StrictMode>
    <PlaygroundConfigProvider value={msw2PlaygroundConfig}>
      <RouterProvider router={router} />
    </PlaygroundConfigProvider>
  </StrictMode>
);
