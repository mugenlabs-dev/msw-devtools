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
  "Apollo Client": { accent: "#311C87", hoverBg: "rgba(49,28,135,0.12)" },
  Axios: { accent: "#5A29E4", hoverBg: "rgba(90,41,228,0.12)" },
  fetch: { accent: "#F7DF1E", hoverBg: "rgba(247,223,30,0.10)" },
  "RTK Query": { accent: "#764ABC", hoverBg: "rgba(118,74,188,0.12)" },
  // Theme-aware: white border on dark, near-black on light (fixes light-mode slip)
  SWR: {
    accent: "light-dark(#111111, #ffffff)",
    hoverBg: "light-dark(rgba(0,0,0,0.06), rgba(255,255,255,0.06))",
  },
  "TanStack Query": { accent: "#EF4444", hoverBg: "rgba(239,68,68,0.12)" },
  URQL: { accent: "#6C63FF", hoverBg: "rgba(108,99,255,0.12)" },
};

export const HeroSection = () => (
  <section className="relative mb-0 overflow-clip px-6 pt-[60px] pb-16 text-center">
    <div className="pointer-events-none absolute inset-0 overflow-clip">
      <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[#5F4B8B]/[0.07] blur-[100px]" />
      <div className="absolute top-[10%] right-[-10%] h-[400px] w-[400px] rounded-full bg-[#7B68AE]/[0.05] blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[30%] h-[350px] w-[350px] rounded-full bg-[#3D2D6B]/[0.06] blur-[100px]" />
    </div>

    <div className="relative z-[2] mx-auto max-w-[720px]">
      <div className="mb-6 flex justify-center">
        <img
          alt="msw-devtools logo"
          className="h-24 w-24 rounded-[20px]"
          height={96}
          src={`${import.meta.env.BASE_URL}logo.png`}
          width={96}
        />
      </div>
      <h1 className="mt-0 mr-0 mb-4 ml-0 font-extrabold font-mono text-[clamp(1.75rem,4vw+1rem,2.5rem)] text-text-primary tracking-[-0.03em] transition-colors duration-300">
        @mugenlabs/
        <wbr />
        msw-devtools
      </h1>
      <p className="mt-0 mr-0 mb-8 ml-0 text-pretty text-lg text-text-muted leading-normal transition-colors duration-300">
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

      <div className="mx-auto mb-8 grid max-w-[600px] grid-cols-2 gap-2.5 text-left sm:grid-cols-3">
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
