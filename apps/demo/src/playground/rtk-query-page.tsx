import { configureStore } from "@reduxjs/toolkit";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { registerAdapter } from "msw-devtools-plugin";
import { createRtkQueryAdapter } from "msw-devtools-plugin/adapters/rtk-query";
import { useCallback, useEffect } from "react";
import { Provider } from "react-redux";

import { CodeBlock } from "../docs/components/code-block";
import type { GraphQLPokemon } from "../pokemon-card";
import {
  GRAPHQL_BADGE,
  mapGraphQLPokemon,
  mapRestPokemon,
  PokemonCard,
  REST_BADGE,
} from "../pokemon-card";
import type { RestPokemonResponse } from "../use-rest-pokemon";

// ---------------------------------------------------------------------------
// RTK Query API
// ---------------------------------------------------------------------------

const pokemonApi = createApi({
  baseQuery: fetchBaseQuery(),
  endpoints: (builder) => ({
    getGraphqlPokemon: builder.query<
      { data: { pokemon_v2_pokemon: GraphQLPokemon[] } },
      { operationName: string; query: string }
    >({
      query: ({ query, operationName }) => ({
        body: { operationName, query },
        headers: { "Content-Type": "application/json" },
        method: "POST",
        url: "https://beta.pokeapi.co/graphql/v1beta",
      }),
    }),
    getRestPokemon: builder.query<RestPokemonResponse, string>({
      query: (url) => url,
    }),
  }),
  reducerPath: "pokemonApi",
});

const store = configureStore({
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(pokemonApi.middleware),
  reducer: {
    [pokemonApi.reducerPath]: pokemonApi.reducer,
  },
});

// ---------------------------------------------------------------------------
// GraphQL Queries
// ---------------------------------------------------------------------------

const VOLCARONA_QUERY =
  "query GetVolcarona { pokemon_v2_pokemon(where: { id: { _eq: 637 } }) { id name height weight pokemon_v2_pokemontypes { pokemon_v2_type { name } } pokemon_v2_pokemonsprites { sprites } } }";

const HYDREIGON_QUERY =
  "query GetHydreigon { pokemon_v2_pokemon(where: { id: { _eq: 635 } }) { id name height weight pokemon_v2_pokemontypes { pokemon_v2_type { name } } pokemon_v2_pokemonsprites { sprites } } }";

const CHANDELURE_QUERY =
  "query GetChandelure { pokemon_v2_pokemon(where: { id: { _eq: 609 } }) { id name height weight pokemon_v2_pokemontypes { pokemon_v2_type { name } } pokemon_v2_pokemonsprites { sprites } } }";

// ---------------------------------------------------------------------------
// Adapter Registration
// ---------------------------------------------------------------------------

const AdapterRegistrar = () => {
  useEffect(() => {
    const unregister = registerAdapter(createRtkQueryAdapter(store, pokemonApi));
    return unregister;
  }, []);

  return null;
};

// ---------------------------------------------------------------------------
// REST Cards
// ---------------------------------------------------------------------------

const InfernapeCard = () => {
  const { data, error, isLoading, refetch } = pokemonApi.useGetRestPokemonQuery(
    "https://pokeapi.co/api/v2/pokemon/392"
  );

  const handleRefetch = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <PokemonCard
      badge={REST_BADGE}
      data={data ? mapRestPokemon(data) : null}
      error={error ? String(error) : null}
      library="RTK Query"
      loading={isLoading}
      method="GET"
      onRefetch={handleRefetch}
    />
  );
};

const WeavileCard = () => {
  const { data, error, isLoading, refetch } = pokemonApi.useGetRestPokemonQuery(
    "https://pokeapi.co/api/v2/pokemon/461"
  );

  const handleRefetch = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <PokemonCard
      badge={REST_BADGE}
      data={data ? mapRestPokemon(data) : null}
      error={error ? String(error) : null}
      library="RTK Query"
      loading={isLoading}
      method="GET"
      onRefetch={handleRefetch}
    />
  );
};

const ZoroarkCard = () => {
  const { data, error, isLoading, refetch } = pokemonApi.useGetRestPokemonQuery(
    "https://pokeapi.co/api/v2/pokemon/571"
  );

  const handleRefetch = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <PokemonCard
      badge={REST_BADGE}
      data={data ? mapRestPokemon(data) : null}
      error={error ? String(error) : null}
      library="RTK Query"
      loading={isLoading}
      method="GET"
      onRefetch={handleRefetch}
    />
  );
};

