import { useQuery as useTanStackQuery } from "@tanstack/react-query";
import { useCallback } from "react";

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
import { fetchPokemonJson } from "../use-rest-pokemon";

// ---------------------------------------------------------------------------
// GraphQL Queries
// ---------------------------------------------------------------------------

const PANCHAM_QUERY =
  "query GetPancham { pokemon_v2_pokemon(where: { id: { _eq: 674 } }) { id name height weight pokemon_v2_pokemontypes { pokemon_v2_type { name } } pokemon_v2_pokemonsprites { sprites } } }";

const SALAMENCE_QUERY =
  "query GetSalamence { pokemon_v2_pokemon(where: { id: { _eq: 373 } }) { id name height weight pokemon_v2_pokemontypes { pokemon_v2_type { name } } pokemon_v2_pokemonsprites { sprites } } }";

const SNORLAX_QUERY =
  "query GetSnorlax { pokemon_v2_pokemon(where: { id: { _eq: 143 } }) { id name height weight pokemon_v2_pokemontypes { pokemon_v2_type { name } } pokemon_v2_pokemonsprites { sprites } } }";

// ---------------------------------------------------------------------------
// GraphQL Response Type
// ---------------------------------------------------------------------------

interface GraphQLResponse {
  data: { pokemon_v2_pokemon: GraphQLPokemon[] };
}

// ---------------------------------------------------------------------------
// REST Cards
// ---------------------------------------------------------------------------

const CharizardCard = () => {
  const { data, error, isLoading, refetch } = useTanStackQuery<RestPokemonResponse>({
    queryFn: () => fetchPokemonJson("https://pokeapi.co/api/v2/pokemon/6"),
    queryKey: ["pokemon", "charizard"],
  });

  const handleRefetch = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <PokemonCard
      badge={REST_BADGE}
      data={data ? mapRestPokemon(data) : null}
      error={error?.message ?? null}
      library="@tanstack/query"
      loading={isLoading}
      method="GET"
      onRefetch={handleRefetch}
    />
  );
};

const GengarCard = () => {
  const { data, error, isLoading, refetch } = useTanStackQuery<RestPokemonResponse>({
    queryFn: () => fetchPokemonJson("https://pokeapi.co/api/v2/pokemon/94"),
    queryKey: ["pokemon", "gengar"],
  });

  const handleRefetch = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <PokemonCard
      badge={REST_BADGE}
      data={data ? mapRestPokemon(data) : null}
      error={error?.message ?? null}
      library="@tanstack/query"
      loading={isLoading}
      method="GET"
      onRefetch={handleRefetch}
    />
  );
};

const TyranitarCard = () => {
  const { data, error, isLoading, refetch } = useTanStackQuery<RestPokemonResponse>({
    queryFn: () => fetchPokemonJson("https://pokeapi.co/api/v2/pokemon/248"),
    queryKey: ["pokemon", "tyranitar"],
  });

  const handleRefetch = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <PokemonCard
      badge={REST_BADGE}
      data={data ? mapRestPokemon(data) : null}
      error={error?.message ?? null}
      library="@tanstack/query"
      loading={isLoading}
      method="GET"
      onRefetch={handleRefetch}
    />
  );
};

// ---------------------------------------------------------------------------
// GraphQL Cards
// ---------------------------------------------------------------------------

