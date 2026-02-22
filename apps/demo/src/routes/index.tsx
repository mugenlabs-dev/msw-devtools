import { createFileRoute } from "@tanstack/react-router";
import { DocsPage } from "../DocsPage";

export const Route = createFileRoute("/")({
	component: DocsPage,
});
