# msw-devtools-plugin

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
