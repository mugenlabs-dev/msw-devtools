import type { Decorator } from "@storybook/react";
import { useEffect } from "react";
import { theme } from "#/plugin/theme";
import { mockRegistry } from "#/registry/registry";
import type { MockOperationDescriptor } from "#/registry/types";
import { useMockStore } from "#/store/store";
import type { OperationMockConfig, WorkerStatus } from "#/store/types";
import { allDescriptors, defaultConfig } from "./fixtures";

interface MockSeedOptions {
  descriptors?: MockOperationDescriptor[];
  operations?: Record<string, OperationMockConfig>;
  seenOperations?: Set<string>;
  workerStatus?: WorkerStatus;
}

/**
 * Storybook decorator that seeds MockRegistry + Zustand store before render.
 * Cleans up on unmount to prevent state leaking between stories.
 */
export const withMockSeed = (options: MockSeedOptions = {}): Decorator => {
  const {
    descriptors = allDescriptors,
    operations,
    seenOperations = new Set<string>(),
    workerStatus = "active",
  } = options;

  const seedOperations =
    operations ??
    Object.fromEntries(descriptors.map((d) => [d.operationName, { ...defaultConfig }]));

  return (Story) => {
    useEffect(() => {
      mockRegistry.register(...descriptors);
      useMockStore.setState({
        operations: seedOperations,
        seenOperations,
        workerStatus,
      });

      return () => {
        for (const d of descriptors) {
          mockRegistry.unregister(d.operationName);
        }
        useMockStore.setState({
          capturedResponseData: new Map(),
          collapsedGroups: new Set(),
          filter: "all",
          isGrouped: true,
          operations: {},
          seenOperations: new Set(),
          sort: "default",
          workerStatus: "idle",
        });
      };
    }, []);

    return <Story />;
  };
};

/**
 * Decorator that wraps the story in a fixed-height dark container.
 * Useful for container components that rely on height: 100%.
 */
export const withPluginContainer: Decorator = (Story) => (
  <div
    style={{
      background: theme.colors.background,
      color: theme.colors.textPrimary,
      fontFamily: theme.fontFamily.sans,
      height: "500px",
      width: "100%",
    }}
  >
    <Story />
  </div>
);
