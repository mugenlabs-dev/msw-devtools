import { type KeyboardEvent, useId, useRef, useState } from "react";

import {
  SEGMENT,
  SEGMENT_ACTIVE,
  SEGMENT_IDLE,
  SEGMENTED_GROUP,
} from "../../components/segmented-control";
import { CodeBlock } from "./code-block";

type Version = "msw2" | "msw3";

const VERSIONS = [
  ["msw3", "MSW 3"],
  ["msw2", "MSW 2"],
] as const;

/** Index to move to for a tabs-pattern key, or undefined for keys the tabs ignore. */
const nextIndex = (key: string, current: number): number | undefined => {
  const last = VERSIONS.length - 1;
  switch (key) {
    case "ArrowRight":
      return current === last ? 0 : current + 1;
    case "ArrowLeft":
      return current === 0 ? last : current - 1;
    case "Home":
      return 0;
    case "End":
      return last;
    default:
      return undefined;
  }
};

/**
 * WAI-ARIA tabs: arrow keys, Home and End move and select, only the selected
 * tab is in the Tab order, and the code sits in a labelled tabpanel.
 */
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
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();
  const tabId = (id: Version) => `${baseId}-tab-${id}`;
  const panelId = `${baseId}-panel`;
  const source = version === "msw3" ? msw3 : msw2;

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = nextIndex(event.key, index);
    if (next === undefined) {
      return;
    }
    event.preventDefault();
    setVersion(VERSIONS[next][0]);
    tabs.current[next]?.focus();
  };

  return (
    <div className="mb-7">
      <div aria-label="MSW major" className={`mb-2 ${SEGMENTED_GROUP}`} role="tablist">
        {VERSIONS.map(([id, label], index) => {
          const selected = version === id;
          return (
            <button
              aria-controls={panelId}
              aria-selected={selected}
              className={`cursor-pointer ${SEGMENT} ${selected ? SEGMENT_ACTIVE : SEGMENT_IDLE}`}
              id={tabId(id)}
              key={id}
              onClick={() => setVersion(id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              ref={(element) => {
                tabs.current[index] = element;
              }}
              role="tab"
              tabIndex={selected ? 0 : -1}
              type="button"
            >
              {label}
            </button>
          );
        })}
      </div>
      <div aria-labelledby={tabId(version)} id={panelId} role="tabpanel">
        <CodeBlock lang={lang}>{source}</CodeBlock>
      </div>
    </div>
  );
};
