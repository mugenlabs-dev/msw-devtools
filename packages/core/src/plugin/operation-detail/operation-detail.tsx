import { useMemo } from "react";
import { JsonEditor } from "#/plugin/json-editor";
import { theme } from "#/plugin/theme";
import { mockRegistry } from "#/registry/registry";
import { useMockStore } from "#/store/store";
import { ErrorOverrideSelector } from "./error-override-selector";
import { HeadersEditor } from "./headers-editor";
import { useDetailHandlers } from "./hooks";
import { OperationDetailHeader } from "./operation-detail-header";
import { StatusCodeInput } from "./status-code-input";
import type { OperationDetailProps } from "./types";
import { getDerivedState } from "./utils";
import { VariantSelector } from "./variant-selector";

const OperationDetailInner = ({ operationName }: { operationName: string }) => {
  const handlers = useDetailHandlers(operationName);
  const { config } = handlers;
  const capturedData = useMockStore((s) => s.capturedResponseData.get(operationName));

  const descriptor = mockRegistry.get(operationName);

  const jsonValue = useMemo(() => {
    if (config?.customJsonOverride != null && config.customJsonOverride !== "") {
      return config.customJsonOverride;
    }
    if (capturedData != null) {
      return capturedData;
    }
    return "// Waiting for first request...";
  }, [config?.customJsonOverride, capturedData]);

  if (descriptor == null || config == null) {
    return null;
  }

  const derived = getDerivedState(descriptor, config);

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      {/* Sticky header — stays fixed at top of detail pane */}
      <div
        style={{
          borderBottom: `1px solid ${theme.colors.border}`,
          flexShrink: 0,
          padding: theme.spacing.xl,
        }}
      >
        <OperationDetailHeader
          config={config}
          onToggle={handlers.handleToggle}
          operationName={operationName}
          typeBadge={derived.typeBadge}
        />
      </div>

      {/* Scrollable content */}
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          gap: theme.spacing.xl,
          overflow: "auto",
          padding: theme.spacing.xl,
        }}
      >
        <VariantSelector
          activeVariantId={config.activeVariantId}
          onVariantChange={handlers.handleVariantChange}
          operationName={operationName}
          variants={descriptor.variants}
        />

        {/* Error Override */}
        <ErrorOverrideSelector
          onChange={handlers.handleErrorOverrideChange}
          operationName={operationName}
          value={config.errorOverride}
        />

        {/* Delay and Status row */}
        <div
          style={{
            alignItems: "center",
            display: "flex",
            flexWrap: "wrap",
            gap: theme.spacing.lg,
          }}
        >
          <label
            htmlFor={`delay-${operationName}`}
            style={{
              color: theme.colors.textSecondary,
              fontSize: theme.fontSize.md,
              fontWeight: 600,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            Delay
          </label>
          <input
            id={`delay-${operationName}`}
            min={0}
            onChange={handlers.handleDelayChange}
            step={100}
            style={{
              background: theme.colors.surface,
              border: `1px solid ${theme.colors.borderInput}`,
              borderRadius: theme.radius.lg,
              color: theme.colors.textPrimary,
              fontSize: theme.fontSize.base,
              outline: "none",
              padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
              width: "70px",
            }}
            type="number"
            value={config.delay}
          />
          <span style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.md }}>ms</span>
          {!derived.isErrorOverrideActive && (
            <StatusCodeInput
              config={config}
              effectiveStatusCode={derived.effectiveStatusCode}
              onStatusCodeChange={handlers.handleStatusCodeChange}
              onStatusCodeReset={handlers.handleStatusCodeReset}
              operationName={operationName}
            />
          )}
        </div>

        {/* Headers editor */}
        {!derived.isErrorOverrideActive && (
          <HeadersEditor
            effectiveHeaders={derived.effectiveHeaders}
            hasHeadersOverride={derived.hasHeadersOverride}
            onHeadersChange={handlers.handleHeadersChange}
            onHeadersReset={handlers.handleHeadersReset}
            operationName={operationName}
          />
        )}

        {/* JSON Editor */}
        {!derived.isErrorOverrideActive && (
          <JsonEditor
            hasOverride={config.customJsonOverride !== null}
            onChange={handlers.handleJsonChange}
            onReset={handlers.handleReset}
            value={jsonValue}
          />
        )}

        {derived.isErrorOverrideActive && (
          <div
            style={{
              alignItems: "center",
              border: `1px dashed ${theme.colors.error}`,
              borderRadius: theme.radius.lg,
              color: theme.colors.error,
              display: "flex",
              flex: 1,
              fontSize: theme.fontSize.lg,
              justifyContent: "center",
            }}
          >
            {config.errorOverride === "networkError"
              ? "Network error -- no response body"
              : `Error override active: ${config.errorOverride}`}
          </div>
        )}
      </div>
    </div>
  );
};

export const OperationDetail = ({ operationName }: OperationDetailProps) => {
  if (operationName == null || operationName === "") {
    return (
      <div
        style={{
          alignItems: "center",
          color: theme.colors.textDimmed,
          display: "flex",
          flex: 1,
          fontSize: theme.fontSize.lg,
          justifyContent: "center",
        }}
      >
        Select an operation to configure
      </div>
    );
  }

  return <OperationDetailInner operationName={operationName} />;
};
