import { startWorker } from "@mugenlabs/msw-devtools";

const NESTED_PLAYGROUND_SCRIPT = "/playground/mockServiceWorker.js";

/**
 * A worker registered at `/playground/mockServiceWorker.js` has a longer scope
 * than the root worker. The browser keeps using it for `/playground/*` until
 * that registration is gone.
 */
const retireNestedPlaygroundWorker = async (): Promise<void> => {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }
  const registrations = await navigator.serviceWorker.getRegistrations();
  const nested = registrations.filter((registration) => {
    const scriptURL =
      registration.active?.scriptURL ??
      registration.waiting?.scriptURL ??
      registration.installing?.scriptURL;
    return scriptURL?.includes(NESTED_PLAYGROUND_SCRIPT) === true;
  });
  await Promise.all(nested.map((registration) => registration.unregister()));
};

/** Start this build's worker at `${BASE_URL}mockServiceWorker.js`. */
export const startPlaygroundWorker = (): void => {
  void startWorker({
    serviceWorkerUrl: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
  });
  void retireNestedPlaygroundWorker();
};
