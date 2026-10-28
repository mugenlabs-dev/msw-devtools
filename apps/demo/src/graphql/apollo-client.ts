import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

import { playgroundFetch } from "../playground-fetch";

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },
  link: new HttpLink({
    fetch: playgroundFetch,
    uri: "https://beta.pokeapi.co/graphql/v1beta",
  }),
});
