import { useCallback, useState } from "react";

import { CodeBlock } from "./code-block";

const packageManagers = ["npm", "yarn", "pnpm", "bun"] as const;
type PackageManager = (typeof packageManagers)[number];

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
        background: active ? "var(--bg-tertiary)" : "transparent",
        border: "1px solid",
        borderColor: active ? "var(--border-tertiary)" : "transparent",
        borderRadius: 6,
        color: active ? "var(--text-primary)" : "var(--text-dimmed)",
        cursor: "pointer",
        fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
        fontSize: 12,
        fontWeight: 600,
        padding: "4px 12px",
        transition: "all 0.15s",
      }}
      type="button"
    >
      {manager}
    </button>
  );
};

export const InstallBlock = ({ packages }: { packages: string }) => {
  const [pm, setPm] = useState<PackageManager>("npm");
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
