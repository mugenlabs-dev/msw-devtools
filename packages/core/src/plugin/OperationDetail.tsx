import { useCallback, useMemo } from "react";
import { dispatchMockUpdate } from "../adapter/event-bus";
import { mockRegistry } from "../registry/registry";
import { useMockStore } from "../store/store";
import { JsonEditor } from "./JsonEditor";

type OperationDetailProps = {
	operationName: string | null;
};

function getTypeBadge(descriptor: { type: string } & Record<string, unknown>) {
	if (descriptor.type === "graphql") {
		const opType = descriptor.operationType as string;
		return {
			label: opType,
			bg: opType === "query" ? "#1e3a5f" : "#3a1e5f",
			color: opType === "query" ? "#60a5fa" : "#a78bfa",
		};
	}
	const method = (descriptor.method as string).toUpperCase();
	const colors: Record<string, { bg: string; color: string }> = {
		GET: { bg: "#1e3a5f", color: "#60a5fa" },
		POST: { bg: "#1e5f3a", color: "#4ade80" },
		PUT: { bg: "#5f3a1e", color: "#fb923c" },
		DELETE: { bg: "#5f1e1e", color: "#ef4444" },
		PATCH: { bg: "#3a1e5f", color: "#a78bfa" },
	};
	const c = colors[method] ?? { bg: "#333", color: "#ccc" };
	return { label: `${method} ${descriptor.path as string}`, ...c };
}

export function OperationDetail({ operationName }: OperationDetailProps) {
	if (!operationName) {
		return (
			<div
				style={{
					flex: 1,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					color: "#555",
					fontSize: "13px",
				}}
			>
				Select an operation to configure
			</div>
		);
	}

	return <OperationDetailInner operationName={operationName} />;
}

