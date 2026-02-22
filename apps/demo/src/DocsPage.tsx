import { useEffect, useState, useCallback, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { createHighlighter, type Highlighter } from "shiki";
import {
	Link as LinkIcon,
	Check,
	Copy,
	ToggleRight,
	Shuffle,
	PenLine,
	Radio,
	SlidersHorizontal,
	RefreshCw,
	Package,
	Zap,
	Terminal,
	Plug,
	ArrowRight,
} from "lucide-react";
import { Aurora } from "./Aurora";
import { useTheme } from "./ThemeContext";

// ---------------------------------------------------------------------------
// Shiki highlighter (loaded once, cached)
// ---------------------------------------------------------------------------
let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter() {
	if (!highlighterPromise) {
		highlighterPromise = createHighlighter({
			themes: ["github-dark"],
			langs: ["typescript", "tsx", "bash"],
		});
	}
	return highlighterPromise;
}

// ---------------------------------------------------------------------------
// Global style injection (once) — fixes shiki pre styling
// ---------------------------------------------------------------------------
let stylesInjected = false;
function injectShikiStyles() {
	if (stylesInjected) return;
	stylesInjected = true;
	const style = document.createElement("style");
	style.textContent = `
		.shiki-wrapper pre.shiki {
			margin: 0 !important;
			padding: 16px 20px !important;
			border-radius: 0 !important;
			background: var(--code-block-bg) !important;
		}
		.shiki-wrapper code {
			font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace !important;
		}
	`;
	document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// CopyButton — copies text to clipboard with check feedback
// ---------------------------------------------------------------------------
function CopyButton({ text }: { text: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(text).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	}, [text]);

	return (
		<button
			type="button"
			onClick={handleCopy}
			aria-label="Copy code"
			style={{
				position: "absolute",
				top: 10,
				right: 10,
				background: copied ? "rgba(74, 222, 128, 0.15)" : "rgba(255,255,255,0.06)",
				border: "1px solid",
				borderColor: copied ? "rgba(74, 222, 128, 0.3)" : "rgba(255,255,255,0.1)",
				borderRadius: 6,
				padding: "5px 6px",
				cursor: "pointer",
				color: copied ? "var(--accent-green)" : "#888",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				transition: "all 0.15s",
				opacity: copied ? 1 : 0.6,
			}}
			onMouseEnter={(e) => {
				if (!copied) e.currentTarget.style.opacity = "1";
			}}
			onMouseLeave={(e) => {
				if (!copied) e.currentTarget.style.opacity = "0.6";
			}}
		>
			{copied ? <Check size={14} /> : <Copy size={14} />}
		</button>
	);
}

// ---------------------------------------------------------------------------
// CodeBlock — async syntax-highlighted code with copy button
// ---------------------------------------------------------------------------
function CodeBlock({
	children,
	lang = "typescript",
}: {
	children: string;
	lang?: "typescript" | "tsx" | "bash";
}) {
	const [html, setHtml] = useState<string | null>(null);
	const trimmed = children.trim();

	useEffect(() => {
		injectShikiStyles();
		let cancelled = false;
		getHighlighter().then((hl) => {
			if (cancelled) return;
			const result = hl.codeToHtml(trimmed, {
				lang,
				theme: "github-dark",
			});
			setHtml(result);
		});
		return () => {
			cancelled = true;
		};
	}, [trimmed, lang]);

	return (
		<div
			style={{
				position: "relative",
				borderRadius: 8,
				border: "1px solid var(--border-primary)",
				overflow: "hidden",
				background: "var(--code-block-bg)",
			}}
		>
			<CopyButton text={trimmed} />
			{html ? (
				<div
					className="shiki-wrapper"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: shiki output is safe
					dangerouslySetInnerHTML={{ __html: html }}
					style={{
						fontSize: 13,
						lineHeight: 1.6,
					}}
				/>
			) : (
				<pre
					style={{
						background: "var(--code-block-bg)",
						padding: "16px 20px",
						margin: 0,
						fontSize: 13,
						lineHeight: 1.6,
						color: "#e0e0e0",
						fontFamily:
							"ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
					}}
				>
					<code>{trimmed}</code>
				</pre>
			)}
		</div>
	);
}

// ---------------------------------------------------------------------------
// InstallBlock — package manager toggle for install commands
// ---------------------------------------------------------------------------
const packageManagers = ["npm", "yarn", "pnpm", "bun"] as const;
type PackageManager = (typeof packageManagers)[number];

function getInstallCommand(pm: PackageManager, packages: string): string {
	switch (pm) {
		case "npm":
			return `npm install ${packages}`;
		case "yarn":
			return `yarn add ${packages}`;
		case "pnpm":
			return `pnpm add ${packages}`;
		case "bun":
			return `bun add ${packages}`;
	}
}

function InstallBlock({ packages }: { packages: string }) {
	const [pm, setPm] = useState<PackageManager>("npm");
	const command = getInstallCommand(pm, packages);

	return (
		<div>
			<div
				style={{
					display: "flex",
					gap: 2,
					marginBottom: 8,
				}}
			>
				{packageManagers.map((manager) => (
					<button
						key={manager}
						type="button"
						onClick={() => setPm(manager)}
						style={{
							fontSize: 12,
							fontWeight: 600,
							padding: "4px 12px",
							borderRadius: 6,
							border: "1px solid",
							borderColor:
								pm === manager ? "var(--border-tertiary)" : "transparent",
							background:
								pm === manager ? "var(--bg-tertiary)" : "transparent",
							color: pm === manager ? "var(--text-primary)" : "var(--text-dimmed)",
							cursor: "pointer",
							transition: "all 0.15s",
							fontFamily:
								"ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
						}}
					>
						{manager}
					</button>
				))}
			</div>
			<CodeBlock lang="bash">{command}</CodeBlock>
		</div>
	);
}

// ---------------------------------------------------------------------------
// SectionTitle — clickable hash-linked headings
// ---------------------------------------------------------------------------
function SectionTitle({
	children,
	id,
}: {
	children: ReactNode;
	id: string;
}) {
	const [copied, setCopied] = useState(false);

	const handleClick = useCallback(() => {
		const url = `${window.location.origin}${window.location.pathname}#${id}`;
		navigator.clipboard.writeText(url).then(() => {
			setCopied(true);
			window.history.replaceState(null, "", `#${id}`);
			setTimeout(() => setCopied(false), 2000);
		});
	}, [id]);

	return (
		<h2
			id={id}
			onClick={handleClick}
			style={{
				fontSize: 22,
				fontWeight: 700,
				color: "var(--text-primary)",
				margin: "0 0 16px 0",
				letterSpacing: "-0.01em",
				cursor: "pointer",
				display: "flex",
				alignItems: "center",
				gap: 8,
				scrollMarginTop: 72,
				transition: "color 0.3s",
			}}
		>
			{children}
			<span
				style={{
					opacity: copied ? 1 : 0.3,
					transition: "opacity 0.15s",
					display: "inline-flex",
				}}
			>
				{copied ? (
					<Check size={16} color="var(--accent-green)" />
				) : (
					<LinkIcon size={16} />
				)}
			</span>
		</h2>
	);
}

// ---------------------------------------------------------------------------
// FeatureCard
// ---------------------------------------------------------------------------
function FeatureCard({
	icon,
	title,
	description,
}: {
	icon: ReactNode;
	title: string;
	description: string;
}) {
	return (
		<div
			style={{
				background: "var(--card-bg)",
				border: "1px solid var(--border-primary)",
				borderRadius: 10,
				padding: "20px 24px",
				transition: "background 0.3s, border-color 0.3s",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 8,
					marginBottom: 8,
				}}
			>
				<span style={{ color: "var(--text-muted)" }}>{icon}</span>
				<h3
					style={{
						fontSize: 15,
						fontWeight: 600,
						color: "var(--text-primary)",
						margin: 0,
						transition: "color 0.3s",
					}}
				>
					{title}
				</h3>
			</div>
			<p
				style={{
					fontSize: 14,
					color: "var(--text-muted)",
					margin: 0,
					lineHeight: 1.5,
					transition: "color 0.3s",
				}}
			>
				{description}
			</p>
		</div>
	);
}

// ---------------------------------------------------------------------------
// StepNumber
// ---------------------------------------------------------------------------
function StepNumber({ n }: { n: number }) {
	return (
		<span
			style={{
				display: "inline-flex",
				alignItems: "center",
				justifyContent: "center",
				width: 24,
				height: 24,
				borderRadius: "50%",
				background: "var(--border-primary)",
				color: "var(--text-primary)",
				fontSize: 12,
				fontWeight: 700,
				flexShrink: 0,
				transition: "background 0.3s, color 0.3s",
			}}
		>
			{n}
		</span>
	);
}

// ---------------------------------------------------------------------------
// Prose helpers
// ---------------------------------------------------------------------------
const prose: React.CSSProperties = {
	fontSize: 14,
	color: "var(--text-tertiary)",
	margin: "0 0 16px 0",
	lineHeight: 1.7,
};

const inlineCode: React.CSSProperties = {
	color: "var(--text-secondary)",
	background: "var(--code-bg)",
	padding: "2px 6px",
	borderRadius: 4,
	fontSize: 13,
	fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
};

// ---------------------------------------------------------------------------
// DocsPage
// ---------------------------------------------------------------------------
export function DocsPage() {
	const { theme } = useTheme();

	// Scroll to hash on mount
	useEffect(() => {
		if (window.location.hash) {
			const el = document.getElementById(
				window.location.hash.slice(1),
			);
			el?.scrollIntoView({ behavior: "smooth" });
		}
	}, []);

	return (
		<div
			style={{
				color: "var(--text-secondary)",
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
				transition: "color 0.3s",
			}}
		>
			{/* ───── Hero with Aurora ───── */}
			<section
				style={{
					position: "relative",
					overflow: "hidden",
					marginBottom: 0,
					textAlign: "center",
					padding: "60px 24px 64px",
				}}
			>
				<Aurora
					colorStops={
						theme === "dark"
							? ["#3D2D6B", "#5F4B8B", "#7B68AE"]
							: ["#d4c0ff", "#b8a0e8", "#e0d0ff"]
					}
					amplitude={1.2}
					blend={0.6}
					speed={0.4}
					lightMode={theme === "light"}
				/>
				{/* gradient overlay to fade the aurora's dark edge into the page bg */}
				<div
					style={{
						position: "absolute",
						inset: 0,
						background:
							theme === "dark"
								? "linear-gradient(to bottom, transparent 0%, transparent 30%, var(--bg-primary) 95%)"
								: "linear-gradient(to bottom, rgba(248,248,248,0.3) 0%, rgba(248,248,248,0.6) 25%, var(--bg-primary) 70%)",
						pointerEvents: "none",
						zIndex: 1,
					}}
				/>
				<div
					style={{
						position: "relative",
						zIndex: 2,
						maxWidth: 720,
						margin: "0 auto",
					}}
				>
					<div
						style={{
							display: "flex",
							justifyContent: "center",
							marginBottom: 24,
						}}
					>
						<img
							src="/logo.svg"
							alt="msw-devtool logo"
							style={{
								width: 96,
								height: 96,
								borderRadius: 20,
							}}
						/>
					</div>
					<h1
						style={{
							fontSize: 40,
							fontWeight: 800,
							color: "var(--text-primary)",
							margin: "0 0 16px 0",
							letterSpacing: "-0.03em",
							fontFamily:
								"ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
							transition: "color 0.3s",
						}}
					>
						msw-devtool
					</h1>
					<p
						style={{
							fontSize: 18,
							color: "var(--text-muted)",
							margin: "0 0 32px 0",
							lineHeight: 1.5,
							transition: "color 0.3s",
						}}
					>
						A TanStack DevTools plugin for managing MSW mocks.
						<br />
						Toggle, customize, and inspect your mock handlers in real
						time.
					</p>
					<div
						style={{
							display: "flex",
							gap: 12,
							justifyContent: "center",
						}}
					>
						<Link
							to="/playground"
							style={{
								display: "inline-flex",
								alignItems: "center",
								gap: 8,
								padding: "10px 24px",
								background: "var(--hero-btn-bg)",
								color: "var(--hero-btn-color)",
								borderRadius: 8,
								fontSize: 14,
								fontWeight: 600,
								textDecoration: "none",
								transition: "opacity 0.15s, background 0.3s, color 0.3s",
							}}
						>
							Open Playground
							<ArrowRight size={14} />
						</Link>
					</div>
				</div>
			</section>

			<div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 160px" }}>

			{/* ───── Installation ───── */}
			<section style={{ marginBottom: 48 }}>
				<SectionTitle id="installation">
					<Package size={20} />
					Installation
				</SectionTitle>
				<p style={prose}>
					Install the core library:
				</p>
				<div style={{ marginBottom: 20 }}>
					<InstallBlock packages="msw-devtool" />
				</div>
				<p style={prose}>
					This library renders inside{" "}
					<a
						href="https://tanstack.com/devtools"
						target="_blank"
						rel="noopener noreferrer"
						style={{ color: "var(--accent-blue)", textDecoration: "none" }}
					>
						TanStack DevTools
					</a>
					, so you'll need that too:
				</p>
				<InstallBlock packages="@tanstack/react-devtools" />
			</section>

			{/* ───── Quick Start ───── */}
			<section style={{ marginBottom: 48 }}>
				<SectionTitle id="quick-start">
					<Zap size={20} />
					Quick Start
				</SectionTitle>

				{/* Step 1 */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 10,
						marginBottom: 12,
					}}
				>
					<StepNumber n={1} />
					<span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
						Define mock descriptors
					</span>
				</div>
				<p style={prose}>
					Mock descriptors tell the devtools which operations exist and
					what response variants are available. Use{" "}
					<code style={inlineCode}>withRestVariants</code> or{" "}
					<code style={inlineCode}>withStandardVariants</code> to
					generate standard success/error variants automatically:
				</p>
				<div style={{ marginBottom: 28 }}>
					<CodeBlock lang="typescript">
						{`import { registerMocks, withRestVariants, withStandardVariants } from "msw-devtool";
import type { RestMockDescriptor, GraphQLMockDescriptor } from "msw-devtool/types";

// REST mock — withRestVariants generates Success (200) + Network Error
const getUsers: RestMockDescriptor = {
  type: "rest",
  operationName: "GET Users",
  method: "get",
  path: "https://api.example.com/users",
  variants: withRestVariants([{ id: 1, name: "Alice" }]),
};

// GraphQL mock — withStandardVariants generates Success + Network Error + GraphQL Error
const getUser: GraphQLMockDescriptor = {
  type: "graphql",
  operationName: "GetUser",
  operationType: "query",
  variants: withStandardVariants({ user: { id: 1, name: "Alice" } }),
};

registerMocks(getUsers, getUser);`}
					</CodeBlock>
				</div>

				{/* Step 2 */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 10,
						marginBottom: 12,
					}}
				>
					<StepNumber n={2} />
					<span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
						Start the MSW worker
					</span>
				</div>
				<p style={prose}>
					Call <code style={inlineCode}>enableMocking()</code> before
					rendering your app. This starts the MSW service worker and
					registers all your mock handlers:
				</p>
				<div style={{ marginBottom: 28 }}>
					<CodeBlock lang="tsx">
						{`// main.tsx
import { enableMocking } from "msw-devtool";
import "./mocks/setup"; // your registerMocks() call

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});`}
					</CodeBlock>
				</div>

				{/* Step 3 */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 10,
						marginBottom: 12,
					}}
				>
					<StepNumber n={3} />
					<span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
						Mount the DevTools plugin
					</span>
				</div>
				<p style={prose}>
					Add the TanStack DevTools component to your app with the MSW
					plugin:
				</p>
				<div style={{ marginBottom: 28 }}>
					<CodeBlock lang="tsx">
						{`// App.tsx
import { TanStackDevtools } from "@tanstack/react-devtools";
import { createMswDevToolsPlugin } from "msw-devtool";

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

				{/* Step 4 */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 10,
						marginBottom: 12,
					}}
				>
					<StepNumber n={4} />
					<span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
						Register adapters{" "}
						<span
							style={{
								fontSize: 12,
								color: "var(--text-dimmed)",
								fontWeight: 400,
							}}
						>
							(optional)
						</span>
					</span>
				</div>
				<p style={prose}>
					Adapters connect your data-fetching library to the devtools.
					When you toggle a mock or switch variants, the adapter
					automatically refetches/revalidates so your UI updates
					immediately.
				</p>
				<div style={{ marginBottom: 0 }}>
					<CodeBlock lang="typescript">
						{`import { registerAdapter } from "msw-devtool";
import { createTanStackQueryAdapter } from "msw-devtool/adapters/tanstack-query";
import { createUrqlAdapter } from "msw-devtool/adapters/urql";
import { createApolloAdapter } from "msw-devtool/adapters/apollo";
import { createAxiosAdapter } from "msw-devtool/adapters/axios";

// Pick the adapters matching your stack:
registerAdapter(createTanStackQueryAdapter(queryClient));
registerAdapter(createUrqlAdapter());
registerAdapter(createApolloAdapter(apolloClient));
registerAdapter(createAxiosAdapter());`}
					</CodeBlock>
				</div>
			</section>

			{/* ───── Adapters (detailed) ───── */}
			<section style={{ marginBottom: 48 }}>
				<SectionTitle id="adapters">
					<Plug size={20} />
					Adapter Setup
				</SectionTitle>
				<p style={prose}>
					Each adapter hooks into a specific library's cache
					invalidation mechanism. You only need to register the
					adapters for the libraries you actually use.
				</p>

				{/* TanStack Query */}
				<h3
					style={{
						fontSize: 16,
						fontWeight: 600,
						color: "var(--text-primary)",
						margin: "24px 0 12px 0",
					}}
				>
					TanStack Query
				</h3>
				<p style={prose}>
					Invalidates all queries via{" "}
					<code style={inlineCode}>
						queryClient.invalidateQueries()
					</code>{" "}
					when mock config changes.
				</p>
				<div style={{ marginBottom: 24 }}>
					<CodeBlock lang="typescript">
						{`import { QueryClient } from "@tanstack/react-query";
import { registerAdapter } from "msw-devtool";
import { createTanStackQueryAdapter } from "msw-devtool/adapters/tanstack-query";

const queryClient = new QueryClient();
registerAdapter(createTanStackQueryAdapter(queryClient));`}
					</CodeBlock>
				</div>

				{/* URQL */}
				<h3
					style={{
						fontSize: 16,
						fontWeight: 600,
						color: "var(--text-primary)",
						margin: "24px 0 12px 0",
					}}
				>
					URQL
				</h3>
				<p style={prose}>
					Uses a custom exchange that re-executes active queries. Add{" "}
					<code style={inlineCode}>mockRefetchExchange</code> to your
					URQL client's exchange pipeline:
				</p>
				<div style={{ marginBottom: 24 }}>
					<CodeBlock lang="typescript">
						{`import { createClient, cacheExchange, fetchExchange } from "@urql/core";
import { registerAdapter } from "msw-devtool";
import { createUrqlAdapter, mockRefetchExchange } from "msw-devtool/adapters/urql";

registerAdapter(createUrqlAdapter());

const client = createClient({
  url: "/graphql",
  exchanges: [cacheExchange, mockRefetchExchange, fetchExchange],
});`}
					</CodeBlock>
				</div>

				{/* Apollo */}
				<h3
					style={{
						fontSize: 16,
						fontWeight: 600,
						color: "var(--text-primary)",
						margin: "24px 0 12px 0",
					}}
				>
					Apollo Client
				</h3>
				<p style={prose}>
					Calls{" "}
					<code style={inlineCode}>
						apolloClient.refetchQueries()
					</code>{" "}
					to re-run all active queries.
				</p>
				<div style={{ marginBottom: 24 }}>
					<CodeBlock lang="typescript">
						{`import { ApolloClient, InMemoryCache } from "@apollo/client";
import { registerAdapter } from "msw-devtool";
import { createApolloAdapter } from "msw-devtool/adapters/apollo";

const apolloClient = new ApolloClient({ uri: "/graphql", cache: new InMemoryCache() });
registerAdapter(createApolloAdapter(apolloClient));`}
					</CodeBlock>
				</div>

				{/* SWR */}
				<h3
					style={{
						fontSize: 16,
						fontWeight: 600,
						color: "var(--text-primary)",
						margin: "24px 0 12px 0",
					}}
				>
					SWR
				</h3>
				<p style={prose}>
					Calls the global <code style={inlineCode}>mutate()</code> to
					revalidate all SWR keys.
				</p>
				<div style={{ marginBottom: 24 }}>
					<CodeBlock lang="tsx">
						{`import { useSWRConfig } from "swr";
import { registerAdapter } from "msw-devtool";
import { createSwrAdapter } from "msw-devtool/adapters/swr";

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

				{/* Axios / fetch */}
				<h3
					style={{
						fontSize: 16,
						fontWeight: 600,
						color: "var(--text-primary)",
						margin: "24px 0 12px 0",
					}}
				>
					Axios & plain fetch
				</h3>
				<p style={prose}>
					Axios and <code style={inlineCode}>fetch()</code> have no
					query cache. Register the Axios adapter as a marker, then
					use the <code style={inlineCode}>useMockRefetch</code> hook
					in your components to re-run requests when mock config
					changes:
				</p>
				<div style={{ marginBottom: 0 }}>
					<CodeBlock lang="tsx">
						{`import { registerAdapter } from "msw-devtool";
import { createAxiosAdapter } from "msw-devtool/adapters/axios";
import { useMockRefetch } from "msw-devtool";

registerAdapter(createAxiosAdapter());

// In your component:
function UserCard() {
  const { data, refetch } = useMyFetch("/api/users/1");
  useMockRefetch("GET Users", refetch);

  return <div>{data?.name}</div>;
}`}
					</CodeBlock>
				</div>
			</section>

			{/* ───── Features ───── */}
			<section style={{ marginBottom: 48 }}>
				<SectionTitle id="features">
					<Terminal size={20} />
					Features
				</SectionTitle>
				<div
					style={{
						display: "grid",
						gridTemplateColumns:
							"repeat(auto-fill, minmax(200px, 1fr))",
						gap: 12,
					}}
				>
					<FeatureCard
						icon={<ToggleRight size={16} />}
						title="Toggle Mocks"
						description="Enable or disable individual mock handlers on the fly without restarting your dev server."
					/>
					<FeatureCard
						icon={<Shuffle size={16} />}
						title="Switch Variants"
						description="Swap between success, error, loading, and custom response variants instantly."
					/>
					<FeatureCard
						icon={<PenLine size={16} />}
						title="Custom Overrides"
						description="Override response JSON, status codes, delays, and headers per operation."
					/>
					<FeatureCard
						icon={<Radio size={16} />}
						title="LIVE Tracking"
						description="See which mock handlers are actively intercepting requests in real time."
					/>
					<FeatureCard
						icon={<SlidersHorizontal size={16} />}
						title="Filter & Sort"
						description="Filter by REST, GraphQL, enabled, or live status. Sort alphabetically."
					/>
					<FeatureCard
						icon={<RefreshCw size={16} />}
						title="Auto Refetch"
						description="Library adapters automatically refetch queries when you change mock settings."
					/>
				</div>
			</section>

			{/* ───── Supported Libraries ───── */}
			<section>
				<SectionTitle id="supported-libraries">
					Supported Libraries
				</SectionTitle>
				<div
					style={{
						display: "flex",
						flexWrap: "wrap",
						gap: 8,
					}}
				>
					{[
						"TanStack Query",
						"URQL",
						"Apollo Client",
						"SWR",
						"Axios",
						"fetch",
					].map((lib) => (
						<span
							key={lib}
							style={{
								fontSize: 13,
								padding: "6px 14px",
								borderRadius: 20,
								background: "var(--pill-bg)",
								border: "1px solid var(--border-primary)",
								color: "var(--pill-color)",
								fontWeight: 500,
								transition: "background 0.3s, border-color 0.3s, color 0.3s",
							}}
						>
							{lib}
						</span>
					))}
				</div>
			</section>
			</div>
		</div>
	);
}
