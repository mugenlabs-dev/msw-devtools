import type { Client, Operation, OperationContext, OperationResult } from "@urql/core";
import { gql, makeOperation } from "@urql/core";
import { makeSubject, map, pipe, publish } from "wonka";
import { dispatchMockUpdate } from "#/adapter/event-bus";
import { ALL_OPERATIONS } from "#/adapter/types";
import { mockRefetchExchange } from "./mock-refetch-exchange";

const context = { requestPolicy: "cache-first", url: "/graphql" } as unknown as OperationContext;

const queryOp = (key: number, name: string): Operation =>
  makeOperation(
    "query",
    { key, query: gql`query ${name} { user { id } }`, variables: {} },
    context
  );

const mutationOp = (key: number, name: string): Operation =>
  makeOperation(
    "mutation",
    { key, query: gql`mutation ${name} { addUser { id } }`, variables: {} },
    context
  );

const teardownOp = (op: Operation): Operation => makeOperation("teardown", op, op.context);

/** Wire the exchange to a fake client and return a function that feeds it operations. */
const setup = () => {
  const client = { reexecuteOperation: vi.fn() };
  const { next, source } = makeSubject<Operation>();
  const forward = (ops$: typeof source) =>
    pipe(
      ops$,
      map((operation): OperationResult => ({ data: null, hasNext: false, operation, stale: false }))
    );
  const exchange = mockRefetchExchange({
    client: client as unknown as Client,
    dispatchDebug: () => {
      // Not exercised
    },
    forward,
  });
  pipe(exchange(source), publish);
  return { client, emit: next };
};

describe("mockRefetchExchange", () => {
  it("re-executes an active query matching the updated operation with network-only", () => {
    const { client, emit } = setup();
    emit(queryOp(1, "GetUser"));

    dispatchMockUpdate("GetUser", "toggle");

    expect(client.reexecuteOperation).toHaveBeenCalledOnce();
    const [reexecuted] = client.reexecuteOperation.mock.calls[0] as [Operation];
    expect(reexecuted.key).toBe(1);
    expect(reexecuted.context.requestPolicy).toBe("network-only");
  });

  it("ignores operations with a different name", () => {
    const { client, emit } = setup();
    emit(queryOp(1, "GetUser"));

    dispatchMockUpdate("GetPosts", "toggle");

    expect(client.reexecuteOperation).not.toHaveBeenCalled();
  });

  it("does not re-execute mutations", () => {
    const { client, emit } = setup();
    emit(mutationOp(2, "AddUser"));

    dispatchMockUpdate("AddUser", "toggle");

    expect(client.reexecuteOperation).not.toHaveBeenCalled();
  });

  it("stops tracking a query after its teardown", () => {
    const { client, emit } = setup();
    const op = queryOp(1, "GetUser");
    emit(op);
    emit(teardownOp(op));

    dispatchMockUpdate("GetUser", "toggle");

    expect(client.reexecuteOperation).not.toHaveBeenCalled();
  });

  it("refetches on every client when several clients share the page", () => {
    const first = setup();
    const second = setup();
    first.emit(queryOp(1, "GetUser"));
    second.emit(queryOp(7, "GetUser"));

    dispatchMockUpdate("GetUser", "toggle");

    expect(first.client.reexecuteOperation).toHaveBeenCalledOnce();
    expect(second.client.reexecuteOperation).toHaveBeenCalledOnce();
  });

  it("re-executes every active query on a bulk event", () => {
    const { client, emit } = setup();
    emit(queryOp(1, "GetUser"));
    emit(queryOp(2, "GetPosts"));

    dispatchMockUpdate(ALL_OPERATIONS, "enable-all");

    expect(client.reexecuteOperation).toHaveBeenCalledTimes(2);
  });
});
