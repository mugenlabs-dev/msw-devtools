const SLOT = Symbol.for("@mugenlabs/msw-devtools.persistence-key");

type SlotHost = typeof globalThis & { [SLOT]?: { key?: string } };

const host = globalThis as SlotHost;

const slot = (): { key?: string } => {
  host[SLOT] ??= {};
  return host[SLOT];
};

/** localStorage key used when {@link setPersistenceKey} was not called. */
export const DEFAULT_PERSISTENCE_KEY = "msw-devtools-store";

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
  slot().key = key;
};

/** Key the store will read. Falls back to {@link DEFAULT_PERSISTENCE_KEY}. */
export const getPersistenceKey = (): string => slot().key ?? DEFAULT_PERSISTENCE_KEY;
