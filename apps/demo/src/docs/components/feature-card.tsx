import type { ReactNode } from "react";

const handleFeatureCardEnter = (e: React.MouseEvent<HTMLDivElement>) => {
  e.currentTarget.style.borderColor = "var(--border-secondary)";
  e.currentTarget.style.transform = "translateY(-2px)";
  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
  const iconEl = e.currentTarget.querySelector<HTMLElement>("[data-feature-icon]");
  if (iconEl) {
    iconEl.style.color = "var(--accent-purple)";
  }
};

const handleFeatureCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
  e.currentTarget.style.borderColor = "var(--border-primary)";
  e.currentTarget.style.transform = "translateY(0)";
  e.currentTarget.style.boxShadow = "none";
  const iconEl = e.currentTarget.querySelector<HTMLElement>("[data-feature-icon]");
  if (iconEl) {
    iconEl.style.color = "var(--text-muted)";
  }
};

export const FeatureCard = ({
  description,
  icon,
  title,
}: {
  description: string;
  icon: ReactNode;
  title: string;
}) => (
  // biome-ignore lint/a11y/noStaticElementInteractions: cosmetic hover effects only
  <div
    className="rounded-[10px] border border-border-primary bg-card-bg px-6 py-5 transition-[background,border-color,transform,box-shadow] duration-200"
    onMouseEnter={handleFeatureCardEnter}
    onMouseLeave={handleFeatureCardLeave}
    role="presentation"
  >
    <div className="mb-2 flex items-center gap-2">
      <span className="text-text-muted transition-colors duration-200" data-feature-icon="">
        {icon}
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
