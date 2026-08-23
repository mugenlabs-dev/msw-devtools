import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

// Compact, self-contained mock replicas of the devtools UI — each one loops a
// tiny scripted animation showing exactly one feature. Colors mirror the
// plugin's own dark theme so the demos read as slices of the real panel.

const IN_VIEW_THRESHOLD = 0.3;

/** Cycles 0..steps-1 while the demo is on screen; pauses when scrolled away. */
const useDemoPhase = (steps: number, intervalMs: number) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        setInView(entries.some((entry) => entry.isIntersecting));
      },
      { threshold: IN_VIEW_THRESHOLD }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!inView) {
      return;
    }
    const id = window.setInterval(() => {
      setPhase((p) => (p + 1) % steps);
    }, intervalMs);
    return () => {
      window.clearInterval(id);
    };
  }, [inView, steps, intervalMs]);

  return { phase, ref };
};

// Fixed heights (tallest phase + a two-line caption slot) so cycling phases
// never resizes the box and causes layout shift.
const DemoShell = ({ caption, children }: { caption: string; children: ReactNode }) => (
  <div className="w-full rounded-xl border border-[#333] bg-[#1e1e1e] p-4 font-mono text-[11px] shadow-[0_12px_32px_rgba(0,0,0,0.3)]">
    <div className="flex h-[152px] flex-col justify-center gap-2">{children}</div>
    <div className="mt-3 border-[#2a2a2a] border-t pt-2.5">
      <p className="m-0 h-[30px] overflow-hidden font-sans text-[#888] text-[11px] leading-[15px]">
        {caption}
      </p>
    </div>
  </div>
);

const MockSwitch = ({ on }: { on: boolean }) => (
  <span
    className={`flex h-4 w-7 shrink-0 items-center rounded-full px-0.5 transition-colors duration-300 ${on ? "bg-[#4ade80]/70" : "bg-[#444]"}`}
  >
    <span
      className={`size-3 rounded-full bg-white transition-transform duration-300 ${on ? "translate-x-3" : "translate-x-0"}`}
    />
  </span>
);

const TypeTag = ({ type }: { type: "GQL" | "REST" }) => (
  <span
    className={`rounded px-1 py-px text-[9px] ${type === "REST" ? "bg-[#3b82f6]/20 text-[#60a5fa]" : "bg-[#e535ab]/20 text-[#e879b9]"}`}
  >
    {type}
  </span>
);

const LiveBadge = ({ on }: { on: boolean }) => (
  <span
    className={`rounded bg-[#3b82f6] px-1 py-px text-[9px] text-white transition-opacity duration-300 ${on ? "animate-pulse opacity-100" : "opacity-0"}`}
  >
    LIVE
  </span>
);

const OpName = ({ children }: { children: ReactNode }) => (
  <span className="truncate text-[#e0e0e0]">{children}</span>
);

// ---------------------------------------------------------------------------
// 1. Toggle Mocks — flip a handler off and watch it pass through
// ---------------------------------------------------------------------------

const TOGGLE_CAPTIONS = [
  "GET Charizard is mocked — instant, deterministic responses.",
  "One click disables the mock…",
  "…and requests pass straight through to the real PokéAPI.",
  "Toggle it back — no restarts, no code changes.",
];

