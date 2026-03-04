import { createFileRoute } from "@tanstack/react-router";
import { RtkQueryPage } from "../../playground/rtk-query-page";

export const Route = createFileRoute("/playground/rtk-query")({
  component: RtkQueryPage,
});
