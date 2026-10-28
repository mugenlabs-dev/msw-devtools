# MSW 2 playground

Vite app pinned to MSW 2.x. It serves the same playground as `apps/demo` at `/msw2/` on the demo host. The pages, handlers, and shell live in `apps/demo/src`. This package chooses the MSW 2 worker, the router base path `/msw2/`, and `PlaygroundConfig` (`major` 2, `pathPrefix` `""`).

`mockServiceWorker.js` is served from `/msw2/mockServiceWorker.js`. Its scope is `/msw2/`. The site worker is `/mockServiceWorker.js` with scope `/`. The browser picks the longest matching scope, so the two registrations stay separate.

`pnpm test:e2e:msw2` and the CI peer-version legs that pin MSW 2 run against this app. The demo `/playground` routes run MSW 3.
