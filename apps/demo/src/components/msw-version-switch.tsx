/**
 * Full-page links between the MSW 3 demo playground and the MSW 2 playground.
 * Separate apps, separate service-worker scopes — switching must navigate, not soft-route.
 */
export type MswMajor = "2" | "3";

const STYLES = {
  active: {
    background: "oklch(36.3% 0.055 283.3)",
    border: "1px solid oklch(58.5% 0.204 277.1)",
    color: "oklch(90.7% 0 0)",
  },
  idle: {
    background: "transparent",
    border: "1px solid oklch(38.7% 0 0)",
    color: "oklch(70.6% 0 0)",
  },
  link: {
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    padding: "6px 12px",
    textDecoration: "none",
  },
  wrap: {
    alignItems: "center",
    display: "inline-flex",
    flexWrap: "wrap" as const,
    gap: "8px",
    justifyContent: "center",
  },
};

export const MswVersionSwitch = ({
  active,
  msw2Href = "/msw2/query",
  msw3Href = "/playground/query",
}: {
  active: MswMajor;
  msw2Href?: string;
  msw3Href?: string;
}) => (
  <nav aria-label="MSW major version" data-testid="msw-version-switch" style={STYLES.wrap}>
    <span style={{ color: "oklch(62.7% 0 0)", fontSize: "12px", fontWeight: 600 }}>MSW</span>
    <a
      aria-current={active === "3" ? "page" : undefined}
      data-active={active === "3" ? "true" : "false"}
      data-testid="msw-switch-3"
      href={msw3Href}
      style={{ ...STYLES.link, ...(active === "3" ? STYLES.active : STYLES.idle) }}
    >
      3.x
    </a>
    <a
      aria-current={active === "2" ? "page" : undefined}
      data-active={active === "2" ? "true" : "false"}
      data-testid="msw-switch-2"
      href={msw2Href}
      style={{ ...STYLES.link, ...(active === "2" ? STYLES.active : STYLES.idle) }}
    >
      2.x
    </a>
  </nav>
);
