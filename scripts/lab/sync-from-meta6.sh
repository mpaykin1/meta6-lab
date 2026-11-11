#!/usr/bin/env bash
# Безопасная синхронизация meta6 → meta6-lab (Claude, 10.11.2026).
#
# Было: rsync --delete целиком делал main песочницы копией meta6 и УДАЛЯЛ всё,
# что Claude уже принял в песочнице, но ещё не перенёс в meta6
# (проверки B1/P1, станок библиотеки, kontur, ZANYATO, эталонные игры).
#
# Стало: переносятся только файлы, которые изменились В META6 с прошлой синхронизации.
#   * файл изменён только в meta6  → берётся версия meta6 (meta6 главнее);
#   * файл удалён в meta6          → сохраняется в песочнице (никакого удаления);
#   * файл изменили ОБЕ стороны    → остаётся версия песочницы, путь пишется в конфликты
#                                    (решает Claude при переносе в meta6);
#   * файл есть только в песочнице → никогда не трогается;
#   * .github/workflows             → никогда не трогается (GITHUB_TOKEN не может их пушить).
# База синхронизации хранится в .lab-sync-base (полный SHA meta6).
# Нет базы или её нет в истории meta6 → ошибка, НИЧЕГО не меняется.
#
# Использование: sync-from-meta6.sh <папка-песочницы> <папка-клона-meta6-с-историей>
# Печатает в stdout итог; конфликты — в файл $SYNC_CONFLICTS (если задан).
set -euo pipefail
LAB=$(cd "$1" && pwd); M6=$(cd "$2" && pwd)
BASE_FILE="$LAB/.lab-sync-base"
[ -s "$BASE_FILE" ] || { echo "::error::нет $BASE_FILE — синхронизация остановлена, ничего не изменено"; exit 2; }
BASE=$(tr -d ' \n' < "$BASE_FILE")
git -C "$M6" cat-file -e "$BASE^{commit}" 2>/dev/null || { echo "::error::база $BASE не найдена в истории meta6 — ничего не изменено"; exit 3; }
HEAD6=$(git -C "$M6" rev-parse HEAD)
[ "$BASE" = "$HEAD6" ] && { echo "Уже синхронизировано с meta6 $HEAD6"; exit 0; }

# Коммит песочницы, в котором записана текущая база (с него считаем правки песочницы).
LAB_BASE_COMMIT=$(git -C "$LAB" log -1 --format=%H -- .lab-sync-base)
[ -n "$LAB_BASE_COMMIT" ] || { echo "::error::.lab-sync-base не закоммичен — ничего не изменено"; exit 4; }
LAB_CHANGED=$(mktemp)
{ git -C "$LAB" diff --name-only --no-renames "$LAB_BASE_COMMIT" HEAD; git -C "$LAB" status --porcelain | cut -c4-; } | sort -u > "$LAB_CHANGED"

applied=0; skipped=0; conflicts=()
while IFS=$'\t' read -r st path; do
  [ -z "$path" ] && continue
  case "$path" in .github/workflows/*|.lab-sync-base|README.md|LAB_README.md|LAB_QUEUE.md) skipped=$((skipped+1)); continue;; esac
  if grep -qxF "$path" "$LAB_CHANGED"; then conflicts+=("$path"); continue; fi
  if [ "$st" = "D" ]; then
    # Deletion upstream is not permission to delete a sandbox-owned or published file.
    skipped=$((skipped+1))
    continue
  fi
  mkdir -p "$LAB/$(dirname "$path")"
  git -C "$M6" show "HEAD:$path" > "$LAB/$path"
  [ -x "$M6/$path" ] && chmod +x "$LAB/$path" || true
  applied=$((applied+1))
done < <(git -C "$M6" diff --name-status --no-renames "$BASE" "$HEAD6")

echo "$HEAD6" > "$BASE_FILE"
echo "meta6 $BASE → $HEAD6: перенесено $applied, пропущено $skipped, конфликтов ${#conflicts[@]}"
if [ ${#conflicts[@]} -gt 0 ]; then
  printf '%s\n' "${conflicts[@]}" | sed 's/^/  оставлена версия песочницы: /'
  [ -n "${SYNC_CONFLICTS:-}" ] && printf '%s\n' "${conflicts[@]}" > "$SYNC_CONFLICTS"
fi
rm -f "$LAB_CHANGED"
