import { createMswDevToolsPlugin } from "@mugenlabs/msw-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { useCallback, useEffect, useState } from "react";

interface Pokemon {
  id: number;
  name: string | null;
  types: string[];
}

const RestPage = () => {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch("/api/pokemon/6");
      setPokemon((await response.json()) as Pokemon);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "fetch failed");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section>
      <h1>REST</h1>
      <button onClick={() => void load()} type="button">
        Refetch REST
      </button>
      {error ? <p role="alert">{error}</p> : null}
      <pre data-testid="rest-result">{JSON.stringify(pokemon, null, 2)}</pre>
    </section>
  );
};

const GraphQLPage = () => {
  const [payload, setPayload] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch("/graphql", {
        body: JSON.stringify({
          operationName: "GetPancham",
          query: "query GetPancham { pokemon { id name types } }",
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      setPayload(await response.json());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "fetch failed");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section>
      <h1>GraphQL</h1>
      <button onClick={() => void load()} type="button">
        Refetch GraphQL
      </button>
      {error ? <p role="alert">{error}</p> : null}
      <pre data-testid="graphql-result">{JSON.stringify(payload, null, 2)}</pre>
    </section>
  );
};

export const App = () => {
  const page = window.location.pathname.includes("graphql") ? "graphql" : "rest";

  return (
    <main style={{ fontFamily: "system-ui", margin: "2rem auto", maxWidth: 640 }}>
      <nav style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <a href="/">REST</a>
        <a href="/graphql">GraphQL</a>
      </nav>
      {page === "graphql" ? <GraphQLPage /> : <RestPage />}
      <TanStackDevtools
        config={{ defaultOpen: true }}
        plugins={[createMswDevToolsPlugin({ defaultOpen: true })]}
      />
    </main>
  );
};
