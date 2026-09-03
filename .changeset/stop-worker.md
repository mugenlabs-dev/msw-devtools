---
"@mugenlabs/msw-devtools": minor
---

Add `stopWorker()`, which stops the MSW service worker and detaches the devtools from it: the registry subscription, the request tracker listener and the SPA navigation patch are all removed. Registered mocks and persisted configuration are kept, so a later `startWorker()` resumes cleanly. The request tracker previously left its `request:start` listener attached on teardown.
