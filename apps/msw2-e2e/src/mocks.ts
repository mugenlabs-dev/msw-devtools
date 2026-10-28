import {
  registerGraphqlMocks,
  registerRestMocks,
  startWorker,
  useMockStore,
} from "@mugenlabs/msw-devtools";
import { graphql, HttpResponse, http } from "msw";

export const getPokemonHandler = http.get("/api/pokemon/6", () =>
  HttpResponse.json({ id: 6, name: "charizard", types: ["fire", "flying"] })
);

export const getPokemonEmptyHandler = http.get("/api/pokemon/6", () =>
  HttpResponse.json({ id: 6, name: null, types: [] })
);

const github = graphql.link("/graphql");

export const getPanchamHandler = github.query("GetPancham", () =>
  HttpResponse.json({
    data: { pokemon: { id: 674, name: "pancham", types: ["fighting"] } },
  })
);

export const getPanchamEmptyHandler = github.query("GetPancham", () =>
  HttpResponse.json({ data: { pokemon: null } })
);

registerRestMocks({
  group: "REST",
  operationName: "GET Charizard",
  variants: [
    { handler: getPokemonHandler, label: "Default" },
    { handler: getPokemonEmptyHandler, label: "Empty" },
  ],
});

registerGraphqlMocks({
  group: "GraphQL",
  operationName: "GetPancham",
  variants: [
    { handler: getPanchamHandler, label: "Default" },
    { handler: getPanchamEmptyHandler, label: "Empty" },
  ],
});

const store = useMockStore.getState();
store.setEnabled("GET Charizard", true);
store.setEnabled("GetPancham", true);

export const workerReady = startWorker({
  serviceWorkerUrl: "/mockServiceWorker.js",
});
