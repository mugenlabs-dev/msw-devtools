# Remove `enableMocking()` — Auto-Start Worker from Plugin Mount

## Context

`enableMocking()` is a thin wrapper around `startWorker()` that users must call before rendering their app. This forces framework-specific boilerplate (Vite React uses `.then()`, Next.js needs a client provider with `use()`, TanStack Start uses top-level `await`). By moving the worker startup into the plugin's mount lifecycle, users just call `registerMocks()` and mount the plugin — no framework-specific setup needed.

**User decision:** Remove `WorkerOptions` from the public convenience API. Use sensible defaults (`quiet: true`, `onUnhandledRequest: "bypass"`, `serviceWorkerUrl: "/mockServiceWorker.js"`). Advanced users who need custom options can call `startWorker()` directly before the plugin mounts — the plugin detects an already-running worker and skips auto-start.

---

## Changes

### 1. Auto-start worker in `MswDevToolsPlugin`

**File:** `packages/core/src/plugin/msw-dev-tools-plugin.tsx`

Add a `useEffect` that calls `startWorker()` on mount. The worker-manager already guards against double-starts (`if (started && worker) return worker`), so this is safe.

```tsx
useEffect(() => {
  startWorker().catch(() => {
    // Error already captured in store as workerStatus: "error"
  });
}, []);
```

The UI already reads `workerStatus` from the store and shows "Starting…" / "Active" / "Error" states via `WorkerStatusBar` — no UI changes needed.

### 2. Remove `enableMocking` export

**File:** `packages/core/src/index.ts`

- Remove: `export { enableMocking } from "./bootstrap/enable-mocking"`
- Keep: `startWorker`, `getWorker`, `refreshHandlers` (advanced API)
- Keep: `WorkerOptions` type export (for `startWorker` users)

### 3. Delete `enableMocking` module

**File:** `packages/core/src/bootstrap/enable-mocking.ts` → delete

### 4. Delete deprecated `MswBootstrap` component

**File:** `packages/core/src/bootstrap/msw-bootstrap.tsx` → delete

- Also remove exports from `index.ts`: `MswBootstrap`, `MswBootstrapProps`
- Delete `packages/core/src/bootstrap/` directory (will be empty)

### 5. Update demo app entry point

**File:** `apps/demo/src/client.tsx`

Remove the `enableMocking()` call and async bootstrap wrapper. Just import mocks and hydrate directly.

**Note:** The demo currently passes a custom `serviceWorkerUrl` for `BASE_URL`. Need to check if the default `/mockServiceWorker.js` works — if not, add a `startWorker({ serviceWorkerUrl })` call in the demo's setup file.

### 6. Update Quick Start docs

**File:** `apps/demo/src/docs/sections/quick-start-section.tsx`

- Remove Step 2 ("Start the MSW worker") entirely — the `FrameworkTabs` component with Vite React / TanStack Start / Next.js snippets is no longer needed
- Renumber: Step 1 (Define mocks), Step 2 (Mount plugin), Step 3 (Register adapters)
- Remove the `FrameworkTabs` import

### 7. Update API Reference docs

**File:** `apps/demo/src/docs/sections/api-reference-section.tsx`

- Remove `enableMocking` from Bootstrap section
- Remove `MswBootstrap` (deprecated)
- Keep `startWorker` documented as the advanced escape hatch

### 8. Update README

**File:** `packages/core/README.md`

- Remove all `enableMocking()` examples
- Simplify Quick Start to: `registerMocks()` → mount plugin → done
- Add "Advanced: custom worker options" section showing `startWorker()` direct usage

### 9. Check and update tests

E2E tests don't call `enableMocking` directly. Check unit tests for references.

---

## Verification

1. `pnpm build` — core package builds without the removed exports
2. `pnpm exec tsgo -p packages/core --noEmit && pnpm exec tsgo -p apps/demo --noEmit` — no type errors
3. `pnpm biome check .` — lint clean
4. `pnpm test:ci` — unit tests pass
5. Preview the demo app — navigate to playground, verify:
   - Worker status shows "Starting…" briefly then "Active"
   - Mock operations appear in the list
   - Toggling mocks works
   - LIVE badges appear after requests
6. Verify the docs page renders correctly with renumbered steps
