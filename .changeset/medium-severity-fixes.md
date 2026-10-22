---
"@mugenlabs/msw-devtools": minor
---

Fix eight bugs, some of which change behaviour:

- Settings are no longer rewritten to localStorage on every intercepted request, a full or blocked localStorage no longer breaks request handling, and settings stay in sync across open tabs instead of a stale tab overwriting them.
- `http.all()` handlers keep matching every method (named `ALL /path`), and `graphql.operation()` handlers keep matching mutations. Previously they were narrowed to GET and to queries. `RestMethod` gains `"head" | "options" | "all"` and `GraphQLOperationType` gains `"operation"`.
- GraphQL handlers registered with a RegExp are named after the pattern (e.g. `/^GetUser/`) instead of all sharing `UnknownOperation`. Saved settings for a single RegExp GraphQL mock are reset once by the rename.
- A console warning flags two different requests registered under the same name, where the second silently replaced the first.
- The urql exchange refetches queries whose mock has a custom `operationName` or a RegExp handler.
- The JSON editor prefill runs only in the browser, uses the selected variant, and never replaces a body captured from a real request.
- Registering a mock after the worker started no longer removes handlers the app added with `worker.use()`, and `startWorker(options)` warns when its options are ignored because the worker had already started.
- The LIVE list is only cleared when the page changes, not on every `history.replaceState` call.
