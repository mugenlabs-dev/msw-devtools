import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";

import {
  GITHUB_REPO_URL,
  NPM_URL,
  ORG_JSON_LD,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "../content/site";
import { ErrorPage, NotFoundPage } from "../error-page";
import { Layout } from "../layout";
import { ThemeProvider } from "../theme-context";

const RootComponent = () => (
  <html lang="en">
    <head>
      <title>{SITE_NAME} — Mugenlabs MSW DevTools plugin</title>
      <HeadContent />
      <style
        // biome-ignore lint/security/noDangerouslySetInnerHtml: inline critical styles
        dangerouslySetInnerHTML={{
          __html: `
							:root {
								--accent-blue:#6cb6ff;--accent-green:#4ade80;--accent-purple:#a78bfa;
								--badge-graphql-bg:#3a1e5f;--badge-graphql-color:#a78bfa;
								--badge-lib-bg:#1a2a1a;--badge-lib-color:#4ade80;
								--badge-method-bg:#1e3a5f;--badge-method-color:#60a5fa;
								--badge-rest-bg:#1e3a5f;--badge-rest-color:#60a5fa;
								--bg-primary:#0a0a0a;--bg-secondary:#111;--bg-tertiary:#1a1a1a;
								--border-primary:#222;--border-secondary:#333;--border-tertiary:#444;
								--card-bg:#111;--code-bg:rgba(255,255,255,0.06);--code-block-bg:#0d1117;
								--header-bg:rgba(10,10,10,0.85);--hero-btn-bg:#fff;--hero-btn-color:#000;
								--pill-bg:#111;--pill-color:#aaa;
								--text-dimmed:#666;--text-muted:#888;--text-primary:#fff;
								--text-secondary:#e0e0e0;--text-tertiary:#aaa;
							}
							body { margin: 0; background: var(--bg-primary); transition: background 0.3s; }
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
      {/* JSON-LD — Organization contactPoint is GitHub Issues only. */}
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
<<<<<<< HEAD
            "@graph": [
              {
                ...ORG_JSON_LD,
                "@context": undefined,
              },
              {
                "@type": "SoftwareApplication",
                applicationCategory: "DeveloperApplication",
                author: {
                  "@type": "Organization",
                  name: "Mugenlabs",
                  url: "https://www.mugenlabs.dev/",
                },
                codeRepository: GITHUB_REPO_URL,
                description: SITE_DESCRIPTION,
                downloadUrl: NPM_URL,
                license: "https://opensource.org/licenses/MIT",
                name: SITE_NAME,
                offers: { "@type": "Offer", price: "0" },
                operatingSystem: "Web",
                url: SITE_URL,
              },
            ],
=======
            "@type": "SoftwareApplication",
            applicationCategory: "DeveloperApplication",
            author: {
              "@type": "Organization",
              name: "Mugenlabs",
              url: "https://www.mugenlabs.dev/",
            },
            codeRepository: GITHUB_REPO_URL,
            description: SITE_DESCRIPTION,
            downloadUrl: NPM_URL,
            license: "https://opensource.org/licenses/MIT",
            name: SITE_NAME,
            offers: { "@type": "Offer", price: "0" },
            operatingSystem: "Web",
            url: SITE_URL,
>>>>>>> 77c943a (docs(demo): Mugenlabs brand + minimal contact/privacy for Yago)
          }),
        }}
        type="application/ld+json"
      />
    </head>
    <body className="min-h-screen font-sans">
      <ThemeProvider>
        <Layout>
          <Outlet />
        </Layout>
      </ThemeProvider>
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
      // Declares demo site type for Is Agentic report lens (not a score change).
      { content: "app", name: "is-agentic-site-type" },
      // Open Graph
      {
        content: `${SITE_NAME} — Mugenlabs MSW DevTools plugin`,
        property: "og:title",
      },
      { content: SITE_DESCRIPTION, property: "og:description" },
      { content: `${SITE_URL}og-image.png`, property: "og:image" },
      { content: "Mugenlabs", property: "og:site_name" },
      { content: "website", property: "og:type" },
      { content: SITE_URL, property: "og:url" },
<<<<<<< HEAD
=======
      { content: "Mugenlabs", property: "og:site_name" },
>>>>>>> 77c943a (docs(demo): Mugenlabs brand + minimal contact/privacy for Yago)
      // Twitter Card
      { content: "summary_large_image", name: "twitter:card" },
      {
        content: `${SITE_NAME} — Mugenlabs MSW DevTools plugin`,
        name: "twitter:title",
      },
      { content: SITE_DESCRIPTION, name: "twitter:description" },
      { content: `${SITE_URL}og-image.png`, name: "twitter:image" },
    ],
    title: `${SITE_NAME} — Mugenlabs MSW DevTools plugin`,
  }),
  notFoundComponent: NotFoundPage,
});
