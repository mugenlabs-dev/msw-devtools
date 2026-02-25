import { Check, Link as LinkIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useState } from "react";

export const SectionTitle = ({ children, id }: { children: ReactNode; id: string }) => {
  const [copied, setCopied] = useState(false);

  const handleClick = useCallback(async () => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.history.replaceState(null, "", `#${id}`);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }, [id]);

  return (
    <h2
      className="mb-4 flex scroll-mt-[72px] items-center gap-2 font-bold text-[22px] text-text-primary tracking-tight transition-colors duration-300"
      id={id}
    >
      <button
        className="m-0 inline-flex cursor-pointer appearance-none items-center gap-2 border-none bg-transparent p-0"
        onClick={handleClick}
        type="button"
      >
        {children}
        <span
          className="inline-flex transition-opacity duration-150"
          style={{ opacity: copied ? 1 : 0.3 }}
        >
          {copied ? <Check color="var(--accent-green)" size={16} /> : <LinkIcon size={16} />}
        </span>
      </button>
    </h2>
  );
};
