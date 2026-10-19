#!/usr/bin/env bash
# Path filter for CI. Writes code=true|false to GITHUB_OUTPUT when set.
# If the base commit is missing (force-push) or git diff fails, run the full suite.
set -euo pipefail

root="$(cd "$(dirname "$0")" && pwd)"

emit() {
  local value="$1"
  echo "code=${value}"
  if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    echo "code=${value}" >> "${GITHUB_OUTPUT}"
  fi
}

event="${EVENT_NAME:-}"
base="${BASE_SHA:-}"
head="${HEAD_SHA:-}"

if [[ "${event}" == "schedule" || -z "${base}" || "${base}" =~ ^0+$ ]]; then
  emit true
  exit 0
fi

set +e
if [[ "${event}" == "pull_request" ]]; then
  files="$(git diff --name-only "${base}...${head}" 2>/dev/null)"
else
  files="$(git diff --name-only "${base}" "${head}" 2>/dev/null)"
fi
status=$?
set -e

if [[ "${status}" -ne 0 ]]; then
  echo "Cannot diff ${base} ${head}; running full suite." >&2
  emit true
  exit 0
fi

printf '%s\n' "${files}"
if printf '%s\n' "${files}" | bash "${root}/docs-only.sh"; then
  emit false
else
  emit true
fi
