---
"@mugenlabs/msw-devtools": minor
---

Refine mock update events:

- "Enable all" and "Disable all" now dispatch a single event whose `operationName` is the exported `ALL_OPERATIONS` sentinel (`"*"`) instead of one event per operation, so adapters refetch once. `useMockRefetch` and the urql exchange treat it as matching every operation; custom adapters that filter by operation name can use the new `affectsOperation(event, name)` helper.
- Status code and header override changes now dispatch `"status-override"` and `"headers-override"` events, so clients refetch and show the overridden response immediately. Both values are additions to `MockChangeType`.
