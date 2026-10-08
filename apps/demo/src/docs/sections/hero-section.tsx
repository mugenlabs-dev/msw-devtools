import { Link } from "@tanstack/react-router";
import { PenLine, Radio, RefreshCw, Shuffle, SlidersHorizontal, ToggleRight } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import { ArrowRightIcon } from "../../components/icons/arrow-right";

const FeaturePill = ({ icon, label }: { icon: ReactNode; label: string }) => (
  <div className="flex items-center gap-2 rounded-lg border border-border-primary bg-card-bg/80 px-4 py-3 transition-[border-color,box-shadow] duration-200 hover:border-accent-purple/40 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
    <span className="flex text-accent-purple [&_svg]:size-[1cap]">{icon}</span>
    <span className="font-medium text-[13px] text-text-primary">{label}</span>
  </div>
);

const LIBRARY_BRANDS: Record<string, { accent: string; hoverBg: string }> = {
  "Apollo Client": {
    accent: "oklch(32% 0.18 290)",
    hoverBg: "color-mix(in oklch, oklch(32% 0.18 290) 12%, transparent)",
  },
  Axios: {
    accent: "oklch(48% 0.24 290)",
    hoverBg: "color-mix(in oklch, oklch(48% 0.24 290) 12%, transparent)",
  },
  fetch: {
    accent: "oklch(90% 0.18 105)",
    hoverBg: "color-mix(in oklch, oklch(90% 0.18 105) 12%, transparent)",
  },
  "RTK Query": {
    accent: "oklch(50% 0.2 300)",
    hoverBg: "color-mix(in oklch, oklch(50% 0.2 300) 12%, transparent)",
  },
  SWR: {
    accent: "light-dark(oklch(21.8% 0 0), oklch(100% 0 0))",
    hoverBg:
      "light-dark(color-mix(in oklch, oklch(0% 0 0) 6%, transparent), color-mix(in oklch, oklch(100% 0 0) 6%, transparent))",
  },
  "TanStack Query": {
    accent: "oklch(63% 0.22 25)",
    hoverBg: "color-mix(in oklch, oklch(63% 0.22 25) 12%, transparent)",
  },
  URQL: {
    accent: "oklch(60% 0.22 285)",
    hoverBg: "color-mix(in oklch, oklch(60% 0.22 285) 12%, transparent)",
  },
};

export const HeroSection = () => (
  <section className="relative mb-0 overflow-clip px-[var(--shell-gutter)] pt-[calc(var(--header-height)+var(--safe-top))] pb-16 text-center">
    <div className="pointer-events-none absolute inset-0 overflow-clip">
      <div
        className="absolute start-[-10%] top-[-20%] h-[500px] w-[500px] rounded-full blur-[100px]"
        style={{
          background: "color-mix(in oklch, var(--accent-purple) 14%, transparent)",
        }}
      />
      <div
        className="absolute end-[-10%] top-[10%] h-[400px] w-[400px] rounded-full blur-[120px]"
        style={{
          background: "color-mix(in oklch, var(--accent-purple) 10%, transparent)",
        }}
      />
      <div
        className="absolute start-[30%] bottom-[-10%] h-[350px] w-[350px] rounded-full blur-[100px]"
        style={{
          background: "color-mix(in oklch, var(--accent-purple) 12%, transparent)",
        }}
      />
    </div>

    <div className="relative z-[2] mx-auto w-full max-w-[var(--shell-content)]">
      <div className="mb-6 flex justify-center">
        <img
          alt="msw-devtools logo"
          className="h-24 w-24 rounded-[20px]"
          height={96}
          src={`${import.meta.env.BASE_URL}logo.png`}
          width={96}
        />
      </div>
      <h1 className="m-0 mb-4 font-extrabold font-mono text-[clamp(1.75rem,4vw+1rem,2.5rem)] text-text-primary tracking-[-0.03em] transition-colors duration-300">
        @mugenlabs/
        <wbr />
        msw-devtools
      </h1>
      <p className="m-0 mb-8 text-pretty text-lg text-text-muted leading-normal transition-colors duration-300">
        A TanStack DevTools plugin for managing MSW mocks.
        <br />
        Toggle, customize, and inspect your mock handlers in real time.
      </p>
      <p className="mx-auto mb-8 max-w-[480px] text-pretty rounded-lg border border-accent-purple/30 bg-accent-purple/10 px-4 py-2.5 text-[13px] text-text-muted">
        This project is a work in progress &mdash; the API has not been finalised yet, which is why
        we haven&apos;t reached 1.0.0. Expect breaking changes between minor versions.
      </p>
      <div className="mb-12 flex justify-center gap-3">
        <Link
          className="hero-cta pressable inline-flex items-center gap-2 rounded-lg bg-hero-btn-bg px-6 py-2.5 font-semibold text-hero-btn-color text-sm no-underline transition-[opacity,background,color,transform] duration-300"
          to="/playground"
        >
          Open Playground
          <ArrowRightIcon aria-hidden className="icon-flex-none flex size-[1cap]" size={14} />
        </Link>
      </div>

      <div className="mx-auto mb-8 grid max-w-[600px] grid-cols-2 gap-2.5 text-start sm:grid-cols-3">
        <FeaturePill icon={<ToggleRight size={15} />} label="Toggle Mocks" />
        <FeaturePill icon={<Shuffle size={15} />} label="Switch Variants" />
        <FeaturePill icon={<PenLine size={15} />} label="Live Overrides" />
        <FeaturePill icon={<Radio size={15} />} label="LIVE Tracking" />
        <FeaturePill icon={<SlidersHorizontal size={15} />} label="Filter & Sort" />
        <FeaturePill icon={<RefreshCw size={15} />} label="Auto Refetch" />
      </div>

      <div className="mb-2">
        <p className="mb-3 text-[13px] text-text-dimmed">Works with</p>
        <div className="flex flex-wrap justify-center gap-2">
          {["TanStack Query", "RTK Query", "URQL", "Apollo Client", "SWR", "Axios", "fetch"].map(
            (lib) => {
              const brand = LIBRARY_BRANDS[lib];
              return (
                <span
                  className="lib-pill"
                  data-lib={lib}
                  key={lib}
                  style={
                    {
                      "--lib-accent": brand?.accent,
                      "--lib-hover-bg": brand?.hoverBg,
                    } as CSSProperties
                  }
                >
                  {lib}
                </span>
              );
            }
          )}
        </div>
      </div>
    </div>
  </section>
);
