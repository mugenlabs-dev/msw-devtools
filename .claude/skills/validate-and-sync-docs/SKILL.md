---
name: validate-and-sync-docs
description: Runs unit and E2E tests, then syncs README.md and docs-page.tsx with the latest codebase changes. Use after making code changes to ensure tests pass and documentation stays up to date.
user-invocable: true
allowed-tools: Read, Grep, Glob, Bash(pnpm test:ci), Bash(pnpm test:e2e), Bash(pnpm build), Edit, Write
---

# Validate & Sync Docs

Run the full test suite. If everything passes, audit the README and Docs page against the actual codebase and update them to reflect the latest state.

## Step 1 — Run Tests

Run both test suites **sequentially** (unit first, then E2E):

```
pnpm test:ci
```

If unit tests fail, **stop immediately**. Report the failures and do NOT proceed to E2E or docs.

```
pnpm test:e2e
```

If E2E tests fail, **stop immediately**. Report the failures and do NOT proceed to docs.

## Step 2 — Audit the Codebase

Only reach this step if **all tests passed**.

Read the following source files to understand the current state of the library:

- `packages/core/package.json` — package name, exports map, peer dependencies
- `packages/core/src/index.ts` — all public exports
- `packages/core/src/types.ts` — all public types
- `packages/core/src/adapters/*/index.ts` — adapter exports
- `packages/core/src/registry/helpers.ts` — `withStandardVariants`, `withRestVariants`
- `packages/core/src/plugin/create-msw-dev-tools-plugin.tsx` — plugin options
- `packages/core/src/msw/worker-manager.ts` — `startWorker` options
- `apps/demo/src/playground-page.tsx` — how the demo uses the library
- `apps/demo/src/docs-page.tsx` — current docs page content
- `README.md` — current README content

## Step 3 — Sync README.md

Compare the README against the actual codebase and update any sections that are out of date:

- **Features list** — match actual capabilities
- **Packages table** — match the exports map in `package.json`
- **Installation** — correct package name and peer deps
- **Quick Start code examples** — match actual API signatures and imports
- **Adapter examples** — match actual adapter factory signatures
- **API Reference tables** — match actual exports from `src/index.ts`
- **Types table** — match actual types from `src/types.ts`
- **Development section** — match actual scripts in root `package.json`
- **Project Structure** — match actual directory layout

Rules:

- Do NOT rewrite sections that are already correct
- Do NOT change writing style or add emoji
- Only update factual inaccuracies (wrong imports, missing exports, outdated examples)
- If a new feature/export was added but is not documented, add it in the appropriate section
- If a feature/export was removed, remove its documentation

## Step 4 — Sync docs-page.tsx

Compare `apps/demo/src/docs-page.tsx` against the actual codebase:

- **Installation command** — correct package name
- **Quick Start code** — match actual API (registerMocks, createMswDevToolsPlugin, TanStackDevtools)
- **Adapter imports** — match actual import paths and function names
- **Features grid** — match actual capabilities
- **Supported Libraries list** — match actual adapters

Rules:

- Same rules as README: only fix inaccuracies, don't change style
- Keep the JSX structure and inline CSS intact
- Only update string content inside the existing components

## Step 5 — Verify Build

If any files were changed in Steps 3–4, run:

```
pnpm build
```

to ensure the demo still builds.

## Step 6 — Report

Summarize what happened:

1. Test results (pass counts)
2. Files changed (if any) with a brief description of what was updated
3. If nothing needed updating, say "Docs are already in sync"
