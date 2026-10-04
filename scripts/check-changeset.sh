#!/usr/bin/env bash
# Fail PRs that change packages/core without adding a Changeset file.
# Version PRs from changesets/action are skipped (they consume changesets).
set -euo pipefail

if [[ "${GITHUB_HEAD_REF:-}" == changeset-release/* ]]; then
  echo "Version PR — changeset not required."
  exit 0
fi

base="${1:?base sha or ref}"
head="${2:?head sha or ref}"

changed="$(git diff --name-only "${base}...${head}" -- packages/core)"
if [[ -z "${changed}" ]]; then
  echo "No packages/core changes — changeset not required."
  exit 0
fi

echo "packages/core changes:"
echo "${changed}"

added="$(git diff --name-only --diff-filter=A "${base}...${head}" -- .changeset \
  | grep -E '\.md$' \
  | grep -vE '(^|/)README\.md$' \
  || true)"

if [[ -z "${added}" ]]; then
  echo "::error::This PR changes packages/core but does not add a changeset."
  echo "Run \`pnpm changeset\` and commit the new file under .changeset/ with the change."
  exit 1
fi

echo "Found changeset(s):"
echo "${added}"
