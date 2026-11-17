#!/usr/bin/env bash
# Claude запускает перед КАЖДЫМ прямым пушем в main МГЛ (урок OSHIBKI 1151).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
bash scripts/meta-games-guard.sh check
: > /tmp/claude-empty.diff
node scripts/kontur/guard.mjs --diff-file /tmp/claude-empty.diff --title "claude pre-push" --body "claude pre-push"
echo "CLAUDE_PRE_PUSH_PASS"
