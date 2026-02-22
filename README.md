<p align="center">
  <img src="apps/demo/public/logo-readme.svg" width="128" height="128" alt="msw-devtool logo" />
</p>

# msw-devtool

A TanStack DevTools plugin for managing [MSW](https://mswjs.io/) (Mock Service Worker) mocks in the browser. Toggle mocks on/off, switch response variants, edit JSON responses live, control HTTP status codes, response headers, and delays -- all from a visual panel embedded in TanStack DevTools.

## Features

- Toggle mocks on/off per operation
- Switch between response variants (success, error, custom)
- Live JSON response body editor
- HTTP status code control and override
- Response headers editor
- Response delay simulation
- Persisted state across page refreshes (via Zustand persist)
- LIVE indicator for operations that have been intercepted
- Support for both GraphQL and REST operations
- Auto-discovery of MSW handlers already registered in your app
- Adapters for automatic refetch: URQL, TanStack Query, SWR, Apollo Client

## Packages

| Package | Import path | Description |
| --- | --- | --- |
| Core | `msw-devtool` | Registry, store, MSW integration, React UI plugin, adapter system |
| URQL adapter | `msw-devtool/adapters/urql` | Auto-refetch via custom exchange |
| TanStack Query adapter | `msw-devtool/adapters/tanstack-query` | Auto-refetch via query invalidation |
| SWR adapter | `msw-devtool/adapters/swr` | Auto-refetch via global mutate |
| Apollo Client adapter | `msw-devtool/adapters/apollo` | Auto-refetch via refetchQueries |
| Axios adapter | `msw-devtool/adapters/axios` | Registration marker for Axios users (use `useMockRefetch` for live updates) |

## Installation

Everything is in a single package:

```bash
pnpm add msw-devtool
```

Adapters are available via subpath exports -- only the ones you import are bundled (tree-shaking):

```ts
import { createUrqlAdapter } from "msw-devtool/adapters/urql";
import { createTanStackQueryAdapter } from "msw-devtool/adapters/tanstack-query";
import { createSwrAdapter } from "msw-devtool/adapters/swr";
import { createApolloAdapter } from "msw-devtool/adapters/apollo";
import { createAxiosAdapter } from "msw-devtool/adapters/axios";
```

### Peer dependencies

`msw-devtool` expects the following as peer dependencies:

- `msw` ^2.0.0
- `react` ^18 or ^19
- `react-dom` ^18 or ^19
- `zustand` ^5.0.0
- `@tanstack/pacer` >=0.19.0

## Quick Start

This guide assumes you already have MSW installed and `mockServiceWorker.js` generated in your public directory.

### 1. Define mock descriptors

Mock descriptors tell the devtools which operations exist and what response variants are available for each one.

**GraphQL operations:**

```ts
import {
  type GraphQLMockDescriptor,
  withStandardVariants,
} from "msw-devtool";

const graphqlDescriptors: GraphQLMockDescriptor[] = [
  {
    type: "graphql",
    operationName: "GetUser",
    operationType: "query",
    group: "Users",
    variants: withStandardVariants({ user: { id: 1, name: "John" } }),
  },
  {
    type: "graphql",
    operationName: "UpdateUser",
    operationType: "mutation",
    group: "Users",
    variants: withStandardVariants({ updateUser: { success: true } }),
  },
];
```

`withStandardVariants(data)` generates three variants: **Success** (200), **Network Error**, and **GraphQL Error**.

**REST operations:**

```ts
import {
  type RestMockDescriptor,
  withRestVariants,
} from "msw-devtool";

const restDescriptors: RestMockDescriptor[] = [
  {
    type: "rest",
    operationName: "GET Users",
    method: "get",
    path: "https://api.example.com/users/:id",
    group: "Users",
    variants: [
      { id: "success", label: "Success", statusCode: 200, data: { id: 1, name: "John" } },
      { id: "notFound", label: "Not Found", statusCode: 404, data: { error: "Not found" } },
      { id: "networkError", label: "Network Error", data: null, isNetworkError: true },
    ],
  },
];
```

`withRestVariants(data)` generates two variants: **Success (200)** and **Network Error**.

### 2. Register mocks

```ts
import { registerMocks } from "msw-devtool";

registerMocks(...graphqlDescriptors, ...restDescriptors);
```

### 3. Enable mocking in your entry point

Use `enableMocking()` to start the MSW worker before rendering your app. By wrapping the setup behind a dev-mode check (`import.meta.env.DEV`), Vite will tree-shake the entire MSW code path from production bundles:

```tsx
// main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

async function bootstrap() {
  if (import.meta.env.DEV) {
    // Dynamic imports keep MSW out of the production bundle
    await import("./mocks/setup");
    const { enableMocking } = await import("msw-devtool");
    await enableMocking();
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

bootstrap();
```

For dev-only apps (e.g. demo apps, Storybook), you can skip the conditional:

```tsx
import { enableMocking } from "msw-devtool";
import { App } from "./App";

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
```

Then add the TanStack DevTools plugin to your app:

```tsx
// App.tsx
import { TanStackDevtools } from "@tanstack/react-devtools";
import { createMswDevToolsPlugin } from "msw-devtool";

function App() {
  return (
    <>
      <YourApp />
      <TanStackDevtools plugins={[createMswDevToolsPlugin()]} />
    </>
  );
}
```

You can pass custom worker options to `enableMocking()`:

```ts
enableMocking({
  serviceWorkerUrl: "/custom-path/mockServiceWorker.js",
  quiet: true,
  onUnhandledRequest: "bypass",
});
```

### 4. (Optional) Register an adapter for auto-refetch

Adapters automatically refetch/revalidate queries when you change mock configuration in the devtools panel.

**URQL:**

The URQL adapter uses a custom exchange. Register the adapter and add `mockRefetchExchange` to your URQL client:

```ts
import { registerAdapter } from "msw-devtool";
import { createUrqlAdapter, mockRefetchExchange } from "msw-devtool/adapters/urql";
import { createClient, cacheExchange, fetchExchange } from "@urql/core";

registerAdapter(createUrqlAdapter());

const client = createClient({
  url: "/graphql",
  exchanges: [cacheExchange, mockRefetchExchange, fetchExchange],
});
```

**TanStack Query:**

```ts
import { registerAdapter } from "msw-devtool";
import { createTanStackQueryAdapter } from "msw-devtool/adapters/tanstack-query";
import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();
registerAdapter(createTanStackQueryAdapter(queryClient));
```

**SWR:**

```ts
import { registerAdapter } from "msw-devtool";
import { createSwrAdapter } from "msw-devtool/adapters/swr";
import { useSWRConfig } from "swr";

// Inside a component that has SWR context:
function SetupAdapter() {
  const { mutate } = useSWRConfig();

  useEffect(() => {
    const unregister = registerAdapter(createSwrAdapter(mutate));
    return unregister;
  }, [mutate]);

  return null;
}
```

**Apollo Client:**

```ts
import { registerAdapter } from "msw-devtool";
import { createApolloAdapter } from "msw-devtool/adapters/apollo";
import { ApolloClient, InMemoryCache } from "@apollo/client";

const apolloClient = new ApolloClient({
  uri: "/graphql",
  cache: new InMemoryCache(),
});

registerAdapter(createApolloAdapter(apolloClient));
```

**Axios:**

Axios has no built-in query cache, so the adapter is a registration marker.
Use `useMockRefetch` in your components for live updates:

```ts
import { registerAdapter } from "msw-devtool";
import { createAxiosAdapter } from "msw-devtool/adapters/axios";

registerAdapter(createAxiosAdapter());
```

### 5. (Optional) `useMockRefetch` for plain `fetch()`

If you use plain `fetch()` without a data-fetching library, there's no client to create an adapter for. Instead, use the `useMockRefetch` hook to automatically refetch when mock config changes in the devtools:

```tsx
import { useMockRefetch } from "msw-devtool";

function UserCard() {
  const { data, refetch } = useMyFetch("/api/users/1");

  // Pass the operation name (must match your descriptor's operationName)
  useMockRefetch("GET User", refetch);

  return <div>{data?.name}</div>;
}
```

> **Note:** The first argument must match the `operationName` in your mock descriptor exactly. Library adapters (TanStack Query, SWR, etc.) don't need this because they invalidate all queries at once.

> **Tip:** If you're starting a new project, consider using a server-state library like [TanStack Query](https://tanstack.com/query), [SWR](https://swr.vercel.app/), [URQL](https://formidable.com/open-source/urql/), or [Apollo Client](https://www.apollographql.com/docs/react/) instead of plain `fetch()` or Axios. These libraries provide built-in caching, deduplication, and automatic refetching, and their adapters integrate seamlessly with `msw-devtool` without needing per-operation `useMockRefetch` calls.

## Concepts

### Mock Descriptors

A mock descriptor defines a single mockable operation -- either GraphQL or REST. Each descriptor has:

- **`operationName`** -- Unique identifier (for GraphQL, the operation name; for REST, typically `METHOD path`)
- **`type`** -- `"graphql"` or `"rest"`
- **`group`** -- Optional grouping label for the UI (e.g., feature area)
- **`variants`** -- Array of possible responses

### Variants

Each variant represents one possible response for an operation:

```ts
type MockVariant = {
  id: string;
  label: string;
  data: unknown | null;
  isNetworkError?: boolean;   // Simulates a fetch failure
  isGraphQLError?: boolean;   // Wraps response in { data, errors: [...] }
  statusCode?: number;        // HTTP status code (default: 200)
  headers?: Record<string, string>;
};
```

**Custom variant example:**

```ts
{
  id: "rateLimited",
  label: "Rate Limited (429)",
  statusCode: 429,
  headers: { "Retry-After": "60" },
  data: { error: "Too many requests" },
}
```

### Override Chain

The devtools apply a layered override system:

1. The **variant** defines default `statusCode`, `headers`, and `data`
2. The **store config** records which variant is active for each operation
3. The **user** can override `statusCode`, `headers`, response body (JSON), and delay per-operation from the UI

This means you can select a "Success" variant and then temporarily change just the status code to 500 without creating a new variant.

### Adapters

Adapters bridge the devtools with your data-fetching library. When a mock configuration changes (toggle, variant switch, JSON override), the adapter triggers a refetch so the UI updates immediately. Each adapter returns an unregister function for cleanup:

```ts
const unregister = registerAdapter(myAdapter);
// Later:
unregister();
```

### Auto-Discovery

If you already have MSW handlers registered and want the devtools to pick them up automatically:

```ts
import { discoverFromHandlers } from "msw-devtool";
import { getWorker } from "msw-devtool";

const worker = getWorker();
if (worker) {
  discoverFromHandlers(worker.listHandlers(), {
    group: "Auto-discovered",
    skipExisting: true,
  });
}
```

This introspects your existing MSW handlers and generates descriptors with default variants for any that are not already registered.

## API Reference

### Core Exports (`msw-devtool`)

| Export | Description |
| --- | --- |
| `registerMocks(...descriptors)` | Register mock operation descriptors with the global registry |
| `registerAdapter(adapter)` | Register a data-fetching adapter. Returns an unregister function |
| `createMswDevToolsPlugin(options?)` | Create the TanStack DevTools plugin configuration object |
| `enableMocking(options?)` | Start the MSW service worker. Call before `createRoot()` in your entry point |
| `MswBootstrap` _(deprecated)_ | React component that blocks rendering until the MSW worker is ready. Use `enableMocking()` instead |
| `useMockRefetch(name, refetch)` | React hook — auto-refetches when mock config changes for the given operation. For plain `fetch()` users |
| `withStandardVariants(data)` | Generate standard GraphQL variants: Success, Network Error, GraphQL Error |
| `withRestVariants(data)` | Generate standard REST variants: Success (200), Network Error |
| `discoverFromHandlers(handlers, options?)` | Auto-discover MSW handlers and register them as descriptors |
| `mockRegistry` | Singleton registry instance for advanced use (subscribe, get, unregister) |
| `useMockStore` | Zustand store hook for mock operation state |
| `mockStore` | Direct Zustand store reference (non-hook) |
| `startWorker(options?)` | Manually start the MSW service worker |
| `getWorker()` | Get the current MSW `SetupWorker` instance (or `null`) |
| `refreshHandlers()` | Re-sync MSW handlers after registry changes post-startup |

### Adapter Exports

| Import path | Export | Description |
| --- | --- | --- |
| `msw-devtool/adapters/urql` | `createUrqlAdapter()` | Create the URQL adapter |
| `msw-devtool/adapters/urql` | `mockRefetchExchange` | URQL exchange that re-executes queries on mock changes |
| `msw-devtool/adapters/tanstack-query` | `createTanStackQueryAdapter(queryClient)` | Create the TanStack Query adapter |
| `msw-devtool/adapters/swr` | `createSwrAdapter(mutate)` | Create the SWR adapter |
| `msw-devtool/adapters/apollo` | `createApolloAdapter(apolloClient)` | Create the Apollo Client adapter |
| `msw-devtool/adapters/axios` | `createAxiosAdapter()` | Create the Axios adapter (use with `useMockRefetch`) |

### Types (`msw-devtool` or `msw-devtool/types`)

| Type | Description |
| --- | --- |
| `GraphQLMockDescriptor` | Descriptor for a GraphQL operation |
| `RestMockDescriptor` | Descriptor for a REST operation |
| `MockOperationDescriptor` | Union of `GraphQLMockDescriptor` and `RestMockDescriptor` |
| `MockVariant` | A single response variant |
| `OperationMockConfig` | Per-operation runtime state (enabled, active variant, overrides) |
| `MswDevToolAdapter` | Interface for creating custom adapters |
| `MockChangeType` | `"toggle" \| "variant" \| "json-override" \| "enable-all" \| "disable-all"` |
| `WorkerOptions` | Configuration for the MSW service worker |

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Watch mode for all packages
pnpm dev

# Run the demo app
pnpm dev:demo

# Type checking
pnpm typecheck

# Lint
pnpm lint

# Format
pnpm format
```

### Project Structure

```
msw-devtool/
  apps/
    demo/              # Demo application
  packages/
    core/              # Core library (registry, store, MSW integration, UI plugin)
    urql/              # URQL adapter
    tanstack-query/    # TanStack Query adapter
    swr/               # SWR adapter
    apollo/            # Apollo Client adapter
```

### Tech Stack

- **pnpm workspaces** for monorepo management
- **MSW v2** for request interception
- **TanStack DevTools** plugin system for the UI panel
- **Zustand v5** for state management (with persist middleware)
- **tsup** for building (ESM-only output)
- **Biome** for linting and formatting

## Testing

```bash
# Unit tests (Vitest)
pnpm test

# E2E tests (Playwright, against the demo app)
pnpm test:e2e
```

## License

MIT
