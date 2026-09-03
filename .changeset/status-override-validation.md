---
"@mugenlabs/msw-devtools": patch
---

Ignore status code overrides outside the 200-599 range a `Response` can represent, and return an empty body for 204, 205 and 304 overrides. Previously a partially typed status (or a null-body status with a JSON body) threw inside the resolver and surfaced as an opaque 500.
