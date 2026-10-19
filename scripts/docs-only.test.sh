#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")" && pwd)"
fail() {
  echo "FAIL: $*" >&2
  exit 1
}

expect() {
  local want="$1"
  shift
  set +e
  "$@" >/tmp/docs-only-test.out 2>&1
  local got=$?
  set -e
  if [[ "${got}" -ne "${want}" ]]; then
    echo "command: $*" >&2
    cat /tmp/docs-only-test.out >&2
    fail "exit ${got}, want ${want}"
  fi
}

expect 0 bash -c "printf '%s\n' 'README.md' 'docs/guide.md' 'docs/assets/diagram.png' | bash '${root}/docs-only.sh'"
expect 1 bash -c "printf '%s\n' 'README.md' 'packages/core/src/store.ts' | bash '${root}/docs-only.sh'"
expect 1 bash -c "printf '%s\n' 'pnpm-lock.yaml' | bash '${root}/docs-only.sh'"
expect 1 bash -c "printf '%s\n' 'vercel.json' | bash '${root}/docs-only.sh'"
expect 1 bash -c "printf '%s\n' '.github/workflows/ci.yml' | bash '${root}/docs-only.sh'"
expect 1 bash -c "printf '' | bash '${root}/docs-only.sh'"

tmp="$(mktemp -d)"
trap 'rm -rf "${tmp}"' EXIT
git -C "${tmp}" init -q
git -C "${tmp}" config user.email "ci@example.com"
git -C "${tmp}" config user.name "ci"
mkdir -p "${tmp}/docs"
echo "seed" > "${tmp}/docs/.gitkeep"
git -C "${tmp}" add docs/.gitkeep
git -C "${tmp}" commit -qm "seed"
parent="$(git -C "${tmp}" rev-parse HEAD)"
echo "rules" > "${tmp}/AGENTS.md"
echo "page" > "${tmp}/docs/guide.md"
git -C "${tmp}" add AGENTS.md docs/guide.md
git -C "${tmp}" commit -qm "docs"
docs_sha="$(git -C "${tmp}" rev-parse HEAD)"
echo "code" > "${tmp}/src.ts"
git -C "${tmp}" add src.ts
git -C "${tmp}" commit -qm "code"
code_sha="$(git -C "${tmp}" rev-parse HEAD)"
zero="0000000000000000000000000000000000000000"

expect 0 env VERCEL_ENV=production VERCEL_GIT_PREVIOUS_SHA="${docs_sha}" VERCEL_GIT_COMMIT_SHA="${code_sha}" \
  bash -c "cd '${tmp}' && '${root}/vercel-ignore.sh'"
expect 1 env VERCEL_ENV=preview VERCEL_GIT_PREVIOUS_SHA="${zero}" VERCEL_GIT_COMMIT_SHA="${docs_sha}" \
  bash -c "cd '${tmp}' && '${root}/vercel-ignore.sh'"
expect 0 env VERCEL_ENV=preview VERCEL_GIT_PREVIOUS_SHA="${parent}" VERCEL_GIT_COMMIT_SHA="${docs_sha}" \
  bash -c "cd '${tmp}' && '${root}/vercel-ignore.sh'"
expect 1 env VERCEL_ENV=preview VERCEL_GIT_PREVIOUS_SHA="${docs_sha}" VERCEL_GIT_COMMIT_SHA="${code_sha}" \
  bash -c "cd '${tmp}' && '${root}/vercel-ignore.sh'"

echo "docs-only tests passed"
