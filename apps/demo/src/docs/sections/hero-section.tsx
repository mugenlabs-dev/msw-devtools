import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  PenLine,
  Radio,
  RefreshCw,
  Shuffle,
  SlidersHorizontal,
  ToggleRight,
} from "lucide-react";
import type { ReactNode } from "react";

import { Aurora } from "../../aurora";
import { useTheme } from "../../theme-context";

// ---------------------------------------------------------------------------
// Feature pill — compact feature badge for the hero area
// ---------------------------------------------------------------------------
const FeaturePill = ({ icon, label }: { icon: ReactNode; label: string }) => (
  <div className="flex items-center gap-2 rounded-lg border border-border-primary bg-card-bg/80 px-4 py-3 transition-all duration-200 hover:border-accent-purple/40 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
    <span className="text-accent-purple">{icon}</span>
    <span className="font-medium text-[13px] text-text-primary">{label}</span>
  </div>
);

// ---------------------------------------------------------------------------
// Library brands
// ---------------------------------------------------------------------------
const LIBRARY_BRANDS: Record<string, { accent: string; hoverBg: string }> = {
  "Apollo Client": { accent: "#311C87", hoverBg: "rgba(49,28,135,0.12)" },
  Axios: { accent: "#5A29E4", hoverBg: "rgba(90,41,228,0.12)" },
  SWR: { accent: "#fff", hoverBg: "rgba(255,255,255,0.06)" },
  "TanStack Query": { accent: "#EF4444", hoverBg: "rgba(239,68,68,0.12)" },
  URQL: { accent: "#6C63FF", hoverBg: "rgba(108,99,255,0.12)" },
  fetch: { accent: "#F7DF1E", hoverBg: "rgba(247,223,30,0.10)" },
};

const handleLibPillEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
  const brand = LIBRARY_BRANDS[e.currentTarget.dataset.lib ?? ""];
  if (brand != null) {
    e.currentTarget.style.borderColor = brand.accent;
    e.currentTarget.style.background = brand.hoverBg;
    e.currentTarget.style.color = "var(--text-primary)";
    e.currentTarget.style.transform = "translateY(-1px)";
  }
};

const handleLibPillLeave = (e: React.MouseEvent<HTMLSpanElement>) => {
  e.currentTarget.style.borderColor = "var(--border-primary)";
  e.currentTarget.style.background = "var(--pill-bg)";
  e.currentTarget.style.color = "var(--pill-color)";
  e.currentTarget.style.transform = "translateY(0)";
};

// ---------------------------------------------------------------------------
// Aurora color stop constants (stable references to avoid re-renders)
// ---------------------------------------------------------------------------
const AURORA_DARK: [string, string, string] = ["#3D2D6B", "#5F4B8B", "#7B68AE"];
const AURORA_LIGHT: [string, string, string] = ["#d4c0ff", "#b8a0e8", "#e0d0ff"];

// ---------------------------------------------------------------------------
// Hero Section
// ---------------------------------------------------------------------------
export const HeroSection = () => {
  const { theme } = useTheme();

  return (
    <section className="!mb-0 relative overflow-hidden px-6 pt-[60px] pb-16 text-center">
      <Aurora
        amplitude={1.2}
        blend={0.6}
        colorStops={theme === "dark" ? AURORA_DARK : AURORA_LIGHT}
        lightMode={theme === "light"}
        speed={0.4}
      />
      {/* gradient overlay to fade the aurora's dark edge into the page bg */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            theme === "dark"
              ? "linear-gradient(to bottom, transparent 0%, transparent 30%, var(--bg-primary) 95%)"
              : "linear-gradient(to bottom, rgba(248,248,248,0.3) 0%, rgba(248,248,248,0.6) 25%, var(--bg-primary) 70%)",
        }}
      />
      <div className="relative z-[2] mx-auto max-w-[720px]">
        <div className="mb-6 flex justify-center">
          <img
            alt="msw-devtool logo"
            className="h-24 w-24 rounded-[20px]"
            height={96}
            src={`${import.meta.env.BASE_URL}logo.svg`}
            width={96}
          />
        </div>
        <h1 className="mt-0 mr-0 mb-4 ml-0 font-extrabold font-mono text-[40px] text-text-primary tracking-[-0.03em] transition-colors duration-300">
          msw-devtool
        </h1>
        <p className="mt-0 mr-0 mb-8 ml-0 text-lg text-text-muted leading-normal transition-colors duration-300">
          A TanStack DevTools plugin for managing MSW mocks.
          <br />
          Toggle, customize, and inspect your mock handlers in real time.
        </p>
        <p className="mx-auto mb-8 max-w-[480px] rounded-lg border border-accent-purple/30 bg-accent-purple/10 px-4 py-2.5 text-[13px] text-text-muted">
          This project is a work in progress &mdash; the API has not been finalised yet, which is
          why we haven&apos;t reached 1.0.0. Expect breaking changes between minor versions.
        </p>
        <div className="mb-12 flex justify-center gap-3">
          <Link
            className="inline-flex items-center gap-2 rounded-lg bg-hero-btn-bg px-6 py-2.5 font-semibold text-hero-btn-color text-sm no-underline transition-[opacity,background,color] duration-300"
            to="/playground"
          >
            Open Playground
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Features grid */}
        <div className="mx-auto mb-8 grid max-w-[600px] grid-cols-2 gap-2.5 text-left sm:grid-cols-3">
          <FeaturePill icon={<ToggleRight size={15} />} label="Toggle Mocks" />
          <FeaturePill icon={<Shuffle size={15} />} label="Switch Variants" />
          <FeaturePill icon={<PenLine size={15} />} label="Live Overrides" />
          <FeaturePill icon={<Radio size={15} />} label="LIVE Tracking" />
          <FeaturePill icon={<SlidersHorizontal size={15} />} label="Filter & Sort" />
          <FeaturePill icon={<RefreshCw size={15} />} label="Auto Refetch" />
        </div>

        {/* Supported Libraries */}
        <div className="mb-2">
          <p className="mb-3 text-[13px] text-text-dimmed">Works with</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["TanStack Query", "URQL", "Apollo Client", "SWR", "Axios", "fetch"].map((lib) => (
              // biome-ignore lint/a11y/noStaticElementInteractions: cosmetic hover effects only
              <span
                data-lib={lib}
                key={lib}
                onMouseEnter={handleLibPillEnter}
                onMouseLeave={handleLibPillLeave}
                role="presentation"
                style={{
                  background: "var(--pill-bg)",
                  border: "1px solid var(--border-primary)",
                  borderRadius: 20,
                  color: "var(--pill-color)",
                  cursor: "default",
                  fontSize: 13,
                  fontWeight: 500,
                  padding: "6px 14px",
                  transition: "background 0.2s, border-color 0.2s, color 0.2s, transform 0.15s",
                }}
              >
                {lib}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
