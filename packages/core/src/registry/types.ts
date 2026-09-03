import type { GraphQLHandler, HttpHandler } from "msw";
import type { HandlerOptions } from "#/msw/msw-internals";

// ---------------------------------------------------------------------------
// Handler Variant — wraps a user-provided MSW handler as a selectable variant
// ---------------------------------------------------------------------------

export interface HandlerVariant {
  /** The user's MSW request handler whose resolver produces the response. */
  handler: GraphQLHandler | HttpHandler;
  /**
   * Stable identifier for this variant: derived from the label when one was
   * given (e.g. "not-found-empty"), otherwise from the handler's resolver, so
   * reordering variants does not change which one a persisted selection points at.
   */
  id: string;
  /** Display label shown in the variant dropdown. */
  label: string;
  /** Handler options (e.g. `{ once: true }`) carried over from the user's handler. */
  options?: HandlerOptions;
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
  /**
   * The endpoint the handler is scoped to via `graphql.link(url)`.
   * `"*"` (MSW's default) matches any endpoint.
   */
  endpoint: string | RegExp;
  /**
   * The GraphQL operation name (or pattern) the handler matches, exactly as
   * passed to MSW's graphql.query/mutation. Kept separate from `operationName`
   * so the display name can be overridden without breaking request matching.
   */
  graphqlOperationName: string | RegExp;
  operationType: GraphQLOperationType;
  type: "graphql";
};

export type RestMockDescriptor = MockOperationDescriptorBase & {
  method: RestMethod;
  /**
   * The URL path pattern, exactly as passed to MSW's http.get/post/etc.
   * e.g., '/api/users/:id', 'https://api.example.com/products', or a RegExp.
   */
  path: string | RegExp;
  type: "rest";
};

export type MockOperationDescriptor = GraphQLMockDescriptor | RestMockDescriptor;

// ---------------------------------------------------------------------------
// Operation handles — type-safe references returned from registration
// ---------------------------------------------------------------------------

declare const operationHandleBrand: unique symbol;

/**
 * A type-safe reference to a registered mock operation.
 *
 * Returned from {@link registerRestMocks} / {@link registerGraphqlMocks} so the
 * `operationName` never has to be re-typed as a string literal (which silently
 * no-ops on a typo). Pass it directly to `useMockRefetch`.
 *
 * Branded so it is a distinct nominal type — you cannot fabricate one from a
 * plain object; it must come from a registration call.
 */
export interface OperationHandle<Name extends string = string> {
  /** The exact operation name this handle refers to. */
  readonly operationName: Name;
  /** @internal Nominal brand — never present at runtime. */
  readonly [operationHandleBrand]?: true;
}

/** The operation name a mock def will register under, as a literal when it was given explicitly. */
type OperationNameOf<Def> = Def extends { operationName: infer Name extends string }
  ? Name
  : string;

/**
 * The return value of {@link registerRestMocks} / {@link registerGraphqlMocks},
 * typed from the defs that were passed in.
 *
 * Behaves both as an ordered tuple (so `const [first] = registerRestMocks(...)`
 * works) and as an object keyed by `operationName` (so
 * `handles["GET Charizard"]` works). When every def carries an explicit
 * `operationName`, the keys are literal, so a mistyped name is a type error.
 * Defs that rely on the auto-derived name fall back to `string` keys.
 */
export type OperationHandlesFor<Defs extends readonly unknown[]> = readonly [
  ...{ [Index in keyof Defs]: OperationHandle<OperationNameOf<Defs[Index]>> },
] & {
  readonly [Name in OperationNameOf<Defs[number]>]: OperationHandle<Name>;
};

/**
 * The untyped form of {@link OperationHandlesFor}: an array of
 * {@link OperationHandle} that is also indexable by any `operationName`.
 */
export type OperationHandles = readonly OperationHandle[] & {
  readonly [operationName: string]: OperationHandle;
};

/**
 * The variant a config's `activeVariantId` refers to, falling back to the first
 * variant when the id is unknown (a legacy positional id, a removed variant, or
 * the store's "unset" default).
 */
export const resolveActiveVariant = (
  descriptor: MockOperationDescriptor,
  activeVariantId: string | undefined
): HandlerVariant | undefined =>
  descriptor.variants.find((v) => v.id === activeVariantId) ?? descriptor.variants[0];

export const isGraphQLDescriptor = (d: MockOperationDescriptor): d is GraphQLMockDescriptor =>
  d.type === "graphql";

export const isRestDescriptor = (d: MockOperationDescriptor): d is RestMockDescriptor =>
  d.type === "rest";
