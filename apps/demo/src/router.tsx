import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const router = createRouter({
    basepath: import.meta.env.BASE_URL,
    routeTree,
    scrollRestoration: true,
  });

  return router;
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
