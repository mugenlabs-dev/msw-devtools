import type { GraphQLHandler, HttpHandler } from "msw";

// ---------------------------------------------------------------------------
// Handler Variant — wraps a user-provided MSW handler as a selectable variant
// ---------------------------------------------------------------------------

export interface HandlerVariant {
  /** The user's MSW request handler whose resolver produces the response. */
  handler: GraphQLHandler | HttpHandler;
  /** Stable identifier for this variant (e.g. "variant-0"). */
  id: string;
  /** Display label shown in the variant dropdown. */
  label: string;
}

// ---------------------------------------------------------------------------
// Public input types — what users pass to registerRestMocks / registerGraphqlMocks
// ---------------------------------------------------------------------------

/** A variant input is either a bare handler or an object with an optional label. */
export type HandlerVariantInput<H> = H | { handler: H; label?: string };

export interface RestMockDef {
  /** Optional grouping label (e.g. journey name, feature area). */
  group?: string;
  /** Shorthand for a single-variant mock. Mutually exclusive with `variants`. */
  handler?: HttpHandler;
  /**
   * Override the auto-derived operation name.
   * Default: `"METHOD /pathname"` derived from the handler info.
   */
  operationName?: string;
  /** Multiple handler variants for the same endpoint. */
  variants?: HandlerVariantInput<HttpHandler>[];
}

export interface GraphqlMockDef {
  /** Optional grouping label (e.g. journey name, feature area). */
  group?: string;
  /** Shorthand for a single-variant mock. Mutually exclusive with `variants`. */
  handler?: GraphQLHandler;
  /**
   * Override the auto-derived operation name.
   * Default: the `operationName` from the GraphQL handler info.
   */
  operationName?: string;
  /** Override the auto-derived operation type ("query" | "mutation"). */
  operationType?: GraphQLOperationType;
  /** Multiple handler variants for the same endpoint. */
  variants?: HandlerVariantInput<GraphQLHandler>[];
}

// ---------------------------------------------------------------------------
// Internal descriptor types — stored in the registry
// ---------------------------------------------------------------------------

export type GraphQLOperationType = "query" | "mutation";

export type RestMethod = "get" | "post" | "put" | "delete" | "patch";

interface MockOperationDescriptorBase {
  /** Optional grouping label (e.g., journey name, feature area). */
  group?: string;
  /** Unique identifier for this operation. Used as the store key. */
  operationName: string;
  /** Handler-based variants available for this operation. */
  variants: HandlerVariant[];
}

export type GraphQLMockDescriptor = MockOperationDescriptorBase & {
  operationType: GraphQLOperationType;
  type: "graphql";
};

export type RestMockDescriptor = MockOperationDescriptorBase & {
  method: RestMethod;
  /**
   * The URL path pattern, exactly as passed to MSW's http.get/post/etc.
   * e.g., '/api/users/:id', 'https://api.example.com/products'
   */
  path: string;
  type: "rest";
};

export type MockOperationDescriptor = GraphQLMockDescriptor | RestMockDescriptor;

export const isGraphQLDescriptor = (d: MockOperationDescriptor): d is GraphQLMockDescriptor =>
  d.type === "graphql";

export const isRestDescriptor = (d: MockOperationDescriptor): d is RestMockDescriptor =>
  d.type === "rest";
