// Pins the library's peer dependencies for CI matrix legs. Writes pnpm
// overrides into the root package.json; run
// `pnpm install --no-frozen-lockfile` afterwards.
//
// Usage: node scripts/pin-peer-versions.mjs <oldest|latest-2|oldest-3|latest-3>
//
// For msw (^2 || ^3), read from the peer range:
//   oldest    → lowest 2.x bound (2.0.0)
//   latest-2  → newest published 2.x
//   oldest-3  → lowest 3.x bound (3.0.0)
//   latest-3  → newest published 3.x
// Other peers pin their lowest bound on `oldest` and their newest release on
// every other leg, so the msw legs differ only in msw.
//
// The overrides apply to the whole workspace, demo apps included. That is why
// the CI job typechecks only packages/core: the MSW 3 demo cannot build against
// an MSW 2 pin.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const MODES = ["oldest", "latest-2", "oldest-3", "latest-3"];
const [, , mode] = process.argv;
if (!MODES.includes(mode)) {
  console.error(`Usage: node scripts/pin-peer-versions.mjs <${MODES.join("|")}>`);
  process.exit(1);
}

const rootUrl = new URL("../package.json", import.meta.url);
const corePath = new URL("../packages/core/package.json", import.meta.url);
const root = JSON.parse(readFileSync(rootUrl, "utf8"));
const { peerDependencies } = JSON.parse(readFileSync(corePath, "utf8"));

const compare = (a, b) => {
  const [x, y] = [a, b].map((v) => v.split(".").map(Number));
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
};

/** The newest published version that satisfies `range`. */
const newestPublished = (name, range) => {
  const output = execFileSync("npm", ["view", `${name}@${range}`, "version", "--json"], {
    encoding: "utf8",
  });
  const versions = [JSON.parse(output)].flat().filter((v) => !v.includes("-"));
  return versions.sort(compare).at(-1);
};

const pick = (name, range) => {
  const bounds = range.match(/\d+\.\d+\.\d+/gu);
  if (!bounds) {
    throw new Error(`Cannot read a version from the ${name} peer range "${range}"`);
  }
  bounds.sort(compare);

  if (name === "msw") {
    const major = mode.endsWith("-3") ? 3 : 2;
    const lowest = bounds.find((v) => Number(v.split(".")[0]) === major);
    if (!lowest) {
      throw new Error(`The msw peer range "${range}" has no ${major}.x bound`);
    }
    return mode.startsWith("oldest") ? lowest : newestPublished(name, `^${lowest}`);
  }

  if (mode === "oldest") {
    return bounds[0];
  }
  return newestPublished(name, `^${bounds.at(-1)}`);
};

const overrides = Object.fromEntries(
  Object.entries(peerDependencies).map(([name, range]) => [name, pick(name, range)])
);
// react-dom isn't a peer, but the tests render with it, so it has to match react.
if (overrides.react) {
  overrides["react-dom"] = overrides.react;
}

root.pnpm.overrides = { ...root.pnpm.overrides, ...overrides };
writeFileSync(rootUrl, `${JSON.stringify(root, null, 2)}\n`);

for (const [name, version] of Object.entries(overrides)) {
  console.log(`${name}: ${version}`);
}
