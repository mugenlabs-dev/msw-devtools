import {
  createRootRoute,
  createRoute,
  createRouter,
  Navigate,
  Outlet,
} from "@tanstack/react-router";

import { ApolloPage } from "#demo/playground/apollo-page";
import { FetchPage } from "#demo/playground/fetch-page";
import { QueryPage } from "#demo/playground/query-page";
import { RtkQueryPage } from "#demo/playground/rtk-query-page";
import { SwrPage } from "#demo/playground/swr-page";
import { UrqlPage } from "#demo/playground/urql-page";
import { PlaygroundLayout } from "#demo/playground-page";

const rootRoute = createRootRoute({
  component: Outlet,
});

const playgroundRoute = createRoute({
  component: PlaygroundLayout,
  getParentRoute: () => rootRoute,
  id: "playground",
});

const indexRoute = createRoute({
  component: () => <Navigate replace to="/query" />,
  getParentRoute: () => playgroundRoute,
  path: "/",
});

const queryRoute = createRoute({
  component: QueryPage,
  getParentRoute: () => playgroundRoute,
  path: "/query",
});

const swrRoute = createRoute({
  component: SwrPage,
  getParentRoute: () => playgroundRoute,
  path: "/swr",
});

const urqlRoute = createRoute({
  component: UrqlPage,
  getParentRoute: () => playgroundRoute,
  path: "/urql",
});

const rtkQueryRoute = createRoute({
  component: RtkQueryPage,
  getParentRoute: () => playgroundRoute,
  path: "/rtk-query",
});

const apolloRoute = createRoute({
  component: ApolloPage,
  getParentRoute: () => playgroundRoute,
  path: "/apollo",
});

const fetchRoute = createRoute({
  component: FetchPage,
  getParentRoute: () => playgroundRoute,
  path: "/fetch",
});

const routeTree = rootRoute.addChildren([
  playgroundRoute.addChildren([
    indexRoute,
    queryRoute,
    swrRoute,
    urqlRoute,
    rtkQueryRoute,
    apolloRoute,
    fetchRoute,
  ]),
]);

const basepath = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

export const router = createRouter({
  basepath,
  routeTree,
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
