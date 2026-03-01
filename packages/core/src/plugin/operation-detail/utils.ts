import { theme } from "#/plugin/theme";
import type { MockOperationDescriptor } from "#/registry/types";
import type { OperationMockConfig } from "#/store/types";

import type { DetailDerivedState } from "./types";

export const getTypeBadge = (descriptor: MockOperationDescriptor) => {
  if (descriptor.type === "graphql") {
    const opType = descriptor.operationType;
    const colors = opType === "query" ? theme.colors.gqlQuery : theme.colors.gqlMutation;
    return { label: opType, ...colors };
  }
  const method = descriptor.method.toUpperCase();
  const colors: Record<string, { bg: string; color: string }> = {
    DELETE: theme.colors.methodDelete,
    GET: theme.colors.methodGet,
    PATCH: theme.colors.methodPatch,
    POST: theme.colors.methodPost,
    PUT: theme.colors.methodPut,
  };
  const c = colors[method] ?? { bg: theme.colors.border, color: theme.colors.textDisabled };
  return { label: `${method} ${descriptor.path}`, ...c };
};

export const getDerivedState = (
  descriptor: MockOperationDescriptor,
  config: OperationMockConfig
): DetailDerivedState => ({
  effectiveHeaders: config.customHeaders ?? "{}",
  effectiveStatusCode: config.statusCode ?? 200,
  hasHeadersOverride: config.customHeaders !== null,
  isErrorOverrideActive: config.errorOverride != null,
  typeBadge: getTypeBadge(descriptor),
});
