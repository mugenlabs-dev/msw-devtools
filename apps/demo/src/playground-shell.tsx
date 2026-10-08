import { Link, useMatches } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { skeletonKeyframes } from "./pokemon-card";

const PLAYGROUND_TABS = [
  { label: "TanStack Query", to: "/playground/query" },
  { label: "SWR", to: "/playground/swr" },
  { label: "URQL", to: "/playground/urql" },
  { label: "RTK Query", to: "/playground/rtk-query" },
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
            className={`pressable rounded-lg border px-4 py-2 font-medium text-[13px] no-underline transition-[border-color,background-color,color,transform] duration-150 ${
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

export const PlaygroundPageShell = ({ children }: { children: ReactNode }) => {
  const matches = useMatches();
  const routeKey = matches.at(-1)?.fullPath ?? "";

  return (
    <div className="shell shell-wide shell-pad-block pt-12 font-sans">
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: skeleton animation keyframes */}
      <style dangerouslySetInnerHTML={{ __html: skeletonKeyframes }} />
      <div className="mb-8 text-center">
        <h1 className="m-0 mb-2 font-bold text-[clamp(1.375rem,2vw+1rem,1.75rem)] text-text-primary transition-colors duration-300">
          @mugenlabs/
          <wbr />
          msw-devtools Playground
        </h1>
        <p className="m-0 mb-6 text-pretty text-sm text-text-muted">
          Each page demonstrates a different data-fetching library integrated with
          @mugenlabs/msw-devtools. Toggle mocks in the DevTools panel below to see responses change
          in real-time.
        </p>
        <PlaygroundTabs />
      </div>
      <div className="playground-page-enter" key={routeKey}>
        {children}
      </div>
    </div>
  );
};
