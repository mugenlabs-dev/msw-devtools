import { useCallback } from "react";
import { gql, useQuery as useUrqlQuery } from "urql";

import { CodeBlock } from "../docs/components/code-block";
import type { GraphQLPokemon } from "../pokemon-card";
import { GRAPHQL_BADGE, mapGraphQLPokemon, PokemonCard } from "../pokemon-card";

// ---------------------------------------------------------------------------
// Pokeball
// ---------------------------------------------------------------------------

const POKEBALL_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png";

// ---------------------------------------------------------------------------
// GraphQL Queries
// ---------------------------------------------------------------------------

const GET_EEVEE = gql`
  query GetEevee {
    pokemon_v2_pokemon(where: { id: { _eq: 133 } }) {
      id name height weight
      pokemon_v2_pokemontypes { pokemon_v2_type { name } }
      pokemon_v2_pokemonsprites { sprites }
    }
  }
`;

const GET_LAPRAS = gql`
  query GetLapras {
    pokemon_v2_pokemon(where: { id: { _eq: 131 } }) {
      id name height weight
      pokemon_v2_pokemontypes { pokemon_v2_type { name } }
      pokemon_v2_pokemonsprites { sprites }
    }
  }
`;

const GET_ALAKAZAM = gql`
  query GetAlakazam {
    pokemon_v2_pokemon(where: { id: { _eq: 65 } }) {
      id name height weight
      pokemon_v2_pokemontypes { pokemon_v2_type { name } }
      pokemon_v2_pokemonsprites { sprites }
    }
  }
`;

const GET_ARCANINE = gql`
  query GetArcanine {
    pokemon_v2_pokemon(where: { id: { _eq: 59 } }) {
      id name height weight
      pokemon_v2_pokemontypes { pokemon_v2_type { name } }
      pokemon_v2_pokemonsprites { sprites }
    }
  }
`;

const GET_STEELIX = gql`
  query GetSteelix {
    pokemon_v2_pokemon(where: { id: { _eq: 208 } }) {
      id name height weight
      pokemon_v2_pokemontypes { pokemon_v2_type { name } }
      pokemon_v2_pokemonsprites { sprites }
    }
  }
`;

const GET_HERACROSS = gql`
  query GetHeracross {
    pokemon_v2_pokemon(where: { id: { _eq: 214 } }) {
      id name height weight
      pokemon_v2_pokemontypes { pokemon_v2_type { name } }
      pokemon_v2_pokemonsprites { sprites }
    }
  }
`;

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

const EeveeCard = () => {
  const [result, reexecute] = useUrqlQuery<{
    pokemon_v2_pokemon: GraphQLPokemon[];
  }>({ query: GET_EEVEE });
  const { data: raw, error, fetching } = result;
  const handleRefetch = useCallback(() => {
    reexecute({ requestPolicy: "network-only" });
  }, [reexecute]);

  return (
    <PokemonCard
      badge={GRAPHQL_BADGE}
      data={mapGraphQLPokemon(raw?.pokemon_v2_pokemon?.[0])}
      error={error?.message ?? null}
      library="urql"
      loading={fetching}
      method="QUERY"
      onRefetch={handleRefetch}
    />
  );
};

const LaprasCard = () => {
  const [result, reexecute] = useUrqlQuery<{
    pokemon_v2_pokemon: GraphQLPokemon[];
  }>({ query: GET_LAPRAS });
  const { data: raw, error, fetching } = result;
  const handleRefetch = useCallback(() => {
    reexecute({ requestPolicy: "network-only" });
  }, [reexecute]);

  return (
    <PokemonCard
      badge={GRAPHQL_BADGE}
      data={mapGraphQLPokemon(raw?.pokemon_v2_pokemon?.[0])}
      error={error?.message ?? null}
      library="urql"
      loading={fetching}
      method="QUERY"
      onRefetch={handleRefetch}
    />
  );
};

