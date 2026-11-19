/** Demo fetches opt out of the HTTP cache so a passthrough cannot replay a mock body. */
export const playgroundFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: "no-store" });
