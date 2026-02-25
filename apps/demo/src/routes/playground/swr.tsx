import { createFileRoute } from "@tanstack/react-router";
import { SwrPage } from "../../playground/swr-page";

export const Route = createFileRoute("/playground/swr")({
  component: SwrPage,
});
