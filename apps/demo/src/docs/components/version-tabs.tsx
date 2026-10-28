import { useState } from "react";

import { CodeBlock } from "./code-block";

type Version = "msw2" | "msw3";

export const VersionTabs = ({
  msw2,
  msw3,
  lang = "typescript",
}: {
  lang?: "typescript" | "tsx" | "bash";
  msw2: string;
  msw3: string;
}) => {
  const [version, setVersion] = useState<Version>("msw3");
  const source = version === "msw3" ? msw3 : msw2;

  return (
    <div className="mb-7">
      <div aria-label="MSW major" className="mb-2 flex gap-1" role="tablist">
        {(
          [
            ["msw3", "MSW 3"],
            ["msw2", "MSW 2"],
          ] as const
        ).map(([id, label]) => (
          <button
            aria-selected={version === id}
            className={`cursor-pointer rounded-md border px-2.5 py-1 text-xs transition-colors ${
              version === id
                ? "border-accent-blue/40 bg-accent-blue/15 text-text-primary"
                : "border-white/10 bg-transparent text-text-dimmed hover:text-text-primary"
            }`}
            key={id}
            onClick={() => setVersion(id)}
            role="tab"
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
      <CodeBlock lang={lang}>{source}</CodeBlock>
    </div>
  );
};
