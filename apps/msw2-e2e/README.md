# MSW 2 playground

Vite app pinned to MSW 2.x. It serves the same playground as `apps/demo` at `/msw2/` on the demo host. The pages, handlers, and shell live in `apps/demo/src`. This package chooses the MSW 2 worker, the router base path `/msw2/`, and `PlaygroundConfig` (`major` 2, `pathPrefix` `""`).

`mockServiceWorker.js` is served from `/msw2/mockServiceWorker.js`. Its scope stays `/msw2/` and does not overlap `/playground/`.

`pnpm test:e2e:msw2` and the CI peer-version legs that pin MSW 2 run against this app. The demo `/playground` routes run MSW 3.
