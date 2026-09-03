---
"@mugenlabs/msw-devtools": patch
---

Fix GraphQL mocks registered with a custom `operationName` never matching requests. The display name is now kept separate from the GraphQL operation name the handler matches on (exposed as `graphqlOperationName` on GraphQL descriptors), and the "live" tracker maps request operation names back to the registered display name.
