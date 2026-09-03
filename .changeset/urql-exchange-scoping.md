---
"@mugenlabs/msw-devtools": patch
---

Give each urql client its own `mockRefetchExchange` listener instead of a module-wide one, so multiple clients on a page all refetch and a re-created client no longer detaches the previous one. The exchange now only tracks queries, fixing unbounded growth from mutations, and holds the client weakly so it can be garbage collected.
