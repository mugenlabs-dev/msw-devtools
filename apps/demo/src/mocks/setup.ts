import { startWorker } from "@mugenlabs/msw-devtools";

import { registerPlaygroundMocks } from "./register-playground-mocks";

registerPlaygroundMocks();

// /playground/mockServiceWorker.js scopes to /playground/ and does not control /msw2/.
void startWorker({
  serviceWorkerUrl: `${import.meta.env.BASE_URL}playground/mockServiceWorker.js`,
});
