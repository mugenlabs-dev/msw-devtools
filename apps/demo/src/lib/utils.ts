type ClassValue = string | false | null | undefined;

/**
 * Minimal `cn` helper used by the vendored lucide-animated icon components.
 * The demo app has no `clsx`/`tailwind-merge` dependency and the icons only
 * ever forward a single className, so plain filtering + joining is enough.
 */
export const cn = (...classes: ClassValue[]): string | undefined =>
  classes.filter(Boolean).join(" ") || undefined;

/** Whether the user prefers reduced motion (SSR-safe). */
export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Smooth scroll only when motion is OK. */
export const smoothScrollBehavior = (): ScrollBehavior =>
  prefersReducedMotion() ? "auto" : "smooth";

/** Intrinsic playground card grid — ~3 cols at ~1000px, 1 col on phones. */
export const playgroundCardsGrid =
  "mt-6 grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,17.5rem),1fr))]";
