import { Client, cacheExchange, fetchExchange } from "@urql/core";
import { mockRefetchExchange } from "msw-devtools-plugin/adapters/urql";

export const urqlClient = new Client({
  exchanges: [cacheExchange, mockRefetchExchange, fetchExchange],
  preferGetMethod: false,
  url: "https://beta.pokeapi.co/graphql/v1beta",
});
