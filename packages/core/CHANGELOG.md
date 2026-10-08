# msw-devtools-plugin

## 0.7.3

### Patch Changes

- f24f4a1: Improve panel chrome CSS: overflow clip, fine-pointer hover gating, focus-visible rings, hit targets, tabular nums, overscroll containment, OKLCH/color-mix theme tokens, reduced-motion-aware transitions, and operation-name ellipsis that keeps the LIVE badge visible.

## 0.7.2

### Patch Changes

- 2a114fc: Dispatch `"delay-override"` when the delay input changes and `"error-override"` when an error override is set, matching the 0.7.0 override-event pattern so adapters refetch immediately. Sync the npm README with the current event contract and the bounded `@tanstack/react-devtools` `^0.9.0` peer.

## 0.7.1

### Patch Changes

- 8c292c6: Bound the optional peer `@tanstack/react-devtools` to `^0.9.0` so a future breaking 0.x release cannot be pulled into the plugin. Demo Start XSS bump and audit overrides stay monorepo hygiene and are not part of the published package.

## 0.7.0

### Minor Changes

- 0a3a98f: Tighten the dependency contract:

  - Peer ranges for `@apollo/client`, `@tanstack/react-query`, `@urql/core`, `graphql`, `swr` and `wonka` are now bounded caret ranges (for example `^3.0.0 || ^4.0.0` for Apollo) instead of open `>=` ranges.
  - `createApolloAdapter` is typed against a structural `ApolloClientLike` (`{ refetchQueries }`) so it accepts both Apollo Client 3 and 4 clients.
  - `createMswDevToolsPlugin` now returns `TanStackDevtoolsReactPlugin` from `@tanstack/react-devtools`, which is declared as an optional peer dependency. Type drift in the host plugin shape is caught in this package's own typecheck instead of in consumer apps.

- 71ca90b: Refine mock update events:

  - "Enable all" and "Disable all" now dispatch a single event whose `operationName` is the exported `ALL_OPERATIONS` sentinel (`"*"`) instead of one event per operation, so adapters refetch once. `useMockRefetch` and the urql exchange treat it as matching every operation; custom adapters that filter by operation name can use the new `affectsOperation(event, name)` helper.
  - Status code and header override changes now dispatch `"status-override"` and `"headers-override"` events, so clients refetch and show the overridden response immediately. Both values are additions to `MockChangeType`.

- 0bfc6f6: Type operation handles from the defs passed to `registerRestMocks` / `registerGraphqlMocks`. The new return type `OperationHandlesFor<Defs>` is a tuple of `OperationHandle<Name>` that is also keyed by the literal `operationName`s, so `handles["typo"]` is now a compile-time error whenever every def has an explicit name. Defs relying on auto-derived names keep `string` keys. `OperationHandle` gains an optional `Name` type parameter; the untyped `OperationHandles` alias is unchanged.
- 0883ced: Preserve more of the original MSW handler when wrapping it:

  - `{ once: true }` handler options are carried over (from the first variant) so the wrapped handler still only responds once.
  - GraphQL handlers created with `graphql.link(endpoint)` stay scoped to that endpoint instead of matching the operation on every URL. GraphQL descriptors expose the endpoint as `endpoint`.
  - RegExp paths passed to `http.*` are supported for matching, display and live tracking. `RestMockDescriptor.path` is now `string | RegExp`.

  Reads of MSW's private handler fields are centralised behind runtime-checked accessors, so an incompatible MSW release fails with a clear error instead of producing handlers that never match.

- 0656786: Variant ids are now stable instead of positional. A labelled variant gets an id derived from its label (for example `not-found-empty`); an unlabelled one gets an id derived from its handler. Reordering or inserting variants therefore no longer repoints persisted selections. Any unknown `activeVariantId` (including ids persisted by older versions) resolves to the first variant, both in the handler and in the panel, where it previously caused the mock to pass through. The helper is exported as `resolveActiveVariant`.
- 2c41307: Add `stopWorker()`, which stops the MSW service worker and detaches the devtools from it: the registry subscription, the request tracker listener and the SPA navigation patch are all removed. Registered mocks and persisted configuration are kept, so a later `startWorker()` resumes cleanly. The request tracker previously left its `request:start` listener attached on teardown.

### Patch Changes

