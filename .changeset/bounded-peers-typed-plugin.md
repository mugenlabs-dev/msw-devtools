---
"@mugenlabs/msw-devtools": minor
---

Tighten the dependency contract:

- Peer ranges for `@apollo/client`, `@tanstack/react-query`, `@urql/core`, `graphql`, `swr` and `wonka` are now bounded caret ranges (for example `^3.0.0 || ^4.0.0` for Apollo) instead of open `>=` ranges.
- `createApolloAdapter` is typed against a structural `ApolloClientLike` (`{ refetchQueries }`) so it accepts both Apollo Client 3 and 4 clients.
- `createMswDevToolsPlugin` now returns `TanStackDevtoolsReactPlugin` from `@tanstack/react-devtools`, which is declared as an optional peer dependency. Type drift in the host plugin shape is caught in this package's own typecheck instead of in consumer apps.
