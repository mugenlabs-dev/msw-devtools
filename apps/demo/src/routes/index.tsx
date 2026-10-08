import { createFileRoute } from "@tanstack/react-router";

import { SITE_DESCRIPTION, SITE_NAME } from "../content/site";
import { DocsPage } from "../docs-page";

export const Route = createFileRoute("/")({
  component: DocsPage,
  head: () => ({
    meta: [{ content: SITE_DESCRIPTION, name: "description" }],
    title: `${SITE_NAME} — Mugenlabs MSW DevTools plugin`,
  }),
});
