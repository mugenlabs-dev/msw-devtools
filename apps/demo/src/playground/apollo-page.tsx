import { gql as apolloGql, useQuery as useApolloQuery } from "@apollo/client";
import { useCallback } from "react";

import { CodeBlock } from "../docs/components/code-block";
import type { GraphQLPokemon } from "../pokemon-card";
import { GRAPHQL_BADGE, mapGraphQLPokemon, PokemonCard } from "../pokemon-card";

// ---------------------------------------------------------------------------
// Pokeball
// ---------------------------------------------------------------------------

const POKEBALL_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/timer-ball.png";

// ---------------------------------------------------------------------------
// GraphQL Queries
// ---------------------------------------------------------------------------

const GET_RAYQUAZA = apolloGql`
  query GetRayquaza {
    pokemon_v2_pokemon(where: { id: { _eq: 384 } }) {
      id name height weight
      pokemon_v2_pokemontypes { pokemon_v2_type { name } }
      pokemon_v2_pokemonsprites { sprites }
    }
  }
`;

const GET_METAGROSS = apolloGql`
  query GetMetagross {
    pokemon_v2_pokemon(where: { id: { _eq: 376 } }) {
      id name height weight
      pokemon_v2_pokemontypes { pokemon_v2_type { name } }
      pokemon_v2_pokemonsprites { sprites }
    }
  }
`;

const GET_MILOTIC = apolloGql`
  query GetMilotic {
    pokemon_v2_pokemon(where: { id: { _eq: 350 } }) {
      id name height weight
      pokemon_v2_pokemontypes { pokemon_v2_type { name } }
      pokemon_v2_pokemonsprites { sprites }
    }
  }
`;

const GET_ABSOL = apolloGql`
  query GetAbsol {
    pokemon_v2_pokemon(where: { id: { _eq: 359 } }) {
      id name height weight
      pokemon_v2_pokemontypes { pokemon_v2_type { name } }
      pokemon_v2_pokemonsprites { sprites }
    }
  }
`;

const GET_FLYGON = apolloGql`
  query GetFlygon {
    pokemon_v2_pokemon(where: { id: { _eq: 330 } }) {
      id name height weight
      pokemon_v2_pokemontypes { pokemon_v2_type { name } }
      pokemon_v2_pokemonsprites { sprites }
    }
  }
`;

const GET_AGGRON = apolloGql`
  query GetAggron {
    pokemon_v2_pokemon(where: { id: { _eq: 306 } }) {
      id name height weight
      pokemon_v2_pokemontypes { pokemon_v2_type { name } }
      pokemon_v2_pokemonsprites { sprites }
    }
  }
`;

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

const RayquazaCard = () => {
  const {
    data: raw,
    error,
    loading,
    refetch,
  } = useApolloQuery<{
    pokemon_v2_pokemon: GraphQLPokemon[];
  }>(GET_RAYQUAZA);
  const handleRefetch = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <PokemonCard
      badge={GRAPHQL_BADGE}
      data={mapGraphQLPokemon(raw?.pokemon_v2_pokemon?.[0])}
      error={error?.message ?? null}
      library="apollo"
      loading={loading}
      method="QUERY"
      onRefetch={handleRefetch}
    />
  );
};

const MetagrossCard = () => {
  const {
    data: raw,
    error,
    loading,
    refetch,
  } = useApolloQuery<{
    pokemon_v2_pokemon: GraphQLPokemon[];
  }>(GET_METAGROSS);
  const handleRefetch = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <PokemonCard
      badge={GRAPHQL_BADGE}
      data={mapGraphQLPokemon(raw?.pokemon_v2_pokemon?.[0])}
      error={error?.message ?? null}
      library="apollo"
      loading={loading}
      method="QUERY"
      onRefetch={handleRefetch}
    />
  );
};

const MiloticCard = () => {
  const {
    data: raw,
    error,
    loading,
    refetch,
  } = useApolloQuery<{
    pokemon_v2_pokemon: GraphQLPokemon[];
  }>(GET_MILOTIC);
  const handleRefetch = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <PokemonCard
      badge={GRAPHQL_BADGE}
      data={mapGraphQLPokemon(raw?.pokemon_v2_pokemon?.[0])}
      error={error?.message ?? null}
      library="apollo"
      loading={loading}
      method="QUERY"
      onRefetch={handleRefetch}
    />
  );
};

