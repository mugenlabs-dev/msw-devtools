import { Info, Plug } from "lucide-react";
import { Accordion } from "../components/accordion";
import { CodeBlock } from "../components/code-block";
import { SectionTitle } from "../components/section-title";
import { inlineCode, prose } from "../styles";

export const AdapterSection = () => (
  <section className="mb-12">
    <SectionTitle id="adapters">
      <Plug size={20} />
      Adapter Setup
    </SectionTitle>
    <p className={prose}>
      Each adapter hooks into a specific library&apos;s cache invalidation mechanism. You only need
      to register the adapters for the libraries you actually use.
    </p>

    {/* TanStack Query */}
    <h3 className="mx-0 mt-6 mb-3 font-semibold text-base text-text-primary">TanStack Query</h3>
    <p className={prose}>
      Invalidates all queries via{" "}
      <code className={inlineCode}>queryClient.invalidateQueries()</code> when mock config changes.
    </p>
    <div className="!mb-0">
      <CodeBlock lang="typescript">
        {`import { QueryClient } from "@tanstack/react-query";
import { registerAdapter } from "msw-devtools-plugin";
import { createTanStackQueryAdapter } from "msw-devtools-plugin/adapters/tanstack-query";

const queryClient = new QueryClient();
registerAdapter(createTanStackQueryAdapter(queryClient));`}
      </CodeBlock>
    </div>
    <Accordion title="How it works">
      <p className={`${prose} !m-0`}>
        When you toggle a mock or switch variants in the devtools, a{" "}
        <code className={inlineCode}>CustomEvent</code> is dispatched on the window. The TanStack
        Query adapter listens for this event and calls{" "}
        <code className={inlineCode}>queryClient.invalidateQueries()</code>, which marks every query
        in the cache as stale. React Query then automatically refetches all active (mounted)
        queries, picking up the new mock responses from MSW.
      </p>
    </Accordion>
    <div className="mb-6" />

    {/* URQL */}
    <h3 className="mx-0 mt-6 mb-3 font-semibold text-base text-text-primary">URQL</h3>
    <p className={prose}>
      Uses a custom exchange that re-executes active queries. Add{" "}
      <code className={inlineCode}>mockRefetchExchange</code> to your URQL client&apos;s exchange
      pipeline:
    </p>
    <div className="!mb-0">
      <CodeBlock lang="typescript">
        {`import { createClient, cacheExchange, fetchExchange } from "@urql/core";
import { registerAdapter } from "msw-devtools-plugin";
import { createUrqlAdapter, mockRefetchExchange } from "msw-devtools-plugin/adapters/urql";

registerAdapter(createUrqlAdapter());

const client = createClient({
  url: "/graphql",
  exchanges: [cacheExchange, mockRefetchExchange, fetchExchange],
});`}
      </CodeBlock>
    </div>
    <Accordion title="How it works">
      <p className={`${prose} !m-0`}>
        URQL works differently from other adapters. The adapter itself is a no-op registration
        marker &mdash; the actual refetch logic lives in the{" "}
        <code className={inlineCode}>mockRefetchExchange</code>, a custom URQL exchange that you add
        to your client&apos;s exchange pipeline. The exchange tracks all active operations and
        listens for mock update events on the window. When a mock changes, it finds queries whose
        operation name matches and re-executes them with a{" "}
        <code className={inlineCode}>&quot;network-only&quot;</code> request policy, bypassing the
        cache and fetching fresh data from MSW.
      </p>
    </Accordion>
    <div className="mb-6" />

    {/* Apollo */}
    <h3 className="mx-0 mt-6 mb-3 font-semibold text-base text-text-primary">Apollo Client</h3>
    <p className={prose}>
      Calls <code className={inlineCode}>apolloClient.refetchQueries()</code> to re-run all active
      queries.
    </p>
    <div className="!mb-0">
      <CodeBlock lang="typescript">
        {`import { ApolloClient, InMemoryCache } from "@apollo/client";
import { registerAdapter } from "msw-devtools-plugin";
import { createApolloAdapter } from "msw-devtools-plugin/adapters/apollo";

const apolloClient = new ApolloClient({ uri: "/graphql", cache: new InMemoryCache() });
registerAdapter(createApolloAdapter(apolloClient));`}
      </CodeBlock>
    </div>
    <Accordion title="How it works">
      <p className={`${prose} !m-0`}>
        The Apollo adapter listens for mock update events and calls{" "}
        <code className={inlineCode}>
          apolloClient.refetchQueries({"{"} include: &quot;active&quot; {"}"})
        </code>
        . This tells Apollo to re-run every query that currently has active observers (i.e., any
        component rendering data from a query). The queries bypass the cache and hit MSW again,
        picking up whatever mock variant is now active.
      </p>
    </Accordion>
    <div className="mb-6" />

    {/* SWR */}
    <h3 className="mx-0 mt-6 mb-3 font-semibold text-base text-text-primary">SWR</h3>
    <p className={prose}>
      Calls the global <code className={inlineCode}>mutate()</code> to revalidate all SWR keys.
    </p>
    <div className="!mb-0">
      <CodeBlock lang="tsx">
        {`import { useSWRConfig } from "swr";
import { registerAdapter } from "msw-devtools-plugin";
import { createSwrAdapter } from "msw-devtools-plugin/adapters/swr";

function SetupAdapter() {
  const { mutate } = useSWRConfig();

  useEffect(() => {
    const unregister = registerAdapter(createSwrAdapter(mutate));
    return unregister;
  }, [mutate]);

  return null;
}`}
      </CodeBlock>
    </div>
    <Accordion title="How it works">
      <p className={`${prose} !m-0`}>
        The SWR adapter calls the global <code className={inlineCode}>mutate()</code> function with
        a matcher that returns <code className={inlineCode}>true</code> for all cache keys and{" "}
        <code className={inlineCode}>{"{ revalidate: true }"}</code>. This tells SWR to revalidate
        every cached entry, triggering fresh network requests that hit MSW with the updated mock
        configuration. Because SWR&apos;s <code className={inlineCode}>mutate</code> is scoped to
        the provider context, the adapter must be registered inside a React component that has
        access to <code className={inlineCode}>useSWRConfig()</code>.
      </p>
    </Accordion>
    <div className="mb-6" />

    {/* Axios / fetch */}
    <h3 className="mx-0 mt-6 mb-3 font-semibold text-base text-text-primary">
      Axios &amp; plain fetch
    </h3>
    <div className="mt-4 mb-4 flex gap-3 rounded-lg border border-accent-blue/20 bg-accent-blue/5 px-4 py-3">
      <Info className="mt-0.5 shrink-0 text-accent-blue" size={16} />
      <p className="m-0 text-[13px] text-text-secondary leading-relaxed">
        <strong>Consider using a server-state library instead.</strong> Libraries like TanStack
        Query, SWR, or Apollo provide built-in caching, deduplication, and automatic refetching —
        making the integration with msw-devtool seamless and zero-config. The Axios/fetch adapter
        requires manual <code className={inlineCode}>useMockRefetch</code> wiring in every
        component, which adds boilerplate and is harder to maintain.
      </p>
    </div>
    <p className={prose}>
      Axios and <code className={inlineCode}>fetch()</code> have no query cache. Register the Axios
      adapter as a marker, then use the <code className={inlineCode}>useMockRefetch</code> hook in
      your components to re-run requests when mock config changes:
    </p>
    <div className="!mb-0">
      <CodeBlock lang="tsx">
        {`import { registerAdapter } from "msw-devtools-plugin";
import { createAxiosAdapter } from "msw-devtools-plugin/adapters/axios";
import { useMockRefetch } from "msw-devtools-plugin";

registerAdapter(createAxiosAdapter());

// In your component:
function UserCard() {
  const { data, refetch } = useMyFetch("/api/users/1");
  useMockRefetch("GET Users", refetch);

  return <div>{data?.name}</div>;
}`}
      </CodeBlock>
    </div>
    <Accordion title="How it works">
      <p className={`${prose} !m-0`}>
        Unlike the other libraries, Axios and <code className={inlineCode}>fetch()</code> don&apos;t
        have a built-in query cache or automatic refetch mechanism. The adapter itself is a no-op
        marker that registers the library with the devtools. To get live updates, you use the{" "}
        <code className={inlineCode}>useMockRefetch</code> hook in your components. This hook
        listens for mock update events matching a specific operation name and calls your refetch
        callback when the mock changes, giving you per-operation control over what gets refreshed.
      </p>
    </Accordion>
  </section>
);
