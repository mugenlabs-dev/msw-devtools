export const StepNumber = ({ n }: { n: number }) => (
  <span className="bg-border-primary text-text-primary inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-[background,color] duration-300">
    {n}
  </span>
);
