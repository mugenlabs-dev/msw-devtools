import { Debouncer } from "@tanstack/pacer";
import { useCallback, useEffect, useMemo, useState } from "react";

type JsonEditorProps = {
	value: string;
	onChange: (json: string) => void;
	onReset: () => void;
	hasOverride: boolean;
};

const DEBOUNCE_WAIT = 600;

export function JsonEditor({
	value,
	onChange,
	onReset,
	hasOverride,
}: JsonEditorProps) {
	const [localValue, setLocalValue] = useState(value);
	const [isValid, setIsValid] = useState(true);

	const debouncer = useMemo(
		() =>
			new Debouncer(
				(json: string) => {
					onChange(json);
				},
				{ wait: DEBOUNCE_WAIT },
			),
		[onChange],
	);

	useEffect(() => {
		return () => debouncer.cancel();
	}, [debouncer]);

	useEffect(() => {
		setLocalValue(value);
		setIsValid(true);
		debouncer.cancel();
	}, [value, debouncer]);

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			const newValue = e.target.value;
			setLocalValue(newValue);

			try {
				JSON.parse(newValue);
				setIsValid(true);
				debouncer.maybeExecute(newValue);
			} catch {
				setIsValid(false);
				debouncer.cancel();
			}
		},
		[debouncer],
	);

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: "6px",
				flex: 1,
				minHeight: 0,
			}}
		>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<span
					style={{
						fontSize: "11px",
						fontWeight: 600,
						color: "#a0a0a0",
						textTransform: "uppercase",
					}}
				>
					Response JSON {hasOverride && "(custom)"}
				</span>
				<div style={{ display: "flex", gap: "6px" }}>
					{!isValid && (
						<span
							style={{ fontSize: "11px", color: "#ef4444", fontWeight: 500 }}
						>
							Invalid JSON
						</span>
					)}
					{hasOverride && (
						<button
							type="button"
							onClick={onReset}
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
							Reset to Default
						</button>
					)}
				</div>
			</div>
			<textarea
				value={localValue}
				onChange={handleChange}
				spellCheck={false}
				style={{
					flex: 1,
					minHeight: "120px",
					fontFamily:
						'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace',
					fontSize: "12px",
					lineHeight: "1.5",
					padding: "8px",
					borderRadius: "6px",
					border: `1px solid ${isValid ? "#333" : "#ef4444"}`,
					background: "#1a1a1a",
					color: "#e0e0e0",
					resize: "vertical",
					outline: "none",
				}}
			/>
		</div>
	);
}
