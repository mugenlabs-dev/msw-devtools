import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },
  link: new HttpLink({
    uri: "https://beta.pokeapi.co/graphql/v1beta",
  }),
});
