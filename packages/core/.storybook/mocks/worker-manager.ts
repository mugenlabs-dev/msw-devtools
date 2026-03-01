/**
 * Mock worker-manager for Storybook.
 * startWorker() is a no-op — stories use withMockSeed() to seed workerStatus directly.
 */
export const startWorker = () => Promise.resolve(null);
export const getWorker = () => null;
export const refreshHandlers = () => undefined;
