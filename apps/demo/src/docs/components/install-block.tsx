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

const pmIcons: Record<
  PackageManager,
  ComponentType<{ className?: string; color: string; size: number | string }>
> = {
  bun: SiBun,
  npm: SiNpm,
  pnpm: SiPnpm,
  yarn: SiYarn,
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

  const Icon = pmIcons[manager];

  return (
    <button
      className={`pressable hit-44 flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1 font-mono font-semibold text-xs transition-[background,border-color,color,transform] duration-150 ${
        active
          ? "border-border-tertiary bg-bg-tertiary text-text-primary"
          : "border-transparent bg-transparent text-text-dimmed hover:text-text-secondary"
      }`}
      onClick={handleClick}
      type="button"
    >
      <Icon className="icon-flex-none size-[1cap]" color="currentColor" size="1cap" />
      {manager}
    </button>
  );
};

export const InstallBlock = ({ packages }: { packages: string }) => {
  const { pm, setPm } = usePm();
  const command = getInstallCommand(pm, packages);

  return (
    <div>
      <div className="mb-2 flex gap-1">
        {packageManagers.map((manager) => (
          <PmButton active={pm === manager} key={manager} manager={manager} onSelect={setPm} />
        ))}
      </div>
      <CodeBlock lang="bash">{command}</CodeBlock>
    </div>
  );
};
