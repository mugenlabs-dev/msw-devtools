---
"@mugenlabs/msw-devtools": patch
---

Preserve non-JSON handler responses (text, HTML, binary) when only a status code or headers override is set, instead of replacing the body with `null` and forcing a JSON content type.
