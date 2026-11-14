# КАРТА СИЛ — META GAMES Lab

## Экзамены 09.11.2026

Считаны только ошибки, прямо атрибутированные экзамену в OSHIBKI.md. «Нет подтверждения» не означает отсутствие ошибок.

| Экзамен | PR и итог | Поймано ошибок | Повтор прежней ошибки |
|---|---|---:|---|
| P1 | [#186](https://github.com/mpaykin1/meta6-lab/pull/186) — слит [a6d1596](https://github.com/mpaykin1/meta6-lab/commit/a6d159697f40ed95b4ae129fcbabf6f0325bc27b) | 4 (№10–13, [журнал](https://github.com/mpaykin1/meta6-lab/blob/main/OSHIBKI.md)) | Подтверждения повтора нет |
| M3/M5 | [#197](https://github.com/mpaykin1/meta6-lab/pull/197) — слит [918c509](https://github.com/mpaykin1/meta6-lab/commit/918c509c2adb69f8a64397518adc47c448c8e942) | 1 (№8, [журнал](https://github.com/mpaykin1/meta6-lab/blob/main/OSHIBKI.md)) | Подтверждения повтора нет |
| M4 | [#194](https://github.com/mpaykin1/meta6-lab/pull/194) — слит [5a07daf](https://github.com/mpaykin1/meta6-lab/commit/5a07daf4e82b7f80616a5e75044ce9f43811dd25) | 2 (№9, №14, [журнал](https://github.com/mpaykin1/meta6-lab/blob/main/OSHIBKI.md)) | Да — №9 сломала прежнюю ловушку M1 |
| M6 | [#192](https://github.com/mpaykin1/meta6-lab/pull/192) — закрыт сторожем как заброшенный; [M6 SDK PASS](https://github.com/mpaykin1/meta6-lab/actions/runs/42711868041), но [Portal: 11 ≠ 12](https://github.com/mpaykin1/meta6-lab/actions/runs/42711867873) и [META BOT: застревание уровня 3](https://github.com/mpaykin1/meta6-lab/actions/runs/42711868016) красные на 61f0e781; перекрёстная приёмка не завершена | В main OSHIBKI нет надёжной атрибуции к M6; внешние блокеры не считаются дефектами Connect | Нет подтверждения повтора |
| К7 | [#193](https://github.com/mpaykin1/meta6-lab/pull/193) — [возвращён Claude, попытка 1/2](https://github.com/mpaykin1/meta6-lab/pull/193#issuecomment-6747014451): ложные срабатывания на честных PR; закрыт сторожем как заброшенный | 3 замечания ревью: подсчёт мутаций по именам, пары verify/mutate по имени, запрет чтения GITHUB_TOKEN; это замечания ревью, не записи main OSHIBKI | [KONTUR PASS](https://github.com/mpaykin1/meta6-lab/actions/runs/42929712565) не заменяет приёмку Claude; повтор не подтверждён |

<!-- KARTA:AUTO BEGIN -->
## Статистика GitHub за 14 дней
Источник: GitHub PR, коммиты, Actions, OSHIBKI.md. Нет выборки — «нет данных», а не зелёный.

| Тип | Исполнитель | Слито | Закрыто | Брошено | Отложено | Claude | Ошибки | До слияния, ч | Красные прогоны | Зона |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| game_reference | неизвестно | 13 | 9 | 0 | 1 | 0 | 0 | 5.9 | 18 | жёлтая |
| game_fix | автозадача | 0 | 2 | 0 | 0 | 0 | 0 | нет данных | 0 | красная |
| game_fix | чат ChatGPT | 0 | 2 | 0 | 1 | 0 | 0 | нет данных | 24 | красная |
| game_fix | неизвестно | 62 | 42 | 0 | 6 | 4 | 0 | 0.6 | 113 | жёлтая |
| bot_check | неизвестно | 4 | 1 | 0 | 5 | 0 | 0 | 5.5 | 125 | зелёная |
| workflow_ci | чат ChatGPT | 1 | 2 | 0 | 2 | 0 | 0 | 0.6 | 12 | красная |
| workflow_ci | неизвестно | 38 | 14 | 0 | 7 | 4 | 0 | 0.6 | 234 | жёлтая |
| repo_clean | неизвестно | 19 | 2 | 0 | 4 | 2 | 0 | 0.4 | 47 | зелёная |
| summary_dispatch | чат ChatGPT | 2 | 0 | 0 | 0 | 1 | 0 | 12.7 | 17 | жёлтая |
| summary_dispatch | неизвестно | 11 | 6 | 0 | 1 | 2 | 0 | 17.2 | 19 | жёлтая |
| assets | неизвестно | 3 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | зелёная |
| rules_docs | чат ChatGPT | 0 | 1 | 0 | 0 | 0 | 0 | нет данных | 0 | красная |
| rules_docs | неизвестно | 9 | 6 | 0 | 2 | 0 | 0 | 17.2 | 17 | жёлтая |
| unclassified | неизвестно | 15 | 2 | 0 | 1 | 1 | 0 | 3.3 | 13 | зелёная |

<!-- KARTA:AUTO END -->
