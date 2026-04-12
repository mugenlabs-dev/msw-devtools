import { createFileRoute } from "@tanstack/react-router";
import { PlaygroundLayout } from "../../playground-page";

export const Route = createFileRoute("/playground")({
  component: PlaygroundLayout,
  head: () => ({
    meta: [{ content: "noindex", name: "robots" }],
    title: "Playground — @mugenlabs/msw-devtools",
  }),
  ssr: false,
});
