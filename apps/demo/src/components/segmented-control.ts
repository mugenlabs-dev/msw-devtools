/**
 * Classes for the segmented control shared by the playground's MSW version switch
 * and the docs' MSW version tabs, so the two look the same.
 */
export const SEGMENTED_GROUP =
  "inline-flex items-center gap-0.5 rounded-lg border border-border-secondary bg-bg-tertiary p-0.5";

export const SEGMENT =
  "rounded-md px-3 py-1 font-semibold text-[13px] no-underline transition-[background-color,color] duration-150";

export const SEGMENT_ACTIVE = "bg-bg-secondary text-text-primary shadow-sm";

export const SEGMENT_IDLE = "text-text-muted hover:text-text-primary";
