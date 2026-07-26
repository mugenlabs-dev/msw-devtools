type ClassValue = string | false | null | undefined;

/**
 * Minimal `cn` helper used by the vendored lucide-animated icon components.
 * The demo app has no `clsx`/`tailwind-merge` dependency and the icons only
 * ever forward a single className, so plain filtering + joining is enough.
 */
export const cn = (...classes: ClassValue[]): string | undefined =>
  classes.filter(Boolean).join(" ") || undefined;
