import { createFileRoute } from "@tanstack/react-router";

import { ContentPage } from "../components/content-page";
import { GITHUB_REPO_URL, NPM_URL, ORG_HOME_URL, ORG_NAME, SITE_NAME } from "../content/site";

const AboutPage = () => (
  <ContentPage
    description={`${SITE_NAME} is an open-source browser DevTools plugin from ${ORG_NAME} for teams that mock HTTP with MSW and want a visual control surface inside TanStack DevTools.`}
    title="About"
  >
    <p>
      {ORG_NAME} builds developer tooling that keeps local mock workflows fast and inspectable.{" "}
      {SITE_NAME} sits beside your app in{" "}
      <a href="https://tanstack.com/devtools" rel="noopener noreferrer" target="_blank">
        TanStack DevTools
      </a>{" "}
      and talks to the{" "}
      <a href="https://mswjs.io/" rel="noopener noreferrer" target="_blank">
        Mock Service Worker
      </a>{" "}
      worker you already run in development. Register existing handlers, then toggle them, swap
      response variants, override bodies and status codes, watch LIVE traffic, and refetch client
      caches through adapters — without rewriting handler source for every UI state.
    </p>
    <h2>What this project is</h2>
    <p>
      This site documents and demos the npm package{" "}
      <a href={NPM_URL} rel="noopener noreferrer" target="_blank">
        @mugenlabs/msw-devtools
      </a>
      . The product surface is a TypeScript library and React plugin, not a multi-tenant cloud API.
      There is no login, no hosted mock backend, and no paid plan on this documentation site. Source
      of truth for the code lives on{" "}
      <a href={GITHUB_REPO_URL} rel="noopener noreferrer" target="_blank">
        GitHub under mugenlabs-dev/msw-devtools
      </a>
      , licensed MIT, authored by Yago Gonzalez.
    </p>
    <h2>Who it is for</h2>
    <p>
      Frontend and full-stack engineers who already use MSW in React apps and want faster iteration
      on empty, error, and edge-case responses. Agents and humans reading this page should treat the
      docs, playground, and npm package as the integration path — not invent remote OpenAPI or CLI
      services that do not exist.
    </p>
    <h2>Organization</h2>
    <p>
      {ORG_NAME} publishes this project and related work from{" "}
      <a href={ORG_HOME_URL} rel="noopener noreferrer" target="_blank">
        mugenlabs.dev
      </a>
      . For project history, releases, and contributions, start with the repository README and
      GitHub Releases.
    </p>
  </ContentPage>
);

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      {
        content:
          "About @mugenlabs/msw-devtools — the Mugenlabs TanStack DevTools plugin for MSW mock management.",
        name: "description",
      },
    ],
    title: "About · @mugenlabs/msw-devtools",
  }),
});
