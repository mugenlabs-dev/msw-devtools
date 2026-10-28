import { Link, useMatches } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { MswVersionSwitch } from "./components/msw-version-switch";
import { type PlaygroundConfig, usePlaygroundConfig } from "./playground-config";
import { skeletonKeyframes } from "./pokemon-card";

const PLAYGROUND_TABS = [
  { label: "TanStack Query", slug: "query" },
  { label: "SWR", slug: "swr" },
  { label: "URQL", slug: "urql" },
  { label: "RTK Query", slug: "rtk-query" },
  { label: "Apollo", slug: "apollo" },
  { label: "Fetch + Axios", slug: "fetch" },
] as const;

const tabPath = (pathPrefix: PlaygroundConfig["pathPrefix"], slug: string) =>
  pathPrefix === "" ? `/${slug}` : `${pathPrefix}/${slug}`;

const PlaygroundTabs = () => {
  const { pathPrefix } = usePlaygroundConfig();

  return (
    <nav aria-label="Libraries" className="flex flex-wrap justify-center gap-2">
      {PLAYGROUND_TABS.map((tab) => (
        <Link
          activeProps={{
            className: "border-border-tertiary bg-bg-tertiary text-text-primary",
          }}
          className="pressable rounded-lg border px-4 py-2 font-medium text-[13px] no-underline transition-[border-color,background-color,color,transform] duration-150"
          inactiveProps={{
            className:
              "border-border-secondary text-text-secondary hover:border-border-tertiary hover:text-text-primary",
          }}
          key={tab.slug}
          // This file is typechecked against both registered route trees.
          to={tabPath(pathPrefix, tab.slug) as never}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
};

export const PlaygroundPageShell = ({ children }: { children: ReactNode }) => {
  const matches = useMatches();
  const routeKey = matches.at(-1)?.fullPath ?? "";
  const { major, msw2Href, msw3Href } = usePlaygroundConfig();
  const running = major === "2" ? "MSW 2" : "MSW 3";
  const other = major === "2" ? "MSW 3" : "MSW 2";

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
        <p className="m-0 mb-4 text-pretty text-sm text-text-muted">
          Each page demonstrates a different data-fetching library integrated with
          @mugenlabs/msw-devtools. Toggle mocks in the DevTools panel below to see responses change
          in real time. This site runs {running}. Switch to {other} for the same playground.
        </p>
        <div className="mb-6 flex justify-center">
          <MswVersionSwitch active={major} msw2Href={msw2Href} msw3Href={msw3Href} />
        </div>
        <PlaygroundTabs />
      </div>
      <div className="playground-page-enter" key={routeKey}>
        {children}
      </div>
    </div>
  );
};
