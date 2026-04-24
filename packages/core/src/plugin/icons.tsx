import type { CSSProperties } from "react";

interface IconProps {
  color?: string;
  size?: number;
  style?: CSSProperties;
}

const defaults = { color: "currentColor", size: 14 } satisfies IconProps;

export const AlertCircle = ({ color = defaults.color, size = defaults.size, style }: IconProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    height={size}
    stroke={color}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    style={style}
    viewBox="0 0 24 24"
    width={size}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);

export const ArrowUpDown = ({ color = defaults.color, size = defaults.size, style }: IconProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    height={size}
    stroke={color}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    style={style}
    viewBox="0 0 24 24"
    width={size}
  >
    <path d="m21 16-4 4-4-4" />
    <path d="M17 20V4" />
    <path d="m3 8 4-4 4 4" />
    <path d="M7 4v16" />
  </svg>
);

export const ChevronDown = ({ color = defaults.color, size = defaults.size, style }: IconProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    height={size}
    stroke={color}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    style={style}
    viewBox="0 0 24 24"
    width={size}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const EyeOff = ({ color = defaults.color, size = defaults.size, style }: IconProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    height={size}
    stroke={color}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    style={style}
    viewBox="0 0 24 24"
    width={size}
  >
    <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
    <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
    <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
    <path d="m2 2 20 20" />
  </svg>
);

export const Layers = ({ color = defaults.color, size = defaults.size, style }: IconProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    height={size}
    stroke={color}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    style={style}
    viewBox="0 0 24 24"
    width={size}
  >
    <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
    <path d="m2 12 8.58 3.91a2 2 0 0 0 1.66 0L20.34 12" />
    <path d="m2 17 8.58 3.91a2 2 0 0 0 1.66 0L20.34 17" />
  </svg>
);

export const MousePointerClick = ({
  color = defaults.color,
  size = defaults.size,
  style,
}: IconProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    height={size}
    stroke={color}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    style={style}
    viewBox="0 0 24 24"
    width={size}
  >
    <path d="M14 4.1 12 6" />
    <path d="m5.1 8-2.9-.8" />
    <path d="m6 12-1.9 2" />
    <path d="M7.2 2.2 8 5.1" />
    <path d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z" />
  </svg>
);

export const RotateCcw = ({ color = defaults.color, size = defaults.size, style }: IconProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    height={size}
    stroke={color}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    style={style}
    viewBox="0 0 24 24"
    width={size}
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

export const ToggleLeft = ({ color = defaults.color, size = defaults.size, style }: IconProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    height={size}
    stroke={color}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    style={style}
    viewBox="0 0 24 24"
    width={size}
  >
    <rect height="14" rx="7" ry="7" width="22" x="1" y="5" />
    <circle cx="8" cy="12" r="3" />
  </svg>
);

export const ToggleRight = ({ color = defaults.color, size = defaults.size, style }: IconProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    height={size}
    stroke={color}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    style={style}
    viewBox="0 0 24 24"
    width={size}
  >
    <rect height="14" rx="7" ry="7" width="22" x="1" y="5" />
    <circle cx="16" cy="12" r="3" />
  </svg>
);
