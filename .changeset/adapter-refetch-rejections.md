---
"@mugenlabs/msw-devtools": patch
---

Stop the Apollo, TanStack Query and SWR adapters from surfacing failed refetches as unhandled promise rejections (for example when the network-error override is selected).
