---
"@mugenlabs/msw-devtools": minor
---

Add type-safe operation handles and ship a minified build.

- `registerRestMocks` and `registerGraphqlMocks` now return `OperationHandles` — an array of branded `OperationHandle` objects (destructurable in registration order) that is also indexable by `operationName`. Previously they returned `void`, so this is purely additive.
- `useMockRefetch` now accepts an `OperationHandle | string`. Passing a handle keeps the operation name type-safe and avoids the silent no-op you'd get from a mistyped string. Existing string usage keeps working unchanged.
- Export the new `OperationHandle` and `OperationHandles` types from the package root and the `./types` subpath.
- Build output is now minified and no longer ships sourcemaps in the published tarball, roughly halving the shipped JavaScript size.
