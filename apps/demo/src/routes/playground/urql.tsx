import { createFileRoute } from "@tanstack/react-router";
import { UrqlPage } from "../../playground/urql-page";

export const Route = createFileRoute("/playground/urql")({
  component: UrqlPage,
});
