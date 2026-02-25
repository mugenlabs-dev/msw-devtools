import { Tooltip } from "@base-ui/react/tooltip";
import { useCallback, useState, useSyncExternalStore } from "react";

// ---------------------------------------------------------------------------
// WindowDots -- macOS traffic-light dots with easter-egg tooltip
// ---------------------------------------------------------------------------
const dotMessages = [
  "This doesn't do anything",
  "Nope, this doesn't do anything either",
  "Still nothing, sorry",
  "Told you, they're just decorative",
  "You're persistent, I'll give you that",
  "Okay, I admire the dedication",
  "But seriously, just decorative dots",
  "For real, this is the last time I say that these buttons don't do anything!",
];

const dotColors = ["#ff5f56", "#ffbd2e", "#27c93f"] as const;
const dotHoverColors = ["#ff8a82", "#ffd368", "#52e66a"] as const;

let dotHoverCount = 0;
const dotListeners = new Set<() => void>();

const subscribeToDotCount = (onChange: () => void) => {
  dotListeners.add(onChange);
  return () => {
    dotListeners.delete(onChange);
  };
};

const getDotSnapshot = () => dotHoverCount;

const notifyDotListeners = () => {
  for (const listener of dotListeners) {
    listener();
  }
};

const tooltipPopupStyle: React.CSSProperties = {
  background: "var(--bg-tertiary)",
  border: "1px solid var(--border-secondary)",
  borderRadius: 6,
  color: "var(--text-secondary)",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: 12,
  lineHeight: 1.4,
  maxWidth: 260,
  padding: "6px 10px",
};

const tooltipArrowStyle: React.CSSProperties = {
  borderBottomColor: "var(--border-secondary)",
  display: "block",
  height: 6,
  width: 12,
};

const WindowDot = ({ index }: { index: number }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [hovered, setHovered] = useState(false);
  const count = useSyncExternalStore(subscribeToDotCount, getDotSnapshot, getDotSnapshot);
  const exhausted = count >= dotMessages.length && !open;

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    if (nextOpen && dotHoverCount < dotMessages.length) {
      setMessage(dotMessages[dotHoverCount]);
      dotHoverCount += 1;
      notifyDotListeners();
      setOpen(true);
    } else if (!nextOpen) {
      setOpen(false);
    }
  }, []);

  const handlePointerEnter = useCallback(() => {
    setHovered(true);
  }, []);

  const handlePointerLeave = useCallback(() => {
    setHovered(false);
  }, []);

  return (
    <Tooltip.Root onOpenChange={handleOpenChange} open={open}>
      <Tooltip.Trigger
        delay={200}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        render={<div />}
        style={{
          background: hovered && !exhausted ? dotHoverColors[index] : dotColors[index],
          borderRadius: "50%",
          cursor: exhausted ? "not-allowed" : "pointer",
          height: 10,
          transition: "background 0.15s, transform 0.15s",
          width: 10,
        }}
      />
      <Tooltip.Portal>
        <Tooltip.Positioner side="top" sideOffset={8}>
          <Tooltip.Popup style={tooltipPopupStyle}>
            <Tooltip.Arrow style={tooltipArrowStyle} />
            {message}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
};

export const WindowDots = () => (
  <div style={{ alignItems: "center", display: "flex", gap: 6 }}>
    <WindowDot index={0} />
    <WindowDot index={1} />
    <WindowDot index={2} />
  </div>
);
