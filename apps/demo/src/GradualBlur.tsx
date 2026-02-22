interface GradualBlurProps {
	layers?: number;
	maxBlur?: number;
	height?: string;
	direction?: "top" | "bottom";
}

export function GradualBlur({
	layers = 8,
	maxBlur = 8,
	height = "140px",
	direction = "bottom",
}: GradualBlurProps) {
	const layerElements = [];

	for (let i = 0; i < layers; i++) {
		// exponential blur ramp for a more natural feel
		const t = i / (layers - 1);
		const blur = t * t * maxBlur;

		// each layer occupies a band, but with wide overlapping soft masks
		// so there are no visible seams between layers
		const bandCenter = t * 100;
		const fadeWidth = (100 / layers) * 1.2;

		const maskDir = direction === "bottom" ? "to bottom" : "to top";

		layerElements.push(
			<div
				key={i}
				style={{
					position: "absolute",
					inset: 0,
					backdropFilter: `blur(${blur}px)`,
					WebkitBackdropFilter: `blur(${blur}px)`,
					maskImage: `linear-gradient(${maskDir}, transparent ${Math.max(0, bandCenter - fadeWidth)}%, black ${bandCenter}%, black 100%)`,
					WebkitMaskImage: `linear-gradient(${maskDir}, transparent ${Math.max(0, bandCenter - fadeWidth)}%, black ${bandCenter}%, black 100%)`,
				}}
			/>,
		);
	}

	return (
		<div
			style={{
				position: "fixed",
				[direction]: 0,
				left: 0,
				right: 0,
				height,
				pointerEvents: "none",
				zIndex: 40,
				isolation: "isolate",
			}}
		>
			{layerElements}
		</div>
	);
}
