import { Code2, Puzzle, Settings, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { CodeBlock } from "../components/code-block";
import { SectionTitle } from "../components/section-title";
import { prose } from "../styles";

// ---------------------------------------------------------------------------
// Badge — small coloured pill for return type or tag
// ---------------------------------------------------------------------------
const Badge = ({ children, variant = "default" }: { children: ReactNode; variant?: string }) => {
  const colors: Record<string, string> = {
    blue: "bg-accent-blue/10 text-accent-blue border-accent-blue/20",
    default: "bg-accent-purple/10 text-accent-purple border-accent-purple/20",
    green: "bg-accent-green/10 text-accent-green border-accent-green/20",
    muted: "bg-bg-tertiary text-text-muted border-border-secondary",
  };

  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 font-mono text-[11px] leading-tight ${colors[variant] ?? colors.default}`}
    >
      {children}
    </span>
  );
};

// ---------------------------------------------------------------------------
// API Entry — card-style block for a single function
// ---------------------------------------------------------------------------
const ApiEntry = ({
  badge,
  badgeVariant,
  children,
  description,
  name,
  signature,
}: {
  badge?: string;
  badgeVariant?: string;
  children?: ReactNode;
  description: string;
  name: string;
  signature: string;
}) => (
  <div
    className="group concentric rounded-xl border border-border-primary bg-card-bg/50 p-5 transition-[border-color,box-shadow] duration-200 hover:border-border-secondary hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
    id={`api-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
    style={{ ["--_radius" as string]: "0.75rem", ["--_pad" as string]: "1.25rem" }}
  >
    <div className="mb-2 flex flex-wrap items-center gap-2">
      <h4 className="m-0 font-bold font-mono text-[15px] text-accent-purple">{name}</h4>
      {badge ? <Badge variant={badgeVariant}>{badge}</Badge> : null}
    </div>
    <div className="concentric-inner mb-3 bg-bg-tertiary/60 px-3 py-2">
      <code className="code-scroll-fade block overflow-x-auto whitespace-pre font-mono text-[12.5px] text-text-secondary leading-relaxed">
        {signature}
      </code>
    </div>
    <p className="m-0 text-[13.5px] text-text-tertiary leading-relaxed">{description}</p>
    {children}
  </div>
);

// ---------------------------------------------------------------------------
// Category heading with icon
// ---------------------------------------------------------------------------
const ApiCategory = ({
  children,
  description,
  icon,
  title,
}: {
  children: ReactNode;
  description?: string;
  icon: ReactNode;
  title: string;
}) => (
  <div className="mt-10 mb-6 first:mt-4">
    <div className="mb-1 flex items-center gap-2.5">
      <span className="flex size-8 items-center justify-center rounded-lg bg-accent-purple/10 text-accent-purple">
        {icon}
      </span>
      <h3 className="m-0 font-bold text-[17px] text-text-primary">{title}</h3>
    </div>
    {description ? (
      <p className="mt-1 mb-4 ml-[42px] text-[13px] text-text-muted">{description}</p>
    ) : (
      <div className="mb-4" />
    )}
    <div className="flex flex-col gap-3">{children}</div>
  </div>
);

// ---------------------------------------------------------------------------
// Param table — cleaner styling
// ---------------------------------------------------------------------------
const ParamTable = ({
  params,
}: {
  params: Array<{ defaultVal?: string; description: string; name: string; type: string }>;
}) => (
  <div className="mt-3 overflow-x-auto rounded-lg border border-border-primary">
    <table className="w-full border-collapse text-[12.5px]">
      <thead>
        <tr className="bg-bg-tertiary/40">
          {["Parameter", "Type", "Default", "Description"].map((h) => (
            <th
              className="border-border-primary border-b px-3 py-2 text-start font-semibold text-[11px] text-text-muted uppercase tracking-wider"
              key={h}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {params.map((p) => (
          <tr className="border-border-primary border-b last:border-b-0" key={p.name}>
            <td className="px-3 py-2 font-medium font-mono text-accent-blue">{p.name}</td>
            <td className="px-3 py-2 font-mono text-text-secondary">{p.type}</td>
            <td className="px-3 py-2 font-mono text-text-dimmed">{p.defaultVal ?? "\u2014"}</td>
            <td className="px-3 py-2 text-text-tertiary">{p.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ---------------------------------------------------------------------------
// API Reference Section
// ---------------------------------------------------------------------------
export const ApiReferenceSection = () => (
  <section className="mb-12">
    <SectionTitle id="api-reference">
      <Code2 size={20} />
      API Reference
    </SectionTitle>
    <p className={prose}>
      The essentials you need to get started, plus advanced exports for custom integrations.
    </p>

    {/* ── Core ── */}
    <ApiCategory
      description="The functions you'll use in every project."
      icon={<Sparkles size={16} />}
      title="Core"
    >
      <ApiEntry
        badge="OperationHandlesFor<Defs>"
        badgeVariant="green"
        description="Register one or more REST mocks from MSW HttpHandlers. Operation metadata (method, path, operationName) is auto-derived from the handler. Returns type-safe operation handles — an array (destructurable in registration order) that is also indexable by operationName — to pass to useMockRefetch instead of raw strings."
        name="registerRestMocks"
        signature="registerRestMocks<const Defs extends readonly RestMockDef[]>(...defs: Defs): OperationHandlesFor<Defs>"
      >
        <ParamTable
          params={[
            {
              description: "MSW HttpHandler (shorthand for single variant)",
              name: "def.handler",
              type: "HttpHandler",
            },
            {
              description: "Multiple handler variants for the same endpoint",
              name: "def.variants",
              type: "HandlerVariantInput<HttpHandler>[]",
            },
            {
              description: "Override the auto-derived operation name",
              name: "def.operationName",
              type: "string",
            },
            {
              description: "Optional grouping label",
              name: "def.group",
              type: "string",
            },
          ]}
        />
      </ApiEntry>
      <ApiEntry
        badge="OperationHandlesFor<Defs>"
        badgeVariant="green"
        description="Register one or more GraphQL mocks from MSW GraphQLHandlers. Operation metadata (operationName, operationType) is auto-derived from the handler. Returns type-safe operation handles — an array (destructurable in registration order) that is also indexable by operationName — to pass to useMockRefetch instead of raw strings."
        name="registerGraphqlMocks"
        signature="registerGraphqlMocks<const Defs extends readonly GraphqlMockDef[]>(...defs: Defs): OperationHandlesFor<Defs>"
      >
        <ParamTable
          params={[
            {
              description: "MSW GraphQLHandler (shorthand for single variant)",
              name: "def.handler",
              type: "GraphQLHandler",
            },
            {
              description: "Multiple handler variants for the same operation",
              name: "def.variants",
              type: "HandlerVariantInput<GraphQLHandler>[]",
            },
            {
              description: "Override the auto-derived operation name",
              name: "def.operationName",
              type: "string",
            },
            {
              description: "Override the auto-derived operation type",
              name: "def.operationType",
              type: '"query" | "mutation"',
            },
            {
              description: "Optional grouping label",
              name: "def.group",
              type: "string",
            },
          ]}
        />
      </ApiEntry>
      <ApiEntry
        badge="TanStackDevtoolsReactPlugin"
        badgeVariant="default"
        description="Creates a TanStack DevTools plugin that auto-starts the MSW service worker on mount. No manual worker setup required."
        name="createMswDevToolsPlugin"
        signature="createMswDevToolsPlugin(options?: MswDevToolsPluginOptions): TanStackDevtoolsReactPlugin"
      >
        <ParamTable
          params={[
            {
              defaultVal: "true",
              description: "Whether the devtools panel starts open",
              name: "options.defaultOpen",
              type: "boolean",
            },
            {
              defaultVal: "'MSW Mocks'",
              description: "Plugin display name",
              name: "options.name",
              type: "string",
            },
          ]}
        />
      </ApiEntry>
      <ApiEntry
        badge="() => void"
        badgeVariant="muted"
        description="Register a data-fetching adapter. When mock config changes, the adapter automatically refetches queries. Returns an unregister function for cleanup. Change kinds include toggle, variant, json-override, status-override, headers-override, and bulk enable-all / disable-all."
        name="registerAdapter"
        signature="registerAdapter(adapter: MswDevToolAdapter): () => void"
      />
    </ApiCategory>

    {/* ── React Hooks ── */}
    <ApiCategory
      description="React hooks for integrating with the mock system."
      icon={<Puzzle size={16} />}
      title="React Hooks"
    >
      <ApiEntry
        badge="void"
        badgeVariant="muted"
        description="Listens for mock update events matching the given operation and calls your refetch callback. Accepts either an OperationHandle (recommended — returned from registration, so typos are caught at build time) or a raw operation name string. Matches per-operation events and bulk Enable all / Disable all via affectsOperation. Use with Axios or plain fetch."
        name="useMockRefetch"
        signature="useMockRefetch(operation: OperationHandle | string, refetch: () => void): void"
      >
        <div className="mt-3">
          <CodeBlock lang="tsx">
            {`const [users] = registerRestMocks({ handler: usersHandler });

function UserCard() {
  const { data, refetch } = useMyFetch("/api/users/1");
  useMockRefetch(users, refetch); // or useMockRefetch("GET /api/users/1", refetch)
  return <div>{data?.name}</div>;
}`}
          </CodeBlock>
        </div>
      </ApiEntry>
    </ApiCategory>

    {/* ── Advanced ── */}
    <ApiCategory
      description="For custom integrations. Most apps won't need these."
      icon={<Settings size={16} />}
      title="Advanced"
    >
      <ApiEntry
        badge="Promise<SetupWorker>"
        badgeVariant="blue"
        description="Manually start the MSW service worker with custom options. The plugin auto-starts the worker on mount — only use this if you need a custom serviceWorkerUrl or other non-default options. If the worker is already running, the plugin skips auto-start."
        name="startWorker"
        signature="startWorker(options?: WorkerOptions): Promise<SetupWorker>"
      >
        <ParamTable
          params={[
            {
              defaultVal: "'bypass'",
              description: "How to handle requests with no matching handler",
              name: "options.onUnhandledRequest",
              type: "'bypass' | 'warn' | 'error'",
            },
            {
              defaultVal: "true",
              description: "Suppress MSW console logging",
              name: "options.quiet",
              type: "boolean",
            },
            {
              defaultVal: "'/mockServiceWorker.js'",
              description: "Custom path to the service worker script",
              name: "options.serviceWorkerUrl",
              type: "string",
            },
          ]}
        />
        <div className="mt-3">
          <CodeBlock lang="typescript">
            {`// Example: app deployed under a sub-path (e.g. GitHub Pages)
import { startWorker } from "@mugenlabs/msw-devtools";

void startWorker({
  serviceWorkerUrl: "/my-app/mockServiceWorker.js",
});`}
          </CodeBlock>
        </div>
      </ApiEntry>
      <ApiEntry
        badge="Promise<void>"
        badgeVariant="default"
        description="Stops the MSW service worker started by startWorker() and detaches everything the devtools attached to it (registry subscription, request tracker, SPA navigation patch). Registered mocks and persisted configuration are kept, so a later startWorker() resumes where it left off. Useful in tests and hot-reload setups."
        name="stopWorker"
        signature="stopWorker(): Promise<void>"
      />
      <ApiEntry
        badge='"*"'
        badgeVariant="muted"
        description='Sentinel operationName ("*") on bulk enable-all / disable-all events. Built-in cache adapters ignore the name and refetch everything; custom adapters that compare operationName with === miss Enable all / Disable all. Match with affectsOperation instead.'
        name="ALL_OPERATIONS"
        signature='const ALL_OPERATIONS: "*"'
      />
      <ApiEntry
        badge="boolean"
        badgeVariant="green"
        description='Returns true when a mock update event applies to the given operation — either a per-operation match or a bulk ALL_OPERATIONS ("*") event. useMockRefetch and the URQL mockRefetchExchange already use this.'
        name="affectsOperation"
        signature="affectsOperation(event: MockUpdateEvent, operationName: string): boolean"
      />
      <ApiEntry
        badge="union"
        badgeVariant="default"
        description='Change kind on each adapter event. Status code and header edits dispatch "status-override" and "headers-override" so clients refetch the overridden response. Enable all / Disable all dispatch a single event whose operationName is ALL_OPERATIONS.'
        name="MockChangeType"
        signature={
          '"toggle" | "variant" | "json-override" | "status-override" | "headers-override" | "enable-all" | "disable-all"'
        }
      />
    </ApiCategory>
  </section>
);
