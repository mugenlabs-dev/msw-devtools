---
"@mugenlabs/msw-devtools": patch
---

Fill in default config fields when an operation is updated before the store has synced with the registry, so a partially initialised operation can no longer silently pass through.
