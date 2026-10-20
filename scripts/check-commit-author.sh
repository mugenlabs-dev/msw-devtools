#!/usr/bin/env bash
# Fail when any commit in BASE..HEAD has a non-Yago author email, a
# Co-authored-by trailer, or a committer email that is neither Yago's nor
# GitHub's squash-merge address. Existing history outside that range is not checked.
set -euo pipefail

ALLOWED_AUTHOR="6538706+Yagogc@users.noreply.github.com"
ALLOWED_COMMITTERS=(
  "6538706+Yagogc@users.noreply.github.com"
  "noreply@github.com"
)

base="${1:-${BASE_SHA:-}}"
head="${2:-${HEAD_SHA:-}}"

if [[ -z "${base}" || -z "${head}" ]]; then
  echo "usage: check-commit-author.sh <base> <head>" >&2
  exit 2
fi

commits=()
if [[ "${base}" =~ ^0+$ ]]; then
  commits+=("${head}")
elif ! git cat-file -e "${base}^{commit}" 2>/dev/null; then
  echo "Base ${base} is missing; checking tip only." >&2
  commits+=("${head}")
else
  while IFS= read -r sha; do
    [[ -n "${sha}" ]] && commits+=("${sha}")
  done < <(git rev-list --reverse "${base}..${head}")
fi

if [[ "${#commits[@]}" -eq 0 ]]; then
  echo "No new commits to check."
  exit 0
fi

committer_ok() {
  local email="$1"
  local allowed
  for allowed in "${ALLOWED_COMMITTERS[@]}"; do
    if [[ "${email}" == "${allowed}" ]]; then
      return 0
    fi
  done
  return 1
}

failed=0
for sha in "${commits[@]}"; do
  author="$(git log -1 --format='%ae' "${sha}")"
  committer="$(git log -1 --format='%ce' "${sha}")"
  subject="$(git log -1 --format='%s' "${sha}")"

  if [[ "${author}" != "${ALLOWED_AUTHOR}" ]]; then
    echo "FAIL ${sha}: author email '${author}' (want ${ALLOWED_AUTHOR}): ${subject}" >&2
    failed=1
  fi
  if ! committer_ok "${committer}"; then
    echo "FAIL ${sha}: committer email '${committer}' (want Yago or noreply@github.com): ${subject}" >&2
    failed=1
  fi
  if git log -1 --format='%B' "${sha}" | grep -qiE '^[[:space:]]*Co-authored-by:[[:space:]]'; then
    echo "FAIL ${sha}: Co-authored-by trailer is not allowed: ${subject}" >&2
    failed=1
  fi
done

if [[ "${failed}" -ne 0 ]]; then
  exit 1
fi

echo "Checked ${#commits[@]} commit(s); author and committer ok."
