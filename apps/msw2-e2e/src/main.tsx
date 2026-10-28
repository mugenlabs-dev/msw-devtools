import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./app";
import { workerReady } from "./mocks";

const root = document.getElementById("root");
if (!root) {
  throw new Error("missing #root");
}

void workerReady.then(() => {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
