import { useMemo, useState, useSyncExternalStore } from "react";
import { dispatchMockUpdate } from "../adapter/event-bus";
import { mockRegistry } from "../registry/registry";
import type { MockOperationDescriptor } from "../registry/types";
import { useMockStore } from "../store/store";
import type { WorkerStatus } from "../store/types";

type FilterOption = "all" | "live" | "enabled" | "rest" | "graphql";
type SortOption = "default" | "a-z" | "z-a";

type OperationListProps = {
	selectedOperation: string | null;
	onSelectOperation: (operationName: string) => void;
};

function useRegistryDescriptors(): MockOperationDescriptor[] {
	return useSyncExternalStore(
		(cb) => mockRegistry.subscribe(cb),
		() => mockRegistry.getAll(),
		() => [],
	);
}

function getOperationTypeBadge(descriptor: MockOperationDescriptor): string {
	if (descriptor.type === "graphql") return descriptor.operationType;
	return descriptor.method.toUpperCase();
}

const statusConfig: Record<
	WorkerStatus,
	{ label: string; color: string; bg: string }
> = {
	idle: { label: "MSW Idle", color: "#888", bg: "#2a2a2a" },
	starting: { label: "Starting...", color: "#facc15", bg: "#3a3a1a" },
	active: { label: "MSW Active", color: "#4ade80", bg: "#1a3a1a" },
	error: { label: "MSW Error", color: "#ef4444", bg: "#3a1a1a" },
};

