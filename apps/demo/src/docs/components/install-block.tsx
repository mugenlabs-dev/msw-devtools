import { SiBun, SiNpm, SiPnpm, SiYarn } from "@icons-pack/react-simple-icons";
import { type ComponentType, useCallback } from "react";

import { type PackageManager, packageManagers, usePm } from "../pm-context";
import { CodeBlock } from "./code-block";

const getInstallCommand = (pm: PackageManager, packages: string): string => {
  switch (pm) {
    case "npm": {
      return `npm install ${packages}`;
    }
    case "yarn": {
      return `yarn add ${packages}`;
    }
    case "pnpm": {
      return `pnpm add ${packages}`;
    }
    case "bun": {
      return `bun add ${packages}`;
    }
    default: {
      return `npm install ${packages}`;
    }
  }
};

const pmIcons: Record<PackageManager, ComponentType<{ size: number; color: string }>> = {
  npm: SiNpm,
  yarn: SiYarn,
  pnpm: SiPnpm,
  bun: SiBun,
};

const PmButton = ({
  active,
  manager,
  onSelect,
}: {
  active: boolean;
  manager: PackageManager;
  onSelect: (pm: PackageManager) => void;
}) => {
  const handleClick = useCallback(() => {
    onSelect(manager);
  }, [manager, onSelect]);

  return (
    <button
      onClick={handleClick}
      style={{
        alignItems: "center",
        background: active ? "var(--bg-tertiary)" : "transparent",
        border: "1px solid",
        borderColor: active ? "var(--border-tertiary)" : "transparent",
        borderRadius: 6,
        color: active ? "var(--text-primary)" : "var(--text-dimmed)",
        cursor: "pointer",
        display: "flex",
        fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
        fontSize: 12,
        fontWeight: 600,
        gap: 6,
        padding: "4px 12px",
        transition: "all 0.15s",
      }}
      type="button"
    >
      {(() => {
        const Icon = pmIcons[manager];
        return <Icon color="currentColor" size={14} />;
      })()}
      {manager}
    </button>
  );
};

export const InstallBlock = ({ packages }: { packages: string }) => {
  const { pm, setPm } = usePm();
  const command = getInstallCommand(pm, packages);

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 2,
          marginBottom: 8,
        }}
      >
        {packageManagers.map((manager) => (
          <PmButton active={pm === manager} key={manager} manager={manager} onSelect={setPm} />
        ))}
      </div>
      <CodeBlock lang="bash">{command}</CodeBlock>
    </div>
  );
};
