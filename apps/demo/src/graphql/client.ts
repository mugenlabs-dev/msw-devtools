import { mockRefetchExchange } from "@mugenlabs/msw-devtools/adapters/urql";
import { Client, cacheExchange, fetchExchange } from "@urql/core";

export const urqlClient = new Client({
  exchanges: [cacheExchange, mockRefetchExchange, fetchExchange],
  preferGetMethod: false,
  url: "https://beta.pokeapi.co/graphql/v1beta",
});
