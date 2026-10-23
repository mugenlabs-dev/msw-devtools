import type { HttpHandler } from "msw";
import { graphql, HttpResponse, http } from "msw";
import { getGraphQLEndpoint, getHandlerOptions, getHandlerResolver } from "./msw-internals";

// These run against real MSW handlers, so an MSW release that renames or
// removes one of the private fields fails here rather than in the panel.
describe("msw internals", () => {
  describe("getHandlerResolver", () => {
    it("returns the resolver of an http handler", async () => {
      const handler = http.get("/api/users", () => HttpResponse.json([{ id: 1 }]));

      const response = await getHandlerResolver(handler)({});

      expect(await response?.json()).toEqual([{ id: 1 }]);
    });

    it("returns the resolver of a graphql handler", async () => {
      const handler = graphql.query("GetUser", () => HttpResponse.json({ data: { id: 1 } }));

      const response = await getHandlerResolver(handler)({});

      expect(await response?.json()).toEqual({ data: { id: 1 } });
    });

    it("throws a descriptive error when the handler has no resolver", () => {
      const handler = {} as unknown as HttpHandler;

      expect(() => getHandlerResolver(handler)).toThrow(/missing `resolver`/);
    });
  });

  describe("getHandlerOptions", () => {
    it("returns { once } when the handler was created with it", () => {
      const handler = http.get("/api/users", () => HttpResponse.json([]), { once: true });

      expect(getHandlerOptions(handler)).toEqual({ once: true });
    });

    it("returns undefined when no options were given", () => {
      const handler = http.get("/api/users", () => HttpResponse.json([]));

      expect(getHandlerOptions(handler)).toBeUndefined();
    });

    it("returns undefined when the handler has no options field", () => {
      const handler = {} as unknown as HttpHandler;

      expect(getHandlerOptions(handler)).toBeUndefined();
    });
  });

  describe("getGraphQLEndpoint", () => {
    it("returns the url of a graphql.link handler", () => {
      const handler = graphql
        .link("https://api.example.com/graphql")
        .query("GetUser", () => HttpResponse.json({ data: {} }));

      expect(getGraphQLEndpoint(handler)).toBe("https://api.example.com/graphql");
    });

    it("returns the wildcard for an unscoped handler", () => {
      const handler = graphql.query("GetUser", () => HttpResponse.json({ data: {} }));

      expect(getGraphQLEndpoint(handler)).toBe("*");
    });
  });
});
