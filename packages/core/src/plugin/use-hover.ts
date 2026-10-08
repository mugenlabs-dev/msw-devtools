import { useCallback, useState } from "react";

const HOVER_QUERY = "(hover: hover) and (pointer: fine)";

const canHover = (): boolean => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(HOVER_QUERY).matches;
};

/**
 * Hover state gated to fine pointers that support hover.
 * Prevents sticky "hover" after a tap on touch devices.
 */
export const useHover = () => {
  const [isHovered, setIsHovered] = useState(false);
  const onMouseEnter = useCallback(() => {
    if (canHover()) {
      setIsHovered(true);
    }
  }, []);
  const onMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);
  return { hoverProps: { onMouseEnter, onMouseLeave }, isHovered } as const;
};
