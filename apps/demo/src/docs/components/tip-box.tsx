import type { ReactNode } from "react";

export const TipBox = ({ children }: { children: ReactNode }) => (
  <div className="border-border-primary border-s-accent-purple bg-card-bg mt-4 rounded-lg border border-s-[3px] px-5 py-4 transition-[background,border-color] duration-300">
    <p className="text-text-tertiary m-0 text-sm leading-relaxed">{children}</p>
  </div>
);
