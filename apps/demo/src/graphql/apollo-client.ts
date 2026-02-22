import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

export const apolloClient = new ApolloClient({
	link: new HttpLink({
		uri: "https://beta.pokeapi.co/graphql/v1beta",
	}),
	cache: new InMemoryCache(),
	defaultOptions: {
		watchQuery: {
			fetchPolicy: "cache-and-network",
		},
	},
});
