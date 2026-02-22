import { Client, cacheExchange, fetchExchange } from "@urql/core";
import { mockRefetchExchange } from "msw-devtool/adapters/urql";

export const urqlClient = new Client({
	url: "https://beta.pokeapi.co/graphql/v1beta",
	exchanges: [cacheExchange, mockRefetchExchange, fetchExchange],
	preferGetMethod: false,
});
