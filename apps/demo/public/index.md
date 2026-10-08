# @mugenlabs/msw-devtools

A TanStack DevTools plugin for managing MSW (Mock Service Worker) mocks in the browser. Toggle, customize, and inspect mock handlers in real time — built by Mugen Labs and published on npm as `@mugenlabs/msw-devtools`.

This project is a work in progress. The public TypeScript API has not been finalised for 1.0.0; expect breaking changes between minor versions.

## When to use this library

Use `@mugenlabs/msw-devtools` when you already mock network traffic with MSW in a React app and want a DevTools panel to enable/disable handlers, switch variants, override JSON bodies/status codes/headers/delays, filter LIVE operations, and refresh client caches through library adapters.

Do not expect a hosted REST API, OpenAPI document, or CLI that talks to a remote backend. Integration is local: install the package, register handlers, mount the plugin.

## Start here

- [Full documentation](https://msw-devtools.mugenlabs.dev/docs) — installation, quick start, adapters, API reference
- [Developer portal](https://msw-devtools.mugenlabs.dev/developers) — links for agents and humans
- [Playground](https://msw-devtools.mugenlabs.dev/playground) — live demo with TanStack Query, SWR, URQL, Apollo, RTK Query, fetch
- [npm](https://www.npmjs.com/package/@mugenlabs/msw-devtools)
- [GitHub](https://github.com/mugenlabs-dev/msw-devtools)
- [llms.txt](https://msw-devtools.mugenlabs.dev/llms.txt)

## Install

```bash
npm install @mugenlabs/msw-devtools
```

Peer dependencies include `msw`, `react`, `react-dom`, and `zustand`. Host the panel with `@tanstack/react-devtools` when you want the visual UI.

## Features

- Toggle mocks without editing handler source
- Switch response variants (success, empty, error, custom)
- Live overrides for body, status, headers, and delay
- LIVE tracking of intercepted operations on the current page
- Filter and sort the operation list
- Auto-refetch adapters for popular data libraries

## Trust and contact

- [About](https://msw-devtools.mugenlabs.dev/about)
- [Contact](https://msw-devtools.mugenlabs.dev/contact)
- [Privacy](https://msw-devtools.mugenlabs.dev/privacy)
