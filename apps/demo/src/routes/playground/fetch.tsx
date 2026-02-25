import { createFileRoute } from "@tanstack/react-router";
import { FetchPage } from "../../playground/fetch-page";

export const Route = createFileRoute("/playground/fetch")({
  component: FetchPage,
});
