import axios from "axios";
import { useMockRefetch } from "msw-devtools-plugin";
import { useCallback, useEffect, useState } from "react";

import { CodeBlock } from "../docs/components/code-block";
import type { PokemonData } from "../pokemon-card";
import { mapRestPokemon, PokemonCard, REST_BADGE } from "../pokemon-card";
import { useRestPokemon } from "../use-rest-pokemon";

// ---------------------------------------------------------------------------
// Pokeball
// ---------------------------------------------------------------------------

const POKEBALL_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/premier-ball.png";

// ---------------------------------------------------------------------------
// Fetch Cards (using useRestPokemon hook)
// ---------------------------------------------------------------------------

const MimikyuCard = () => {
  const { data, error, loading, refetch } = useRestPokemon(
    "https://pokeapi.co/api/v2/pokemon/778",
    "GET Mimikyu"
  );

  return (
    <PokemonCard
      badge={REST_BADGE}
      data={data}
      error={error}
      library="fetch"
      loading={loading}
      method="GET"
      onRefetch={refetch}
    />
  );
};

const UmbreonCard = () => {
  const { data, error, loading, refetch } = useRestPokemon(
    "https://pokeapi.co/api/v2/pokemon/197",
    "GET Umbreon"
  );

  return (
    <PokemonCard
      badge={REST_BADGE}
      data={data}
      error={error}
      library="fetch"
      loading={loading}
      method="GET"
      onRefetch={refetch}
    />
  );
};

const EspeonCard = () => {
  const { data, error, loading, refetch } = useRestPokemon(
    "https://pokeapi.co/api/v2/pokemon/196",
    "GET Espeon"
  );

  return (
    <PokemonCard
      badge={REST_BADGE}
      data={data}
      error={error}
      library="fetch"
      loading={loading}
      method="GET"
      onRefetch={refetch}
    />
  );
};

// ---------------------------------------------------------------------------
// Axios Cards
// ---------------------------------------------------------------------------

const SylveonCard = () => {
  const [data, setData] = useState<PokemonData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("https://pokeapi.co/api/v2/pokemon/700");
      setData(mapRestPokemon(res.data));
      setLoading(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setData(null);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useMockRefetch("GET Sylveon", () => {
    void fetchData();
  });

  return (
    <PokemonCard
      badge={REST_BADGE}
      data={data}
      error={error}
      library="axios"
      loading={loading}
      method="GET"
      onRefetch={() => {
        void fetchData();
      }}
    />
  );
};

const MewtwoCard = () => {
  const [data, setData] = useState<PokemonData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("https://pokeapi.co/api/v2/pokemon/150");
      setData(mapRestPokemon(res.data));
      setLoading(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setData(null);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useMockRefetch("GET Mewtwo", () => {
    void fetchData();
  });

  return (
    <PokemonCard
      badge={REST_BADGE}
      data={data}
      error={error}
      library="axios"
      loading={loading}
      method="GET"
      onRefetch={() => {
        void fetchData();
      }}
    />
  );
};

const DragoniteCard = () => {
  const [data, setData] = useState<PokemonData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("https://pokeapi.co/api/v2/pokemon/149");
      setData(mapRestPokemon(res.data));
      setLoading(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setData(null);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useMockRefetch("GET Dragonite", () => {
    void fetchData();
  });

  return (
    <PokemonCard
      badge={REST_BADGE}
      data={data}
      error={error}
      library="axios"
      loading={loading}
      method="GET"
      onRefetch={() => {
        void fetchData();
      }}
    />
  );
};

// ---------------------------------------------------------------------------
// Code Snippet
// ---------------------------------------------------------------------------

const FETCH_CODE = `// REST fetching with fetch and axios
import axios from "axios";

// fetch example
const res = await fetch("https://pokeapi.co/api/v2/pokemon/778");
const data = await res.json();

// axios example
const { data } = await axios.get("https://pokeapi.co/api/v2/pokemon/700");

// Hook for fetch — auto-refetches when mocks change
import { useMockRefetch } from "msw-devtools-plugin";
useMockRefetch("GET Mimikyu", () => { void fetchData(); });`;

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export const FetchPage = () => (
  <div className="flex flex-col gap-6">
    <div className="group rounded-2xl border border-border-primary bg-card-bg/30 p-6">
      <div className="flex items-center gap-4">
        <img
          alt="Premier Ball"
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
              href="https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API"
              rel="noopener noreferrer"
              target="_blank"
            >
              Fetch
            </a>
            {" + "}
            <a
              className="text-text-primary no-underline transition-colors duration-150 hover:text-accent-blue"
              href="https://axios-http.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              Axios
            </a>
          </h2>
          <p className="m-0 mt-1 text-sm text-text-muted">
            The Axios adapter intercepts instance responses and re-triggers requests when mock state
            changes. Fetch calls use a custom refetch hook that subscribes to the devtool store.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <MimikyuCard />
        <UmbreonCard />
        <EspeonCard />
        <SylveonCard />
        <MewtwoCard />
        <DragoniteCard />
      </div>
    </div>

    <CodeBlock lang="tsx">{FETCH_CODE}</CodeBlock>
  </div>
);
