/**
 * Generate the OG image for the @mugenlabs/msw-devtools demo site using Satori + React.
 *
 * Usage:
 *   npx tsx scripts/generate-og-image.tsx
 *
 * Output: apps/demo/public/og-image.png (1200x630)
 */

import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

// ---------------------------------------------------------------------------
// Config — tweak these to adjust the output
// ---------------------------------------------------------------------------
const W = 1200;
const H = 630;
const GRID_SIZE = 64;
const GRID_COLOR = "rgba(255, 255, 255, 0.04)";

const TITLE = "@mugenlabs/msw-devtools";
const DESCRIPTION = [
  "A TanStack DevTools plugin for managing MSW mocks.",
  "Toggle, customize, and inspect your mock handlers in real time.",
];
const PILLS = [
  "Toggle Mocks",
  "Switch Variants",
  "Live Overrides",
  "LIVE Tracking",
  "Auto Refetch",
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const GridLines = () => {
  const cols = Math.ceil(W / GRID_SIZE) + 1;
  const rows = Math.ceil(H / GRID_SIZE) + 1;

  return (
    <div
      style={{
        display: "flex",
        height: H,
        left: 0,
        position: "absolute",
        top: 0,
        width: W,
      }}
    >
      {Array.from({ length: cols }, (_, i) => (
        <div
          key={`vcol-${String(i)}`}
          style={{
            backgroundColor: GRID_COLOR,
            height: H,
            left: i * GRID_SIZE,
            position: "absolute",
            top: 0,
            width: 1,
          }}
        />
      ))}
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={`hrow-${String(i)}`}
          style={{
            backgroundColor: GRID_COLOR,
            height: 1,
            left: 0,
            position: "absolute",
            top: i * GRID_SIZE,
            width: W,
          }}
        />
      ))}
    </div>
  );
};

const Pill = ({ label }: { label: string }) => (
  <div
    style={{
      alignItems: "center",
      backgroundColor: "rgba(25, 22, 32, 0.8)",
      border: "1px solid rgba(70, 55, 100, 0.8)",
      borderRadius: 8,
      color: "#c4b5fd",
      display: "flex",
      fontSize: 15,
      padding: "8px 20px",
    }}
  >
    {label}
  </div>
);

// ---------------------------------------------------------------------------
// Main OG Image component
// ---------------------------------------------------------------------------
const OgImage = ({ logoSrc }: { logoSrc: string }) => (
  <div
    style={{
      alignItems: "center",
      backgroundColor: "#0a0a0c",
      display: "flex",
      flexDirection: "column",
      height: H,
      justifyContent: "center",
      overflow: "hidden",
      position: "relative",
      width: W,
    }}
  >
    {/* Purple radial glow (main) */}
    <div
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(58,45,88,0.5) 0%, rgba(40,30,65,0.25) 40%, transparent 70%)",
        borderRadius: "50%",
        display: "flex",
        height: 600,
        left: 200,
        position: "absolute",
        top: -100,
        width: 800,
      }}
    />

    {/* Secondary wider glow */}
    <div
      style={{
        background: "radial-gradient(ellipse at center, rgba(50,38,80,0.2) 0%, transparent 60%)",
        borderRadius: "50%",
        display: "flex",
        height: 500,
        left: 0,
        position: "absolute",
        top: -50,
        width: 1200,
      }}
    />

    {/* Grid pattern */}
    <GridLines />

    {/* Content — layered on top via ordering (satori renders later children on top) */}
    <div
      style={{
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <img alt="" height={120} src={logoSrc} style={{ borderRadius: 24 }} width={120} />

      <div
        style={{
          color: "#ffffff",
          fontFamily: "monospace",
          fontSize: 48,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          marginTop: 28,
        }}
      >
        {TITLE}
      </div>

      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          marginTop: 20,
        }}
      >
        {DESCRIPTION.map((line) => (
          <div key={line} style={{ color: "#888888", fontSize: 20 }}>
            {line}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 14, marginTop: 60 }}>
        {PILLS.map((pill) => (
          <Pill key={pill} label={pill} />
        ))}
      </div>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Font loading helper
// ---------------------------------------------------------------------------
async function loadFirstAvailable(paths: string[]): Promise<Buffer> {
  for (const p of paths) {
    try {
      // biome-ignore lint/performance/noAwaitInLoops: fonts are tried in priority order
      return await readFile(p);
    } catch {
      // Try next font path
    }
  }
  throw new Error(`No font found. Tried:\n${paths.join("\n")}`);
}

// ---------------------------------------------------------------------------
// Generate
// ---------------------------------------------------------------------------
async function main() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const root = join(__dirname, "..");
  const logoPath = join(root, "apps", "demo", "public", "logo.png");
  const outPath = join(root, "apps", "demo", "public", "og-image.png");

  const logoBase64 = (await readFile(logoPath)).toString("base64");
  const logoSrc = `data:image/png;base64,${logoBase64}`;

  const svg = await satori(<OgImage logoSrc={logoSrc} />, {
    fonts: [
      {
        data: await loadFirstAvailable([
          "/System/Library/Fonts/Supplemental/Andale Mono.ttf",
          "/System/Library/Fonts/Supplemental/Courier New Bold.ttf",
          "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",
        ]),
        name: "monospace",
        style: "normal",
        weight: 700,
      },
      {
        data: await loadFirstAvailable([
          "/System/Library/Fonts/Supplemental/Arial.ttf",
          "/System/Library/Fonts/Supplemental/Georgia.ttf",
          "/System/Library/Fonts/Geneva.ttf",
          "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        ]),
        name: "sans-serif",
        style: "normal",
        weight: 400,
      },
    ],
    height: H,
    width: W,
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: W },
  });

  await writeFile(outPath, resvg.render().asPng());
  console.log(`Generated ${outPath} (${W}x${H})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
