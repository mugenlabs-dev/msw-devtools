---
"@mugenlabs/msw-devtools": patch
---

Treat MSW `*` wildcards in REST paths as wildcards when tracking which operations have been requested, so mocks registered with paths like `/users/*` are correctly marked as seen.
