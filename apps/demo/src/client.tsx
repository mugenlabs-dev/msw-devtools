import "./mocks/persistence-boot";

import { StartClient } from "@tanstack/react-start/client";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

import { initPostHog } from "./lib/analytics";
import "./styles.css";

initPostHog();

hydrateRoot(
  document,
  <StrictMode>
    <StartClient />
  </StrictMode>
);
