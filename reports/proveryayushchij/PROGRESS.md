# Проверяющий — постоянное развитие

Дата запуска: 2026-11-11 (UTC).
Обработано до: 2026-11-01T00:00:00Z (начальная метка; сплошной просмотр всех событий после этой даты ещё не завершён).
Отдельно обработано вне хронологической очереди: [Claude 5acb77140d3b050fc64bb227f1bee1fc1cf96e32](https://github.com/mpaykin1/meta6-lab/commit/5acb77140d3b050fc64bb227f1bee1fc1cf96e32).
Повторно этот SHA не обрабатывать, продолжить последовательный сбор с начальной метки.

## Сделано
- Новое правило: GraphQL-реестр открытых PR обязан обрабатывать все страницы и fail-closed при HTTP/GraphQL ошибке, отсутствии даты коммита и подмене HEAD.
- Новый автотест [scripts/lovushki/mutate-storozha-gh-list.mjs](https://github.com/mpaykin1/meta6-lab/blob/lab/proveryayushchij-growth-20261111/scripts/lovushki/mutate-storozha-gh-list.mjs): 8 намеренных мутаций обнаружены локальным запуском Node, `STOROZHA_GRAPHQL_MUTATIONS_PASS 8/8`; [коммит a062c58](https://github.com/mpaykin1/meta6-lab/commit/a062c58d7a5264d6fad94eb674cf7892850be481).
- [OSHIBKI #38](https://github.com/mpaykin1/meta6-lab/blob/lab/proveryayushchij-growth-20261111/OSHIBKI.md) и [чек-лист #2, #9](https://github.com/mpaykin1/meta6-lab/blob/lab/proveryayushchij-growth-20261111/rules/06-rabota-ii-s-kodom/CHEKLIST_PROVERYAYUSHCHEGO.md) — в той же ветке, без изменения существующих проверок.

- Усиление #38: [ловушка предела и фильтров GraphQL](https://github.com/mpaykin1/meta6-lab/commit/7d06c9c868667349b6540f58fce0908ba66d4777) с шестью мутациями (cap-raised, cap-lowered, truncated-page-silently-accepted, wrong-state-filter, wrong-base-filter, frozen-cursor). Локальный запуск Node: `STOROZHA_PAGINATION_MUTATIONS_PASS 6/6`, без красного Actions-run; [OSHIBKI #44](https://github.com/mpaykin1/meta6-lab/commit/2f1c4aadf0582fc1098ac376ed132ff4c7549067); [чек-лист #10](https://github.com/mpaykin1/meta6-lab/commit/60658406ea3a5a5e7fa29db1f6e9d5a9f14eb12c). Ветку `lab/proveryayushchij-growth-20261111` не сливать до полного зелёного CI.

## Незавершённое — первое на следующем запуске
1. Опубликовать [ветку lab/proveryayushchij-growth-20261111](https://github.com/mpaykin1/meta6-lab/tree/lab/proveryayushchij-growth-20261111) отдельным PR, когда квота позволит ещё один живой PR. [Список открытых PR](https://github.com/mpaykin1/meta6-lab/pulls): во время запуска найдено 39; quota запрещает открывать шестой живой PR. Текущая ловушка не в main; **нет красного Actions-прогона мутации**, не считать интеграцию подтверждённой.
2. При разрешённом PR получить зелёные обязательные проверки текущего HEAD и отдельный красный прогон намеренной мутации, затем довести слияние только по правилам.
3. Последовательно собрать материал после 2026-11-01 из коммитов Claude, revert, закрытых PR и красных main Actions; не сдвигать метку до завершения обрабатываемого диапазона.
4. Разобрать записи в [DLYA_CLAUDE.md](https://github.com/mpaykin1/meta6-lab/blob/main/DLYA_CLAUDE.md), сначала защищённые решения; провести самоэкзамен трёх ещё не проверенных слитых PR.

## Развитие
| Дата UTC | Новых правил | Новых ловушек | Мутантов-беглецов найдено | Повторов старых ошибок | Пунктов в DLYA_CLAUDE.md | Решений на подпись |
|---|---:|---:|---:|---:|---:|---:|
| 2026-11-11 | 1 | 1 | 0 подтверждённых; 8 новых мутаций убиты локально | 0 | 23 (снимок main на момент чтения) | 0 |

Сравнение с циклом 1: новых правил 1 → 1, ловушек 1 → 1; количество строк DLYA_CLAUDE 23 → 25. Общее ожидание Claude выросло; первым пунктом следующего запуска сверить, какие записи добавились и являются ли они дубликатами. Метка «обработано до» остаётся на 2026-11-01: полный хронологический разбор ещё не сделан. На [PR #247](https://github.com/mpaykin1/meta6-lab/pull/247) есть близкие ловушки GraphQL: перед новым PR проверить пересечение и не дублировать уже принятую проверку.
| 2026-11-11 (цикл 2) | 1 | 1 | 0 подтверждённых; 6 новых мутаций убиты локально | 0 | 25 | 0 |