const PanchamCard = () => {
  const { data, error, isLoading, refetch } = useTanStackQuery<GraphQLResponse>({
    queryFn: async () => {
      const res = await fetch("https://beta.pokeapi.co/graphql/v1beta", {
        body: JSON.stringify({
          operationName: "GetPancham",
          query: PANCHAM_QUERY,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      return res.json() as Promise<GraphQLResponse>;
    },
    queryKey: ["pokemon", "pancham"],
  });

  const handleRefetch = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <PokemonCard
      badge={GRAPHQL_BADGE}
      data={mapGraphQLPokemon(data?.data?.pokemon_v2_pokemon?.[0])}
      error={error?.message ?? null}
      library="@tanstack/query"
      loading={isLoading}
      method="QUERY"
      onRefetch={handleRefetch}
    />
  );
};

const SalamenceCard = () => {
  const { data, error, isLoading, refetch } = useTanStackQuery<GraphQLResponse>({
    queryFn: async () => {
      const res = await fetch("https://beta.pokeapi.co/graphql/v1beta", {
        body: JSON.stringify({
          operationName: "GetSalamence",
          query: SALAMENCE_QUERY,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      return res.json() as Promise<GraphQLResponse>;
    },
    queryKey: ["pokemon", "salamence"],
  });

  const handleRefetch = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <PokemonCard
      badge={GRAPHQL_BADGE}
      data={mapGraphQLPokemon(data?.data?.pokemon_v2_pokemon?.[0])}
      error={error?.message ?? null}
      library="@tanstack/query"
      loading={isLoading}
      method="QUERY"
      onRefetch={handleRefetch}
    />
  );
};

const SnorlaxCard = () => {
  const { data, error, isLoading, refetch } = useTanStackQuery<GraphQLResponse>({
    queryFn: async () => {
      const res = await fetch("https://beta.pokeapi.co/graphql/v1beta", {
        body: JSON.stringify({
          operationName: "GetSnorlax",
          query: SNORLAX_QUERY,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      return res.json() as Promise<GraphQLResponse>;
    },
    queryKey: ["pokemon", "snorlax"],
  });

  const handleRefetch = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <PokemonCard
      badge={GRAPHQL_BADGE}
      data={mapGraphQLPokemon(data?.data?.pokemon_v2_pokemon?.[0])}
      error={error?.message ?? null}
      library="@tanstack/query"
      loading={isLoading}
      method="QUERY"
      onRefetch={handleRefetch}
    />
  );
};

// ---------------------------------------------------------------------------
// Code Snippet
// ---------------------------------------------------------------------------

const QUERY_CODE = `// 1. Register REST handlers — method + path auto-derived from handler
import { registerRestMocks } from "msw-devtools-plugin";
import { http, HttpResponse } from "msw";

registerRestMocks(
  { handler: http.get("https://pokeapi.co/api/v2/pokemon/6", () => HttpResponse.json({ ... })) },
  { handler: http.get("https://pokeapi.co/api/v2/pokemon/94", () => HttpResponse.json({ ... })) },
);

// 2. Register GraphQL handlers — operationName auto-derived from handler
import { registerGraphqlMocks } from "msw-devtools-plugin";
import { graphql } from "msw";

registerGraphqlMocks(
  { handler: graphql.query("GetPancham", () => HttpResponse.json({ data: { ... } })) },
  { handler: graphql.query("GetSnorlax", () => HttpResponse.json({ data: { ... } })) },
);

// 3. Fetch with useQuery — works for both REST and GraphQL
import { useQuery } from "@tanstack/react-query";

// REST
const { data } = useQuery({
  queryKey: ["pokemon", "charizard"],
  queryFn: () => fetch("https://pokeapi.co/api/v2/pokemon/6").then(r => r.json()),
});

// GraphQL
const { data } = useQuery({
  queryKey: ["pokemon", "pancham"],
  queryFn: () => fetch("https://beta.pokeapi.co/graphql/v1beta", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "query GetPancham { ... }" }),
  }).then(r => r.json()),
});

// 4. Adapter — auto-invalidates queries when mocks change
import { registerAdapter } from "msw-devtools-plugin";
import { createTanStackQueryAdapter } from "msw-devtools-plugin/adapters/tanstack-query";
registerAdapter(createTanStackQueryAdapter(queryClient));`;

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export const QueryPage = () => (
  <div className="flex flex-col gap-8">
    <div className="group rounded-2xl border border-border-primary bg-card-bg/30 p-6">
      <div className="flex items-center gap-4">
        <img
          alt="Master Ball"
          className="pokeball-img shrink-0"
          height={64}
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png"
          style={{ imageRendering: "pixelated" }}
          width={64}
        />
        <div>
          <h2 className="m-0 font-bold text-text-primary text-xl">
            <a
              className="text-text-primary no-underline transition-colors duration-150 hover:text-accent-blue"
              href="https://tanstack.com/query"
              rel="noopener noreferrer"
              target="_blank"
            >
              TanStack Query
            </a>
          </h2>
          <p className="m-0 mt-1 text-sm text-text-dimmed">
            The adapter listens for mock changes and automatically invalidates matching TanStack
            Query cache entries, triggering re-fetches without a full page reload.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <CharizardCard />
        <GengarCard />
        <TyranitarCard />
        <PanchamCard />
        <SalamenceCard />
        <SnorlaxCard />
      </div>
    </div>

    <CodeBlock lang="typescript">{QUERY_CODE}</CodeBlock>
  </div>
);
