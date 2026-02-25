import { mockRegistry } from "#/registry/registry";

import { createDynamicHandler } from "./create-handler";

/** Build all MSW handlers from the current registry state. */
export const buildAllHandlers = () => mockRegistry.getAll().map(createDynamicHandler);
