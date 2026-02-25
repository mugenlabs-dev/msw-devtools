import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useState } from "react";

export const Accordion = ({ children, title }: { children: ReactNode; title: string }) => {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-border-primary transition-[border-color] duration-300">
      <button
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-1.5 border-none bg-card-bg px-3.5 py-2.5 font-medium text-[13px] text-text-secondary transition-[background,color] duration-150"
        onClick={toggle}
        type="button"
      >
        <ChevronDown
          className="shrink-0 transition-transform duration-200"
          size={14}
          style={{
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
          }}
        />
        {title}
      </button>
      {open && <div className="border-border-primary border-t px-3.5 py-3">{children}</div>}
    </div>
  );
};
