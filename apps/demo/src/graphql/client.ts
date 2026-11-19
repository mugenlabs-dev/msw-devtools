import { mockRefetchExchange } from "@mugenlabs/msw-devtools/adapters/urql";
import { Client, cacheExchange, fetchExchange } from "@urql/core";

import { playgroundFetch } from "../playground-fetch";

/** A new client has an empty document cache. The layout replaces it on every mock edit. */
export const createUrqlClient = (): Client =>
  new Client({
    exchanges: [cacheExchange, mockRefetchExchange, fetchExchange],
    fetch: playgroundFetch,
    preferGetMethod: false,
    url: "https://beta.pokeapi.co/graphql/v1beta",
  });
