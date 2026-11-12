# ЭТАЛОНЫ В БИБЛИОТЕКУ — прогресс

Начало круга: 2026-11-11T14:21:09.701Z UTC. Ветка: `lab/biblioteka-contract-20261111` (создана от актуального main).
Источник статуса: [BIBLIOTEKA.md](https://github.com/mpaykin1/meta6-lab/blob/main/BIBLIOTEKA.md), [инвентаризация](https://github.com/mpaykin1/meta6-lab/blob/main/docs/INVENTORY_LAB_GAMES_2026-11-10.md).

## Пары «игра × шаг»

Завершённых с подтверждённым SHA и зелёным Actions run на начало этого круга: **0**. Внесение данных из PR без слияния не отмечается PASS.
При изменении исходного Git blob SHA выполненные шаги данной игры должны быть открыты заново.

## Счётчик: было → стало

| Метрика | Было | Стало | Основание |
|---|---:|---:|---|
| Полных эталонов из 22 уникальных позиций | 0 | 0 | [BIBLIOTEKA.md](https://github.com/mpaykin1/meta6-lab/blob/main/BIBLIOTEKA.md); 24 позиции минус 2 копии |
| Систем, подтверждённых независимым Chromium (load_ok) | 0 | **0 в main + 1 в PR #270** | [зелёный Chromium 43173380458](https://github.com/mpaykin1/meta6-lab/actions/runs/43173380458), [SHA 7b2f3e0eb3742048d338bd5bba8a568d076e388b](https://github.com/mpaykin1/meta6-lab/commit/7b2f3e0eb3742048d338bd5bba8a568d076e388b); merge запрещён до всех зелёных checks |
| Ассетов с подтверждённым asset_ok | не подтверждено | не подтверждено | Независимых доказательств нет |
| Полных эталонов, подтверждённо доступных через MCP | 0 | 0 | Живого вызова систем и ассетов без ошибок нет |

## Список саморазвития (по порядку)

- [x] а) Сохранить многоразовый промпт в `automation/prompts/BIBLIOTEKA.md` с источниками, ограничениями и ловушкой неверных PASS.
- [ ] б) Одна целая система одной игры = один небольшой PR, независимый Chromium — [#270](https://github.com/mpaykin1/meta6-lab/pull/270), [Chromium PASS](https://github.com/mpaykin1/meta6-lab/actions/runs/43173380458), **НЕ ЗАКРЫТО**, quota red.
- [ ] в) Исключить копии и учебные игры из живого индекса; не дублировать [PR #218](https://github.com/mpaykin1/meta6-lab/pull/218).
- [ ] г) Семантический поиск по системам нескольких игр для MCP-клиентов.
- [ ] д) Демо из систем и ассетов библиотеки; реально пройдено ботом.
- [ ] е) Счётчики «было → стало» с SHA и run ID каждого круга.

## Незавершённые пары «игра × шаг»