export const ToggleMocksDemo = () => {
  const { phase, ref } = useDemoPhase(TOGGLE_CAPTIONS.length, 1900);
  const mocked = phase === 0 || phase === 3;

  return (
    <div ref={ref}>
      <DemoShell caption={TOGGLE_CAPTIONS[phase]}>
        <div className="flex items-center justify-between gap-2 rounded-md bg-[#1a1a1a] px-2.5 py-2">
          <span className="flex min-w-0 items-center gap-1.5">
            <TypeTag type="REST" />
            <OpName>GET Charizard</OpName>
          </span>
          <MockSwitch on={mocked} />
        </div>
        <div
          className={`px-2.5 transition-colors duration-300 ${mocked ? "text-[#a5b4fc]" : "text-[#fbbf24]"}`}
        >
          → 200 · {mocked ? "mock · 21 ms" : "real network · 174 ms"}
        </div>
        <div className="flex items-center justify-between gap-2 rounded-md bg-[#1a1a1a] px-2.5 py-2 opacity-60">
          <span className="flex min-w-0 items-center gap-1.5">
            <TypeTag type="REST" />
            <OpName>GET Gengar</OpName>
          </span>
          <MockSwitch on />
        </div>
      </DemoShell>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 2. Switch Variants — swap responses from a dropdown
// ---------------------------------------------------------------------------

const VARIANT_STEPS = [
  {
    caption: "GetPancham serves its default response…",
    label: "Default",
    response: '{ name: "pancham", types: ["fighting"] }',
  },
  {
    caption: "…until you pick another variant from the dropdown.",
    label: "Not Found (empty)",
    response: "[]  · the UI shows its empty state",
  },
];

export const SwitchVariantsDemo = () => {
  const { phase, ref } = useDemoPhase(VARIANT_STEPS.length, 2400);
  const step = VARIANT_STEPS[phase];

  return (
    <div ref={ref}>
      <DemoShell caption={step.caption}>
        <div className="flex items-center justify-between gap-2 rounded-md bg-[#1a1a1a] px-2.5 py-2">
          <span className="flex min-w-0 items-center gap-1.5">
            <TypeTag type="GQL" />
            <OpName>GetPancham</OpName>
          </span>
        </div>
        <div className="flex items-center gap-2 px-2.5">
          <span className="text-[#666]">variant</span>
          <span className="flex items-center gap-2 rounded border border-[#444] bg-[#252525] px-2 py-1 text-[#e0e0e0] transition-colors duration-300">
            {step.label}
            <span className="text-[#666] text-[9px]">▾</span>
          </span>
        </div>
        <div className="truncate px-2.5 text-[#8b8b8b] transition-opacity duration-300">
          → {step.response}
        </div>
      </DemoShell>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 3. Live Overrides — edit status / JSON right in the panel
// ---------------------------------------------------------------------------

const STATUS_OPTIONS = [200, 401, 404, 500] as const;

const OVERRIDE_STEPS: { caption: string; status: number; weight: string }[] = [
  { caption: "The captured response, ready to edit.", status: 200, weight: "905" },
  { caption: "Need to test your error UI? Force a 500.", status: 500, weight: "905" },
  { caption: "Or rewrite the JSON body on the fly.", status: 200, weight: "9001" },
  { caption: "Every change applies to the next request instantly.", status: 200, weight: "905" },
];

export const LiveOverridesDemo = () => {
  const { phase, ref } = useDemoPhase(OVERRIDE_STEPS.length, 2100);
  const step = OVERRIDE_STEPS[phase];
  const edited = step.weight !== "905";

  return (
    <div ref={ref}>
      <DemoShell caption={step.caption}>
        <div className="flex items-center gap-1.5 px-1">
          <span className="mr-1 text-[#666]">status</span>
          {STATUS_OPTIONS.map((code) => {
            const activeClasses =
              code === 200
                ? "border-[#4ade80]/60 bg-[#4ade80]/15 text-[#4ade80]"
                : "border-[#ef4444]/60 bg-[#ef4444]/15 text-[#ef4444]";
            return (
              <span
                className={`rounded border px-1.5 py-0.5 transition-colors duration-300 ${
                  step.status === code ? activeClasses : "border-[#333] text-[#666]"
                }`}
                key={code}
              >
                {code}
              </span>
            );
          })}
        </div>
        <div className="rounded-md bg-[#161616] px-2.5 py-2 leading-relaxed">
          <div className="text-[#8b8b8b]">{"{"}</div>
          <div className="pl-3 text-[#8b8b8b]">
            <span className="text-[#93c5fd]">"name"</span>:{" "}
            <span className="text-[#fca5a5]">"charizard"</span>,
          </div>
          <div className="pl-3 text-[#8b8b8b]">
            <span className="text-[#93c5fd]">"weight"</span>:{" "}
            <span
              className={`rounded px-0.5 transition-colors duration-300 ${edited ? "bg-[#6366f1]/30 text-[#c7d2fe]" : "text-[#fcd34d]"}`}
            >
              {step.weight}
            </span>
          </div>
          <div className="text-[#8b8b8b]">{"}"}</div>
        </div>
      </DemoShell>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 4. LIVE Tracking — badges light up as requests are intercepted
// ---------------------------------------------------------------------------

const TRACKING_OPS: { live: number[]; caption: string }[] = [
  { caption: "The page loads quietly — nothing tracked yet.", live: [] },
  { caption: "A request fires: its operation is flagged LIVE.", live: [0] },
  { caption: "Every intercepted call lights up its handler.", live: [0, 1] },
  { caption: "So you always know which mocks this page really uses.", live: [0, 1, 2] },
];

const TRACKING_ROWS: { name: string; type: "GQL" | "REST" }[] = [
  { name: "GET Charizard", type: "REST" },
  { name: "GetPancham", type: "GQL" },
  { name: "GET Gengar", type: "REST" },
];

export const LiveTrackingDemo = () => {
  const { phase, ref } = useDemoPhase(TRACKING_OPS.length, 1800);
  const step = TRACKING_OPS[phase];

  return (
    <div ref={ref}>
      <DemoShell caption={step.caption}>
        {TRACKING_ROWS.map((row, index) => (
          <div
            className="flex items-center justify-between gap-2 rounded-md bg-[#1a1a1a] px-2.5 py-2"
            key={row.name}
          >
            <span className="flex min-w-0 items-center gap-1.5">
              <TypeTag type={row.type} />
              <OpName>{row.name}</OpName>
            </span>
            <LiveBadge on={step.live.includes(index)} />
          </div>
        ))}
      </DemoShell>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 5. Filter & Sort — cut a long handler list down to what matters
// ---------------------------------------------------------------------------

const FILTER_CHIPS = ["All", "Live", "REST", "GraphQL"] as const;

const FILTER_CAPTIONS = [
  "36 handlers registered? The list view shows them all…",
  "…filter by “live” to see what this page actually calls…",
  "…or by protocol when you're hunting one handler down.",
  "GraphQL only — combined with sorting, nothing hides.",
];

const FILTER_ROWS: { live: boolean; name: string; type: "GQL" | "REST" }[] = [
  { live: true, name: "GET Charizard", type: "REST" },
  { live: true, name: "GetPancham", type: "GQL" },
  { live: false, name: "GET Gengar", type: "REST" },
  { live: false, name: "GetSnorlax", type: "GQL" },
];

const rowVisible = (row: (typeof FILTER_ROWS)[number], chip: (typeof FILTER_CHIPS)[number]) => {
  if (chip === "All") {
    return true;
  }
  if (chip === "Live") {
    return row.live;
  }
  if (chip === "REST") {
    return row.type === "REST";
  }
  return row.type === "GQL";
};

export const FilterSortDemo = () => {
  const { phase, ref } = useDemoPhase(FILTER_CHIPS.length, 2000);
  const chip = FILTER_CHIPS[phase];

  return (
    <div ref={ref}>
      <DemoShell caption={FILTER_CAPTIONS[phase]}>
        <div className="flex items-center gap-1.5 px-1">
          {FILTER_CHIPS.map((label) => (
            <span
              className={`rounded border px-1.5 py-0.5 transition-colors duration-300 ${
                chip === label
                  ? "border-[#6366f1]/70 bg-[#6366f1]/20 text-[#a5b4fc]"
                  : "border-[#333] text-[#666]"
              }`}
              key={label}
            >
              {label}
            </span>
          ))}
        </div>
        {/* Fixed-height list so collapsing rows never re-center the filter chips. */}
        <div className="flex h-[118px] flex-col gap-1.5">
          {FILTER_ROWS.map((row) => {
            const visible = rowVisible(row, chip);
            return (
              <div
                className={`flex items-center justify-between gap-2 overflow-hidden rounded-md bg-[#1a1a1a] px-2.5 transition-all duration-300 ${visible ? "max-h-8 py-1.5 opacity-100" : "max-h-0 py-0 opacity-0"}`}
                key={row.name}
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  <TypeTag type={row.type} />
                  <OpName>{row.name}</OpName>
                </span>
                <LiveBadge on={row.live} />
              </div>
            );
          })}
        </div>
      </DemoShell>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 6. Auto Refetch — mock changes invalidate your data library's cache
// ---------------------------------------------------------------------------

const REFETCH_STEPS: {
  app: "data" | "empty" | "loading";
  caption: string;
  variant: string;
}[] = [
  { app: "data", caption: "Your app renders data from the mock, as usual.", variant: "Default" },
  {
    app: "loading",
    caption: "Switch the variant — the adapter invalidates the cache…",
    variant: "Not Found (empty)",
  },
  {
    app: "empty",
    caption: "…and the UI re-renders with the new response. No reload.",
    variant: "Not Found (empty)",
  },
  {
    app: "loading",
    caption: "Works with TanStack Query, RTK Query, SWR, Apollo, URQL.",
    variant: "Default",
  },
];

const Spinner = () => (
  <span className="size-3 animate-spin rounded-full border border-[#6366f1] border-t-transparent" />
);

export const AutoRefetchDemo = () => {
  const { phase, ref } = useDemoPhase(REFETCH_STEPS.length, 1900);
  const step = REFETCH_STEPS[phase];

  return (
    <div ref={ref}>
      <DemoShell caption={step.caption}>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="rounded-md bg-[#1a1a1a] px-2.5 py-2">
            <div className="mb-1 text-[#666] text-[9px] uppercase tracking-wide">Panel</div>
            <div className="truncate text-[#e0e0e0]">GetPancham</div>
            <div className="mt-1 flex items-center gap-1.5 truncate rounded border border-[#444] bg-[#252525] px-1.5 py-0.5 text-[#e0e0e0] text-[10px] transition-colors duration-300">
              <span className="truncate">{step.variant}</span>
              <span className="shrink-0 text-[#666] text-[8px]">▾</span>
            </div>
          </div>
          <span
            className={`text-[#6366f1] transition-opacity duration-300 ${step.app === "loading" ? "opacity-100" : "opacity-25"}`}
          >
            ⇢
          </span>
          <div className="rounded-md bg-[#1a1a1a] px-2.5 py-2">
            <div className="mb-1 text-[#666] text-[9px] uppercase tracking-wide">Your app</div>
            {step.app === "loading" ? (
              <div className="flex h-8 items-center gap-1.5 text-[#888]">
                <Spinner />
                refetching…
              </div>
            ) : null}
            {step.app === "data" ? (
              <div className="h-8">
                <div className="truncate text-[#e0e0e0]">pancham</div>
                <div className="text-[#666] text-[10px]">fighting · 80 wt</div>
              </div>
            ) : null}
            {step.app === "empty" ? (
              <div className="flex h-8 items-center text-[#888]">No Pokémon found</div>
            ) : null}
          </div>
        </div>
      </DemoShell>
    </div>
  );
};
