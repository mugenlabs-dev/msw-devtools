import type { ForwardRefExoticComponent, HTMLAttributes, RefAttributes } from "react";

/**
 * Imperative handle exposed by every vendored lucide-animated icon. Passing a
 * ref switches the icon into controlled mode: it stops animating on its own
 * hover and instead waits for `startAnimation` / `stopAnimation`.
 */
export interface AnimatedIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

export type AnimatedIconProps = HTMLAttributes<HTMLDivElement> & { size?: number };

export type AnimatedIconComponent = ForwardRefExoticComponent<
  AnimatedIconProps & RefAttributes<AnimatedIconHandle>
>;