- Король Пепла × ИСХОДНИК — **BLOCKED, не PASS**: оригинал [в открытом PR #207](https://github.com/mpaykin1/meta6-lab/pull/207), но не принят в main; не запрашивать повторно файл у владельца. Исходный blob по описанию PR: `1a1f6d32310ec84d8c542262a74e4ed71ee60f59`; сверка с принятым оригиналом и Chromium не подтверждена.
- Бесконечные долины — Золотой рыцарь × ИСХОДНИК — **BLOCKED, не PASS**: оригинал [в PR #189](https://github.com/mpaykin1/meta6-lab/pull/189), не в main. Для верификации исходника ещё нужен принятый blob и безопасное слияние.

- Veil Terraces × СИСТЕМЫ — **1/1 камера load_ok в PR #270, полный шаг игры НЕ PASS**: выделена ровно одна система камеры из исходника [Git blob 22f3cd154cd247e3fcc6977c8334e04417a2faf7](https://github.com/mpaykin1/meta6-lab/blob/22f3cd154cd247e3fcc6977c8334e04417a2faf7/games/veil-terraces/index.html), [PR #270](https://github.com/mpaykin1/meta6-lab/pull/270), [коммит 7b2f3e0eb3742048d338bd5bba8a568d076e388b](https://github.com/mpaykin1/meta6-lab/commit/7b2f3e0eb3742048d338bd5bba8a568d076e388b), [зелёный Chromium 43173380458](https://github.com/mpaykin1/meta6-lab/actions/runs/43173380458) подтвердил непустой canvas и реальный ввод; [красный STOROZHA quota 43173380383](https://github.com/mpaykin1/meta6-lab/actions/runs/43173380383) блокирует merge, публичный MCP не проверен.

## Текущий PR

- [#261](https://github.com/mpaykin1/meta6-lab/pull/261) — саморазвитие а); рабочая ветка `lab/biblioteka-contract-20261111`; CI финального SHA ещё не подтверждён, слияния нет.

## Хронология

- 2026-11-11T14:21:09.701Z UTC — захват задачи: [коммит 7e222da5aa9e36a93887c4a9d8fc045b5a604a8c](https://github.com/mpaykin1/meta6-lab/commit/7e222da5aa9e36a93887c4a9d8fc045b5a604a8c). Никакие эталоны не изменены.

- 2026-11-11T14:26:41.373Z UTC — саморазвитие **а)**: [промпт](https://github.com/mpaykin1/meta6-lab/commit/7d6772877919c4298d8f3e441bb007efce71a9d4) + [ловушка и 4 мутации](https://github.com/mpaykin1/meta6-lab/commit/e24017ff33fc3b86c79c45d577891ac4ae89ecf7) + [исправление MCP](https://github.com/mpaykin1/meta6-lab/commit/0653ed0da9c7f4aa07f2f4ab2565a815c9aef511). Локальная проверка структуры и 4 повреждений пройдена; **CI ещё не подтверждён**. Игровые шаги PASS не получены.

- 2026-11-11T14:27:41.203Z UTC — [PR #261](https://github.com/mpaykin1/meta6-lab/pull/261) открыт в статусе draft; [связь с задачей](https://github.com/mpaykin1/meta6-lab/commit/a64bcd917d77f2b97c77d3ad518cf51300569db4). Ожидание CI не означает PASS.

- 2026-11-11T14:29:10.586Z UTC — блокеры систем и исключения копий оставлены за существующими [#209](https://github.com/mpaykin1/meta6-lab/pull/209) и [#218](https://github.com/mpaykin1/meta6-lab/pull/218); [обновлён DLYA_CLAUDE.md](https://github.com/mpaykin1/meta6-lab/commit/41bd68d5f5c257565a23914a8fe96c487c585ddb). Оригиналы из PR #207/#189/#137 не объявлены файлами main.

- 2026-11-12T07:12:00.916Z — синхронизация [PR #261](https://github.com/mpaykin1/meta6-lab/pull/261) с текущим main без force-push: [merge commit 5587949b43a16760160f2199158db32ed83841cc](https://github.com/mpaykin1/meta6-lab/commit/5587949b43a16760160f2199158db32ed83841cc); саморазвитие **б)** начато отдельным [PR #270](https://github.com/mpaykin1/meta6-lab/pull/270), 1 система, 5 файлов, 3 мутации, [CI 43173380458](https://github.com/mpaykin1/meta6-lab/actions/runs/43173380458) в очереди, PASS не заявлен.

- 2026-11-12T07:14:00Z — Veil Terraces, система камеры: исходный Git blob `22f3cd154cd247e3fcc6977c8334e04417a2faf7`, 1/1 автономная камера Chromium PASS: [PR #270](https://github.com/mpaykin1/meta6-lab/pull/270), [зелёный run 43173380458](https://github.com/mpaykin1/meta6-lab/actions/runs/43173380458), [система и код 7b2f3e0eb3742048d338bd5bba8a568d076e388b](https://github.com/mpaykin1/meta6-lab/commit/7b2f3e0eb3742048d338bd5bba8a568d076e388b), [метаданные ae57880382e7ca2c3f53bc3bbceb2b6964137898](https://github.com/mpaykin1/meta6-lab/commit/ae57880382e7ca2c3f53bc3bbceb2b6964137898). PR quota [красный run 43173380383](https://github.com/mpaykin1/meta6-lab/actions/runs/43173380383), LIVE=48, первыми заблокированы #3 #54 #72 #87 #133. Полных эталонов 0 → 0; MCP без подтверждений.


- 2026-11-12T08:55:50.645Z — саморазвитие а), проверка ПРОИСХОЖДЕНИЯ: запрещено считать стороннюю лицензию подтверждённой по имени файла или включать непроверенное в каталог. [PR #261](https://github.com/mpaykin1/meta6-lab/pull/261), [проверка 2a8e116cd2aba35eec7727f7cfda4d19e0ef81e2](https://github.com/mpaykin1/meta6-lab/commit/2a8e116cd2aba35eec7727f7cfda4d19e0ef81e2), [3 мутации 3a19f8d7545d694e768723b4bb44cfc7ddaf2702](https://github.com/mpaykin1/meta6-lab/commit/3a19f8d7545d694e768723b4bb44cfc7ddaf2702). CI текущего SHA не подтверждён. Игр-эталонов 0 → 0; load_ok в main 0 → 0; MCP 0 → 0.

## Урок

- Правило: обнаружение игрового ассета по пути не подтверждает лицензию. Проверяющий должен отклонять допуск стороннего материала без источника и лицензии, даже если текст контракта формально содержит шаг «ПРОИСХОЖДЕНИЕ».

- Латинское название MCP обязано учитываться при проверке нумерованных русских шагов; смешанный алфавит проверять мутациями.
- Не запрашивать у владельца файл, если он уже существует в открытом PR: сначала проверить исходный Git blob и статус PR. [Король Пепла #207](https://github.com/mpaykin1/meta6-lab/pull/207), [Золотой рыцарь #189](https://github.com/mpaykin1/meta6-lab/pull/189).

- Правило: не повышать `load_ok` после статического совпадения SHA/ESM — только после независимого headless Chromium с непустым canvas и реальным `Input.dispatchKeyEvent`; при `main` с 100+ коммитами впереди синхронизировать merge-коммитом без перезаписи главной ветки.

- Перед созданием **нового PR** проверить [STOROZHA PR quota](https://github.com/mpaykin1/meta6-lab/actions/runs/43173380383): при `LIVE>5` не создавать очередной PR; работать в существующей библиотечной ветке или передавать расчистку очереди Claude. Не обходить квоту; не путать зелёный Chromium с разрешением на merge.

## Развитие

| Дата UTC | Новых правил | Новых ловушек | Мутантов-беглецов | Повторов ошибок | Ждёт Claude |
|---|---:|---:|---:|---:|---:|
| 2026-11-11 | 1 | 1 (4 мутации) | 0 | 0 | минимум 2 PR (#209, #218) |
