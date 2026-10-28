export type PlaygroundMajor = "2" | "3";

/** localStorage key for one playground bundle. The two majors share an origin. */
export const playgroundPersistenceKey = (major: PlaygroundMajor): string =>
  `msw-devtools-store:${major}`;
