import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { MotionConfig } from "motion/react";

import { ErrorPage, NotFoundPage } from "../error-page";
import { Layout } from "../layout";
import { ThemeProvider } from "../theme-context";

const SITE_URL = "https://msw-devtools.mugenlabs.dev/";
const SITE_DESCRIPTION =
  "A TanStack DevTools plugin for managing MSW mocks. Toggle, customize, and inspect your mock handlers in real time.";

const THEME_BOOT_SCRIPT = `(function(){try{var k="msw-devtools-demo-theme";var s=localStorage.getItem(k);var t;if(s==="light"||s==="dark")t=s;else if(window.matchMedia("(prefers-color-scheme: light)").matches)t="light";else if(window.matchMedia("(prefers-color-scheme: dark)").matches)t="dark";else t="dark";document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.dataset.theme="dark";document.documentElement.style.colorScheme="dark";}})();`;

const RootComponent = () => (
  <html lang="en">
    <head>
      <title>@mugenlabs/msw-devtools</title>
      <HeadContent />
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: FOUC-safe theme boot before paint
        dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }}
      />
      <style
        // biome-ignore lint/security/noDangerouslySetInnerHtml: inline critical styles
        dangerouslySetInnerHTML={{
          __html: `
							:root {
								color-scheme: dark;
								--header-height: 60px;
								--safe-top: env(safe-area-inset-top, 0px);
								--safe-right: env(safe-area-inset-right, 0px);
								--safe-bottom: env(safe-area-inset-bottom, 0px);
								--safe-left: env(safe-area-inset-left, 0px);
								--accent-blue: light-dark(oklch(54.6% 0.215 262.9), oklch(75.8% 0.129 249.6));
								--accent-green: light-dark(oklch(62.7% 0.17 149.2), oklch(80% 0.182 151.7));
								--accent-purple: light-dark(oklch(54.1% 0.247 293), oklch(70.9% 0.159 293.5));
								--bg-primary: light-dark(oklch(97.9% 0 0), oklch(14.5% 0 0));
								--bg-secondary: light-dark(oklch(100% 0 0), oklch(17.8% 0 0));
								--bg-tertiary: light-dark(oklch(94.9% 0 0), oklch(21.8% 0 0));
								--border-primary: light-dark(oklch(89.8% 0 0), oklch(25.2% 0 0));
								--border-secondary: light-dark(oklch(84.5% 0 0), oklch(32.1% 0 0));
								--card-bg: light-dark(oklch(100% 0 0), oklch(17.8% 0 0));
								--header-bg: light-dark(color-mix(in oklch, oklch(97.9% 0 0) 85%, transparent), color-mix(in oklch, oklch(14.5% 0 0) 85%, transparent));
								--text-primary: light-dark(oklch(21.8% 0 0), oklch(100% 0 0));
								--text-secondary: light-dark(oklch(32.1% 0 0), oklch(90.7% 0 0));
								--text-muted: light-dark(oklch(56.9% 0 0), oklch(62.7% 0 0));
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
      {
        content: "width=device-width, initial-scale=1.0, viewport-fit=cover",
        name: "viewport",
      },
      { content: SITE_DESCRIPTION, name: "description" },
      { content: "oklch(14.5% 0 0)", name: "theme-color" },
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
