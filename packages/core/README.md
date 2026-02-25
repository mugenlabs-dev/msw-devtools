<p align="center">
  <img src="https://raw.githubusercontent.com/Yagogc/msw-devtool/main/apps/demo/public/logo-readme.svg" width="128" height="128" alt="msw-devtool logo" />
</p>

# msw-devtool

A [TanStack DevTools](https://tanstack.com/devtools) plugin for managing [MSW](https://mswjs.io/) (Mock Service Worker) mocks in the browser. Register your existing MSW handlers, then toggle, customize, and inspect them from a visual panel -- no changes to your handler code required.

> **Note:** This project is a work in progress -- the API has not been finalised yet, which is why we haven't reached 1.0.0. Expect breaking changes between minor versions.

<p align="center">
  <img src="https://raw.githubusercontent.com/Yagogc/msw-devtool/main/screenshot.png" alt="msw-devtool plugin UI showing operations list with LIVE badges, variant selector, and response editor" />
</p>

## Features

- **Toggle Mocks** -- Enable or disable individual mock handlers on the fly
- **Switch Variants** -- Swap between response variants (success, error, empty, custom)
- **Live Overrides** -- Edit JSON response bodies, status codes, headers, and delays in real time
- **LIVE Tracking** -- See which operations have been intercepted by MSW
- **Filter & Sort** -- Filter by type (REST/GraphQL), status (enabled/live), and sort alphabetically
- **Auto Refetch** -- Adapters for TanStack Query, SWR, URQL, Apollo Client, and Axios trigger automatic refetches when mock config changes

## Installation

Everything ships in a single package. Adapters are available via subpath exports and are tree-shakeable.

```bash
npm install msw-devtools-plugin
```

### Peer dependencies

| Dependency | Version | Required |
| --- | --- | --- |
| `msw` | `^2.0.0` | Yes |
| `react` | `^18.0.0 \|\| ^19.0.0` | Yes |
| `react-dom` | `^18.0.0 \|\| ^19.0.0` | Yes |
| `zustand` | `^5.0.0` | Yes |
| `@tanstack/react-query` | `>=5.0.0` | Only if using TanStack Query adapter |
| `@urql/core` + `wonka` | `>=5.0.0` / `>=6.0.0` | Only if using URQL adapter |
| `swr` | `>=2.0.0` | Only if using SWR adapter |
| `@apollo/client` + `graphql` | `>=3.0.0` / `>=16.0.0` | Only if using Apollo adapter |

## Quick Start

This guide assumes you already have MSW installed and `mockServiceWorker.js` generated in your public directory.

### 1. Register your MSW handlers

Use `registerRestMocks` and `registerGraphqlMocks` to register your existing MSW handlers with the devtools. Operation metadata (method, path, operation name) is automatically derived from handler info.

```ts
// mocks/setup.ts
import { registerRestMocks, registerGraphqlMocks } from "msw-devtools-plugin";
import { http, HttpResponse, graphql } from "msw";

// Single handler per operation
registerRestMocks(
  { handler: http.get("/api/users", () => HttpResponse.json({ users: [] })) },
  { handler: http.get("/api/posts", () => HttpResponse.json({ posts: [] })), group: "Blog" },
);

// GraphQL handlers with variants
registerGraphqlMocks({
  group: "Users",
  variants: [
    graphql.query("GetUser", () =>
      HttpResponse.json({ data: { user: { id: 1, name: "John" } } })
    ),
    {
      handler: graphql.query("GetUser", () =>
        HttpResponse.json({ data: { user: null } })
      ),
      label: "Not Found",
    },
  ],
});
```

### 2. Mount the plugin

```tsx
// App.tsx
import { TanStackDevtools } from "@tanstack/react-devtools";
import { createMswDevToolsPlugin } from "msw-devtools-plugin";
import "./mocks/setup";

function App() {
  return (
    <>
      <YourApp />
      <TanStackDevtools plugins={[createMswDevToolsPlugin()]} />
    </>
  );
}
```

The MSW service worker starts automatically when the plugin mounts.

> **Custom worker options:** If you need to customise the worker (e.g. a different `serviceWorkerUrl`), call `startWorker()` before the plugin mounts. The plugin detects an already-running worker and skips auto-start.
>
> ```ts
> import { startWorker } from "msw-devtools-plugin";
> void startWorker({ serviceWorkerUrl: "/custom-path/mockServiceWorker.js" });
> ```

### 3. (Optional) Register an adapter for auto-refetch

Adapters automatically refetch/revalidate queries when you change mock configuration in the devtools panel.

**TanStack Query:**

```ts
import { registerAdapter } from "msw-devtools-plugin";
import { createTanStackQueryAdapter } from "msw-devtools-plugin/adapters/tanstack-query";
import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();
registerAdapter(createTanStackQueryAdapter(queryClient));
```

**URQL:**

```ts
import { registerAdapter } from "msw-devtools-plugin";
import { createUrqlAdapter, mockRefetchExchange } from "msw-devtools-plugin/adapters/urql";
import { createClient, cacheExchange, fetchExchange } from "@urql/core";

registerAdapter(createUrqlAdapter());

const client = createClient({
  url: "/graphql",
  exchanges: [cacheExchange, mockRefetchExchange, fetchExchange],
});
```

**SWR:**

```ts
import { registerAdapter } from "msw-devtools-plugin";
import { createSwrAdapter } from "msw-devtools-plugin/adapters/swr";
import { useSWRConfig } from "swr";

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
import { registerAdapter } from "msw-devtools-plugin";
import { createApolloAdapter } from "msw-devtools-plugin/adapters/apollo";

const apolloClient = new ApolloClient({ uri: "/graphql", cache: new InMemoryCache() });
registerAdapter(createApolloAdapter(apolloClient));
```

**Axios / plain fetch:**

Axios has no built-in query cache. Register the adapter as a marker and use `useMockRefetch` in your components:

```ts
import { registerAdapter } from "msw-devtools-plugin";
import { createAxiosAdapter } from "msw-devtools-plugin/adapters/axios";

registerAdapter(createAxiosAdapter());
```

```tsx
import { useMockRefetch } from "msw-devtools-plugin";

function UserCard() {
  const { data, refetch } = useMyFetch("/api/users/1");
  useMockRefetch("GET Users", refetch);
  return <div>{data?.name}</div>;
}
```

## Handler Registration Patterns

### Single handler (auto-derived name)

The operation name is derived from the handler info (e.g. `GET /api/users`):

```ts
registerRestMocks({ handler: http.get("/api/users", resolver) });
```

### Custom operation name and group

```ts
registerRestMocks({
  handler: http.get("https://api.example.com/users", resolver),
  operationName: "GET Users",
  group: "User Management",
});
```

### Multiple variants with labels

Provide an array of `variants` instead of a single `handler`. Each variant is either a bare handler or `{ handler, label }`:

```ts
registerGraphqlMocks({
  group: "Users",
  variants: [
    graphql.query("GetUser", successResolver),                        // label: "Default"
    { handler: graphql.query("GetUser", emptyResolver), label: "Empty" },
    { handler: graphql.query("GetUser", errorResolver), label: "Error" },
  ],
});
```

## Core Exports

All exports come from the `msw-devtools-plugin` package.

| Export | Description |
| --- | --- |
| `registerRestMocks(...defs)` | Register REST mock handlers. Metadata is auto-derived from `HttpHandler` info. |
| `registerGraphqlMocks(...defs)` | Register GraphQL mock handlers. Metadata is auto-derived from `GraphQLHandler` info. |
| `registerAdapter(adapter)` | Register a data-fetching adapter for auto-refetch. Returns an unregister function. |
| `createMswDevToolsPlugin(options?)` | Create the TanStack DevTools plugin config object. |
| `useMockRefetch(operationName, refetch)` | React hook that auto-refetches when mock config changes for a specific operation. |
| `startWorker(options?)` | Manually start the MSW service worker. |
| `getWorker()` | Get the current MSW `SetupWorker` instance (or `null`). |
| `refreshHandlers()` | Re-sync MSW handlers after registry changes post-startup. |
| `mockRegistry` | Singleton registry instance (subscribe, get, unregister). |
| `useMockStore` | Zustand store hook for mock operation state. |
| `mockStore` | Direct Zustand store reference (non-hook). |

### Adapter Exports

| Import path | Export | Description |
| --- | --- | --- |
| `msw-devtools-plugin/adapters/tanstack-query` | `createTanStackQueryAdapter(queryClient)` | TanStack Query adapter |
| `msw-devtools-plugin/adapters/urql` | `createUrqlAdapter()` | URQL adapter |
| `msw-devtools-plugin/adapters/urql` | `mockRefetchExchange` | URQL exchange for mock-triggered re-execution |
| `msw-devtools-plugin/adapters/swr` | `createSwrAdapter(mutate)` | SWR adapter |
| `msw-devtools-plugin/adapters/apollo` | `createApolloAdapter(apolloClient)` | Apollo Client adapter |
| `msw-devtools-plugin/adapters/axios` | `createAxiosAdapter()` | Axios adapter (use with `useMockRefetch`) |

### Key Types

| Type | Description |
| --- | --- |
| `RestMockDef` | Input for `registerRestMocks` -- `{ handler?, variants?, operationName?, group? }` |
| `GraphqlMockDef` | Input for `registerGraphqlMocks` -- `{ handler?, variants?, operationName?, operationType?, group? }` |
| `HandlerVariant` | A resolved variant stored in the registry -- `{ handler, id, label }` |
| `HandlerVariantInput<H>` | What you pass as a variant: a bare handler or `{ handler, label }` |
| `RestMockDescriptor` | Internal descriptor for a registered REST operation |
| `GraphQLMockDescriptor` | Internal descriptor for a registered GraphQL operation |
| `MockOperationDescriptor` | Union of `RestMockDescriptor` and `GraphQLMockDescriptor` |
| `OperationMockConfig` | Per-operation runtime state (enabled, active variant, overrides) |
| `MswDevToolAdapter` | Interface for creating custom adapters |
| `MockChangeType` | `"toggle" \| "variant" \| "json-override" \| "enable-all" \| "disable-all"` |
| `WorkerOptions` | Configuration for `startWorker()` |
| `MswDevToolsPluginOptions` | Configuration for `createMswDevToolsPlugin()` |

## Documentation

Full documentation and live playground: [https://yagogc.github.io/msw-devtool/](https://yagogc.github.io/msw-devtool/)

## License

MIT
