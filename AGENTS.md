# AGENTS.md

Guidance for coding agents working in this repository. Read [CONTRIBUTING.md](CONTRIBUTING.md) for the project layout and conventions.

## Commands

Use pnpm and the root scripts, not the underlying tools directly.

- `pnpm lint:fix`: format and lint (Biome)
- `pnpm typecheck`: build the library and typecheck the workspace
- `pnpm test:ci`: unit tests
- `pnpm test-storybook`: component tests
- `pnpm test:e2e`: end-to-end tests
- `pnpm changeset`: record a release note for `@mugenlabs/msw-devtools`

## Rules

- Run lint, typecheck, and the relevant tests before calling a change done.
- Keep changes small and follow the existing patterns.
- A change to library behaviour needs a test and a changeset.
- Update the README, the docs site, and the JSDoc when the public API changes.
- Don't add dependencies without a clear reason.
- On GitHub, author must be `<6538706+Yagogc@users.noreply.github.com>`; never add `Co-authored-by`. Committer may be that address or `noreply@github.com` (GitHub squash-merge). CI enforces this on new commits.
