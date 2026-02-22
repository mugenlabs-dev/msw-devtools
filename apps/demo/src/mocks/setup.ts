import { registerMocks } from "msw-devtool";
import { graphqlDescriptors, restDescriptors } from "./descriptors";

registerMocks(...graphqlDescriptors, ...restDescriptors);
