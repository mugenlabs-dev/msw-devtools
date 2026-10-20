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
  "$@" >/tmp/check-commit-author-test.out 2>&1
  local got=$?
  set -e
  if [[ "${got}" -ne "${want}" ]]; then
    echo "command: $*" >&2
    cat /tmp/check-commit-author-test.out >&2
    fail "exit ${got}, want ${want}"
  fi
}

run_check() {
  local repo="$1"
  local base="$2"
  local head="$3"
  bash -c "cd '${repo}' && bash '${root}/check-commit-author.sh' '${base}' '${head}'"
}

tmp="$(mktemp -d)"
trap 'rm -rf "${tmp}"' EXIT
git -C "${tmp}" init -q
git -C "${tmp}" config user.name "Yago Gonzalez"
git -C "${tmp}" config user.email "6538706+Yagogc@users.noreply.github.com"

echo "seed" > "${tmp}/seed.txt"
git -C "${tmp}" add seed.txt
git -C "${tmp}" commit -qm "seed"
base="$(git -C "${tmp}" rev-parse HEAD)"

# Good local commit: Yago author + Yago committer.
echo "good" > "${tmp}/good.txt"
git -C "${tmp}" add good.txt
git -C "${tmp}" commit -qm "good local"
good="$(git -C "${tmp}" rev-parse HEAD)"
expect 0 run_check "${tmp}" "${base}" "${good}"

# Good GitHub squash-style: Yago author + noreply@github.com committer.
echo "squash" > "${tmp}/squash.txt"
git -C "${tmp}" add squash.txt
GIT_COMMITTER_NAME="GitHub" GIT_COMMITTER_EMAIL="noreply@github.com" \
  git -C "${tmp}" commit -qm "good squash"
squash="$(git -C "${tmp}" rev-parse HEAD)"
expect 0 run_check "${tmp}" "${good}" "${squash}"

# Bad author.
echo "bad-author" > "${tmp}/bad-author.txt"
git -C "${tmp}" add bad-author.txt
git -C "${tmp}" \
  -c user.email="other@example.com" \
  commit -qm "bad author"
bad_author="$(git -C "${tmp}" rev-parse HEAD)"
expect 1 run_check "${tmp}" "${squash}" "${bad_author}"
grep -q "author email" /tmp/check-commit-author-test.out || fail "missing author email message"

# Bad committer (neither Yago nor GitHub noreply).
echo "bad-committer" > "${tmp}/bad-committer.txt"
git -C "${tmp}" add bad-committer.txt
GIT_COMMITTER_NAME="Other" GIT_COMMITTER_EMAIL="other@example.com" \
  git -C "${tmp}" commit -qm "bad committer"
bad_committer="$(git -C "${tmp}" rev-parse HEAD)"
expect 1 run_check "${tmp}" "${bad_author}" "${bad_committer}"
grep -q "committer email" /tmp/check-commit-author-test.out || fail "missing committer email message"

# Bad Co-authored-by.
echo "coauthor" > "${tmp}/coauthor.txt"
git -C "${tmp}" add coauthor.txt
git -C "${tmp}" commit -qm "$(printf 'has coauthor\n\nCo-authored-by: Cursor <cursoragent@cursor.com>\n')"
coauthor="$(git -C "${tmp}" rev-parse HEAD)"
expect 1 run_check "${tmp}" "${bad_committer}" "${coauthor}"
grep -qi "Co-authored-by" /tmp/check-commit-author-test.out || fail "missing Co-authored-by message"

# Old bad history is ignored when it is not in the checked range.
expect 0 run_check "${tmp}" "${coauthor}" "${coauthor}"

echo "check-commit-author tests passed"
