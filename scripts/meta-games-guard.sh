#!/usr/bin/env bash
# META GAMES guard: принятые оригиналы и файлы направления проекта меняет только Claude.
# Режимы: check (проверка), update (пересчитать суммы).
# GUARD_RANGE=<a>..<b> — диапазон коммитов: правки защищённого, сделанные ТОЛЬКО коммитами Claude
# (трейлер «Claude-Session: https://claude.ai/…»), принимаются (accepted), чужие — ошибка.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
P=.github/protected
list() { grep -v '^\s*#' "$P/paths.txt" | sed '/^\s*$/d' | while read -r p; do git ls-files -- "$p"; done | sort -u; }
if [ "${1:-check}" = update ]; then list | xargs -d '\n' sha256sum > "$P/SHA256SUMS"; echo "updated $(wc -l < $P/SHA256SUMS) files"; exit 0; fi
signed() { git log -1 --format=%B "$1" | grep -q '^Claude-Session: https://claude.ai/'; }
by_claude_only() { # все коммиты диапазона, трогавшие файл, подписаны Claude (и хотя бы один есть)
  [ -n "${GUARD_RANGE:-}" ] || return 1
  local cs; cs=$(git rev-list "$GUARD_RANGE" -- "$1" 2>/dev/null) || return 1
  [ -n "$cs" ] || return 1
  for c in $cs; do signed "$c" || return 1; done
}
fail=0; accepted=0
changed=$( { sha256sum -c "$P/SHA256SUMS" 2>/dev/null || true; } | { grep -v ': OK$' || true; } | sed 's/: [^:]*$//' )
extra=$(comm -13 <(awk '{print $2}' "$P/SHA256SUMS" | sort) <(list) || true)
for f in $changed $extra; do
  if by_claude_only "$f"; then accepted=1; echo "принята правка Claude: $f"
  else fail=1; echo "$f" >> "${GUARD_BAD_FILE:-/dev/null}"; echo "::error::Защищённый файл изменён, удалён или добавлен не Claude: $f (цель: rules/09-platforma/META_GAMES_PLATFORM.md)"; fi
done
if [ -n "${GUARD_RANGE:-}" ]; then
  for c in $(git rev-list "$GUARD_RANGE" -- "$P" 2>/dev/null || true); do
    signed "$c" || git log -1 --format=%s "$c" | grep -q '^meta-games-guard:' || { fail=1; echo "::error::Коммит $c изменил .github/protected без подписи Claude"; }
  done
fi
while IFS='|' read -r f s; do case "$f" in ''|\#*) continue;; esac
  grep -qF -- "$s" "$f" 2>/dev/null || { fail=1; echo "::error::$f потерял обязательную строку: $s"; }
done < "$P/must-contain.txt"
[ -n "${GITHUB_OUTPUT:-}" ] && echo "accepted=$accepted" >> "$GITHUB_OUTPUT"
[ $fail = 0 ] && echo "META GAMES guard: OK ($(wc -l < $P/SHA256SUMS) защищённых файлов${accepted:+, принятых правок Claude: $accepted})"
exit $fail
