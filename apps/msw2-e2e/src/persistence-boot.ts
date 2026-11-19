import { setPersistenceKey } from "@mugenlabs/msw-devtools/persistence";
import { playgroundPersistenceKey } from "#demo/playground-persistence";

setPersistenceKey(playgroundPersistenceKey("2"));
