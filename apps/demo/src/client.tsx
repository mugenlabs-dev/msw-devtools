import { StartClient } from "@tanstack/react-start/client";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import "./styles.css";

// Register mocks — the worker auto-starts when the devtools plugin mounts
import "./mocks/setup";

import { initPostHog } from "./lib/analytics";

initPostHog();

hydrateRoot(
  document,
  <StrictMode>
    <StartClient />
  </StrictMode>
);
