import type { SetupWorker } from "msw/browser";
import { mockRegistry } from "#/registry/registry";
import type { RestMockDescriptor } from "#/registry/types";
import { useMockStore } from "#/store/store";

const markSeen = (name: string): void => {
  useMockStore.getState().markOperationSeen(name);
};

/** Try to extract a GraphQL operation name from a GET request's URL params. */
const tryGraphQLGet = (request: Request): boolean => {
  try {
    const url = new URL(request.url);
    const opName = url.searchParams.get("operationName");
    if (opName != null && opName !== "") {
      markSeen(opName);
      return true;
    }
  } catch {
    // Not a valid URL — ignore
  }
  return false;
};

/** Extract operation name from a GraphQL query string, e.g. "query GetFoo { ... }" → "GetFoo" */
const extractOperationNameFromQuery = (query: string): string | null => {
  const match = /^(?:query|mutation|subscription)\s+(\w+)/i.exec(query.trim());
  return match?.[1] ?? null;
};

/** Try to extract a GraphQL operation name from a POST request's JSON body. */
const tryGraphQLPost = async (request: Request): Promise<void> => {
  try {
    const body = (await request.clone().json()) as {
      operationName?: string;
      query?: string;
    };
    const opName =
      (body?.operationName != null && body.operationName !== "" ? body.operationName : null) ??
      (body?.query ? extractOperationNameFromQuery(body.query) : null);
    if (opName) {
      markSeen(opName);
    }
  } catch {
    // Not JSON — ignore
  }
};

/** Check whether the request URL matches a REST descriptor's path pattern. */
const matchesRestDescriptor = (request: Request, descriptor: RestMockDescriptor): boolean => {
  if (request.method.toLowerCase() !== descriptor.method) {
    return false;
  }
  try {
    const escaped = descriptor.path.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pathPattern = escaped.replaceAll(/:[^/]+/g, "[^/]+");
    const regex = new RegExp(`^${pathPattern}(\\?.*)?$`);
    // Relative descriptor paths (e.g. "/api/users") match the request pathname;
    // absolute descriptor paths (with an origin) match the full URL.
    const isAbsolute = /^https?:\/\//i.test(descriptor.path);
    const target = isAbsolute ? request.url : new URL(request.url).pathname;
    return regex.test(target);
  } catch {
    return false;
  }
};

/** Match the request URL against all registered REST descriptors. */
const tryRestMatch = (request: Request): void => {
  const restDescriptors = mockRegistry
    .getAll()
    .filter((d): d is RestMockDescriptor => d.type === "rest");

  for (const descriptor of restDescriptors) {
    if (matchesRestDescriptor(request, descriptor)) {
      markSeen(descriptor.operationName);
    }
  }
};

// ---------------------------------------------------------------------------
// SPA navigation detection — auto-clear seen operations on route change
// ---------------------------------------------------------------------------

let restoreNavigation: (() => void) | null = null;

const setupNavigationListener = (): void => {
  if (typeof window === "undefined" || restoreNavigation) {
    return;
  }

  const clearSeen = (): void => {
    useMockStore.getState().clearSeenOperations();
  };

  // Detect back/forward navigation
  window.addEventListener("popstate", clearSeen);

  // Monkey-patch pushState/replaceState to detect SPA navigations
  const originalPushState = history.pushState.bind(history);
  const originalReplaceState = history.replaceState.bind(history);

  history.pushState = (...args) => {
    originalPushState(...args);
    clearSeen();
  };

  history.replaceState = (...args) => {
    originalReplaceState(...args);
    clearSeen();
  };

  restoreNavigation = () => {
    window.removeEventListener("popstate", clearSeen);
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
    restoreNavigation = null;
  };
};

/**
 * @internal — Restores the patched history methods and removes the popstate
 * listener installed by the operation tracker. Called before re-setup and
 * available for worker stop/reset. Not part of the public API.
 */
export const teardownOperationTracker = (): void => {
  restoreNavigation?.();
};

// ---------------------------------------------------------------------------
// Public setup
// ---------------------------------------------------------------------------

/**
 * Sets up request:start event tracking on the MSW worker.
 * For GraphQL: extracts operationName from URL params (GET) or body (POST).
 * For REST: matches the request URL against registered REST descriptors.
 * Also listens for SPA navigation events to automatically clear seen operations.
 */
export const setupOperationTracker = (worker: SetupWorker): void => {
  worker.events.on("request:start", ({ request }) => {
    if (request.method === "GET" && tryGraphQLGet(request)) {
      return;
    }

    if (request.method === "POST") {
      void tryGraphQLPost(request);
    }

    tryRestMatch(request);
  });

  // Restore any previously patched history methods before re-installing, so a
  // worker reset/restart doesn't stack listeners or leak the monkey-patch.
  teardownOperationTracker();
  setupNavigationListener();
};
