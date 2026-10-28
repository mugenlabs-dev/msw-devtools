# MSW 2 playground

Deployed Vite app pinned to MSW 2.x at `/msw2/` on the demo host. It shares the
visible MSW 2 / MSW 3 switch with the main playground and uses its own
`mockServiceWorker.js` under `/msw2/` so the service-worker scope and checksum
stay isolated from the MSW 3 playground.

Used by `pnpm test:e2e:msw2` and the CI peer-version legs that pin MSW 2. The
live demo’s `/playground` routes target MSW 3.
