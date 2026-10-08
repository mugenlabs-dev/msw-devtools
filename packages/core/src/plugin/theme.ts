/**
 * Internal plugin chrome tokens. Not part of the public package API.
 * Colors use OKLCH (and color-mix for a few derived surfaces) matched to the
 * prior hex palette — visual delta kept near-identical.
 */
const accent = "oklch(58.5% 0.204 277.1)";
const accentLight = "oklch(70.9% 0.159 293.5)";
const error = "oklch(63.7% 0.208 25.3)";
const success = "oklch(80% 0.182 151.7)";
const rest = "oklch(71.4% 0.143 254.6)";
const graphql = accentLight;

export const theme = {
  colors: {
    accent,
    accentBg: "oklch(36.3% 0.055 283.3)",
    // Slight lighten of accentBg (#454565 vs #3a3a5a)
    accentBgHover: "color-mix(in oklch, oklch(36.3% 0.055 283.3) 93.5%, oklch(100% 0 0))",
    accentLight,
    background: "oklch(23.5% 0 0)",
    black: "oklch(0% 0 0)",
    border: "oklch(32.1% 0 0)",
    borderActive: rest,
    borderInput: "oklch(38.7% 0 0)",
    borderSelected: accent,
    error,
    errorBg: "oklch(26.4% 0.051 21.1)",
    errorBgHover: "color-mix(in oklch, oklch(26.4% 0.051 21.1) 94.5%, oklch(100% 0 0))",
    gqlMutation: { bg: "oklch(31.1% 0.111 299.7)", color: graphql },
    gqlQuery: { bg: "oklch(34.6% 0.074 256)", color: rest },
    graphql,
    graphqlBg: "oklch(27.6% 0.09 296.3)",
    info: "oklch(62.3% 0.188 259.8)",
    methodDelete: { bg: "oklch(33.7% 0.095 23.7)", color: error },
    methodGet: { bg: "oklch(34.6% 0.074 256)", color: rest },
    methodPatch: { bg: "oklch(31.1% 0.111 299.7)", color: graphql },
    methodPost: { bg: "oklch(43.4% 0.09 154.7)", color: success },
    methodPut: { bg: "oklch(38.6% 0.067 56.2)", color: "oklch(75.8% 0.159 55.9)" },
    rest,
    restBg: "oklch(30.2% 0.063 260.3)",
    success,
    successBg: "oklch(31.5% 0.067 143.8)",
    successBgHover: "color-mix(in oklch, oklch(31.5% 0.067 143.8) 92.5%, oklch(100% 0 0))",
    successHover: "oklch(83.6% 0.174 153.3)",
    surface: "oklch(21.8% 0 0)",
    surfaceGroupHeader: "oklch(24.3% 0.03 283.9)",
    surfaceGroupHeaderHover: "oklch(28.2% 0.047 282.9)",
    surfaceHover: "oklch(28.5% 0 0)",
    surfaceHoverStrong: "oklch(32.1% 0 0)",
    surfaceSelected: "oklch(29.2% 0.029 284.5)",
    textDimmed: "oklch(45% 0 0)",
    textDisabled: "oklch(84.5% 0 0)",
    textLabel: "oklch(70.6% 0 0)",
    textMuted: "oklch(51% 0 0)",
    textPrimary: "oklch(90.7% 0 0)",
    textSecondary: "oklch(62.7% 0 0)",
    toggleOff: "oklch(38.7% 0 0)",
    toggleOffHover: "oklch(45% 0 0)",
    warning: "oklch(86.1% 0.173 91.9)",
    warningBg: "oklch(34% 0.05 108.8)",
    white: "oklch(100% 0 0)",
  },

  duration: {
    fast: "0.15s",
  },

  ease: {
    out: "cubic-bezier(0.22, 1, 0.36, 1)",
  },

  fontFamily: {
    mono: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace',
    sans: "system-ui, -apple-system, sans-serif",
  },

  fontSize: {
    base: "12px",
    lg: "13px",
    md: "11px",
    sm: "10px",
    xl: "14px",
    xs: "9px",
  },

  radius: {
    lg: "6px",
    md: "4px",
    pill: "10px",
    round: "50%",
    sm: "3px",
  },

  spacing: {
    lg: "8px",
    md: "6px",
    sm: "4px",
    xl: "12px",
    xs: "2px",
  },
} as const;

/** Named CSS transition with the shared ease-out token. */
export const transition = (property: string): string =>
  `${property} ${theme.duration.fast} ${theme.ease.out}`;

/**
 * Base styles for the six panel inputs that previously used outline:none.
 * Pair with `data-msw-dt-input` so injected CSS can apply :focus-visible rings.
 */
export const focusableInputStyle = {
  outline: "2px solid transparent",
  outlineOffset: "2px",
} as const;
