import { Provider as UrqlProvider } from "urql";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SWRConfig } from "swr";
import { ApolloProvider } from "@apollo/client";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { createMswDevToolsPlugin, registerAdapter } from "msw-devtool";
import { createUrqlAdapter } from "msw-devtool/adapters/urql";
import { createTanStackQueryAdapter } from "msw-devtool/adapters/tanstack-query";
import { createApolloAdapter } from "msw-devtool/adapters/apollo";
import { createAxiosAdapter } from "msw-devtool/adapters/axios";
import { urqlClient } from "./graphql/client";
import { apolloClient } from "./graphql/apollo-client";
import { HomePage } from "./HomePage";

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

export function PlaygroundPage() {
	return (
		<QueryClientProvider client={queryClient}>
			<SWRConfig value={{ revalidateOnFocus: false }}>
				<ApolloProvider client={apolloClient}>
					<UrqlProvider value={urqlClient}>
						<HomePage />
						<TanStackDevtools
							plugins={[createMswDevToolsPlugin()]}
							config={{ defaultOpen: true }}
						/>
					</UrqlProvider>
				</ApolloProvider>
			</SWRConfig>
		</QueryClientProvider>
	);
}
