---
"@mugenlabs/msw-devtools": minor
---

Preserve more of the original MSW handler when wrapping it:

- `{ once: true }` handler options are carried over (from the first variant) so the wrapped handler still only responds once.
- GraphQL handlers created with `graphql.link(endpoint)` stay scoped to that endpoint instead of matching the operation on every URL. GraphQL descriptors expose the endpoint as `endpoint`.
- RegExp paths passed to `http.*` are supported for matching, display and live tracking. `RestMockDescriptor.path` is now `string | RegExp`.

Reads of MSW's private handler fields are centralised behind runtime-checked accessors, so an incompatible MSW release fails with a clear error instead of producing handlers that never match.
