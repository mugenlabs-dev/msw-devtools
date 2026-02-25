import { useMockRefetch } from "msw-devtools-plugin";
import { useCallback, useEffect, useState } from "react";

import type { PokemonData } from "./pokemon-card";

import { mapRestPokemon } from "./pokemon-card";

// --- REST Pokemon Response Type ---

export interface RestPokemonResponse {
  name: string;
  sprites?: { front_default?: string; front_shiny?: string };
  types?: { type: { name: string } }[];
}

// --- REST Fetcher ---

export const fetchPokemonJson = async (url: string): Promise<RestPokemonResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<RestPokemonResponse>;
};

// --- Hook ---

export const useRestPokemon = (url: string, operationName: string) => {
  const [data, setData] = useState<PokemonData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await fetchPokemonJson(url);
      setData(mapRestPokemon(json));
    } catch (caughtError: unknown) {
      setError(caughtError instanceof Error ? caughtError.message : String(caughtError));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useMockRefetch(operationName, () => {
    void fetchData();
  });

  return {
    data,
    error,
    loading,
    refetch: () => {
      void fetchData();
    },
  };
};
