import { createContext, type ReactNode, useContext } from "react";

export type PlaygroundMajor = "2" | "3";

export interface PlaygroundConfig {
  major: PlaygroundMajor;
  msw2Href: string;
  msw3Href: string;
  /** Route prefix without a trailing slash. Demo: "/playground". MSW 2 SPA: "". */
  pathPrefix: "" | "/playground";
}

const PlaygroundConfigContext = createContext<PlaygroundConfig | null>(null);

export const PlaygroundConfigProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: PlaygroundConfig;
}) => <PlaygroundConfigContext.Provider value={value}>{children}</PlaygroundConfigContext.Provider>;

export const usePlaygroundConfig = (): PlaygroundConfig => {
  const value = useContext(PlaygroundConfigContext);
  if (!value) {
    throw new Error("usePlaygroundConfig requires PlaygroundConfigProvider");
  }
  return value;
};

export const demoPlaygroundConfig = {
  major: "3",
  msw2Href: "/msw2/query",
  msw3Href: "/playground/query",
  pathPrefix: "/playground",
} as const satisfies PlaygroundConfig;

export const msw2PlaygroundConfig = {
  major: "2",
  msw2Href: "/msw2/query",
  msw3Href: "/playground/query",
  pathPrefix: "",
} as const satisfies PlaygroundConfig;
