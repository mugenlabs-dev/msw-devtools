import { registerGraphqlMocks, registerRestMocks, startWorker } from "msw-devtools-plugin";

import {
  // Apollo page — all GraphQL
  getAbsolEmptyHandler,
  getAbsolHandler,
  getAggronEmptyHandler,
  getAggronHandler,
  // URQL page — all GraphQL
  getAlakazamEmptyHandler,
  getAlakazamHandler,
  getArcanineEmptyHandler,
  getArcanineHandler,
  // SWR page — 3 REST + 3 GraphQL
  getBlazikenHandler,
  // TanStack Query page — 3 REST + 3 GraphQL
  getCharizardHandler,
  // Fetch + Axios page — all REST
  getDragoniteHandler,
  getEeveeEmptyHandler,
  getEeveeHandler,
  getEspeonHandler,
  getFlygonEmptyHandler,
  getFlygonHandler,
  getGarchompHandler,
  getGardevoirEmptyHandler,
  getGardevoirHandler,
  getGengarHandler,
  getHeracrossEmptyHandler,
  getHeracrossHandler,
  getLaprasEmptyHandler,
  getLaprasHandler,
  getLucarioHandler,
  getMetagrossEmptyHandler,
  getMetagrossHandler,
  getMewtwoHandler,
  getMiloticEmptyHandler,
  getMiloticHandler,
  getMimikyuHandler,
  getPanchamEmptyHandler,
  getPanchamHandler,
  getRayquazaEmptyHandler,
  getRayquazaHandler,
  getSalamenceEmptyHandler,
  getSalamenceHandler,
  getScizorEmptyHandler,
  getScizorHandler,
  getSnorlaxEmptyHandler,
  getSnorlaxHandler,
  getSteelixEmptyHandler,
  getSteelixHandler,
  getSylveonHandler,
  getTogekissEmptyHandler,
  getTogekissHandler,
  getTyranitarHandler,
  getUmbreonHandler,
} from "./handlers";

// ---------------------------------------------------------------------------
// TanStack Query page
// ---------------------------------------------------------------------------

registerRestMocks(
  { group: "TanStack Query", handler: getCharizardHandler, operationName: "GET Charizard" },
  { group: "TanStack Query", handler: getGengarHandler, operationName: "GET Gengar" },
  { group: "TanStack Query", handler: getTyranitarHandler, operationName: "GET Tyranitar" }
);

registerGraphqlMocks(
  {
    group: "TanStack Query",
    variants: [getPanchamHandler, { handler: getPanchamEmptyHandler, label: "Not Found (empty)" }],
  },
  {
    group: "TanStack Query",
    variants: [
      getSalamenceHandler,
      { handler: getSalamenceEmptyHandler, label: "Not Found (empty)" },
    ],
  },
  {
    group: "TanStack Query",
    variants: [getSnorlaxHandler, { handler: getSnorlaxEmptyHandler, label: "Not Found (empty)" }],
  }
);

// ---------------------------------------------------------------------------
// SWR page
// ---------------------------------------------------------------------------

registerRestMocks(
  { group: "SWR", handler: getGarchompHandler, operationName: "GET Garchomp" },
  { group: "SWR", handler: getLucarioHandler, operationName: "GET Lucario" },
  { group: "SWR", handler: getBlazikenHandler, operationName: "GET Blaziken" }
);

registerGraphqlMocks(
  {
    group: "SWR",
    variants: [
      getGardevoirHandler,
      { handler: getGardevoirEmptyHandler, label: "Not Found (empty)" },
    ],
  },
  {
    group: "SWR",
    variants: [getScizorHandler, { handler: getScizorEmptyHandler, label: "Not Found (empty)" }],
  },
  {
    group: "SWR",
    variants: [
      getTogekissHandler,
      { handler: getTogekissEmptyHandler, label: "Not Found (empty)" },
    ],
  }
);

// ---------------------------------------------------------------------------
// URQL page
// ---------------------------------------------------------------------------

registerGraphqlMocks(
  {
    group: "URQL",
    variants: [getEeveeHandler, { handler: getEeveeEmptyHandler, label: "Not Found (empty)" }],
  },
  {
    group: "URQL",
    variants: [getLaprasHandler, { handler: getLaprasEmptyHandler, label: "Not Found (empty)" }],
  },
  {
    group: "URQL",
    variants: [
      getAlakazamHandler,
      { handler: getAlakazamEmptyHandler, label: "Not Found (empty)" },
    ],
  },
  {
    group: "URQL",
    variants: [
      getArcanineHandler,
      { handler: getArcanineEmptyHandler, label: "Not Found (empty)" },
    ],
  },
  {
    group: "URQL",
    variants: [getSteelixHandler, { handler: getSteelixEmptyHandler, label: "Not Found (empty)" }],
  },
  {
    group: "URQL",
    variants: [
      getHeracrossHandler,
      { handler: getHeracrossEmptyHandler, label: "Not Found (empty)" },
    ],
  }
);

// ---------------------------------------------------------------------------
// Apollo page
// ---------------------------------------------------------------------------

registerGraphqlMocks(
  {
    group: "Apollo",
    variants: [
      getRayquazaHandler,
      { handler: getRayquazaEmptyHandler, label: "Not Found (empty)" },
    ],
  },
  {
    group: "Apollo",
    variants: [
      getMetagrossHandler,
      { handler: getMetagrossEmptyHandler, label: "Not Found (empty)" },
    ],
  },
  {
    group: "Apollo",
    variants: [getMiloticHandler, { handler: getMiloticEmptyHandler, label: "Not Found (empty)" }],
  },
  {
    group: "Apollo",
    variants: [getAbsolHandler, { handler: getAbsolEmptyHandler, label: "Not Found (empty)" }],
  },
  {
    group: "Apollo",
    variants: [getFlygonHandler, { handler: getFlygonEmptyHandler, label: "Not Found (empty)" }],
  },
  {
    group: "Apollo",
    variants: [getAggronHandler, { handler: getAggronEmptyHandler, label: "Not Found (empty)" }],
  }
);

// ---------------------------------------------------------------------------
// Fetch + Axios page
// ---------------------------------------------------------------------------

registerRestMocks(
  { group: "Fetch + Axios", handler: getMimikyuHandler, operationName: "GET Mimikyu" },
  { group: "Fetch + Axios", handler: getUmbreonHandler, operationName: "GET Umbreon" },
  { group: "Fetch + Axios", handler: getEspeonHandler, operationName: "GET Espeon" },
  { group: "Fetch + Axios", handler: getSylveonHandler, operationName: "GET Sylveon" },
  { group: "Fetch + Axios", handler: getMewtwoHandler, operationName: "GET Mewtwo" },
  { group: "Fetch + Axios", handler: getDragoniteHandler, operationName: "GET Dragonite" }
);

// Pre-start the worker with a custom serviceWorkerUrl for GitHub Pages deployments.
void startWorker({
  serviceWorkerUrl: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
});
