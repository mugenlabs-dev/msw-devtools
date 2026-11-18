---
"@mugenlabs/msw-devtools": minor
---

Support MSW 2.x and 3.x on the same public API (`msw: ^2.0.0 || ^3.0.0`).

GraphQL wrappers are built from the user's handler constructor instead of importing `graphql` / `GraphQLHandler` from the MSW root (removed in 3.x), which also avoids MSW 3 attaching a hidden subscription sibling from `graphql.link().operation()`. Prefer `graphql.link` in app code; on MSW 3 import `graphql` from `msw/graphql`.

`WorkerOptions.onUnhandledRequest` still works: it is passed as both `onUnhandledRequest` (MSW 2) and `onUnhandledFrame` (MSW 3). `stopWorker()` awaits `worker.stop()`, which is async in MSW 3. `registerGraphqlMocks` now throws at registration when a handler or variant is not a GraphQL handler (for example an `http.*` handler), instead of failing later in `startWorker()`, and rejects GraphQL subscription handlers, which are not supported. `registerRestMocks` throws the same way for a GraphQL handler. The types reject the mixed-up cases too.

New type exports from the root and `/types`: `RestHandlerLike`, `GraphqlHandlerLike` (the handler shapes the register functions accept) and `HandlerOptions`.

Document navigations and form submissions (`request.mode === "navigate"`) are ignored by the LIVE request tracker.
