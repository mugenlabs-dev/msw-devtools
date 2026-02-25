export const StepNumber = ({ n }: { n: number }) => (
  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-border-primary font-bold text-text-primary text-xs transition-[background,color] duration-300">
    {n}
  </span>
);
