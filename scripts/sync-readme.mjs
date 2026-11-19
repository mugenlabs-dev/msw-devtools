#!/usr/bin/env node
/**
 * Generate two copies of the root README.md, so they cannot drift apart:
 * - packages/core/README.md, the npm README.
 * - apps/demo/public/llms-full.txt, the full docs for agents, also served for
 *   `Accept: text/markdown` requests to /docs.
 * Relative links are made absolute, because both are read outside the
 * repository, and the contributor-only "Development" section is left out.
 *
 * Usage: node scripts/sync-readme.mjs [--check]
 * --check exits with 1 when either file is out of date.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "README.md");
const npmReadme = join(root, "packages/core/README.md");
const llmsFull = join(root, "apps/demo/public/llms-full.txt");

const REPO = "mugenlabs-dev/msw-devtools";
const RAW = `https://raw.githubusercontent.com/${REPO}/main/`;
const BLOB = `https://github.com/${REPO}/blob/main/`;

const isRelative = (url) => !/^(?:[a-z]+:|#|\/\/)/iu.test(url);

/** Images are served raw so npm can display them; other files link to GitHub. */
const absolute = (url) => (/\.(?:svg|png|jpe?g|gif|webp)$/iu.test(url) ? RAW : BLOB) + url;

const readme = readFileSync(source, "utf8");

const development = readme.indexOf("\n## Development\n");
const nextSection = readme.indexOf("\n## ", development + 1);
if (development === -1 || nextSection === -1) {
  console.error("sync-readme: could not find the Development section and the one after it.");
  process.exit(1);
}

const body = (readme.slice(0, development) + readme.slice(nextSection))
  .replaceAll(/src="(?<url>[^"]+)"/gu, (match, url) =>
    isRelative(url) ? `src="${absolute(url)}"` : match
  )
  .replaceAll(/\]\((?<url>[^)\s]+)\)/gu, (match, url) =>
    isRelative(url) ? `](${absolute(url)})` : match
  );

const outputs = [
  [
    npmReadme,
    "<!-- Generated from the root README.md by scripts/sync-readme.mjs. Edit that file instead. -->",
  ],
  [
    llmsFull,
    "<!-- Full documentation for @mugenlabs/msw-devtools, generated from the README. Site index: https://msw-devtools.mugenlabs.dev/llms.txt -->",
  ],
].map(([file, header]) => [file, [header, "", body].join("\n")]);

const check = process.argv.includes("--check");
let stale = false;
for (const [file, content] of outputs) {
  const name = relative(root, file);
  if (!check) {
    writeFileSync(file, content);
    console.log(`Wrote ${name}`);
  } else if (!existsSync(file) || readFileSync(file, "utf8") !== content) {
    console.error(`${name} is out of date. Run \`pnpm readme:sync\`.`);
    stale = true;
  } else {
    console.log(`${name} is up to date.`);
  }
}
if (stale) {
  process.exit(1);
}
