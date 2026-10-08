/**
 * Shared public facts for agent-facing infrastructure.
 * Keep this mechanical: existing package/site facts only.
 * Content/prose expansions belong in the content PR (llms.txt, trust pages, etc.).
 */

/** Canonical public site URL (trailing slash). */
export const SITE_URL = "https://msw-devtools.mugenlabs.dev/";

/** Existing homepage / meta description (do not invent marketing copy). */
export const SITE_DESCRIPTION =
  "A TanStack DevTools plugin for managing MSW mocks. Toggle, customize, and inspect your mock handlers in real time.";

export const PACKAGE_NAME = "@mugenlabs/msw-devtools";

export const GITHUB_REPO_URL = "https://github.com/mugenlabs-dev/msw-devtools";

export const NPM_PACKAGE_URL = "https://www.npmjs.com/package/@mugenlabs/msw-devtools";

export const GITHUB_ORG_URL = "https://github.com/mugenlabs-dev";

/** SPA routes that exist in apps/demo (TanStack Router). */
export const KNOWN_HTML_ROUTES = Object.freeze([
  "/",
  "/playground",
  "/playground/",
  "/playground/apollo",
  "/playground/fetch",
  "/playground/query",
  "/playground/rtk-query",
  "/playground/swr",
  "/playground/urql",
]);

/** Routes listed in the public sitemap (homepage + playground entry). */
export const SITEMAP_ROUTES = Object.freeze([
  { changefreq: "weekly", path: "/", priority: "1.0" },
  { changefreq: "weekly", path: "/playground", priority: "0.8" },
  { changefreq: "monthly", path: "/playground/query", priority: "0.5" },
  { changefreq: "monthly", path: "/playground/fetch", priority: "0.5" },
  { changefreq: "monthly", path: "/playground/swr", priority: "0.5" },
  { changefreq: "monthly", path: "/playground/apollo", priority: "0.5" },
  { changefreq: "monthly", path: "/playground/urql", priority: "0.5" },
  { changefreq: "monthly", path: "/playground/rtk-query", priority: "0.5" },
]);

/**
 * Minimal homepage Markdown from existing public facts.
 * Content PR: expand when-to-use guidance / llms.txt body here if desired.
 */
export function homepageMarkdown(origin) {
  const base = origin.replace(/\/$/, "");
  return `# ${PACKAGE_NAME}

${SITE_DESCRIPTION}

## Links

- Site: ${base}/
- Playground: ${base}/playground
- npm: ${NPM_PACKAGE_URL}
- GitHub: ${GITHUB_REPO_URL}
- OpenAPI: ${base}/openapi.json
- Site catalog API: ${base}/api/v1/site
- Sitemap: ${base}/sitemap.xml
`;
}

/**
 * Markdown 404 body (status must still be 404/410).
 * Content PR: may point at llms.txt once that file ships.
 */
export function notFoundMarkdown(origin, pathname) {
  const base = origin.replace(/\/$/, "");
  return `# Page not found

No resource exists at \`${pathname}\` on this demo site.

Recover using one of these public indexes:

- Home / docs: ${base}/
- Playground: ${base}/playground
- Sitemap: ${base}/sitemap.xml
- OpenAPI: ${base}/openapi.json
- Site catalog: ${base}/api/v1/site
- Source: ${GITHUB_REPO_URL}
`;
}

export function isKnownHtmlPath(pathname) {
  if (KNOWN_HTML_ROUTES.includes(pathname)) {
    return true;
  }
  // Normalize trailing slash variants for playground children.
  if (pathname.endsWith("/") && pathname.length > 1) {
    return KNOWN_HTML_ROUTES.includes(pathname.slice(0, -1));
  }
  return KNOWN_HTML_ROUTES.includes(`${pathname}/`);
}

/**
 * Whether the client prefers a Markdown representation.
 * Honors explicit text/markdown and q-values vs text/html.
 */
export function prefersMarkdown(acceptHeader) {
  if (!acceptHeader) {
    return false;
  }

  let markdownQ = Number.NaN;
  let htmlQ = Number.NaN;

  for (const part of acceptHeader.split(",")) {
    const segments = part
      .trim()
      .split(";")
      .map((s) => s.trim());
    const mediaType = segments[0]?.toLowerCase();
    if (!mediaType) {
      continue;
    }

    let q = 1;
    for (const param of segments.slice(1)) {
      if (param.startsWith("q=")) {
        const parsed = Number(param.slice(2));
        if (!Number.isNaN(parsed)) {
          q = parsed;
        }
      }
    }

    if (mediaType === "text/markdown") {
      markdownQ = q;
    } else if (mediaType === "text/html") {
      htmlQ = q;
    }
  }

  if (Number.isNaN(markdownQ)) {
    return false;
  }
  if (Number.isNaN(htmlQ)) {
    return true;
  }
  return markdownQ >= htmlQ;
}

export function siteCatalog(origin) {
  const base = origin.replace(/\/$/, "");
  return {
    description: SITE_DESCRIPTION,
    github: GITHUB_REPO_URL,
    links: {
      homepage: `${base}/`,
      openapi: `${base}/openapi.json`,
      playground: `${base}/playground`,
      sitemap: `${base}/sitemap.xml`,
    },
    name: PACKAGE_NAME,
    npm: NPM_PACKAGE_URL,
    organization: {
      name: "Mugenlabs",
      url: GITHUB_ORG_URL,
    },
    routes: [...KNOWN_HTML_ROUTES],
    /**
     * Demo MSW handlers intercept third-party Pokemon APIs in the browser only.
     * They are not a publicly reachable server API on this host — do not advertise them as one.
     */
    serverApi: {
      note: "This host exposes a small read-only site catalog for agent discovery. Browser MSW mocks in the playground are client-side only and are not served as HTTP APIs here.",
      openapi: `${base}/openapi.json`,
    },
  };
}
