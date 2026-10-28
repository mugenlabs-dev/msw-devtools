---
"@mugenlabs/msw-devtools": patch
---

Cache adapters drop the previous payload before they refetch. TanStack Query calls `resetQueries`, SWR writes `undefined` and revalidates, and Apollo calls `resetStore`. `refetchQueries` and `invalidateQueries` left the mocked body on screen.

`setPersistenceKey`, from `@mugenlabs/msw-devtools/persistence`, chooses the localStorage key. Import that entry before the main package. Two bundles on one origin can then keep separate panel state. The default key is still `msw-devtools-store`.
