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
});
