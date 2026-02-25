import { FileCode } from "lucide-react";
import { CodeBlock } from "../components/code-block";
import { SectionTitle } from "../components/section-title";
import { TipBox } from "../components/tip-box";
import { inlineCode, prose } from "../styles";

export const ExistingHandlersSection = () => (
  <section className="mb-12">
    <SectionTitle id="existing-handlers">
      <FileCode size={20} />
      Using Existing Handlers
    </SectionTitle>
    <p className={prose}>
      Most projects already have MSW handlers for unit tests, E2E, or Storybook. You can pass them
      directly to <code className={inlineCode}>registerRestMocks</code> or{" "}
      <code className={inlineCode}>registerGraphqlMocks</code> &mdash; no conversion needed.
    </p>

    {/* Basic registration */}
    <h3 className="mx-0 mt-6 mb-3 font-semibold text-base text-text-primary">
      Register handlers directly
    </h3>
    <p className={prose}>
      Pass your existing MSW handlers directly. The devtools auto-derives the operation name,
      method, and path from each handler:
    </p>
    <div className="mb-6">
      <CodeBlock lang="typescript">
        {`import { registerRestMocks, registerGraphqlMocks } from "msw-devtools-plugin";

// Your existing handlers — the same ones you use in tests
import { getUserHandler, getProductsHandler } from "./mocks/handlers";
import { getUserProfileQuery, updateSettingsMutation } from "./mocks/graphql-handlers";

// Register REST handlers
registerRestMocks(
  { handler: getUserHandler, group: "Users" },
  { handler: getProductsHandler, group: "Products" },
);

// Register GraphQL handlers
registerGraphqlMocks(
  { handler: getUserProfileQuery, group: "Users" },
  { handler: updateSettingsMutation, group: "Settings" },
);`}
      </CodeBlock>
    </div>

    {/* Multiple variants */}
    <h3 className="mx-0 mt-6 mb-3 font-semibold text-base text-text-primary">
      Multiple variants for the same endpoint
    </h3>
    <p className={prose}>
      If you have multiple success scenarios (e.g. full list vs empty list), use the{" "}
      <code className={inlineCode}>variants</code> array:
    </p>
    <div className="mb-6">
      <CodeBlock lang="typescript">
        {`import { registerRestMocks } from "msw-devtools-plugin";
import { http, HttpResponse } from "msw";

registerRestMocks({
  variants: [
    http.get("/api/users", () => HttpResponse.json([{ id: 1, name: "Alice" }])),
    { handler: http.get("/api/users", () => HttpResponse.json([])), label: "Empty list" },
  ],
  group: "Users",
});`}
      </CodeBlock>
    </div>

    <TipBox>
      <strong className="text-text-primary">Tip:</strong> Error scenarios (401, 404, 429, 500,
      Network Error) are handled by the Error Override UI in the devtools panel &mdash; no need to
      create separate error variants.
    </TipBox>
  </section>
);
