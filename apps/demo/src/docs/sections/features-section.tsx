import { PenLine, Radio, RefreshCw, Shuffle, SlidersHorizontal, ToggleRight } from "lucide-react";

import { FeatureCard } from "../components/feature-card";

const FEATURES = [
  {
    description:
      "Enable or disable individual mock handlers with a single click. Disabled handlers pass requests straight through to the real network, so you can test real vs. mocked responses side by side — no code changes, no restarts.",
    icon: <ToggleRight size={18} />,
    title: "Toggle Mocks",
  },
  {
    description:
      "Define multiple response variants for the same endpoint — success, empty list, validation error, 404 — and swap between them from a dropdown. Perfect for exploring every UI state without writing throwaway code.",
    icon: <Shuffle size={18} />,
    title: "Switch Variants",
  },
  {
    description:
      "Edit response JSON, status codes, and headers directly in the panel. Need to test how your UI handles a 500? A missing field? Just change it and the response updates instantly — no handler code to touch.",
    icon: <PenLine size={18} />,
    title: "Live Overrides",
  },
  {
    description:
      "Every intercepted request is tracked in real time. Operations that are actively being called on the current page get a LIVE badge, so you can see at a glance which handlers are actually in use.",
    icon: <Radio size={18} />,
    title: "LIVE Tracking",
  },
  {
    description:
      'As your mock list grows, use built-in filtering and sorting to quickly find handlers by name, HTTP method, or status. Filter by "live" to see only the operations active on the current page.',
    icon: <SlidersHorizontal size={18} />,
    title: "Filter & Sort",
  },
  {
    description:
      "Register an adapter for your data-fetching library (TanStack Query, SWR, Apollo, URQL) and every mock change automatically invalidates the cache — your UI re-renders with fresh data without a page reload.",
    icon: <RefreshCw size={18} />,
    title: "Auto Refetch",
  },
] as const;

export const FeaturesSection = () => (
  <section className="px-6 py-20">
    <div className="mx-auto max-w-[720px]">
      <h2 className="mb-4 text-center font-extrabold text-[28px] text-text-primary tracking-tight transition-colors duration-300">
        Why msw-devtool?
      </h2>
      <p className="mx-auto mb-12 max-w-[540px] text-center text-base text-text-muted leading-relaxed transition-colors duration-300">
        Tired of commenting out handlers, hard-coding error responses, and refreshing the page every
        time you need a different mock? msw-devtool lets you toggle, swap, and override any MSW mock
        on the fly — right from the browser, without touching your code.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FEATURES.map((feature) => (
          <FeatureCard
            description={feature.description}
            icon={feature.icon}
            key={feature.title}
            title={feature.title}
          />
        ))}
      </div>
    </div>
  </section>
);
