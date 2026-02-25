import { Link, useMatches } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { skeletonKeyframes } from "./pokemon-card";

// --- Playground tabs ---

const PLAYGROUND_TABS = [
  { label: "TanStack Query", to: "/playground/query" },
  { label: "SWR", to: "/playground/swr" },
  { label: "URQL", to: "/playground/urql" },
  { label: "Apollo", to: "/playground/apollo" },
  { label: "Fetch + Axios", to: "/playground/fetch" },
] as const;

const PlaygroundTabs = () => {
  const matches = useMatches();
  const currentPath = matches.at(-1)?.fullPath ?? "";

  return (
    <nav className="flex flex-wrap justify-center gap-2">
      {PLAYGROUND_TABS.map((tab) => {
        const isActive = currentPath === tab.to;
        return (
          <Link
            className={`rounded-lg border px-4 py-2 font-medium text-[13px] no-underline transition-all duration-150 ${
              isActive
                ? "border-border-tertiary bg-bg-tertiary text-text-primary"
                : "border-border-secondary text-text-secondary hover:border-border-tertiary hover:text-text-primary"
            }`}
            key={tab.to}
            to={tab.to}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
};

// --- Page Shell ---

export const PlaygroundPageShell = ({ children }: { children: ReactNode }) => {
  const matches = useMatches();
  const routeKey = matches.at(-1)?.fullPath ?? "";

  return (
    <div className="mx-auto max-w-[1000px] px-6 pt-12 pb-40 font-sans">
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: skeleton animation keyframes */}
      <style dangerouslySetInnerHTML={{ __html: skeletonKeyframes }} />
      <div className="mb-8 text-center">
        <h1 className="m-0 mb-2 font-bold text-[28px] text-text-primary transition-colors duration-300">
          msw-devtool Playground
        </h1>
        <p className="m-0 mb-6 text-sm text-text-muted">
          Each page demonstrates a different data-fetching library integrated with msw-devtool.
          Toggle mocks in the DevTools panel below to see responses change in real-time.
        </p>
        <PlaygroundTabs />
      </div>
      <div className="playground-page-enter" key={routeKey}>
        {children}
      </div>
    </div>
  );
};
