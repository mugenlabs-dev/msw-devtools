import { createFileRoute } from "@tanstack/react-router";
import { QueryPage } from "../../playground/query-page";

export const Route = createFileRoute("/playground/query")({
  component: QueryPage,
});
