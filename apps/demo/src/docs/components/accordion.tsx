import type { ReactNode } from "react";

import { ChevronDownIcon } from "../../components/icons/chevron-down";

export const Accordion = ({ children, title }: { children: ReactNode; title: string }) => (
  <details className="docs-accordion mt-3">
    <summary className="pressable hit-44">
      <ChevronDownIcon
        aria-hidden
        className="docs-accordion__chevron icon-flex-none flex size-[1cap]"
        size={14}
      />
      {title}
    </summary>
    <div className="docs-accordion__body">{children}</div>
  </details>
);
