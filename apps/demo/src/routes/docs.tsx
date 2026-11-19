import { createFileRoute } from "@tanstack/react-router";

import { DocsPage } from "../docs-page";

export const Route = createFileRoute("/docs")({
  component: DocsPage,
  head: () => ({
    meta: [
      { title: "Docs — MSW DevTools" },
      {
        content:
          "@mugenlabs/msw-devtools documentation — install the Mugenlabs MSW DevTools plugin, quick start, adapters, and API reference.",
        name: "description",
      },
    ],
  }),
});
