/**
 * Internal state behind `@mugenlabs/msw-devtools/persistence`. Kept out of that
 * entry so `openPersistenceKey` is not part of the public API. The value lives
 * on `globalThis` so a duplicated copy of this module still sees it.
 */
const SLOT = Symbol.for("@mugenlabs/msw-devtools.persistence-key");

interface Slot {
  key?: string;
  /** The key the store opened with. Set once the store has been created. */
  openedWith?: string;
}

type SlotHost = typeof globalThis & { [SLOT]?: Slot };

const host = globalThis as SlotHost;

export const slot = (): Slot => {
  host[SLOT] ??= {};
  return host[SLOT];
};

/** localStorage key used when `setPersistenceKey` was not called. */
export const DEFAULT_PERSISTENCE_KEY = "msw-devtools-store";

/**
 * Called once by the store when it is created. Returns the key and fixes it, so
 * a later `setPersistenceKey` warns instead of splitting the store's reads and
 * writes across two keys.
 */
export const openPersistenceKey = (): string => {
  const key = slot().key ?? DEFAULT_PERSISTENCE_KEY;
  slot().openedWith = key;
  return key;
};
