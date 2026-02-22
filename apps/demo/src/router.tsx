import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const router = createRouter({
		routeTree,
		scrollRestoration: true,
		basepath: import.meta.env.BASE_URL,
	});

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
