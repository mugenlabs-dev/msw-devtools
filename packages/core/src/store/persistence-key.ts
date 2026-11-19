import { DEFAULT_PERSISTENCE_KEY, slot } from "./persistence-slot";

export { DEFAULT_PERSISTENCE_KEY } from "./persistence-slot";

/**
 * Choose where the panel stores toggles. Call this before importing
 * `@mugenlabs/msw-devtools`. This module does not load the store, so two
 * bundles on one origin can keep separate keys. The value lives on
 * `globalThis` so a duplicated copy of this module still sees it.
 */
export const setPersistenceKey = (key: string): void => {
  if (key.trim() === "") {
    throw new Error("msw-devtools persistence key must not be empty");
  }
  const { openedWith } = slot();
  if (openedWith !== undefined && openedWith !== key) {
    console.warn(
      `[msw-devtools] setPersistenceKey("${key}") ran after the store opened with "${openedWith}", so it has no effect. ` +
        "Call it in a module that is imported before @mugenlabs/msw-devtools."
    );
    return;
  }
  slot().key = key;
};

/** Key the store will read. Falls back to {@link DEFAULT_PERSISTENCE_KEY}. */
export const getPersistenceKey = (): string => slot().key ?? DEFAULT_PERSISTENCE_KEY;