// ---------------------------------------------------------------------------
// GraphQL Cards
// ---------------------------------------------------------------------------

const VolcaronaCard = () => {
  const { data, error, isLoading, refetch } = pokemonApi.useGetGraphqlPokemonQuery({
    operationName: "GetVolcarona",
    query: VOLCARONA_QUERY,
  });

  const handleRefetch = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <PokemonCard
      badge={GRAPHQL_BADGE}
      data={mapGraphQLPokemon(data?.data?.pokemon_v2_pokemon?.[0])}
      error={error ? String(error) : null}
      library="RTK Query"
      loading={isLoading}
      method="QUERY"
      onRefetch={handleRefetch}
    />
  );
};

const HydreigonCard = () => {
  const { data, error, isLoading, refetch } = pokemonApi.useGetGraphqlPokemonQuery({
    operationName: "GetHydreigon",
    query: HYDREIGON_QUERY,
  });

  const handleRefetch = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <PokemonCard
      badge={GRAPHQL_BADGE}
      data={mapGraphQLPokemon(data?.data?.pokemon_v2_pokemon?.[0])}
      error={error ? String(error) : null}
      library="RTK Query"
      loading={isLoading}
      method="QUERY"
      onRefetch={handleRefetch}
    />
  );
};

const ChandelureCard = () => {
  const { data, error, isLoading, refetch } = pokemonApi.useGetGraphqlPokemonQuery({
    operationName: "GetChandelure",
    query: CHANDELURE_QUERY,
  });

  const handleRefetch = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <PokemonCard
      badge={GRAPHQL_BADGE}
      data={mapGraphQLPokemon(data?.data?.pokemon_v2_pokemon?.[0])}
      error={error ? String(error) : null}
      library="RTK Query"
      loading={isLoading}
      method="QUERY"
      onRefetch={handleRefetch}
    />
  );
};

// ---------------------------------------------------------------------------
// Code Snippet
// ---------------------------------------------------------------------------

const RTK_QUERY_CODE = `// 1. Create your RTK Query API and store
import { configureStore } from "@reduxjs/toolkit";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const pokemonApi = createApi({
  baseQuery: fetchBaseQuery(),
  endpoints: (builder) => ({
    getPokemon: builder.query({ query: (id) => \`/api/pokemon/\${id}\` }),
  }),
});

const store = configureStore({
  reducer: { [pokemonApi.reducerPath]: pokemonApi.reducer },
  middleware: (gDM) => gDM().concat(pokemonApi.middleware),
});

// 2. Register the adapter — pass the store and the API instance
import { registerAdapter } from "msw-devtools-plugin";
import { createRtkQueryAdapter } from "msw-devtools-plugin/adapters/rtk-query";

registerAdapter(createRtkQueryAdapter(store, pokemonApi));

// 3. Use the generated hooks as usual
const { data } = pokemonApi.useGetPokemonQuery(6);`;

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

const RtkQueryPageContent = () => (
  <div className="flex flex-col gap-8">
    <div className="group rounded-2xl border border-border-primary bg-card-bg/30 p-6">
      <div className="flex items-center gap-4">
        <img
          alt="Dusk Ball"
          className="pokeball-img shrink-0"
          height={64}
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dusk-ball.png"
          style={{ imageRendering: "pixelated" }}
          width={64}
        />
        <div>
          <h2 className="m-0 font-bold text-text-primary text-xl">
            <a
              className="text-text-primary no-underline transition-colors duration-150 hover:text-accent-blue"
              href="https://redux-toolkit.js.org/rtk-query/overview"
              rel="noopener noreferrer"
              target="_blank"
            >
              RTK Query
            </a>
          </h2>
          <p className="m-0 mt-1 text-sm text-text-dimmed">
            The adapter listens for mock changes and resets the RTK Query API state, triggering
            re-fetches for all active subscriptions without a full page reload.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <InfernapeCard />
        <WeavileCard />
        <ZoroarkCard />
        <VolcaronaCard />
        <HydreigonCard />
        <ChandelureCard />
      </div>
    </div>

    <CodeBlock lang="typescript">{RTK_QUERY_CODE}</CodeBlock>
    <AdapterRegistrar />
  </div>
);

export const RtkQueryPage = () => (
  <Provider store={store}>
    <RtkQueryPageContent />
  </Provider>
);