- 09c3443: Stop the Apollo, TanStack Query and SWR adapters from surfacing failed refetches as unhandled promise rejections (for example when the network-error override is selected).
- d58f840: Make the function returned by `registerAdapter` only unregister the adapter it registered. Previously a stale unregister could tear down a newer adapter re-registered under the same id.
- 9e9deca: Fill in default config fields when an operation is updated before the store has synced with the registry, so a partially initialised operation can no longer silently pass through.
- 5ee2bba: Fix GraphQL mocks registered with a custom `operationName` never matching requests. The display name is now kept separate from the GraphQL operation name the handler matches on (exposed as `graphqlOperationName` on GraphQL descriptors), and the "live" tracker maps request operation names back to the registered display name.
- a87254f: Only commit valid header JSON from the headers editor, debounce writes like the JSON editor does, and clear the "Invalid JSON" state correctly after a reset. Previously every keystroke, including invalid JSON, was written straight to the persisted store.
- d17929d: Install MSW handlers for mocks registered after `startWorker()` has resolved. Previously late registrations (for example from lazily loaded routes) showed up in the panel but never intercepted requests.
- da0e8cc: Give the sort dropdown an accessible name, memoise operation rows so a single toggle no longer re-renders the whole list, and move the toggle hover colour into the theme.
- 6b976d1: Expose `./package.json` in the package `exports` map and relax the `engines.node` requirement from `>=22` to `>=18`, matching the runtimes the plugin actually supports.
- 3717171: Pin `@tanstack/pacer` to a caret range (`^0.22.0`) instead of an open `>=` range, so a future breaking 0.x release cannot be pulled into the plugin.
- 79e1031: Preserve non-JSON handler responses (text, HTML, binary) when only a status code or headers override is set, instead of replacing the body with `null` and forcing a JSON content type.
- 134d97a: Remount the operation detail pane when a different operation is selected. Previously a pending JSON edit could be dropped, and invalid text from the previous operation could stay on screen, when switching operations mid-edit.
- 9f4dc25: Ignore status code overrides outside the 200-599 range a `Response` can represent, and return an empty body for 204, 205 and 304 overrides. Previously a partially typed status (or a null-body status with a JSON body) threw inside the resolver and surfaced as an opaque 500.
- a0ab638: Give each urql client its own `mockRefetchExchange` listener instead of a module-wide one, so multiple clients on a page all refetch and a re-created client no longer detaches the previous one. The exchange now only tracks queries, fixing unbounded growth from mutations, and holds the client weakly so it can be garbage collected.
- 68c6de4: Validate the persisted devtools state loaded from `localStorage`. Corrupt or hand-edited entries are now sanitised instead of throwing while the store is created, which could previously crash the host application on import.
- 2a63141: Treat MSW `*` wildcards in REST paths as wildcards when tracking which operations have been requested, so mocks registered with paths like `/users/*` are correctly marked as seen.

## 0.6.0

### Minor Changes

- 7a41042: Add type-safe operation handles and ship a minified build.
  - `registerRestMocks` and `registerGraphqlMocks` now return `OperationHandles` — an array of branded `OperationHandle` objects (destructurable in registration order) that is also indexable by `operationName`. Previously they returned `void`, so this is purely additive.
  - `useMockRefetch` now accepts an `OperationHandle | string`. Passing a handle keeps the operation name type-safe and avoids the silent no-op you'd get from a mistyped string. Existing string usage keeps working unchanged.
  - Export the new `OperationHandle` and `OperationHandles` types from the package root and the `./types` subpath.
  - Build output is now minified and no longer ships sourcemaps in the published tarball, roughly halving the shipped JavaScript size.

## 0.5.2

### Patch Changes

- 97eed30: Fix a batch of bugs found in code review:
  - Prevent a race in `startWorker` that could create duplicate MSW workers and double-register request listeners when called concurrently
  - Stop live captured traffic from overwriting unsaved edits in the JSON override editor
  - Match REST handlers registered with relative paths (e.g. `/api/users`) against the request pathname so their live status is tracked correctly
  - Restore monkey-patched `history` methods and remove the `popstate` listener via a new operation-tracker teardown
  - Clean up the previous adapter's subscription when re-registering an adapter with the same id
  - Remove the previous mock-update listener when the urql exchange is recreated, avoiding stacked refetches
  - Strip stale `content-length`/`content-encoding`/`transfer-encoding` headers when applying JSON overrides
  - Keyboard-toggling a mock no longer also opens the operation detail pane
  - Add `aria-expanded` to collapsible group headers
  - Show an "Invalid JSON" indicator in the headers editor instead of silently ignoring malformed input
  - Guard against undefined config in the enable/disable toggle
  - Treat empty-string JSON overrides consistently between the editor value and the override indicator

## 0.5.1

### Patch Changes

- 0ae0994: Add Lucide SVG icons across the plugin UI for improved visual clarity
- da68094: Fix typecheck errors in hover state variables caused by narrow literal types from `as const` theme

## 0.5.0

### Minor Changes

- ae12f44: Moved the package under the mugenlabs org

### Patch Changes

- 61e76cc: Fix
- d2732e6: update registry

## 0.4.0

### Minor Changes

- b3f70b1: Added adapter for RTK-Query

## 0.3.0

### Minor Changes

- 67ae427: Improving perf

### Patch Changes

- 5014db6: rerelease
