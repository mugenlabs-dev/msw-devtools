import type { LucideIcon } from "lucide-react";
import { Code2, FileCode, Package, Plug, Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { smoothScrollBehavior } from "../../lib/utils";

// Responsive sidebar visibility: styles.css @media (min-width: 1048px)

interface SectionDef {
  icon: LucideIcon;
  id: string;
  label: string;
}

const sections: SectionDef[] = [
  { icon: Package, id: "installation", label: "Installation" },
  { icon: Zap, id: "quick-start", label: "Quick Start" },
  { icon: Plug, id: "adapters", label: "Adapters" },
  { icon: FileCode, id: "existing-handlers", label: "Existing Handlers" },
  { icon: Code2, id: "api-reference", label: "API Reference" },
];

const NavItem = ({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) => (
  <button
    className={`pressable flex w-full cursor-pointer items-center gap-2 border-none bg-transparent px-3 py-2 text-start text-[13px] transition-[color,opacity,transform,border-color] duration-200 ${
      active
        ? "translate-x-0.5 font-semibold text-text-primary opacity-100"
        : "font-normal text-text-muted opacity-70 hover:text-text-secondary hover:opacity-100"
    }`}
    onClick={onClick}
    style={{
      borderInlineStart: `2px solid ${active ? "var(--accent-purple)" : "transparent"}`,
    }}
    type="button"
  >
    <Icon
      aria-hidden
      className={`icon-flex-none size-[1cap] shrink-0 transition-colors duration-200 ${
        active ? "text-accent-purple" : "text-text-dimmed"
      }`}
      size={15}
    />
    {label}
  </button>
);

export const SidebarNav = () => {
  const [activeId, setActiveId] = useState("");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isClickScrolling = useRef(false);

  useEffect(() => {
    const headings = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el != null);

    if (headings.length === 0) {
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (isClickScrolling.current) {
          return;
        }
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      {
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0,
      }
    );

    for (const heading of headings) {
      observerRef.current.observe(heading);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const handleClick = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      setActiveId(id);
      isClickScrolling.current = true;
      el.scrollIntoView({ behavior: smoothScrollBehavior() });
      window.history.replaceState(null, "", `#${id}`);
      setTimeout(() => {
        isClickScrolling.current = false;
      }, 800);
    }
  }, []);

  return (
    <nav className="sticky top-[calc(var(--header-height)+20px)] flex flex-col gap-1.5">
      <span className="mb-2 px-3 font-semibold text-[11px] text-text-dimmed uppercase tracking-wide">
        On this page
      </span>
      {sections.map((section) => (
        <NavItem
          active={activeId === section.id}
          icon={section.icon}
          key={section.id}
          label={section.label}
          onClick={() => {
            handleClick(section.id);
          }}
        />
      ))}
    </nav>
  );
};