export function OperationList({
	selectedOperation,
	onSelectOperation,
}: OperationListProps) {
	const descriptors = useRegistryDescriptors();
	const operations = useMockStore((s) => s.operations);
	const setEnabled = useMockStore((s) => s.setEnabled);
	const enableAll = useMockStore((s) => s.enableAll);
	const disableAll = useMockStore((s) => s.disableAll);
	const workerStatus = useMockStore((s) => s.workerStatus);
	const seenOperations = useMockStore((s) => s.seenOperations);
	const clearSeenOperations = useMockStore((s) => s.clearSeenOperations);

	const [filter, setFilter] = useState<FilterOption>("all");
	const [sort, setSort] = useState<SortOption>("default");

	const filteredDescriptors = useMemo(() => {
		let list = descriptors;
		if (filter === "live") list = list.filter((d) => seenOperations.has(d.operationName));
		if (filter === "enabled") list = list.filter((d) => operations[d.operationName]?.enabled);
		if (filter === "rest") list = list.filter((d) => d.type === "rest");
		if (filter === "graphql") list = list.filter((d) => d.type === "graphql");

		if (sort === "a-z") return [...list].sort((a, b) => a.operationName.localeCompare(b.operationName));
		if (sort === "z-a") return [...list].sort((a, b) => b.operationName.localeCompare(a.operationName));
		return list;
	}, [descriptors, operations, seenOperations, filter, sort]);

	const enabledCount = Object.values(operations).filter(
		(op) => op.enabled,
	).length;
	const status = statusConfig[workerStatus];

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				borderRight: "1px solid #333",
				width: "280px",
				minWidth: "280px",
				overflow: "hidden",
			}}
		>
			{/* Worker status bar */}
			<div
				style={{
					padding: "6px 12px",
					borderBottom: "1px solid #333",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					background: status.bg,
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
					<span
						style={{
							width: "8px",
							height: "8px",
							borderRadius: "50%",
							background: status.color,
							display: "inline-block",
							boxShadow:
								workerStatus === "active"
									? `0 0 6px ${status.color}`
									: "none",
						}}
					/>
					<span
						style={{
							fontSize: "11px",
							color: status.color,
							fontWeight: 600,
						}}
					>
						{status.label}
					</span>
				</div>
				{seenOperations.size > 0 && (
					<button
						type="button"
						onClick={clearSeenOperations}
						style={{
							fontSize: "10px",
							padding: "1px 6px",
							borderRadius: "4px",
							border: "1px solid #444",
							background: "transparent",
							color: "#888",
							cursor: "pointer",
						}}
					>
						Clear seen
					</button>
				)}
			</div>

			{/* Controls bar */}
			<div
				style={{
					padding: "6px 12px",
					borderBottom: "1px solid #333",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<span style={{ fontSize: "11px", color: "#888" }}>
					{enabledCount}/{descriptors.length} active
				</span>
				<div style={{ display: "flex", gap: "4px" }}>
					<button
						type="button"
						onClick={() => {
							enableAll();
							for (const d of descriptors)
								dispatchMockUpdate(d.operationName, "enable-all");
						}}
						style={{
							fontSize: "11px",
							padding: "2px 8px",
							borderRadius: "4px",
							border: "1px solid #444",
							background: "#1a3a1a",
							color: "#4ade80",
							cursor: "pointer",
						}}
					>
						All On
					</button>
					<button
						type="button"
						onClick={() => {
							disableAll();
							for (const d of descriptors)
								dispatchMockUpdate(d.operationName, "disable-all");
						}}
						style={{
							fontSize: "11px",
							padding: "2px 8px",
							borderRadius: "4px",
							border: "1px solid #444",
							background: "#2a2a2a",
							color: "#ccc",
							cursor: "pointer",
						}}
					>
						All Off
					</button>
				</div>
			</div>

			{/* Filter & Sort bar */}
			<div
				style={{
					padding: "6px 12px",
					borderBottom: "1px solid #333",
					display: "flex",
					flexDirection: "column",
					gap: "6px",
				}}
			>
				<div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
					{(["all", "live", "enabled", "rest", "graphql"] as const).map((opt) => (
						<button
							key={opt}
							type="button"
							onClick={() => setFilter(opt)}
							style={{
								fontSize: "10px",
								padding: "2px 8px",
								borderRadius: "4px",
								border: "1px solid #444",
								background: filter === opt ? "#3a3a5a" : "transparent",
								color: filter === opt ? "#a78bfa" : "#888",
								cursor: "pointer",
								fontWeight: filter === opt ? 600 : 400,
								textTransform: "capitalize",
							}}
						>
							{opt}
						</button>
					))}
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
					<span style={{ fontSize: "10px", color: "#666" }}>Sort:</span>
					<select
						value={sort}
						onChange={(e) => setSort(e.target.value as SortOption)}
						style={{
							fontSize: "10px",
							padding: "2px 6px",
							borderRadius: "4px",
							border: "1px solid #444",
							background: "#1a1a1a",
							color: "#e0e0e0",
							outline: "none",
						}}
					>
						<option value="default">Default</option>
						<option value="a-z">A → Z</option>
						<option value="z-a">Z → A</option>
					</select>
				</div>
			</div>

			<div style={{ overflow: "auto", flex: 1 }}>
				{filteredDescriptors.map((descriptor) => {
					const config = operations[descriptor.operationName];
					const isSelected = selectedOperation === descriptor.operationName;
					const isEnabled = config?.enabled ?? false;
					const variant = descriptor.variants.find(
						(v) => v.id === config?.activeVariantId,
					);
					const isErrorVariant =
						variant?.isNetworkError || variant?.isGraphQLError;
					const isSeen = seenOperations.has(descriptor.operationName);

					return (
						<div
							key={descriptor.operationName}
							role="button"
							tabIndex={0}
							onClick={() => onSelectOperation(descriptor.operationName)}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ")
									onSelectOperation(descriptor.operationName);
							}}
							style={{
								display: "flex",
								alignItems: "center",
								gap: "8px",
								padding: "6px 12px",
								cursor: "pointer",
								background: isSelected ? "#2a2a3a" : "transparent",
								borderLeft: isSelected
									? "2px solid #6366f1"
									: "2px solid transparent",
							}}
						>
							{/* Status dot */}
							<span
								style={{
									width: "8px",
									height: "8px",
									borderRadius: "50%",
									flexShrink: 0,
									background: !isEnabled
										? "#555"
										: isErrorVariant
											? "#ef4444"
											: "#4ade80",
								}}
							/>

							{/* Operation name */}
							<div style={{ flex: 1, minWidth: 0 }}>
								<div
									style={{
										fontSize: "12px",
										color: "#e0e0e0",
										whiteSpace: "nowrap",
										overflow: "hidden",
										textOverflow: "ellipsis",
										display: "flex",
										alignItems: "center",
										gap: "6px",
									}}
								>
									{descriptor.operationName}
									{isSeen && (
										<span
											style={{
												fontSize: "9px",
												padding: "0px 4px",
												borderRadius: "3px",
												background: "#3b82f6",
												color: "#fff",
												fontWeight: 600,
												lineHeight: "16px",
												flexShrink: 0,
											}}
										>
											LIVE
										</span>
									)}
								</div>
								<div
									style={{
										fontSize: "10px",
										color: "#666",
										display: "flex",
										alignItems: "center",
										gap: "4px",
									}}
								>
									<span
										style={{
											fontSize: "9px",
											padding: "0px 4px",
											borderRadius: "3px",
											background:
												descriptor.type === "graphql"
													? "#2d1b4e"
													: "#1b2e4e",
											color:
												descriptor.type === "graphql"
													? "#a78bfa"
													: "#60a5fa",
											fontWeight: 600,
											lineHeight: "14px",
											textTransform: "uppercase",
										}}
									>
										{descriptor.type === "graphql"
											? "graphql"
											: "rest"}
									</span>
									<span>
										{getOperationTypeBadge(descriptor)}
										{isEnabled && variant
											? ` · ${variant.label}`
											: ""}
									</span>
								</div>
							</div>

							{/* Toggle */}
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									setEnabled(descriptor.operationName, !isEnabled);
									dispatchMockUpdate(descriptor.operationName, "toggle");
								}}
								style={{
									width: "36px",
									height: "20px",
									borderRadius: "10px",
									border: "none",
									cursor: "pointer",
									position: "relative",
									flexShrink: 0,
									background: isEnabled ? "#4ade80" : "#444",
									transition: "background 0.15s",
								}}
							>
								<span
									style={{
										position: "absolute",
										top: "2px",
										left: isEnabled ? "18px" : "2px",
										width: "16px",
										height: "16px",
										borderRadius: "50%",
										background: "#fff",
										transition: "left 0.15s",
									}}
								/>
							</button>
						</div>
					);
				})}
			</div>
		</div>
	);
}
