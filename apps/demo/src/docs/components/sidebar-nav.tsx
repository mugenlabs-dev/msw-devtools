import type { LucideIcon } from "lucide-react";
import { Code2, FileCode, Package, Plug, Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// Responsive sidebar visibility is handled by the CSS rule in styles.css:
// @media (max-width: 1200px) { .docs-sidebar { display: none !important; } }

// ---------------------------------------------------------------------------
// Section definitions
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Sidebar Nav Item
// ---------------------------------------------------------------------------
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
    className="flex w-full cursor-pointer items-center gap-2 border-none bg-transparent px-3 py-2 text-left text-[13px] transition-all duration-200 ease-in-out"
    onClick={onClick}
    style={{
      borderLeft: `2px solid ${active ? "var(--accent-purple, #7c3aed)" : "transparent"}`,
      color: active ? "var(--text-primary)" : "var(--text-muted)",
      fontWeight: active ? 600 : 400,
      opacity: active ? 1 : 0.7,
      transform: active ? "translateX(2px)" : "translateX(0)",
    }}
    type="button"
  >
    <Icon
      className="shrink-0 transition-colors duration-200"
      size={15}
      style={{
        color: active ? "var(--accent-purple, #7c3aed)" : "var(--text-dimmed)",
      }}
    />
    {label}
  </button>
);

// ---------------------------------------------------------------------------
// Sidebar Nav
// ---------------------------------------------------------------------------
export const SidebarNav = () => {
  const [activeId, setActiveId] = useState("");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isClickScrolling = useRef(false);

  // Set up IntersectionObserver to track active section
  useEffect(() => {
    const headings = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el != null);

    if (headings.length === 0) {
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Skip observer updates during programmatic (click) scrolls
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
      // Immediately update the active state
      setActiveId(id);
      // Pause observer during the smooth scroll to prevent flickering
      isClickScrolling.current = true;
      el.scrollIntoView({ behavior: "smooth" });
      window.history.replaceState(null, "", `#${id}`);
      // Resume observer after scroll animation settles
      setTimeout(() => {
        isClickScrolling.current = false;
      }, 800);
    }
  }, []);

  return (
    <nav className="sticky top-[80px] flex flex-col gap-0.5">
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
