import { ApolloProvider } from "@apollo/client";
import { createMswDevToolsPlugin, registerAdapter } from "@mugenlabs/msw-devtools";
import { createApolloAdapter } from "@mugenlabs/msw-devtools/adapters/apollo";
import { createAxiosAdapter } from "@mugenlabs/msw-devtools/adapters/axios";
import { createTanStackQueryAdapter } from "@mugenlabs/msw-devtools/adapters/tanstack-query";
import { createUrqlAdapter } from "@mugenlabs/msw-devtools/adapters/urql";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet } from "@tanstack/react-router";
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
