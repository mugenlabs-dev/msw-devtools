import type { MockOperationDescriptor } from "./types";

import { isGraphQLDescriptor, isRestDescriptor } from "./types";

describe("type guards", () => {
  const graphqlDescriptor: MockOperationDescriptor = {
    operationName: "GetUser",
    operationType: "query",
    type: "graphql",
    variants: [],
  };

  const restDescriptor: MockOperationDescriptor = {
    method: "get",
    operationName: "GET Users",
    path: "/api/users",
    type: "rest",
    variants: [],
  };

  describe("graphql descriptor type guard", () => {
    it("returns true for GraphQL descriptors", () => {
      expect(isGraphQLDescriptor(graphqlDescriptor)).toBeTruthy();
    });

    it("returns false for REST descriptors", () => {
      expect(isGraphQLDescriptor(restDescriptor)).toBeFalsy();
    });
  });

  describe("rest descriptor type guard", () => {
    it("returns true for REST descriptors", () => {
      expect(isRestDescriptor(restDescriptor)).toBeTruthy();
    });

    it("returns false for GraphQL descriptors", () => {
      expect(isRestDescriptor(graphqlDescriptor)).toBeFalsy();
    });
  });
});
