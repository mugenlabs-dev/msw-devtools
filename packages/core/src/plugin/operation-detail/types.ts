import type { OperationMockConfig } from "#/store/types";

export interface OperationDetailProps {
  operationName: string | null;
}

export interface OperationDetailHeaderProps {
  config: { enabled: boolean };
  onToggle: () => void;
  operationName: string;
  typeBadge: { bg: string; color: string; label: string };
}

export interface VariantSelectorProps {
  activeVariantId: string;
  onVariantChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  operationName: string;
  variants: { id: string; label: string }[];
}

export interface StatusCodeInputProps {
  config: OperationMockConfig;
  effectiveStatusCode: number;
  onStatusCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStatusCodeReset: () => void;
  operationName: string;
}

export interface HeadersEditorProps {
  effectiveHeaders: string;
  hasHeadersOverride: boolean;
  onHeadersChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onHeadersReset: () => void;
  operationName: string;
}

export interface DetailDerivedState {
  effectiveHeaders: string;
  effectiveStatusCode: number;
  hasHeadersOverride: boolean;
  isErrorOverrideActive: boolean;
  typeBadge: { bg: string; color: string; label: string };
}
