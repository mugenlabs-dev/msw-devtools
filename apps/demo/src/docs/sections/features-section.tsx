import { PenLine, Shuffle, ToggleRight } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { RadioIcon } from "../../components/icons/radio";
import { RefreshCWIcon } from "../../components/icons/refresh-cw";
import { SlidersHorizontalIcon } from "../../components/icons/sliders-horizontal";
import type { AnimatedIconComponent, AnimatedIconHandle } from "../../components/icons/types";
import {
  AutoRefetchDemo,
  FilterSortDemo,
  LiveOverridesDemo,
  LiveTrackingDemo,
  SwitchVariantsDemo,
  ToggleMocksDemo,
} from "../components/feature-demos";

const ICON_SIZE = 18;

/**
 * Drives a vendored lucide-animated icon from the parent row's hover state, so
 * the animation fires when hovering anywhere on the row (not just the icon).
 */
const AnimatedFeatureIcon = ({
  hovered,
  icon: Icon,
}: {
  hovered: boolean;
  icon: AnimatedIconComponent;
}) => {
  const ref = useRef<AnimatedIconHandle>(null);

  useEffect(() => {
    if (hovered) {
      ref.current?.startAnimation();
    } else {
      ref.current?.stopAnimation();
    }
  }, [hovered]);

  return <Icon aria-hidden className="flex" ref={ref} size={ICON_SIZE} />;
};

const FEATURES: {
  demo: ComponentType;
  description: string;
  icon: (hovered: boolean) => ReactNode;
  title: string;
}[] = [
  {
    demo: ToggleMocksDemo,
    description:
      "Enable or disable individual mock handlers with a single click. Disabled handlers pass requests straight through to the real network, so you can test real vs. mocked responses side by side — no code changes, no restarts.",
    icon: () => <ToggleRight size={ICON_SIZE} />,
    title: "Toggle Mocks",
  },
  {
    demo: SwitchVariantsDemo,
    description:
      "Define multiple response variants for the same endpoint — success, empty list, validation error, 404 — and swap between them from a dropdown. Perfect for exploring every UI state without writing throwaway code.",
    icon: () => <Shuffle size={ICON_SIZE} />,
    title: "Switch Variants",
  },
  {
    demo: LiveOverridesDemo,
    description:
      "Edit response JSON, status codes, and headers directly in the panel. Need to test how your UI handles a 500? A missing field? Just change it and the response updates instantly — no handler code to touch.",
    icon: () => <PenLine size={ICON_SIZE} />,
    title: "Live Overrides",
  },
  {
    demo: LiveTrackingDemo,
    description:
      "Every intercepted request is tracked in real time. Operations that are actively being called on the current page get a LIVE badge, so you can see at a glance which handlers are actually in use.",
    icon: (hovered: boolean) => <AnimatedFeatureIcon hovered={hovered} icon={RadioIcon} />,
    title: "LIVE Tracking",
  },
  {
    demo: FilterSortDemo,
    description:
      'As your mock list grows, use built-in filtering and sorting to quickly find handlers by name, HTTP method, or status. Filter by "live" to see only the operations active on the current page.',
    icon: (hovered: boolean) => (
      <AnimatedFeatureIcon hovered={hovered} icon={SlidersHorizontalIcon} />
    ),
    title: "Filter & Sort",
  },
  {
    demo: AutoRefetchDemo,
    description:
      "Register an adapter for your data-fetching library (TanStack Query, RTK Query, SWR, Apollo, URQL) and every mock change automatically invalidates the cache — your UI re-renders with fresh data without a page reload.",
    icon: (hovered: boolean) => <AnimatedFeatureIcon hovered={hovered} icon={RefreshCWIcon} />,
    title: "Auto Refetch",
  },
];

const FeatureRow = ({
  demo: Demo,
  description,
  flipped,
  icon,
  title,
}: {
  demo: ComponentType;
  description: string;
  flipped: boolean;
  icon: (hovered: boolean) => ReactNode;
  title: string;
}) => {
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
  }, []);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: cosmetic hover effects only
    <div
      className="grid grid-cols-1 items-center gap-6 lg:grid-cols-2 lg:gap-12"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="presentation"
    >
      <div className={flipped ? "lg:order-2" : ""}>
        <div className="mb-2 flex items-center gap-2">
          <span
            className={`transition-colors duration-200 ${hovered ? "text-accent-purple" : "text-text-muted"}`}
          >
            {icon(hovered)}
          </span>
          <h3 className="m-0 font-semibold text-[17px] text-text-primary transition-colors duration-300">
            {title}
          </h3>
        </div>
        <p className="m-0 text-sm text-text-muted leading-relaxed transition-colors duration-300">
          {description}
        </p>
      </div>
      <div className={flipped ? "lg:order-1" : ""}>
        <Demo />
      </div>
    </div>
  );
};

export const FeaturesSection = () => (
  <section className="px-6 py-20">
    <div className="mx-auto max-w-[880px]">
      <h2 className="mb-4 text-center font-extrabold text-[28px] text-text-primary tracking-tight transition-colors duration-300">
        Why @mugenlabs/msw-devtools?
      </h2>
      <p className="mx-auto mb-14 max-w-[540px] text-center text-base text-text-muted leading-relaxed transition-colors duration-300">
        Tired of commenting out handlers, hard-coding error responses, and refreshing the page every
        time you need a different mock? @mugenlabs/msw-devtools lets you toggle, swap, and override
        any MSW mock on the fly — right from the browser, without touching your code.
      </p>

      <div className="flex flex-col gap-14">
        {FEATURES.map((feature, index) => (
          <FeatureRow
            demo={feature.demo}
            description={feature.description}
            flipped={index % 2 === 1}
            icon={feature.icon}
            key={feature.title}
            title={feature.title}
          />
        ))}
      </div>
    </div>
  </section>
);
