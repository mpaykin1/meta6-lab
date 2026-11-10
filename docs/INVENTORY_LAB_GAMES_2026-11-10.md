# Опись игр META GAMES LAB — 10.11.2026 (Claude)

Источник: meta6-lab `main` после слияния PR #142, #183, #195, #196 (10.11.2026) + все открытые PR. Собрано по файлам репозитория и спискам файлов PR, не по памяти.

**Решение владельца 10.11.2026:** все игры, которые он залил в META GAMES LAB, — эталоны библиотеки. Каждая игра из таблицы ниже должна попасть в станок библиотеки (`shared/library/<игра>.json`, пункт L1 в FINISH.md).

**Итого: 24 игры владельца.** В `main`: 19. В станке библиотеки: 14. Ещё не в `main` (лежат в открытых PR): 5.

| # | Игра | Где лежит | В main | В станке |
|---|---|---|---|---|
| 1 | Остров сумерек (Twilight Island V7) | `observer-world-en-v7/`, `reference/sumerek-golden/ostrov-sumerek-b94ef394.html` | да | да |
| 2 | Пепельный путь (Ashen Path) | `ashen-sumerek/`; ассет-пак — PR #208 | да | да (ассет-пак — нет) |
| 3 | Подводный мир (Underwater World) | `underwater-world/` | да | да |
| 4 | Три мира (Three Worlds) | `three-worlds-game/` | да | да |
| 5 | Veil Terraces | `meta-games-worlds/veil-terraces/`, `games/veil-terraces/` | да | да |
| 6 | Лучник в тумане | `games/archer-in-the-fog/`; исходный HTML — PR #202 | да | да |
| 7 | Сломанный город | `games/broken-city/`, `reference/broken-city-2026-11-09/` | да | да |
| 8 | Сломанный город (Copy) | `games/broken-city-copy/` | да | да |
| 9 | Сумерки и пепел II | `games/sumerki-i-pepel-2/`, `reference/sumerek-golden/` | да | да |
| 10 | Сумерки и пепел II (Copy) | `games/sumerki-i-pepel-2-copy/` | да | да |
| 11 | Twilight Isle Classic | `games/twilight-isle-classic/` | да | да |
| 12 | Twilight Isles (+ версия 2.0.0 из ZIP) | `games/twilight-isles/`, `reference/twilight-isles-2026-11-09/` | да | да (2.0.0 — нет) |
| 13 | Радужный разгон | `games/rainbow-acceleration/` | да | да |
| 14 | ASQURA OFFICE (Ilya version) | `games/asqura-ilya-reference/`; первая версия — PR #133 | да | да (первая версия — нет) |
| 15 | Сумеречный архипелаг | `reference/sumerechny-arkhipelag/` | да | нет |
| 16 | Под и Над | `reference/sumerek-golden/pod-i-nad-68b2ecd3.html`, `shared/components/pod-i-nad/` | да | нет (только каталог ассетов) |
| 17 | Затонувший город | `reference/sunken-city/`, `references/sunken-city/`; полный ZIP — PR #191 | да | нет |
| 18 | ABYSS GLOW | `abyss-glow/`, `reference/abyss-glow-2026-11-09/`; ещё один эталон — PR #134 | да | нет |
| 19 | Генератор силуэтов (золото) | `reference/silhouette-gold-generator/` | да | нет |
| 20 | Король Пепла | PR #206, #207 (дубли) | **нет** | нет |
| 21 | Бесконечные долины — Золотой рыцарь | PR #189 | **нет** | нет |
| 22 | Демоническая рука (WebGL2) | PR #137 | **нет** | нет |
| 23 | Сцена 1 — Туманное пробуждение | PR #201 (черновик, только ZIP) | **нет** | нет |
| 24 | Поезд в тумане (вагоны R1) | только записи в `shared/asset-library/catalog.json`; исходных `.glb` в репозитории нет | **нет файлов** | нет |

## Не считаются эталонами

- `island-sumerek-biomes/`, `underwater-sumerek/`, `observer-world-en-v1…v6` — копии и ветки «Острова сумерек». По правилу REUSE эталон только №1.
- `meta-games-worlds/generated-confluence-vault`, `witness-vault` — собраны генератором, владелец отклонил (07.11.2026).
- `games/skin-trainer`, `games/rules-trainer` (PR #204) — учебные игры для ботов.

## Что сделать, чтобы все 24 стали эталонами

1. Слить PR №20–23 (#206 или #207, #189, #137, #201) и дополнительные версии (#133, #134, #191, #202, #208): убрать конфликты в `LAB_QUEUE.md` и `shared/library/index.json`, исходники положить в `reference/<игра>/` (сейчас «сырые» эталоны в `games/` валят проверку `changed-games`). Из дублей Короля Пепла оставить один PR.
2. Поезд в тумане: найти исходные `.glb` и положить их в `reference/train-in-the-fog/`, иначе это не эталон, а пустая запись в каталоге.
3. Прогнать станок библиотеки (`library-machine.yml`) по всем 24: в станке должна появиться запись для каждой игры (сейчас 14).
4. Проверка: число игр в станке = число строк этой описи. Ловушка: удалить одну игру из станка — проверка обязана упасть.
