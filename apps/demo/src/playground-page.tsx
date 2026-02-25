import { ApolloProvider } from "@apollo/client";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet } from "@tanstack/react-router";
import { createMswDevToolsPlugin, registerAdapter } from "msw-devtools-plugin";
import { createApolloAdapter } from "msw-devtools-plugin/adapters/apollo";
import { createAxiosAdapter } from "msw-devtools-plugin/adapters/axios";
import { createTanStackQueryAdapter } from "msw-devtools-plugin/adapters/tanstack-query";
import { createUrqlAdapter } from "msw-devtools-plugin/adapters/urql";
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

export const PlaygroundLayout = () => (
  <QueryClientProvider client={queryClient}>
    <SWRConfig value={{ revalidateOnFocus: false }}>
      <ApolloProvider client={apolloClient}>
        <UrqlProvider value={urqlClient}>
          <PlaygroundPageShell>
            <Outlet />
          </PlaygroundPageShell>
          <TanStackDevtools config={{ defaultOpen: true }} plugins={[createMswDevToolsPlugin()]} />
        </UrqlProvider>
      </ApolloProvider>
    </SWRConfig>
  </QueryClientProvider>
);
