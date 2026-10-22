---
"@mugenlabs/msw-devtools": patch
---

Fix five bugs in the devtools:

- Saved settings for mocks registered after the worker starts (for example by a lazily loaded route) are no longer deleted on reload.
- Streaming and other non-JSON mocked responses are returned straight away. Previously the devtools waited to read the whole body, so a streaming or server-sent-events handler never responded.
- The SWR adapter revalidates without clearing SWR's cache first, so components keep their data instead of flashing back to loading.
- Header overrides are merged into the handler's own headers instead of replacing all of them, and an invalid header name no longer turns the response into a 500.
- Path and operation-name regexes with the `g` or `y` flag no longer match only every other request in the LIVE tracking.
