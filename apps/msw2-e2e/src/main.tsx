import "./persistence-boot";

import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { msw2PlaygroundConfig, PlaygroundConfigProvider } from "#demo/playground-config";
import "#demo/styles.css";

import { router } from "./router";

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
