import { next, rewrite } from "@vercel/functions";

import {
  homepageMarkdown,
  isKnownHtmlPath,
  notFoundMarkdown,
  prefersMarkdown,
} from "./agentic/public-facts.js";

export const config = {
  matcher: [
    // Homepage (Markdown negotiation + Vary)
    "/",
    // SPA paths that are not static assets, API, or well-known files
    "/((?!api/|assets/|\\.well-known/|.*\\.[A-Za-z0-9]+$).*)",
  ],
};

const markdownHeaders = {
  "Cache-Control": "public, max-age=0, must-revalidate",
  "Content-Type": "text/markdown; charset=utf-8",
  Vary: "Accept",
} as const;

export default function middleware(request: Request): Response {
  const url = new URL(request.url);
  const { origin, pathname } = url;
  const accept = request.headers.get("accept");
  const wantsMarkdown = prefersMarkdown(accept);
  const known = isKnownHtmlPath(pathname);

  if (pathname === "/" && wantsMarkdown) {
    return new Response(homepageMarkdown(origin), {
      headers: markdownHeaders,
      status: 200,
    });
  }

  if (!known) {
    if (wantsMarkdown) {
      return new Response(notFoundMarkdown(origin, pathname), {
        headers: {
          ...markdownHeaders,
          "X-Robots-Tag": "noindex",
        },
        status: 404,
      });
    }

    // App shell is fine; agents need a real 404 status (not soft-404).
    return rewrite(new URL("/index.html", origin), { status: 404 });
  }

  if (pathname === "/") {
    return next({
      headers: {
        Vary: "Accept",
      },
    });
  }

  return next();
}
