---
"@mugenlabs/msw-devtools": minor
---

Tidy up the package's dependencies and metadata:

- `zustand` is now a regular dependency instead of a required peer, so apps no longer need to install it.
- `react-dom`, `swr`, `graphql` and `@apollo/client` are no longer peer dependencies. The package never imports them: the SWR and Apollo adapters only call the client you pass in.
- `engines.node` is now `>=20.0.0`; Node 18 is end-of-life and was never tested.
- The npm README is now generated from the repository README, so it includes the production, compatibility and upgrade sections it was missing.
