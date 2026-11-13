#!/usr/bin/env bash
# Publish generated state ONLY to bot-state; fail closed on push conflicts.
set -euo pipefail
if [[ "$#" -lt 1 ]]; then echo "usage: write-bot-state.sh path..." >&2; exit 2; fi
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
for f in "$@"; do
  [[ "$f" != /* && "$f" != *'..'* && -f "$f" ]] || { echo "invalid artifact: $f" >&2; exit 2; }
  mkdir -p "$tmp/$(dirname "$f")"
  cp -- "$f" "$tmp/$f"
done
git config user.name 'antisueta-state-bot'
git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git fetch -q origin bot-state
git reset -q --hard HEAD
git switch -q -C bot-state origin/bot-state
for attempt in 1 2 3 4; do
  for f in "$@"; do mkdir -p "$(dirname "$f")"; cp -- "$tmp/$f" "$f"; done
  git add -- "$@"
  if git diff --cached --quiet; then echo 'bot-state facts unchanged'; exit 0; fi
  git commit -qm 'bot-state: update derived GitHub facts'
  if git push -q origin HEAD:bot-state; then echo 'bot-state updated'; exit 0; fi
  git fetch -q origin bot-state
  git reset -q --hard origin/bot-state
done
echo 'bot-state push failed after 4 conflict-safe retries' >&2
exit 1
