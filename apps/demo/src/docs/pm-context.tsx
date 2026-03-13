import { createContext, type ReactNode, useCallback, useContext, useState } from "react";

export const packageManagers = ["npm", "yarn", "pnpm", "bun"] as const;
export type PackageManager = (typeof packageManagers)[number];

const STORAGE_KEY = "msw-devtool:pm";

const readStoredPm = (): PackageManager => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value && (packageManagers as readonly string[]).includes(value)) {
      return value as PackageManager;
    }
  } catch {
    // SSR or storage unavailable
  }
  return "npm";
};

interface PmContextValue {
  pm: PackageManager;
  setPm: (pm: PackageManager) => void;
}

const PmContext = createContext<PmContextValue | null>(null);

export const PmProvider = ({ children }: { children: ReactNode }) => {
  const [pm, setPmState] = useState<PackageManager>(readStoredPm);

  const setPm = useCallback((next: PackageManager) => {
    setPmState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage unavailable
    }
  }, []);

  return <PmContext.Provider value={{ pm, setPm }}>{children}</PmContext.Provider>;
};

export const usePm = (): PmContextValue => {
  const ctx = useContext(PmContext);
  if (!ctx) {
    throw new Error("usePm must be used within a PmProvider");
  }
  return ctx;
};
