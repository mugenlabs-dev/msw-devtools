import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { MotionConfig } from "motion/react";

import { ErrorPage, NotFoundPage } from "../error-page";
import { Layout } from "../layout";
import { ThemeProvider } from "../theme-context";

const SITE_URL = "https://msw-devtools.mugenlabs.dev/";
const SITE_DESCRIPTION =
  "A TanStack DevTools plugin for managing MSW mocks. Toggle, customize, and inspect your mock handlers in real time.";

const RootComponent = () => (
  <html data-theme="dark" lang="en" style={{ colorScheme: "dark" }}>
    <head>
      <title>@mugenlabs/msw-devtools</title>
      <HeadContent />
      <style
        // biome-ignore lint/security/noDangerouslySetInnerHtml: inline critical styles
        dangerouslySetInnerHTML={{
          __html: `
							:root {
								color-scheme: dark;
								--header-height: 60px;
								--accent-blue: light-dark(#2563eb, #6cb6ff);
								--accent-green: light-dark(#16a34a, #4ade80);
								--accent-purple: light-dark(#7c3aed, #a78bfa);
								--badge-graphql-bg: light-dark(#ede9fe, #3a1e5f);
								--badge-graphql-color: light-dark(#6d28d9, #a78bfa);
								--badge-lib-bg: light-dark(#dcfce7, #1a2a1a);
								--badge-lib-color: light-dark(#15803d, #4ade80);
								--badge-method-bg: light-dark(#dbeafe, #1e3a5f);
								--badge-method-color: light-dark(#1d4ed8, #60a5fa);
								--badge-rest-bg: light-dark(#dbeafe, #1e3a5f);
								--badge-rest-color: light-dark(#1d4ed8, #60a5fa);
								--bg-primary: light-dark(#f8f8f8, #0a0a0a);
								--bg-secondary: light-dark(#fff, #111);
								--bg-tertiary: light-dark(#eee, #1a1a1a);
								--border-primary: light-dark(#ddd, #222);
								--border-secondary: light-dark(#ccc, #333);
								--border-tertiary: light-dark(#bbb, #444);
								--card-bg: light-dark(#fff, #111);
								--code-bg: light-dark(rgba(0,0,0,0.05), rgba(255,255,255,0.06));
								--code-block-bg: light-dark(#1e293b, #0d1117);
								--header-bg: light-dark(rgba(248,248,248,0.85), rgba(10,10,10,0.85));
								--hero-btn-bg: light-dark(#1a1a1a, #fff);
								--hero-btn-color: light-dark(#fff, #000);
								--pill-bg: light-dark(#f0f0f0, #111);
								--pill-color: light-dark(#555, #aaa);
								--text-dimmed: light-dark(#999, #666);
								--text-muted: light-dark(#777, #888);
								--text-primary: light-dark(#1a1a1a, #fff);
								--text-secondary: light-dark(#333, #e0e0e0);
								--text-tertiary: light-dark(#555, #aaa);
							}
							html[data-theme="light"] { color-scheme: light; }
							html[data-theme="dark"] { color-scheme: dark; }
							body { margin: 0; min-height: 100svh; background: var(--bg-primary); }
							::view-transition-old(root),
							::view-transition-new(root) {
								animation: none;
								mix-blend-mode: normal;
							}
							::view-transition-old(root) { z-index: 1; }
							::view-transition-new(root) { z-index: 9999; }
						`,
        }}
      />
      {/* JSON-LD Structured Data */}
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            applicationCategory: "DeveloperApplication",
            description: SITE_DESCRIPTION,
            license: "https://opensource.org/licenses/MIT",
            name: "@mugenlabs/msw-devtools",
            offers: { "@type": "Offer", price: "0" },
            operatingSystem: "Web",
            url: SITE_URL,
          }),
        }}
        type="application/ld+json"
      />
    </head>
    <body className="min-h-svh font-sans">
      <MotionConfig reducedMotion="user">
        <ThemeProvider>
          <Layout>
            <Outlet />
          </Layout>
        </ThemeProvider>
      </MotionConfig>
      <Scripts />
    </body>
  </html>
);

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: ErrorPage,
  head: () => ({
    links: [
      {
        href: `${import.meta.env.BASE_URL}logo.png`,
        rel: "icon",
        type: "image/png",
      },
      { href: SITE_URL, rel: "canonical" },
    ],
    meta: [
      { charSet: "utf8" },
      { content: "width=device-width, initial-scale=1.0", name: "viewport" },
      { content: SITE_DESCRIPTION, name: "description" },
      { content: "#0a0a0a", name: "theme-color" },
      // Open Graph
      { content: "@mugenlabs/msw-devtools", property: "og:title" },
      { content: SITE_DESCRIPTION, property: "og:description" },
      { content: `${SITE_URL}og-image.png`, property: "og:image" },
      { content: "website", property: "og:type" },
      { content: SITE_URL, property: "og:url" },
      // Twitter Card
      { content: "summary_large_image", name: "twitter:card" },
      { content: "@mugenlabs/msw-devtools", name: "twitter:title" },
      { content: SITE_DESCRIPTION, name: "twitter:description" },
      { content: `${SITE_URL}og-image.png`, name: "twitter:image" },
    ],
    title: "@mugenlabs/msw-devtools",
  }),
  notFoundComponent: NotFoundPage,
});
