---
"@mugenlabs/msw-devtools": patch
---

Make the function returned by `registerAdapter` only unregister the adapter it registered. Previously a stale unregister could tear down a newer adapter re-registered under the same id.
