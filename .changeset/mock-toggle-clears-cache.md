---
"@mugenlabs/msw-devtools": minor
---

**Behaviour change:** toggling a mock now clears each adapter's whole cache before it refetches, instead of refetching over the old payload. `refetchQueries` and `invalidateQueries` left the mocked body on screen.

- TanStack Query calls `queryClient.resetQueries()`. Every query returns to its initial state, including inactive ones and infinite queries (back to the first page). Active queries refetch.
- SWR calls `mutate(() => true, undefined, { revalidate: true })`. Every key becomes `undefined` first, including keys you use for local state.
- Apollo calls `client.resetStore()`. This also clears local-only cache fields, runs `onResetStore` callbacks and rejects queries that are in flight. `ApolloClientLike` now needs `resetStore` instead of `refetchQueries`, so update hand-written mocks of it.

`setPersistenceKey`, from `@mugenlabs/msw-devtools/persistence`, chooses the localStorage key, so two bundles on one origin can keep separate panel state. Call it in its own module and import that module before the main package. A call made after the store has loaded logs a warning and is ignored. The default key is still `msw-devtools-store`.
