/**
 * Full-page links between the MSW 3 demo playground and the MSW 2 playground.
 * Separate apps, separate service-worker scopes — switching must navigate, not soft-route.
 */
import { SEGMENT, SEGMENT_ACTIVE, SEGMENT_IDLE, SEGMENTED_GROUP } from "./segmented-control";

export type MswMajor = "2" | "3";

const VersionLink = ({
  active,
  href,
  major,
}: {
  active: boolean;
  href: string;
  major: MswMajor;
}) => (
  <a
    aria-current={active ? "page" : undefined}
    className={`${SEGMENT} ${active ? SEGMENT_ACTIVE : SEGMENT_IDLE}`}
    data-active={active ? "true" : "false"}
    data-testid={`msw-switch-${major}`}
    href={href}
  >
    {major}.x
  </a>
);

export const MswVersionSwitch = ({
  active,
  msw2Href = "/msw2/query",
  msw3Href = "/playground/query",
}: {
  active: MswMajor;
  msw2Href?: string;
  msw3Href?: string;
}) => (
  <nav
    aria-label="MSW major version"
    className="inline-flex items-center gap-2"
    data-testid="msw-version-switch"
  >
    <span className="text-text-muted text-xs font-semibold">MSW</span>
    <span className={SEGMENTED_GROUP}>
      <VersionLink active={active === "3"} href={msw3Href} major="3" />
      <VersionLink active={active === "2"} href={msw2Href} major="2" />
    </span>
  </nav>
);
