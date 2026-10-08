import type { ReactElement } from "react";

interface GradualBlurProps {
  direction?: "top" | "bottom";
  height?: string;
  layers?: number;
  maxBlur?: number;
}

export const GradualBlur = ({
  layers = 8,
  maxBlur = 8,
  height = "140px",
  direction = "bottom",
}: GradualBlurProps) => {
  const layerElements: ReactElement[] = [];

  for (let i = 0; i < layers; i += 1) {
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
          backdropFilter: `blur(${blur}px)`,
          inset: 0,
          maskImage: `linear-gradient(${maskDir}, transparent ${Math.max(0, bandCenter - fadeWidth)}%, black ${bandCenter}%, black 100%)`,
          position: "absolute",
          WebkitBackdropFilter: `blur(${blur}px)`,
          WebkitMaskImage: `linear-gradient(${maskDir}, transparent ${Math.max(0, bandCenter - fadeWidth)}%, black ${bandCenter}%, black 100%)`,
        }}
      />
    );
  }

  const gradientDir = direction === "bottom" ? "to bottom" : "to top";

  return (
    <div
      style={{
        [direction]: 0,
        background: `linear-gradient(${gradientDir}, transparent 0%, var(--bg-primary) 100%)`,
        height,
        insetInline: 0,
        isolation: "isolate",
        pointerEvents: "none",
        position: "fixed",
        zIndex: 40,
      }}
    >
      {layerElements}
    </div>
  );
};
