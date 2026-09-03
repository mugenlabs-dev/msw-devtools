---
"@mugenlabs/msw-devtools": patch
---

Validate the persisted devtools state loaded from `localStorage`. Corrupt or hand-edited entries are now sanitised instead of throwing while the store is created, which could previously crash the host application on import.
