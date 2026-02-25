import { createFileRoute, Navigate } from "@tanstack/react-router";

const PlaygroundIndex = () => <Navigate replace to="/playground/query" />;

export const Route = createFileRoute("/playground/")({
  component: PlaygroundIndex,
});
