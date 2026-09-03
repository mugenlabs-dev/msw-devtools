import { graphql, HttpResponse, http } from "msw";

import type { registerGraphqlMocks, registerRestMocks } from "./registry";

describe("operation handles", () => {
  let registerRest: typeof registerRestMocks;
  let registerGraphql: typeof registerGraphqlMocks;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import("./registry");
    registerRest = mod.registerRestMocks;
    registerGraphql = mod.registerGraphqlMocks;
  });

  describe("registerRestMocks", () => {
    it("returns handles matching explicit operationName", () => {
      const handles = registerRest({
        handler: http.get("https://pokeapi.co/api/v2/pokemon/6", () => HttpResponse.json({})),
        operationName: "GET Charizard",
      });

      expect(handles).toHaveLength(1);
      expect(handles[0].operationName).toBe("GET Charizard");
      // Indexable by operation name
      expect(handles["GET Charizard"].operationName).toBe("GET Charizard");
    });

    it("returns handles matching the auto-derived name (METHOD /path)", () => {
      const handles = registerRest({
        handler: http.get("https://api.example.com/users", () => HttpResponse.json({})),
      });

      expect(handles[0].operationName).toBe("GET /users");
    });

    it("supports array destructuring in registration order", () => {
      const [charizard, gengar] = registerRest(
        {
          handler: http.get("https://pokeapi.co/api/v2/pokemon/6", () => HttpResponse.json({})),
          operationName: "GET Charizard",
        },
        {
          handler: http.get("https://pokeapi.co/api/v2/pokemon/94", () => HttpResponse.json({})),
          operationName: "GET Gengar",
        }
      );

      expect(charizard.operationName).toBe("GET Charizard");
      expect(gengar.operationName).toBe("GET Gengar");
    });
  });

  describe("registerGraphqlMocks", () => {
    it("returns handles matching the auto-derived operationName", () => {
      const handles = registerGraphql({
        handler: graphql.query("GetPancham", () => HttpResponse.json({ data: {} })),
      });

      expect(handles[0].operationName).toBe("GetPancham");
      expect(handles.GetPancham.operationName).toBe("GetPancham");
    });

    it("returns handles matching an explicit operationName override", () => {
      const handles = registerGraphql({
        handler: graphql.query("GetPancham", () => HttpResponse.json({ data: {} })),
        operationName: "Pancham (custom)",
      });

      expect(handles[0].operationName).toBe("Pancham (custom)");
    });

    it("keeps the handler's GraphQL operation name when the display name is overridden", async () => {
      const { mockRegistry } = await import("./registry");
      registerGraphql({
        handler: graphql.query("GetPancham", () => HttpResponse.json({ data: {} })),
        operationName: "Pancham (custom)",
      });

      const descriptor = mockRegistry.get("Pancham (custom)");
      expect(descriptor?.type).toBe("graphql");
      expect(
        descriptor && "graphqlOperationName" in descriptor && descriptor.graphqlOperationName
      ).toBe("GetPancham");
    });
  });

  describe("useMockRefetch-relevant name extraction", () => {
    it("a handle carries the exact registered name (so useMockRefetch matches events)", () => {
      const [sylveon] = registerRest({
        handler: http.get("https://pokeapi.co/api/v2/pokemon/700", () => HttpResponse.json({})),
        operationName: "GET Sylveon",
      });

      // useMockRefetch reads `.operationName` off a handle; passing the handle
      // must be equivalent to passing the raw string.
      const extract = (operation: string | { operationName: string }): string =>
        typeof operation === "string" ? operation : operation.operationName;

      expect(extract(sylveon)).toBe("GET Sylveon");
      expect(extract("GET Sylveon")).toBe(extract(sylveon));
    });
  });

  describe("handler metadata", () => {
    it("records handler options, RegExp paths and GraphQL endpoints on the descriptor", async () => {
      const { mockRegistry } = await import("./registry");
      const path = /\/api\/items\/\d+$/;
      registerRest({
        handler: http.get(path, () => HttpResponse.json({}), { once: true }),
        operationName: "GET item",
      });
      registerGraphql({
        handler: graphql
          .link("https://api.example.com/graphql")
          .query("GetItem", () => HttpResponse.json({ data: {} })),
      });

      const rest = mockRegistry.get("GET item");
      expect(rest?.type === "rest" && rest.path).toBe(path);
      expect(rest?.variants[0].options).toStrictEqual({ once: true });

      const gql = mockRegistry.get("GetItem");
      expect(gql?.type === "graphql" && gql.endpoint).toBe("https://api.example.com/graphql");
    });

    it("derives a readable name for RegExp paths", () => {
      const [handle] = registerRest({
        handler: http.get(/\/api\/items$/, () => HttpResponse.json({})),
      });
      expect(handle.operationName).toBe("GET /\\/api\\/items$/");
    });
  });

  describe("literal typing", () => {
    it("keys handles by the explicit operation names", () => {
      const handles = registerRest(
        {
          handler: http.get("https://pokeapi.co/api/v2/pokemon/6", () => HttpResponse.json({})),
          operationName: "GET Charizard",
        },
        {
          handler: http.get("https://pokeapi.co/api/v2/pokemon/94", () => HttpResponse.json({})),
          operationName: "GET Gengar",
        }
      );

      expectTypeOf(handles[0].operationName).toEqualTypeOf<"GET Charizard">();
      expectTypeOf(handles[1].operationName).toEqualTypeOf<"GET Gengar">();
      expectTypeOf(handles["GET Gengar"].operationName).toEqualTypeOf<"GET Gengar">();
      // @ts-expect-error — a mistyped name is a compile-time error, not a runtime undefined
      expect(handles["GET Gangar"]).toBeUndefined();
    });

    it("falls back to string keys when a name is auto-derived", () => {
      const handles = registerRest({
        handler: http.get("https://api.example.com/users", () => HttpResponse.json({})),
      });

      expectTypeOf(handles[0].operationName).toEqualTypeOf<string>();
      expect(handles["GET /users"].operationName).toBe("GET /users");
    });
  });

  describe("variant ids", () => {
    const success = http.get("https://api.example.com/items", () => HttpResponse.json([1]));
    const empty = http.get("https://api.example.com/items", () => HttpResponse.json([]));

    it("derives ids from labels and keeps them stable across reordering", async () => {
      const { mockRegistry } = await import("./registry");
      registerRest({
        operationName: "GET items",
        variants: [success, { handler: empty, label: "Not Found (empty)" }],
      });
      const before = mockRegistry.get("GET items")?.variants.map((v) => v.id);

      registerRest({
        operationName: "GET items",
        variants: [{ handler: empty, label: "Not Found (empty)" }, success],
      });
      const after = mockRegistry.get("GET items")?.variants.map((v) => v.id);

      expect(before).toContain("not-found-empty");
      expect(new Set(after)).toStrictEqual(new Set(before));
    });

    it("suffixes duplicate ids within one operation", async () => {
      const { mockRegistry } = await import("./registry");
      registerRest({
        operationName: "GET dupes",
        variants: [
          { handler: success, label: "Same" },
          { handler: empty, label: "same!" },
        ],
      });
      expect(mockRegistry.get("GET dupes")?.variants.map((v) => v.id)).toStrictEqual([
        "same",
        "same-2",
      ]);
    });
  });
});
