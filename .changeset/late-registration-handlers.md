---
"@mugenlabs/msw-devtools": patch
---

Install MSW handlers for mocks registered after `startWorker()` has resolved. Previously late registrations (for example from lazily loaded routes) showed up in the panel but never intercepted requests.
