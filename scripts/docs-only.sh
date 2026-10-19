#!/usr/bin/env bash
# Exit 0 when every path is a markdown file or under docs/.
# Exit 1 when the list is empty or any other path is present.
set -euo pipefail

seen=0
while IFS= read -r path || [[ -n "${path}" ]]; do
  [[ -z "${path}" ]] && continue
  seen=1
  case "${path}" in
    docs/* | *.md) ;;
    *) exit 1 ;;
  esac
done

if [[ "${seen}" -eq 0 ]]; then
  exit 1
fi
