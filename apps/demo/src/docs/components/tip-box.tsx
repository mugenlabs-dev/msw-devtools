import type { ReactNode } from "react";

export const TipBox = ({ children }: { children: ReactNode }) => (
  <div className="mt-4 rounded-lg border border-border-primary border-l-[3px] border-l-accent-purple bg-card-bg px-5 py-4 transition-[background,border-color] duration-300">
    <p className="m-0 text-sm text-text-tertiary leading-relaxed">{children}</p>
  </div>
);
