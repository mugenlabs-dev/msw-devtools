import type { ReactNode } from "react";
import { useCallback, useState } from "react";

export const FeatureCard = ({
  description,
  icon,
  title,
}: {
  description: string;
  /** Receives the card hover state so animated icons can be driven from it. */
  icon: (hovered: boolean) => ReactNode;
  title: string;
}) => {
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
  }, []);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: cosmetic hover effects only
    <div
      className="rounded-[10px] border border-border-primary bg-card-bg px-6 py-5 transition-[background,border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-border-secondary hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="presentation"
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`transition-colors duration-200 ${hovered ? "text-accent-purple" : "text-text-muted"}`}
        >
          {icon(hovered)}
        </span>
        <h3 className="m-0 font-semibold text-[15px] text-text-primary transition-colors duration-300">
          {title}
        </h3>
      </div>
      <p className="m-0 text-sm text-text-muted leading-normal transition-colors duration-300">
        {description}
      </p>
    </div>
  );
};