const AbsolCard = () => {
  const {
    data: raw,
    error,
    loading,
    refetch,
  } = useApolloQuery<{
    pokemon_v2_pokemon: GraphQLPokemon[];
  }>(GET_ABSOL);
  const handleRefetch = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <PokemonCard
      badge={GRAPHQL_BADGE}
      data={mapGraphQLPokemon(raw?.pokemon_v2_pokemon?.[0])}
      error={error?.message ?? null}
      library="apollo"
      loading={loading}
      method="QUERY"
      onRefetch={handleRefetch}
    />
  );
};

const FlygonCard = () => {
  const {
    data: raw,
    error,
    loading,
    refetch,
  } = useApolloQuery<{
    pokemon_v2_pokemon: GraphQLPokemon[];
  }>(GET_FLYGON);
  const handleRefetch = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <PokemonCard
      badge={GRAPHQL_BADGE}
      data={mapGraphQLPokemon(raw?.pokemon_v2_pokemon?.[0])}
      error={error?.message ?? null}
      library="apollo"
      loading={loading}
      method="QUERY"
      onRefetch={handleRefetch}
    />
  );
};

const AggronCard = () => {
  const {
    data: raw,
    error,
    loading,
    refetch,
  } = useApolloQuery<{
    pokemon_v2_pokemon: GraphQLPokemon[];
  }>(GET_AGGRON);
  const handleRefetch = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <PokemonCard
      badge={GRAPHQL_BADGE}
      data={mapGraphQLPokemon(raw?.pokemon_v2_pokemon?.[0])}
      error={error?.message ?? null}
      library="apollo"
      loading={loading}
      method="QUERY"
      onRefetch={handleRefetch}
    />
  );
};

// ---------------------------------------------------------------------------
// Code Snippet
// ---------------------------------------------------------------------------

const APOLLO_CODE = `// All fetching uses Apollo Client — GraphQL client
import { gql, useQuery } from "@apollo/client";

const GET_RAYQUAZA = gql\`
  query GetRayquaza {
    pokemon_v2_pokemon(where: { id: { _eq: 384 } }) {
      id name height weight
      pokemon_v2_pokemontypes { pokemon_v2_type { name } }
      pokemon_v2_pokemonsprites { sprites }
    }
  }
\`;

const { data, loading, error, refetch } = useQuery(GET_RAYQUAZA);

// Adapter — auto-refetches queries when mocks change
import { registerAdapter } from "msw-devtools-plugin";
import { createApolloAdapter } from "msw-devtools-plugin/adapters/apollo";
registerAdapter(createApolloAdapter(apolloClient));`;

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export const ApolloPage = () => (
  <div className="flex flex-col gap-6">
    <div className="group rounded-2xl border border-border-primary bg-card-bg/30 p-6">
      <div className="flex items-center gap-4">
        <img
          alt="Timer Ball"
          className="pokeball-img shrink-0"
          height={64}
          src={POKEBALL_URL}
          style={{ imageRendering: "pixelated" }}
          width={64}
        />
        <div>
          <h2 className="m-0 font-bold text-text-primary text-xl">
            <a
              className="text-text-primary no-underline transition-colors duration-150 hover:text-accent-blue"
              href="https://www.apollographql.com/docs/react"
              rel="noopener noreferrer"
              target="_blank"
            >
              Apollo Client
            </a>
          </h2>
          <p className="m-0 mt-1 text-sm text-text-muted">
            The adapter clears Apollo's normalized cache and refetches all active queries when mock
            toggles or variants change, keeping the UI in sync with the devtool panel.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <RayquazaCard />
        <MetagrossCard />
        <MiloticCard />
        <AbsolCard />
        <FlygonCard />
        <AggronCard />
      </div>
    </div>

    <CodeBlock lang="tsx">{APOLLO_CODE}</CodeBlock>
  </div>
);
