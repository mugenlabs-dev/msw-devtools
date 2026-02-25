import { useCallback, useEffect, useState } from "react";

import { SidebarNav } from "./docs/components/sidebar-nav";
import { AdapterSection } from "./docs/sections/adapter-section";
import { ApiReferenceSection } from "./docs/sections/api-reference-section";
import { ExistingHandlersSection } from "./docs/sections/existing-handlers-section";
import { HeroSection } from "./docs/sections/hero-section";
import { InstallationSection } from "./docs/sections/installation-section";
import { QuickStartSection } from "./docs/sections/quick-start-section";

// ---------------------------------------------------------------------------
// Floating nav buttons
// ---------------------------------------------------------------------------
const FloatingButtons = () => {
  const [showDocs, setShowDocs] = useState(true);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const docsEl = document.getElementById("installation");
    if (!docsEl) {
      return;
    }

    const update = () => {
      const rect = docsEl.getBoundingClientRect();
      // Docs section is below the viewport → show "Go to Docs"
      const docsBelowViewport = rect.top > window.innerHeight;
      setShowDocs(docsBelowViewport);
      // User has scrolled past the hero into docs → show "Scroll to Top"
      setShowTop(!docsBelowViewport && window.scrollY > 200);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
    };
  }, []);

  const scrollToDocs = useCallback(() => {
    document.querySelector("#installation")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ behavior: "smooth", top: 0 });
  }, []);

  return (
    <>
      {/* Go to Docs — fixed bottom center */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-8 z-50 flex justify-center transition-all duration-300"
        style={{
          opacity: showDocs ? 1 : 0,
          transform: `translateY(${showDocs ? "0" : "20px"})`,
        }}
      >
        <button
          aria-label="Scroll to documentation"
          className="pointer-events-auto flex cursor-pointer items-center gap-2 rounded-full border border-accent-purple/30 bg-bg-primary/80 px-5 py-2.5 font-semibold text-accent-purple text-sm shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-md transition-colors duration-200 hover:border-accent-purple/50 hover:bg-bg-primary"
          onClick={scrollToDocs}
          style={{ pointerEvents: showDocs ? "auto" : "none" }}
          type="button"
        >
          <svg
            aria-hidden="true"
            fill="none"
            height={14}
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
            width={14}
          >
            <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Documentation
        </button>
      </div>

      {/* Scroll to top — aligned with right edge of page container */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-8 z-50 mx-auto flex max-w-[1000px] justify-end px-6 transition-all duration-300"
        style={{
          opacity: showTop ? 1 : 0,
          transform: `translateY(${showTop ? "0" : "20px"})`,
        }}
      >
        <button
          aria-label="Scroll to top"
          className="pointer-events-auto flex size-10 cursor-pointer items-center justify-center rounded-full border border-border-secondary bg-bg-primary/80 text-text-muted shadow-[0_4px_16px_rgba(0,0,0,0.2)] backdrop-blur-md transition-colors duration-200 hover:border-accent-purple/40 hover:text-accent-purple"
          onClick={scrollToTop}
          style={{ pointerEvents: showTop ? "auto" : "none" }}
          type="button"
        >
          <svg
            aria-hidden="true"
            fill="none"
            height={16}
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
            width={16}
          >
            <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------
// Docs Page
// ---------------------------------------------------------------------------
export const DocsPage = () => {
  // Scroll to hash on mount
  useEffect(() => {
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <div className="font-sans text-text-secondary transition-colors duration-300">
      <HeroSection />

      <div className="mx-auto flex max-w-[1000px] gap-12 px-6 pb-40">
        {/* Sidebar — hidden below 1200px via CSS media query */}
        <aside className="docs-sidebar w-[200px] shrink-0">
          <SidebarNav />
        </aside>

        {/* Main content */}
        <div className="min-w-0 max-w-[720px] flex-1">
          <InstallationSection />
          <QuickStartSection />
          <AdapterSection />
          <ExistingHandlersSection />
          <ApiReferenceSection />
        </div>
      </div>

      <FloatingButtons />
    </div>
  );
};
