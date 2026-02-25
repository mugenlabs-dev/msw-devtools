import { createFileRoute } from "@tanstack/react-router";
import { DocsPage } from "../docs-page";

export const Route = createFileRoute("/")({
  component: DocsPage,
});