function OperationDetailInner({
	operationName,
}: { operationName: string }) {
	const config = useMockStore((s) => s.operations[operationName]);
	const setActiveVariant = useMockStore((s) => s.setActiveVariant);
	const setCustomJsonOverride = useMockStore((s) => s.setCustomJsonOverride);
	const setDelay = useMockStore((s) => s.setDelay);
	const setStatusCode = useMockStore((s) => s.setStatusCode);
	const setCustomHeaders = useMockStore((s) => s.setCustomHeaders);
	const setEnabled = useMockStore((s) => s.setEnabled);

	const descriptor = mockRegistry.get(operationName);
	const activeVariant = descriptor?.variants.find(
		(v) => v.id === config?.activeVariantId,
	);

	const jsonValue = useMemo(() => {
		if (config?.customJsonOverride) {
			return config.customJsonOverride;
		}
		if (activeVariant?.data != null) {
			return JSON.stringify(activeVariant.data, null, 2);
		}
		return "// No data (network error variant)";
	}, [config?.customJsonOverride, activeVariant?.data]);

	const handleToggle = useCallback(() => {
		setEnabled(operationName, !config.enabled);
		dispatchMockUpdate(operationName, "toggle");
	}, [operationName, config?.enabled, setEnabled]);

	const handleVariantChange = useCallback(
		(e: React.ChangeEvent<HTMLSelectElement>) => {
			setActiveVariant(operationName, e.target.value);
			dispatchMockUpdate(operationName, "variant");
		},
		[operationName, setActiveVariant],
	);

	const handleJsonChange = useCallback(
		(json: string) => {
			setCustomJsonOverride(operationName, json);
			dispatchMockUpdate(operationName, "json-override");
		},
		[operationName, setCustomJsonOverride],
	);

	const handleDelayChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = Number.parseInt(e.target.value, 10);
			setDelay(operationName, Number.isNaN(value) ? 0 : value);
		},
		[operationName, setDelay],
	);

	const handleStatusCodeChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const raw = e.target.value;
			if (raw === "") {
				setStatusCode(operationName, null);
			} else {
				const value = Number.parseInt(raw, 10);
				if (!Number.isNaN(value)) setStatusCode(operationName, value);
			}
		},
		[operationName, setStatusCode],
	);

	const handleStatusCodeReset = useCallback(() => {
		setStatusCode(operationName, null);
	}, [operationName, setStatusCode]);

	const handleHeadersChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setCustomHeaders(operationName, e.target.value || null);
		},
		[operationName, setCustomHeaders],
	);

	const handleHeadersReset = useCallback(() => {
		setCustomHeaders(operationName, null);
	}, [operationName, setCustomHeaders]);

	const handleReset = useCallback(() => {
		setCustomJsonOverride(operationName, null);
		dispatchMockUpdate(operationName, "json-override");
	}, [operationName, setCustomJsonOverride]);

	if (!descriptor || !config) {
		return null;
	}

	const typeBadge = getTypeBadge(descriptor);
	const isNetworkErrorVariant = activeVariant?.isNetworkError;
	const effectiveStatusCode =
		config.statusCode ?? activeVariant?.statusCode ?? 200;
	const effectiveHeaders =
		config.customHeaders ??
		(activeVariant?.headers
			? JSON.stringify(activeVariant.headers, null, 2)
			: "{}");
	const hasHeadersOverride = config.customHeaders !== null;

	return (
		<div
			style={{
				flex: 1,
				display: "flex",
				flexDirection: "column",
				padding: "12px",
				gap: "12px",
				minHeight: 0,
			}}
		>
			{/* Header */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<div>
					<span
						style={{ fontSize: "14px", fontWeight: 600, color: "#e0e0e0" }}
					>
						{operationName}
					</span>
					<span
						style={{
							marginLeft: "8px",
							fontSize: "10px",
							padding: "2px 6px",
							borderRadius: "4px",
							background: typeBadge.bg,
							color: typeBadge.color,
							textTransform: "uppercase",
							fontWeight: 600,
						}}
					>
						{typeBadge.label}
					</span>
				</div>
				<button
					type="button"
					onClick={handleToggle}
					style={{
						fontSize: "12px",
						padding: "4px 12px",
						borderRadius: "6px",
						border: "none",
						cursor: "pointer",
						background: config.enabled ? "#4ade80" : "#444",
						color: config.enabled ? "#000" : "#ccc",
						fontWeight: 500,
					}}
				>
					{config.enabled ? "Mocked" : "Passthrough"}
				</button>
			</div>

			{/* Variant selector */}
			<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
				<label
					htmlFor={`variant-${operationName}`}
					style={{
						fontSize: "11px",
						color: "#888",
						textTransform: "uppercase",
						fontWeight: 600,
					}}
				>
					Variant
				</label>
				<select
					id={`variant-${operationName}`}
					value={config.activeVariantId}
					onChange={handleVariantChange}
					style={{
						flex: 1,
						fontSize: "12px",
						padding: "4px 8px",
						borderRadius: "6px",
						border: "1px solid #444",
						background: "#1a1a1a",
						color: "#e0e0e0",
						outline: "none",
					}}
				>
					{descriptor.variants.map((v) => (
						<option key={v.id} value={v.id}>
							{v.label}
						</option>
					))}
				</select>
			</div>

			{/* Delay & Status row */}
			<div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
				<label htmlFor={`delay-${operationName}`} style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", fontWeight: 600, whiteSpace: "nowrap" }}>Delay</label>
				<input id={`delay-${operationName}`} type="number" min={0} step={100} value={config.delay} onChange={handleDelayChange} style={{ width: "70px", fontSize: "12px", padding: "4px 8px", borderRadius: "6px", border: "1px solid #444", background: "#1a1a1a", color: "#e0e0e0", outline: "none" }} />
				<span style={{ fontSize: "11px", color: "#666" }}>ms</span>
				{!isNetworkErrorVariant && (
					<>
						<span style={{ color: "#333", margin: "0 4px" }}>|</span>
						<label htmlFor={`status-${operationName}`} style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", fontWeight: 600, whiteSpace: "nowrap" }}>Status</label>
						<input id={`status-${operationName}`} type="number" min={100} max={599} value={effectiveStatusCode} onChange={handleStatusCodeChange} style={{ width: "70px", fontSize: "12px", padding: "4px 8px", borderRadius: "6px", border: `1px solid ${config.statusCode !== null ? "#60a5fa" : "#444"}`, background: "#1a1a1a", color: "#e0e0e0", outline: "none" }} />
						{config.statusCode !== null && (
							<button type="button" onClick={handleStatusCodeReset} style={{ fontSize: "10px", color: "#60a5fa", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Reset</button>
						)}
					</>
				)}
			</div>

			{/* Headers editor */}
			{!isNetworkErrorVariant && (
				<div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
						}}
					>
						<label
							htmlFor={`headers-${operationName}`}
							style={{
								fontSize: "11px",
								color: "#888",
								textTransform: "uppercase",
								fontWeight: 600,
							}}
						>
							Headers
						</label>
						{hasHeadersOverride && (
							<button
								type="button"
								onClick={handleHeadersReset}
								style={{
									fontSize: "10px",
									color: "#60a5fa",
									background: "none",
									border: "none",
									cursor: "pointer",
									padding: 0,
								}}
							>
								Reset
							</button>
						)}
					</div>
					<textarea
						id={`headers-${operationName}`}
						value={effectiveHeaders}
						onChange={handleHeadersChange}
						rows={3}
						spellCheck={false}
						style={{
							fontSize: "11px",
							fontFamily: "monospace",
							padding: "6px 8px",
							borderRadius: "6px",
							border: `1px solid ${hasHeadersOverride ? "#60a5fa" : "#444"}`,
							background: "#1a1a1a",
							color: "#e0e0e0",
							outline: "none",
							resize: "vertical",
						}}
					/>
				</div>
			)}

			{/* JSON Editor */}
			{!isNetworkErrorVariant && (
				<JsonEditor
					value={jsonValue}
					onChange={handleJsonChange}
					onReset={handleReset}
					hasOverride={config.customJsonOverride !== null}
				/>
			)}

			{isNetworkErrorVariant && (
				<div
					style={{
						flex: 1,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						color: "#ef4444",
						fontSize: "13px",
						border: "1px dashed #ef4444",
						borderRadius: "6px",
					}}
				>
					Network error — no response body
				</div>
			)}
		</div>
	);
}
