#!/usr/bin/env bash
# Ловушка для бота ТЕЛЕФОН БЕЗ ТОРМОЗОВ: хорошая сцена обязана пройти, сцена с ошибками Bullet Car 1.2 — упасть по каждому пункту.
set -u
cd "$(dirname "$0")/../.."
B=scripts/telefon-bez-tormozov.mjs; F=automation/telefon-bez-tormozov/fixtures; fail=0
node $B $F/good.html > /tmp/tbt-good.txt; [ $? -eq 0 ] || { echo "ЛОВУШКА: хорошая сцена не прошла"; cat /tmp/tbt-good.txt; fail=1; }
node $B $F/bad.html > /tmp/tbt-bad.txt; [ $? -eq 1 ] || { echo "ЛОВУШКА: плохая сцена не упала"; fail=1; }
for w in 'Источников света' 'Выключенных ламп' 'Сцена рисуется' 'Отрисовок' 'Треугольников' 'КБ геометрии' 'КБ текстур' 'Тени в реальном'; do
  grep -q "FAIL $w" /tmp/tbt-bad.txt || { echo "ЛОВУШКА: бот не поймал «$w»"; fail=1; }
done
cat /tmp/tbt-bad.txt
[ $fail -eq 0 ] && echo "ЛОВУШКИ: OK" || exit 1
