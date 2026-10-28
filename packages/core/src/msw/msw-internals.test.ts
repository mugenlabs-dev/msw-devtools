import { HttpResponse, http } from "msw";
import { graphql } from "#/test-utils/graphql";
import type { RestHandler } from "./msw-internals";
import {
  createGraphqlHandlerFrom,
  getGraphQLEndpoint,
  getHandlerOptions,
  getHandlerResolver,
  isGraphqlHandler,
  isMswRequestHandler,
} from "./msw-internals";

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
      const handler = {} as unknown as RestHandler;

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
      const handler = {} as unknown as RestHandler;

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

  describe("structural checks", () => {
    it("recognises http and graphql handlers without instanceof", () => {
      const rest = http.get("/api/users", () => HttpResponse.json([]));
      const gql = graphql.query("GetUser", () => HttpResponse.json({ data: {} }));

      expect(isMswRequestHandler(rest)).toBe(true);
      expect(isMswRequestHandler(gql)).toBe(true);
      expect(isMswRequestHandler({ handler: rest, label: "Default" })).toBe(false);
      expect(isGraphqlHandler(rest)).toBe(false);
      expect(isGraphqlHandler(gql)).toBe(true);
    });
  });

  describe("createGraphqlHandlerFrom", () => {
    it("builds a scoped query with the user's GraphQLHandler constructor", async () => {
      const prototype = graphql
        .link("https://api.example.com/graphql")
        .query("GetUser", () => HttpResponse.json({ data: { from: "prototype" } }));

      const wrapper = createGraphqlHandlerFrom(prototype, {
        endpoint: "https://api.example.com/graphql",
        operationType: "query",
        predicate: "GetUser",
        resolver: async () => HttpResponse.json({ data: { from: "wrapper" } }),
      });

      expect(wrapper.constructor).toBe(prototype.constructor);
      expect(getGraphQLEndpoint(wrapper)).toBe("https://api.example.com/graphql");

      const result = await (
        wrapper as unknown as {
          run: (args: { request: Request; requestId: string }) => Promise<{
            response?: Response;
          } | null>;
        }
      ).run({
        request: new Request("https://api.example.com/graphql", {
          body: JSON.stringify({ operationName: "GetUser", query: "query GetUser { id }" }),
          headers: { "content-type": "application/json" },
          method: "POST",
        }),
        requestId: "test",
      });

      await expect(result?.response?.json()).resolves.toEqual({ data: { from: "wrapper" } });
    });
  });
});
