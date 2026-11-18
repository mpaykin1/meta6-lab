#!/usr/bin/env bash
# Сторожа коммитят сводку, только если изменилось что-то кроме времени/SHA/ссылки на прогон.
# Выход 0 — есть содержательные изменения; 1 — только служебные (или нет изменений).
# Использование: bash scripts/lab/meaningful-diff.sh [--cached] [пути...]
set -euo pipefail
args=(diff -U0 --no-color)
if [ "${1:-}" = "--cached" ]; then args+=(--cached); shift; fi
noise='^[-+][[:space:]]*("generated_at"|"lab"|"mg"|"run"|"checked_at"|"updated_at")[[:space:]]*:|^[-+](UTC: 20|Сторож проверил:|Обновлено:|_Обновлено|Последняя проверка:)'
if git "${args[@]}" -- "$@" | grep -E '^[-+]' | grep -vE '^(\+\+\+|---) ' | grep -vE "$noise" | grep -q .; then
  exit 0
fi
exit 1
