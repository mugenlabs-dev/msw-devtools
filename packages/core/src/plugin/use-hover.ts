import { useCallback, useState } from "react";

export const useHover = () => {
  const [isHovered, setIsHovered] = useState(false);
  const onMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);
  const onMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);
  return { hoverProps: { onMouseEnter, onMouseLeave }, isHovered } as const;
};
