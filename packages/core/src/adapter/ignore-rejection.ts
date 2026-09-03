/**
 * @internal — Attach a no-op rejection handler to a refetch result. A mock
 * change that makes queries fail (for example the network-error override)
 * must not surface as an unhandled promise rejection in the host app.
 * Not part of the public API.
 */
export const ignoreRejection = (result: unknown): void => {
  void Promise.resolve(result).catch(() => {
    // Refetch failures are the client's concern, not the devtools'.
  });
};
