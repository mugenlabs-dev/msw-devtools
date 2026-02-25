import { createFileRoute } from "@tanstack/react-router";
import { ApolloPage } from "../../playground/apollo-page";

export const Route = createFileRoute("/playground/apollo")({
  component: ApolloPage,
});
