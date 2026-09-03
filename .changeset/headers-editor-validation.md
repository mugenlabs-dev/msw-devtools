---
"@mugenlabs/msw-devtools": patch
---

Only commit valid header JSON from the headers editor, debounce writes like the JSON editor does, and clear the "Invalid JSON" state correctly after a reset. Previously every keystroke, including invalid JSON, was written straight to the persisted store.
