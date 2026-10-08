export const config = {
  runtime: "edge",
};

/**
 * Catch-all for unknown /api/* paths — always structured JSON errors.
 * The real catalog lives at /api/v1/site (see openapi.json).
 */
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

  const status = request.method === "GET" || request.method === "HEAD" ? 404 : 405;
  const code = status === 404 ? "not_found" : "method_not_allowed";
  const title = status === 404 ? "API route not found" : "Method not allowed";
  const detail =
    status === 404
      ? `No API resource exists at ${url.pathname}.`
      : `Unsupported method ${request.method} for ${url.pathname}.`;
  const resolution =
    "Use GET /api/v1/site for the public site catalog, or read /openapi.json for the contract.";

  return new Response(
    JSON.stringify({
      code,
      detail,
      documentation_url: `${url.origin}/openapi.json`,
      instance: url.href,
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
