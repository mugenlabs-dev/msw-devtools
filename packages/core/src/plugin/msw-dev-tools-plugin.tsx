import { useEffect, useState } from "react";

import { startWorker } from "#/msw/worker-manager";

import { OperationDetail } from "./operation-detail";
import { OperationList } from "./operation-list";
import { theme } from "./theme";

export const MswDevToolsPlugin = () => {
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null);

  useEffect(() => {
    startWorker().catch(() => {
      // Error is already captured in the store as workerStatus: "error"
    });
  }, []);

  return (
    <div
      style={{
        background: theme.colors.background,
        color: theme.colors.textPrimary,
        display: "flex",
        fontFamily: theme.fontFamily.sans,
        height: "100%",
      }}
    >
      <OperationList
        onSelectOperation={setSelectedOperation}
        selectedOperation={selectedOperation}
      />
      <OperationDetail operationName={selectedOperation} />
    </div>
  );
};
