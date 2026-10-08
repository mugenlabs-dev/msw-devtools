/** Canonical public site used in copy, JSON-LD, and absolute markdown links. */
export const SITE_URL = "https://msw-devtools.mugenlabs.dev/";

export const SITE_NAME = "@mugenlabs/msw-devtools";

export const SITE_DESCRIPTION =
  "Mugen Labs MSW DevTools plugin for TanStack DevTools — toggle, customize, and inspect Mock Service Worker handlers in real time.";

export const ORG_NAME = "Mugen Labs";

export const GITHUB_REPO_URL = "https://github.com/mugenlabs-dev/msw-devtools";

export const GITHUB_ISSUES_URL = `${GITHUB_REPO_URL}/issues`;

export const NPM_URL = "https://www.npmjs.com/package/@mugenlabs/msw-devtools";

export const ORG_HOME_URL = "https://www.mugenlabs.dev/";

/**
 * Organization contact facts for JSON-LD.
 * Email, telephone, and postal address are intentionally omitted until Yago
 * supplies authored values — inventing them would fail the honesty bar.
 */
export const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "technical support",
    url: GITHUB_ISSUES_URL,
  },
  name: ORG_NAME,
  sameAs: ["https://github.com/mugenlabs-dev", GITHUB_REPO_URL, NPM_URL, SITE_URL],
  url: ORG_HOME_URL,
} as const;
