import { setPersistenceKey } from "@mugenlabs/msw-devtools/persistence";

import { playgroundPersistenceKey } from "../playground-persistence";

setPersistenceKey(playgroundPersistenceKey("3"));
