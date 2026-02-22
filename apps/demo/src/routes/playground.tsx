import { createFileRoute } from "@tanstack/react-router";
import { PlaygroundPage } from "../PlaygroundPage";

export const Route = createFileRoute("/playground")({
	component: PlaygroundPage,
	ssr: false,
});
