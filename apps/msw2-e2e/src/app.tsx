import { createMswDevToolsPlugin } from "@mugenlabs/msw-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { useCallback, useEffect, useState } from "react";
import { MswVersionSwitch } from "#msw-version-switch";

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
      const response = await fetch(`${import.meta.env.BASE_URL}api/pokemon/6`);
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
      <h2 style={{ fontSize: "1.125rem", margin: "0 0 0.75rem" }}>REST</h2>
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
      const response = await fetch(`${import.meta.env.BASE_URL}graphql`, {
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
      <h2 style={{ fontSize: "1.125rem", margin: "0 0 0.75rem" }}>GraphQL</h2>
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
    <main
      style={{
        color: "oklch(90.7% 0 0)",
        fontFamily: "system-ui, sans-serif",
        margin: "0 auto",
        maxWidth: 720,
        padding: "2rem 1.25rem 6rem",
      }}
    >
      <header style={{ marginBottom: "1.75rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.5rem", margin: "0 0 0.5rem" }}>
          @mugenlabs/msw-devtools Playground
        </h1>
        <p style={{ color: "oklch(62.7% 0 0)", fontSize: "0.875rem", margin: "0 0 1rem" }}>
          MSW 2 fixture with REST + GraphQL mocks and the DevTools panel. Switch to MSW 3 for the
          full adapter playground.
        </p>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
          <MswVersionSwitch active="2" />
        </div>
        <nav style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <a href={`${import.meta.env.BASE_URL}`} style={{ color: "inherit" }}>
            REST
          </a>
          <a href={`${import.meta.env.BASE_URL}graphql`} style={{ color: "inherit" }}>
            GraphQL
          </a>
        </nav>
      </header>
      {page === "graphql" ? <GraphQLPage /> : <RestPage />}
      <TanStackDevtools
        config={{ defaultOpen: true }}
        plugins={[createMswDevToolsPlugin({ defaultOpen: true })]}
      />
    </main>
  );
};
