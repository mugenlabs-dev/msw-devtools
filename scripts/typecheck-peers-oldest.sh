#!/usr/bin/env bash
# Mirror CI's "Peer versions (oldest)" typecheck locally.
# Pins msw@2.0.0 (and other oldest peers), typechecks core with tsconfig.msw2.json,
# then restores package.json + lockfile. Not wired to pre-push: pin + reinstall is
# too slow for every push; run this when touching MSW handler types or peer ranges.
set -euo pipefail
ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

tmpdir="$(mktemp -d)"
cleanup() {
  cp "$tmpdir/package.json" "$ROOT/package.json"
  cp "$tmpdir/pnpm-lock.yaml" "$ROOT/pnpm-lock.yaml"
  rm -rf "$tmpdir"
}
trap cleanup EXIT

cp package.json pnpm-lock.yaml "$tmpdir/"

node scripts/pin-peer-versions.mjs oldest
pnpm install --no-frozen-lockfile
pnpm build
pnpm exec tsgo -p packages/core/tsconfig.msw2.json --noEmit
echo "typecheck-peers-oldest: ok"
