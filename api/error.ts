/**
 * Single serverless function kept for Is Agentic `json-error-responses`.
 * Static files cannot return application/problem+json for unknown /api/*
 * paths or unsupported methods on /api/v1/site.
 */
export const config = {
  runtime: "edge",
};

function problem(
  status: number,
  code: string,
  title: string,
  detail: string,
  instance: string,
  resolution: string
): Response {
  return new Response(
    JSON.stringify({
      code,
      detail,
      documentation_url: new URL("/openapi.json", instance).href,
      instance,
      resolution,
      status,
      title,
      type: `https://msw-devtools.mugenlabs.dev/openapi.json#${code}`,
    }),
    {
      headers: {
        Allow: "GET, HEAD, OPTIONS",
        "Cache-Control": "no-store",
        "Content-Type": "application/problem+json; charset=utf-8",
        Link: '</openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json", </.well-known/api-catalog>; rel="api-catalog"',
      },
      status,
    }
  );
}

export default function handler(request: Request): Response {
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Headers": "Accept, Content-Type",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Origin": "*",
        Allow: "GET, HEAD, OPTIONS",
      },
      status: 204,
    });
  }

  const isSiteCatalog = url.pathname === "/api/v1/site" || url.pathname === "/api/v1/site/";
  const status = request.method === "GET" || request.method === "HEAD" ? 404 : 405;
  const code = status === 404 ? "not_found" : "method_not_allowed";
  const title = status === 404 ? "API route not found" : "Method not allowed";

  let detail: string;
  if (status === 404) {
    detail = `No API resource exists at ${url.pathname}.`;
  } else if (isSiteCatalog) {
    detail = `This endpoint only supports GET and HEAD. Received ${request.method}.`;
  } else {
    detail = `Unsupported method ${request.method} for ${url.pathname}.`;
  }

  const resolution = isSiteCatalog
    ? "Retry with GET (or HEAD). See /openapi.json for the site catalog contract."
    : "Use GET /api/v1/site for the public site catalog, or read /openapi.json for the contract.";

  return problem(status, code, title, detail, url.href, resolution);
}
