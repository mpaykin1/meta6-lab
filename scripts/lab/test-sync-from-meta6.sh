#!/usr/bin/env bash
# Проверка + ловушки для scripts/lab/sync-from-meta6.sh (OSHIBKI №15).
# Строит два временных git-репозитория (meta6 и песочница) и проверяет 6 правил.
# Затем ловушки: «опасные» версии скрипта (старый rsync --delete, без защиты конфликтов,
# без проверки базы) ОБЯЗАНЫ провалить проверку. Если ловушка прошла — проверка слабая → exit 1.
set -uo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
REAL="$HERE/sync-from-meta6.sh"

run_suite() { # $1 = скрипт синхронизации; возвращает 0, если все правила соблюдены
  local S="$1" T; T=$(mktemp -d)
  ( # (set -e не работает внутри if, поэтому каждая строка с || exit 1)
    cd "$T"; git init -q m6; git init -q lab || exit 1
    for r in m6 lab; do git -C $r config user.email t@t; git -C $r config user.name t; done
    # meta6: начальное состояние
    mkdir -p m6/rules m6/docs || exit 1
    echo a > m6/rules/A.md; echo b > m6/rules/B.md; echo c > m6/docs/C.md; echo d > m6/docs/D.md
    git -C m6 add -A; git -C m6 commit -qm base; BASE=$(git -C m6 rev-parse HEAD) || exit 1
    # песочница = копия + свой файл + база
    cp -r m6/rules m6/docs lab/; mkdir -p lab/scripts/platform lab/.github/workflows || exit 1
    echo check > lab/scripts/platform/verify.mjs; echo wf > lab/.github/workflows/x.yml || exit 1
    echo "$BASE" > lab/.lab-sync-base; git -C lab add -A; git -C lab commit -qm lab-base || exit 1
    # песочница меняет B.md (её правка), meta6 тоже меняет B.md → конфликт
    echo b-lab > lab/rules/B.md; git -C lab commit -qam lab-edit || exit 1
    # meta6: меняет A, B, удаляет D, добавляет E
    echo a2 > m6/rules/A.md; echo b-m6 > m6/rules/B.md; git -C m6 rm -q docs/D.md; echo e > m6/docs/E.md
    git -C m6 add -A; git -C m6 commit -qm m6-edit || exit 1
    bash "$S" lab m6 >/dev/null || exit 1
    [ "$(cat lab/rules/A.md)" = a2 ] || exit 1  # 1 правка meta6 перенесена
    [ "$(cat lab/rules/B.md)" = b-lab ] || exit 1  # 2 конфликт: правка песочницы сохранена
    [ ! -e lab/docs/D.md ] || exit 1  # 3 удаление в meta6 перенесено
    [ "$(cat lab/docs/E.md)" = e ] || exit 1  # 4 новый файл meta6 перенесён
    [ -e lab/scripts/platform/verify.mjs ] || exit 1  # 5 файл только песочницы НЕ удалён
    [ -e lab/.github/workflows/x.yml ] || exit 1  # 5б workflows не тронуты
    [ "$(cat lab/.lab-sync-base)" = "$(git -C m6 rev-parse HEAD)" ] || exit 1
    # 6 нет базы → ошибка и ничего не изменено
    git -C lab add -A; git -C lab commit -qm synced || exit 1
    rm lab/.lab-sync-base; echo zzz > m6/rules/A.md; git -C m6 commit -qam again || exit 1
    if bash "$S" lab m6 >/dev/null 2>&1; then exit 1; fi
    [ "$(cat lab/rules/A.md)" = a2 ] || exit 1
  ); local rc=$?; rm -rf "$T"; return $rc
}

fail=0
if run_suite "$REAL"; then echo "PASS настоящий sync-from-meta6.sh"; else echo "FAIL настоящий sync-from-meta6.sh"; fail=1; fi

M=$(mktemp -d)
# Ловушка 1: старый способ — полная копия с удалением всего лишнего
cat > "$M/rsync-delete.sh" <<'EOF'
set -e; LAB=$1; M6=$2
find "$LAB" -mindepth 1 -maxdepth 1 ! -name .git ! -name .lab-sync-base -exec rm -rf {} +
(cd "$M6" && git ls-files) | while read -r p; do mkdir -p "$LAB/$(dirname "$p")"; cp "$M6/$p" "$LAB/$p"; done
git -C "$M6" rev-parse HEAD > "$LAB/.lab-sync-base" || exit 1
EOF
# Ловушка 2: без защиты конфликтов (meta6 всегда перезаписывает)
sed 's/if grep -qxF "$path" "$LAB_CHANGED"; then conflicts+=("$path"); continue; fi/:/' "$REAL" > "$M/no-conflict.sh"
# Ловушка 3: нет базы → берёт всё подряд вместо остановки
sed 's/|| { echo "::error::нет $BASE_FILE.*exit 2; }/|| git -C "$2" rev-list --max-parents=0 HEAD > "$1\/.lab-sync-base"/' "$REAL" > "$M/no-base-guard.sh"
# Ловушка 4: удаления из meta6 не переносятся
sed 's/\[ -e "$LAB\/$path" \] \&\& rm -f "$LAB\/$path"/:/' "$REAL" > "$M/no-delete.sh"
for t in rsync-delete no-conflict no-base-guard no-delete; do
  cmp -s "$M/$t.sh" "$REAL" && { echo "FAIL ловушка $t не применилась (sed не нашёл строку)"; fail=1; continue; }
  if run_suite "$M/$t.sh"; then echo "FAIL ловушка $t НЕ поймана"; fail=1; else echo "PASS ловушка $t поймана"; fi
done
rm -rf "$M"
exit $fail
