import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";

import { Layout } from "../layout";
import { ThemeProvider } from "../theme-context";

const SITE_URL = "https://yagogc.github.io/msw-devtool/";
const SITE_DESCRIPTION =
  "A TanStack DevTools plugin for managing MSW mocks. Toggle, customize, and inspect your mock handlers in real time.";

const RootComponent = () => (
  <html lang="en">
    <head>
      <title>msw-devtool</title>
      <HeadContent />
      <style
        // biome-ignore lint/security/noDangerouslySetInnerHtml: inline styles for body
        dangerouslySetInnerHTML={{
          __html: `
							body { margin: 0; background: var(--bg-primary, #0a0a0a); transition: background 0.3s; }
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
            name: "msw-devtools-plugin",
            offers: { "@type": "Offer", price: "0" },
            operatingSystem: "Web",
            url: SITE_URL,
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
  head: () => ({
    links: [
      {
        href: `${import.meta.env.BASE_URL}favicon.svg`,
        rel: "icon",
        type: "image/svg+xml",
      },
      { href: SITE_URL, rel: "canonical" },
    ],
    meta: [
      { charSet: "utf8" },
      { content: "width=device-width, initial-scale=1.0", name: "viewport" },
      { content: SITE_DESCRIPTION, name: "description" },
      { content: "#0a0a0a", name: "theme-color" },
      // Open Graph
      { content: "msw-devtools-plugin", property: "og:title" },
      { content: SITE_DESCRIPTION, property: "og:description" },
      { content: `${SITE_URL}og-image.png`, property: "og:image" },
      { content: "website", property: "og:type" },
      { content: SITE_URL, property: "og:url" },
      // Twitter Card
      { content: "summary_large_image", name: "twitter:card" },
      { content: "msw-devtools-plugin", name: "twitter:title" },
      { content: SITE_DESCRIPTION, name: "twitter:description" },
      { content: `${SITE_URL}og-image.png`, name: "twitter:image" },
    ],
    title: "msw-devtools-plugin",
  }),
});
