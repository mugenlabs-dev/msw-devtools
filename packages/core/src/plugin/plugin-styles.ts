import { theme } from "./theme";

const STYLE_ID = "msw-devtools-plugin-styles";

/**
 * Inject once: focus-visible rings, 44px hit-area pseudos, reduced-motion.
 * Kept as a JS-injected stylesheet so `sideEffects: false` stays accurate
 * (no separate CSS import for bundlers to drop).
 */
export const ensurePluginStyles = (): void => {
  if (typeof document === "undefined") {
    return;
  }
  if (document.getElementById(STYLE_ID) != null) {
    return;
  }

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
[data-msw-dt-input]:focus-visible {
  outline: 2px solid ${theme.colors.accent} !important;
  outline-offset: 2px;
}

[data-msw-dt-hit] {
  position: relative;
}

[data-msw-dt-hit]::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: max(100%, 44px);
  height: max(100%, 44px);
  transform: translate(-50%, -50%);
}

@media (prefers-reduced-motion: reduce) {
  [data-msw-dt-motion] {
    transition: none !important;
  }
}
`.trim();
  document.head.appendChild(style);
};
