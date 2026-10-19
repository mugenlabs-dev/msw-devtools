#!/usr/bin/env bash
# Ignored Build Step. Exit 0 skips the Vercel Git build. Exit 1 builds it.
# Production Git builds always skip. CI promote is the production deploy.
set -euo pipefail

root="$(cd "$(dirname "$0")" && pwd)"

if [[ "${VERCEL_ENV:-}" == "production" ]]; then
  echo "Skip production Git build. CI promotes the one production deploy."
  exit 0
fi

prev="${VERCEL_GIT_PREVIOUS_SHA:-}"
head="${VERCEL_GIT_COMMIT_SHA:-}"
if [[ -z "${prev}" || -z "${head}" || "${prev}" =~ ^0+$ ]]; then
  echo "No comparable SHAs. Build."
  exit 1
fi

if ! git cat-file -e "${prev}^{commit}" 2>/dev/null; then
  git fetch --depth=1 origin "${prev}" || {
    echo "Cannot fetch ${prev}. Build."
    exit 1
  }
fi

files="$(git diff --name-only "${prev}" "${head}")"
if printf '%s\n' "${files}" | bash "${root}/docs-only.sh"; then
  echo "Docs-only commit. Skip deploy."
  exit 0
fi

echo "Build."
exit 1
