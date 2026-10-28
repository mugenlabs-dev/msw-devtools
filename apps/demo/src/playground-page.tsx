import { ApolloProvider } from "@apollo/client";
import {
  createMswDevToolsPlugin,
  mockRegistry,
  onMockUpdate,
  registerAdapter,
  useMockStore,
} from "@mugenlabs/msw-devtools";
import { createApolloAdapter } from "@mugenlabs/msw-devtools/adapters/apollo";
import { createAxiosAdapter } from "@mugenlabs/msw-devtools/adapters/axios";
import { createTanStackQueryAdapter } from "@mugenlabs/msw-devtools/adapters/tanstack-query";
import { createUrqlAdapter } from "@mugenlabs/msw-devtools/adapters/urql";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { SWRConfig } from "swr";
import { Provider as UrqlProvider } from "urql";

import { apolloClient } from "./graphql/apollo-client";
import { createUrqlClient } from "./graphql/client";
import { trackEvent } from "./lib/analytics";
import "./mocks/setup";
import { startPlaygroundWorker } from "./mocks/start-playground-worker";
import { PlaygroundPageShell } from "./playground-shell";

// Create TanStack Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false },
  },
});

// Register adapters
registerAdapter(createUrqlAdapter());
registerAdapter(createTanStackQueryAdapter(queryClient));
registerAdapter(createApolloAdapter(apolloClient));
registerAdapter(createAxiosAdapter());

/**
 * Hold the data pages until the service worker controls the page. On a fast
 * production build the cards otherwise fetch before MSW is ready, so the first
 * requests bypass the mocks and never show up as LIVE.
 */
const WorkerGate = ({ children }: { children: ReactNode }) => {
  const workerStatus = useMockStore((s) => s.workerStatus);
  if (workerStatus === "idle" || workerStatus === "starting") {
    return (
      <p className="m-0 py-12 text-center text-sm text-text-muted" data-testid="worker-starting">
        Starting the mock service worker…
      </p>
    );
  }
  return children;
};

/** Override editors emit on every debounced change; report those once per operation. */
const reportedContinuousChanges = new Set<string>();

/** Reports every change made from the devtools panel, so we learn which features get used. */
const useMockUpdateTracking = () => {
  useEffect(
    () =>
      onMockUpdate((event) => {
        if (event.changeType === "json-override" || event.changeType === "headers-override") {
          const dedupeKey = `${event.changeType}:${event.operationName}`;
          if (reportedContinuousChanges.has(dedupeKey)) {
            return;
          }
          reportedContinuousChanges.add(dedupeKey);
        }
        trackEvent("mock_updated", {
          change_type: event.changeType,
          operation: event.operationName,
          operation_type: mockRegistry.get(event.operationName)?.type ?? null,
        });
      }),
    []
  );
};

export const PlaygroundLayout = () => {
  const [urql, setUrql] = useState(createUrqlClient);
  const devtoolsPlugins = useMemo(() => [createMswDevToolsPlugin()], []);
  useMockUpdateTracking();
  useLayoutEffect(() => {
    startPlaygroundWorker();
  }, []);
  useEffect(
    () =>
      onMockUpdate(() => {
        setUrql(createUrqlClient());
      }),
    []
  );
  return (
    <QueryClientProvider client={queryClient}>
      <SWRConfig value={{ revalidateOnFocus: false }}>
        <ApolloProvider client={apolloClient}>
          <UrqlProvider value={urql}>
            <PlaygroundPageShell>
              <WorkerGate>
                <Outlet />
              </WorkerGate>
            </PlaygroundPageShell>
            <TanStackDevtools config={{ defaultOpen: true }} plugins={devtoolsPlugins} />
          </UrqlProvider>
        </ApolloProvider>
      </SWRConfig>
    </QueryClientProvider>
  );
};
