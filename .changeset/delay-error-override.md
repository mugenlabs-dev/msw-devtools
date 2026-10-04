---
"@mugenlabs/msw-devtools": patch
---

Dispatch `"delay-override"` when the delay input changes and `"error-override"` when an error override is set, matching the 0.7.0 override-event pattern so adapters refetch immediately. Sync the npm README with the current event contract and the bounded `@tanstack/react-devtools` `^0.9.0` peer.
