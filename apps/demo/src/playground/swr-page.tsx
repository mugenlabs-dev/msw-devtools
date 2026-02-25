import { useCallback } from "react";
import useSWR from "swr";
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

// --- REST fetcher ---

const swrFetcher = (url: string): Promise<RestPokemonResponse> => fetchPokemonJson(url);

// --- GraphQL queries ---

const GARDEVOIR_QUERY =
  "query GetGardevoir { pokemon_v2_pokemon(where: { id: { _eq: 282 } }) { id name height weight pokemon_v2_pokemontypes { pokemon_v2_type { name } } pokemon_v2_pokemonsprites { sprites } } }";

const SCIZOR_QUERY =
  "query GetScizor { pokemon_v2_pokemon(where: { id: { _eq: 212 } }) { id name height weight pokemon_v2_pokemontypes { pokemon_v2_type { name } } pokemon_v2_pokemonsprites { sprites } } }";

const TOGEKISS_QUERY =
  "query GetTogekiss { pokemon_v2_pokemon(where: { id: { _eq: 468 } }) { id name height weight pokemon_v2_pokemontypes { pokemon_v2_type { name } } pokemon_v2_pokemonsprites { sprites } } }";

// --- GraphQL fetcher ---

const gqlSwrFetcher = async (
  key: string
): Promise<{ data: { pokemon_v2_pokemon: GraphQLPokemon[] } }> => {
  const [, operationName, query] = key.split("|");
  const res = await fetch("https://beta.pokeapi.co/graphql/v1beta", {
    body: JSON.stringify({ operationName, query }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  return res.json() as Promise<{
    data: { pokemon_v2_pokemon: GraphQLPokemon[] };
  }>;
};

// --- REST Cards ---

const GarchompCard = () => {
  const { data, error, isLoading, mutate } = useSWR<RestPokemonResponse, Error>(
    "https://pokeapi.co/api/v2/pokemon/445",
    swrFetcher
  );
  const handleRefetch = useCallback(() => {
    void mutate();
  }, [mutate]);
  return (
    <PokemonCard
      badge={REST_BADGE}
      data={data ? mapRestPokemon(data) : null}
      error={error?.message ?? null}
      library="swr"
      loading={isLoading}
      method="GET"
      onRefetch={handleRefetch}
    />
  );
};

const LucarioCard = () => {
  const { data, error, isLoading, mutate } = useSWR<RestPokemonResponse, Error>(
    "https://pokeapi.co/api/v2/pokemon/448",
    swrFetcher
  );
  const handleRefetch = useCallback(() => {
    void mutate();
  }, [mutate]);
  return (
    <PokemonCard
      badge={REST_BADGE}
      data={data ? mapRestPokemon(data) : null}
      error={error?.message ?? null}
      library="swr"
      loading={isLoading}
      method="GET"
      onRefetch={handleRefetch}
    />
  );
};

const BlazikenCard = () => {
  const { data, error, isLoading, mutate } = useSWR<RestPokemonResponse, Error>(
    "https://pokeapi.co/api/v2/pokemon/257",
    swrFetcher
  );
  const handleRefetch = useCallback(() => {
    void mutate();
  }, [mutate]);
  return (
    <PokemonCard
      badge={REST_BADGE}
      data={data ? mapRestPokemon(data) : null}
      error={error?.message ?? null}
      library="swr"
      loading={isLoading}
      method="GET"
      onRefetch={handleRefetch}
    />
  );
};

// --- GraphQL Cards ---

const GardevoirCard = () => {
  const { data, error, isLoading, mutate } = useSWR<
    { data: { pokemon_v2_pokemon: GraphQLPokemon[] } },
    Error
  >(`gql|GetGardevoir|${GARDEVOIR_QUERY}`, gqlSwrFetcher);
  const handleRefetch = useCallback(() => {
    void mutate();
  }, [mutate]);
  return (
    <PokemonCard
      badge={GRAPHQL_BADGE}
      data={mapGraphQLPokemon(data?.data?.pokemon_v2_pokemon?.[0])}
      error={error?.message ?? null}
      library="swr"
      loading={isLoading}
      method="QUERY"
      onRefetch={handleRefetch}
    />
  );
};

const ScizorCard = () => {
  const { data, error, isLoading, mutate } = useSWR<
    { data: { pokemon_v2_pokemon: GraphQLPokemon[] } },
    Error
  >(`gql|GetScizor|${SCIZOR_QUERY}`, gqlSwrFetcher);
  const handleRefetch = useCallback(() => {
    void mutate();
  }, [mutate]);
  return (
    <PokemonCard
      badge={GRAPHQL_BADGE}
      data={mapGraphQLPokemon(data?.data?.pokemon_v2_pokemon?.[0])}
      error={error?.message ?? null}
      library="swr"
      loading={isLoading}
      method="QUERY"
      onRefetch={handleRefetch}
    />
  );
};

const TogekissCard = () => {
  const { data, error, isLoading, mutate } = useSWR<
    { data: { pokemon_v2_pokemon: GraphQLPokemon[] } },
    Error
  >(`gql|GetTogekiss|${TOGEKISS_QUERY}`, gqlSwrFetcher);
  const handleRefetch = useCallback(() => {
    void mutate();
  }, [mutate]);
  return (
    <PokemonCard
      badge={GRAPHQL_BADGE}
      data={mapGraphQLPokemon(data?.data?.pokemon_v2_pokemon?.[0])}
      error={error?.message ?? null}
      library="swr"
      loading={isLoading}
      method="QUERY"
      onRefetch={handleRefetch}
    />
  );
};

// --- Code snippet ---

const SWR_CODE = `// 1. Register REST + GraphQL handlers
import { registerRestMocks, registerGraphqlMocks } from "msw-devtools-plugin";
import { http, graphql, HttpResponse } from "msw";

registerRestMocks(
  { handler: http.get("https://pokeapi.co/api/v2/pokemon/445", () => HttpResponse.json({ ... })) },
);
registerGraphqlMocks(
  { handler: graphql.query("GetGardevoir", () => HttpResponse.json({ data: { ... } })) },
);

// 2. Fetch with useSWR — REST and GraphQL
import useSWR from "swr";

// REST
const { data, mutate } = useSWR(url, (url) => fetch(url).then(r => r.json()));

// GraphQL
const { data } = useSWR("gql|GetGardevoir", async () => {
  const res = await fetch("https://beta.pokeapi.co/graphql/v1beta", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "query GetGardevoir { ... }" }),
  });
  return res.json();
});

// 3. Adapter — auto-revalidates when mocks change
// Must be registered inside a component with access to useSWRConfig
import { useSWRConfig } from "swr";
import { registerAdapter } from "msw-devtools-plugin";
import { createSwrAdapter } from "msw-devtools-plugin/adapters/swr";

function SetupSwr() {
  const { mutate } = useSWRConfig();
  useEffect(() => registerAdapter(createSwrAdapter(mutate)), [mutate]);
  return null;
}`;

// --- Page ---

export const SwrPage = () => (
  <div className="flex flex-col gap-6">
    <div className="group rounded-2xl border border-border-primary bg-card-bg/30 p-6">
      <div className="flex items-center gap-4">
        <img
          alt="Ultra Ball"
          className="pokeball-img shrink-0"
          height={64}
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png"
          style={{ imageRendering: "pixelated" }}
          width={64}
        />
        <div>
          <h2 className="m-0 font-bold text-text-primary text-xl">
            <a
              className="text-text-primary no-underline transition-colors duration-150 hover:text-accent-blue"
              href="https://swr.vercel.app"
              rel="noopener noreferrer"
              target="_blank"
            >
              SWR
            </a>
          </h2>
          <p className="m-0 mt-1 text-sm text-text-dimmed">
            The adapter hooks into SWR's global mutate to revalidate stale keys when mock
            configurations change, so cards refresh instantly without manual cache busting.
          </p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4">
        <GarchompCard />
        <LucarioCard />
        <BlazikenCard />
        <GardevoirCard />
        <ScizorCard />
        <TogekissCard />
      </div>
    </div>
    <CodeBlock lang="typescript">{SWR_CODE}</CodeBlock>
  </div>
);
