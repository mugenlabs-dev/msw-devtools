import { siteCatalog } from "../../agentic/public-facts.js";

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
  const instance = url.href;

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

  if (request.method !== "GET" && request.method !== "HEAD") {
    return problem(
      405,
      "method_not_allowed",
      "Method not allowed",
      `This endpoint only supports GET and HEAD. Received ${request.method}.`,
      instance,
      "Retry with GET (or HEAD). See /openapi.json for the site catalog contract."
    );
  }

  const body = JSON.stringify(siteCatalog(url.origin));
  return new Response(request.method === "HEAD" ? null : body, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300",
      "Content-Type": "application/json; charset=utf-8",
      Link: '</openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json", </.well-known/api-catalog>; rel="api-catalog"',
    },
    status: 200,
  });
}
