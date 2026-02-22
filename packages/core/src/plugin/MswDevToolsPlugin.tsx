import { useState } from "react";
import { OperationDetail } from "./OperationDetail";
import { OperationList } from "./OperationList";

export function MswDevToolsPlugin() {
	const [selectedOperation, setSelectedOperation] = useState<string | null>(
		null,
	);

	return (
		<div
			style={{
				display: "flex",
				height: "100%",
				background: "#1e1e1e",
				color: "#e0e0e0",
				fontFamily: "system-ui, -apple-system, sans-serif",
			}}
		>
			<OperationList
				selectedOperation={selectedOperation}
				onSelectOperation={setSelectedOperation}
			/>
			<OperationDetail operationName={selectedOperation} />
		</div>
	);
}
