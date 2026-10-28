import { createFileRoute } from "@tanstack/react-router";

import { demoPlaygroundConfig, PlaygroundConfigProvider } from "../../playground-config";
import { PlaygroundLayout } from "../../playground-page";

const PlaygroundRoute = () => (
  <PlaygroundConfigProvider value={demoPlaygroundConfig}>
    <PlaygroundLayout />
  </PlaygroundConfigProvider>
);

export const Route = createFileRoute("/playground")({
  component: PlaygroundRoute,
  head: () => ({
    meta: [{ content: "noindex", name: "robots" }],
    title: "Playground — @mugenlabs/msw-devtools",
  }),
  ssr: false,
});
