import { ApolloProvider } from "@apollo/client";
import { createMswDevToolsPlugin, registerAdapter, useMockStore } from "@mugenlabs/msw-devtools";
import { createApolloAdapter } from "@mugenlabs/msw-devtools/adapters/apollo";
import { createAxiosAdapter } from "@mugenlabs/msw-devtools/adapters/axios";
import { createTanStackQueryAdapter } from "@mugenlabs/msw-devtools/adapters/tanstack-query";
import { createUrqlAdapter } from "@mugenlabs/msw-devtools/adapters/urql";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SWRConfig } from "swr";
import { Provider as UrqlProvider } from "urql";

import { apolloClient } from "./graphql/apollo-client";
import { urqlClient } from "./graphql/client";
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

export const PlaygroundLayout = () => (
  <QueryClientProvider client={queryClient}>
    <SWRConfig value={{ revalidateOnFocus: false }}>
      <ApolloProvider client={apolloClient}>
        <UrqlProvider value={urqlClient}>
          <PlaygroundPageShell>
            <WorkerGate>
              <Outlet />
            </WorkerGate>
          </PlaygroundPageShell>
          <TanStackDevtools config={{ defaultOpen: true }} plugins={[createMswDevToolsPlugin()]} />
        </UrqlProvider>
      </ApolloProvider>
    </SWRConfig>
  </QueryClientProvider>
);
