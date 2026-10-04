import { useCallback } from "react";
import { dispatchMockUpdate } from "#/adapter/event-bus";
import { useMockStore } from "#/store/store";
import type { ErrorOverride } from "#/store/types";

export const useToggleAndVariantHandlers = (operationName: string) => {
  const setActiveVariant = useMockStore((s) => s.setActiveVariant);
  const setEnabled = useMockStore((s) => s.setEnabled);
  const config = useMockStore((s) => s.operations[operationName]);

  const handleToggle = useCallback(() => {
    setEnabled(operationName, !config?.enabled);
    dispatchMockUpdate(operationName, "toggle");
  }, [operationName, config?.enabled, setEnabled]);

  const handleVariantChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setActiveVariant(operationName, e.target.value);
      dispatchMockUpdate(operationName, "variant");
    },
    [operationName, setActiveVariant]
  );

  return { config, handleToggle, handleVariantChange };
};

export const useErrorOverrideHandler = (operationName: string) => {
  const setErrorOverride = useMockStore((s) => s.setErrorOverride);

  const handleErrorOverrideChange = useCallback(
    (override: ErrorOverride) => {
      setErrorOverride(operationName, override);
      dispatchMockUpdate(operationName, "error-override");
    },
    [operationName, setErrorOverride]
  );

  return { handleErrorOverrideChange };
};

export const useFieldHandlers = (operationName: string) => {
  const setCustomJsonOverride = useMockStore((s) => s.setCustomJsonOverride);
  const setDelay = useMockStore((s) => s.setDelay);
  const setStatusCode = useMockStore((s) => s.setStatusCode);

  const handleJsonChange = useCallback(
    (json: string) => {
      setCustomJsonOverride(operationName, json);
      dispatchMockUpdate(operationName, "json-override");
    },
    [operationName, setCustomJsonOverride]
  );

  const handleDelayChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseInt(e.target.value, 10);
      setDelay(operationName, Number.isNaN(value) ? 0 : value);
      dispatchMockUpdate(operationName, "delay-override");
    },
    [operationName, setDelay]
  );

  const handleStatusCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === "") {
        setStatusCode(operationName, null);
        dispatchMockUpdate(operationName, "status-override");
        return;
      }
      const value = Number.parseInt(raw, 10);
      if (!Number.isNaN(value)) {
        setStatusCode(operationName, value);
        dispatchMockUpdate(operationName, "status-override");
      }
    },
    [operationName, setStatusCode]
  );

  const handleStatusCodeReset = useCallback(() => {
    setStatusCode(operationName, null);
    dispatchMockUpdate(operationName, "status-override");
  }, [operationName, setStatusCode]);

  return { handleDelayChange, handleJsonChange, handleStatusCodeChange, handleStatusCodeReset };
};

export const useHeaderAndResetHandlers = (operationName: string) => {
  const setCustomHeaders = useMockStore((s) => s.setCustomHeaders);
  const setCustomJsonOverride = useMockStore((s) => s.setCustomJsonOverride);

  const handleHeadersChange = useCallback(
    (headers: string | null) => {
      setCustomHeaders(operationName, headers);
      dispatchMockUpdate(operationName, "headers-override");
    },
    [operationName, setCustomHeaders]
  );

  const handleHeadersReset = useCallback(() => {
    setCustomHeaders(operationName, null);
    dispatchMockUpdate(operationName, "headers-override");
  }, [operationName, setCustomHeaders]);

  const handleReset = useCallback(() => {
    setCustomJsonOverride(operationName, null);
    dispatchMockUpdate(operationName, "json-override");
  }, [operationName, setCustomJsonOverride]);

  return { handleHeadersChange, handleHeadersReset, handleReset };
};

export const useDetailHandlers = (operationName: string) => {
  const toggleAndVariant = useToggleAndVariantHandlers(operationName);
  const errorOverrideHandlers = useErrorOverrideHandler(operationName);
  const fieldHandlers = useFieldHandlers(operationName);
  const headerAndReset = useHeaderAndResetHandlers(operationName);

  return {
    ...toggleAndVariant,
    ...errorOverrideHandlers,
    ...fieldHandlers,
    ...headerAndReset,
  };
};
