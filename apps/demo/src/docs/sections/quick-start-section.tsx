import { Zap } from "lucide-react";
import { CodeBlock } from "../components/code-block";
import { SectionTitle } from "../components/section-title";
import { StepNumber } from "../components/step-number";
import { inlineCode, prose } from "../styles";

export const QuickStartSection = () => (
  <section className="mb-12">
    <SectionTitle id="quick-start">
      <Zap size={20} />
      Quick Start
    </SectionTitle>

    {/* Step 1 */}
    <div className="mb-3 flex items-center gap-2.5">
      <StepNumber n={1} />
      <span className="font-semibold text-[15px] text-text-primary">Register your handlers</span>
    </div>
    <p className={prose}>
      Pass your MSW handlers directly to <code className={inlineCode}>registerRestMocks</code> or{" "}
      <code className={inlineCode}>registerGraphqlMocks</code>. The operation name, method, and path
      are auto-derived from the handler:
    </p>
    <div className="mb-7">
      <CodeBlock lang="typescript">
        {`import { http, HttpResponse, graphql } from "msw";
import { registerRestMocks, registerGraphqlMocks } from "msw-devtools-plugin";

// REST — pass your HttpHandler directly
registerRestMocks(
  {
    handler: http.get("/api/users", () =>
      HttpResponse.json([{ id: 1, name: "Alice" }])
    ),
    group: "Users",
  },
);

// GraphQL — pass your GraphQLHandler directly
registerGraphqlMocks(
  {
    handler: graphql.query("GetUser", () =>
      HttpResponse.json({ data: { user: { id: 1, name: "Alice" } } })
    ),
    group: "Users",
  },
);`}
      </CodeBlock>
    </div>

    {/* Step 2 */}
    <div className="mb-3 flex items-center gap-2.5">
      <StepNumber n={2} />
      <span className="font-semibold text-[15px] text-text-primary">Mount the DevTools plugin</span>
    </div>
    <p className={prose}>
      Add the TanStack DevTools component to your app with the MSW plugin. The service worker starts
      automatically when the plugin mounts:
    </p>
    <div className="mb-7">
      <CodeBlock lang="tsx">
        {`// App.tsx
import { TanStackDevtools } from "@tanstack/react-devtools";
import { createMswDevToolsPlugin } from "msw-devtools-plugin";
import "./mocks/setup"; // your registration calls

function App() {
  return (
    <>
      <YourApp />
      <TanStackDevtools plugins={[createMswDevToolsPlugin()]} />
    </>
  );
}`}
      </CodeBlock>
    </div>

    {/* Step 3 */}
    <div className="mb-3 flex items-center gap-2.5">
      <StepNumber n={3} />
      <span className="font-semibold text-[15px] text-text-primary">
        Register adapters <span className="font-normal text-text-dimmed text-xs">(optional)</span>
      </span>
    </div>
    <p className={prose}>
      Adapters connect your data-fetching library to the devtools. When you toggle a mock or switch
      variants, the adapter automatically refetches/revalidates so your UI updates immediately.
    </p>
    <div className="!mb-0">
      <CodeBlock lang="typescript">
        {`import { registerAdapter } from "msw-devtools-plugin";
import { createTanStackQueryAdapter } from "msw-devtools-plugin/adapters/tanstack-query";
import { createUrqlAdapter } from "msw-devtools-plugin/adapters/urql";
import { createApolloAdapter } from "msw-devtools-plugin/adapters/apollo";
import { createAxiosAdapter } from "msw-devtools-plugin/adapters/axios";

// Pick the adapters matching your stack:
registerAdapter(createTanStackQueryAdapter(queryClient));
registerAdapter(createUrqlAdapter());
registerAdapter(createApolloAdapter(apolloClient));
registerAdapter(createAxiosAdapter());`}
      </CodeBlock>
    </div>
  </section>
);