const AlakazamCard = () => {
  const [result, reexecute] = useUrqlQuery<{
    pokemon_v2_pokemon: GraphQLPokemon[];
  }>({ query: GET_ALAKAZAM });
  const { data: raw, error, fetching } = result;
  const handleRefetch = useCallback(() => {
    reexecute({ requestPolicy: "network-only" });
  }, [reexecute]);

  return (
    <PokemonCard
      badge={GRAPHQL_BADGE}
      data={mapGraphQLPokemon(raw?.pokemon_v2_pokemon?.[0])}
      error={error?.message ?? null}
      library="urql"
      loading={fetching}
      method="QUERY"
      onRefetch={handleRefetch}
    />
  );
};

const ArcanineCard = () => {
  const [result, reexecute] = useUrqlQuery<{
    pokemon_v2_pokemon: GraphQLPokemon[];
  }>({ query: GET_ARCANINE });
  const { data: raw, error, fetching } = result;
  const handleRefetch = useCallback(() => {
    reexecute({ requestPolicy: "network-only" });
  }, [reexecute]);

  return (
    <PokemonCard
      badge={GRAPHQL_BADGE}
      data={mapGraphQLPokemon(raw?.pokemon_v2_pokemon?.[0])}
      error={error?.message ?? null}
      library="urql"
      loading={fetching}
      method="QUERY"
      onRefetch={handleRefetch}
    />
  );
};

const SteelixCard = () => {
  const [result, reexecute] = useUrqlQuery<{
    pokemon_v2_pokemon: GraphQLPokemon[];
  }>({ query: GET_STEELIX });
  const { data: raw, error, fetching } = result;
  const handleRefetch = useCallback(() => {
    reexecute({ requestPolicy: "network-only" });
  }, [reexecute]);

  return (
    <PokemonCard
      badge={GRAPHQL_BADGE}
      data={mapGraphQLPokemon(raw?.pokemon_v2_pokemon?.[0])}
      error={error?.message ?? null}
      library="urql"
      loading={fetching}
      method="QUERY"
      onRefetch={handleRefetch}
    />
  );
};

const HeracrossCard = () => {
  const [result, reexecute] = useUrqlQuery<{
    pokemon_v2_pokemon: GraphQLPokemon[];
  }>({ query: GET_HERACROSS });
  const { data: raw, error, fetching } = result;
  const handleRefetch = useCallback(() => {
    reexecute({ requestPolicy: "network-only" });
  }, [reexecute]);

  return (
    <PokemonCard
      badge={GRAPHQL_BADGE}
      data={mapGraphQLPokemon(raw?.pokemon_v2_pokemon?.[0])}
      error={error?.message ?? null}
      library="urql"
      loading={fetching}
      method="QUERY"
      onRefetch={handleRefetch}
    />
  );
};

// ---------------------------------------------------------------------------
// Code Snippet
// ---------------------------------------------------------------------------

const URQL_CODE = `// All fetching uses URQL — GraphQL client
import { gql, useQuery } from "urql";

const GET_EEVEE = gql\`
  query GetEevee {
    pokemon_v2_pokemon(where: { id: { _eq: 133 } }) {
      id name height weight
      pokemon_v2_pokemontypes { pokemon_v2_type { name } }
      pokemon_v2_pokemonsprites { sprites }
    }
  }
\`;

const [result, reexecute] = useQuery({ query: GET_EEVEE });

// Adapter — auto-refetches queries when mocks change
import { registerAdapter } from "msw-devtools-plugin";
import { createUrqlAdapter } from "msw-devtools-plugin/adapters/urql";
registerAdapter(createUrqlAdapter());`;

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export const UrqlPage = () => (
  <div className="flex flex-col gap-6">
    <div className="group rounded-2xl border border-border-primary bg-card-bg/30 p-6">
      <div className="flex items-center gap-4">
        <img
          alt="Great Ball"
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
              href="https://commerce.nearform.com/open-source/urql/"
              rel="noopener noreferrer"
              target="_blank"
            >
              URQL
            </a>
          </h2>
          <p className="m-0 mt-1 text-sm text-text-muted">
            The adapter triggers URQL cache invalidation when mock state changes, causing active
            subscriptions to re-execute their queries with the updated mock responses.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <EeveeCard />
        <LaprasCard />
        <AlakazamCard />
        <ArcanineCard />
        <SteelixCard />
        <HeracrossCard />
      </div>
    </div>

    <CodeBlock lang="tsx">{URQL_CODE}</CodeBlock>
  </div>
);
