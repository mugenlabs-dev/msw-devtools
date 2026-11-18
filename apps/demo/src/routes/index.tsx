import { createFileRoute } from "@tanstack/react-router";

import { SITE_DESCRIPTION, SITE_NAME } from "../content/site";
import { DocsPage } from "../docs-page";

export const Route = createFileRoute("/")({
  component: DocsPage,
  head: () => ({
    meta: [
      { title: `${SITE_NAME} — A TanStack DevTools plugin for MSW` },
      { content: SITE_DESCRIPTION, name: "description" },
    ],
  }),
});
