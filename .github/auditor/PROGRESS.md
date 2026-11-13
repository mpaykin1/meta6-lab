# META GAMES — ревизор пяти задач

Источник состояния: GitHub, ветка `lab/auditor-five-hourly-1111`.

- [x] Шаг 0: прочитаны правила МГ/МГЛ и проверено отсутствие прежнего `.github/auditor/PROGRESS.md`.
- [x] Шаг 1: 5 ролей, индивидуальные минуты и защищённые пути — [config.yml](https://github.com/mpaykin1/meta6-lab/blob/lab/auditor-five-hourly-1111/.github/auditor/config.yml), [коммит a490957](https://github.com/mpaykin1/meta6-lab/commit/a490957406390e207a456e12310bfc6a37347fe0). Уникальные commit/PR-label префиксы не подтверждены, поэтому не подставлены.
- [x] Шаг 2: [workflow auditor.yml](https://github.com/mpaykin1/meta6-lab/blob/lab/auditor-five-hourly-1111/.github/workflows/auditor.yml) создан ([SHA d2130fc](https://github.com/mpaykin1/meta6-lab/commit/d2130fc00e17697071cf8cbfcc87508086ae7089)); синтаксис JS проверен, runtime ещё не запускался.
- [x] Шаг 3: два цикла, PR, SHA, CI, Actions и protected diff проверены пробным [зелёным run #43024276845](https://github.com/mpaykin1/meta6-lab/actions/runs/43024276845), SHA `bda9a36bc4d45b4f96809a4ff11989edfc547e9e`.
- [ ] Шаг 4: Actions Summary формируется, канонический [Issue #253](https://github.com/mpaykin1/meta6-lab/issues/253) создан; обновление и pin ботом требуют запуска из main.
- [ ] Шаг 5: разрешить защищённый workflow по [красному STOROZHA run #43024276457](https://github.com/mpaykin1/meta6-lab/actions/runs/43024276457), затем merge PR #251, запуск на main и workflow_dispatch, проверить обновление Issue.
- [x] Шаг 6: оптимизированы запросы GitHub API, номер Issue зафиксирован, три мутации пойманы (API pagination, duplicate Issue, PR write), [run #43024276845](https://github.com/mpaykin1/meta6-lab/actions/runs/43024276845), [trap](https://github.com/mpaykin1/meta6-lab/blob/lab/auditor-five-hourly-1111/scripts/auditor/mutate-auditor.mjs).

## Продолжение

Читать этот файл перед каждым повтором; выполнять первый незавершённый шаг. Не называть CI успешным без реального Actions run.

## Последнее подтверждение

- PR: https://github.com/mpaykin1/meta6-lab/pull/251
- Код: https://github.com/mpaykin1/meta6-lab/commit/bda9a36bc4d45b4f96809a4ff11989edfc547e9e
- Ревизор в PR: зелёный https://github.com/mpaykin1/meta6-lab/actions/runs/43024276845
- Защищённый workflow: ожидает Claude https://github.com/mpaykin1/meta6-lab/actions/runs/43024276457
- Единственный Issue: https://github.com/mpaykin1/meta6-lab/issues/253 (ботом ещё не обновлён).

## Круг 2026-11-13 08:12 UTC — main 85411c490f86e4627237b6c1e45c4b90ee2e0d43

- Шаг 0 · 2026-11-13T08:12:24Z: прочитаны обязательные правила и прогресс открытых #254/#269/#275; #251 уже слит: [merge SHA](https://github.com/mpaykin1/meta6-lab/commit/5016e0750ad94d53798200f6db159f9c37f55ab1). Не повторять третью попытку #254.
- [ ] Шаг 1 · 2026-11-13T08:12:24Z: последние schedule на main [43284747015](https://github.com/mpaykin1/meta6-lab/actions/runs/43284747015) 12.11 18:54:55Z, [43336396518](https://github.com/mpaykin1/meta6-lab/actions/runs/43336396518) 13.11 00:21:20Z, [43389263368](https://github.com/mpaykin1/meta6-lab/actions/runs/43389263368) 07:55:41Z — success; интервалы 5:26:25 и 7:34:21. cron уже 13 * * * *; причина задержек не доказана, почасовой режим НЕ пройден. Исследовать jobs/очередь, не менять cron вслепую.

### Реестр улучшений (подготовлено ≠ слито)
- а) pin: PR #254, НУЖЕН CLAUDE, 2 попытки уже исчерпаны.
- б) два часа: PR #269, не слит.
- в) старые проблемные PR: PR #275, не слит.
- г) таблица задач: продолжить существующую ветку lab/auditor-task-table-20261113; PR ещё нет, код ещё не добавлен.
- д) повторные ошибки: не начато.
- е) запросы API: исходная оптимизация #251, новое измерение бюджета не выполнено.

- [ ] Шаг 2 · 2026-11-13T08:14:38Z: поиск открытых одноимённых Issues вернул только #253; Issue open, автоматический срез 07:55:51Z свежий. GraphQL не предоставлен соединением, gh token недействителен, pin не подтверждён: [PR #254](https://github.com/mpaykin1/meta6-lab/pull/254).
- [x] Шаг 3 · 2026-11-13T08:14:38Z: строки MG-строитель-1/2 сверены с [SHA источника](https://github.com/mpaykin1/meta6-lab/commit/85411c490f86e4627237b6c1e45c4b90ee2e0d43) и [run](https://github.com/mpaykin1/meta6-lab/actions/runs/43389263368); они не содержат PR/SHA/CI и сохраняют ⚠️. Ложный заголовок «Последний запуск» заменён на расчётное окно; постоянная ловушка уже в [#269](https://github.com/mpaykin1/meta6-lab/pull/269).
- [x] Шаг 4 · 2026-11-13T08:14:38Z: в 🚨 нет конкретного нового безопасного нарушения; известные защищённые исправления #254/#269/#275 не сливать. Jobs последних трёх run стартовали через 2–3 секунды и длились 11–14 секунд: это не часовая очередь runner. Причина редкого создания schedule пока не доказана, см. [43389263368](https://github.com/mpaykin1/meta6-lab/actions/runs/43389263368).
- Шаг 5 · 2026-11-13T08:14:38Z: продолжается уже зарегистрированная ветка lab/auditor-task-table-20261113, пункт г). Основная сверка — новый модуль вне защищённых путей; подключение отчёта в workflow требует НУЖЕН CLAUDE. Запрещено объявлять улучшение слитым до main.

### Сохранённое продолжение пункта г)
 — task-table, main c42a2dd4d07d8cae745cd963b4b3748ad7600084

- Шаг 0 · 2026-11-13T04:14:00Z: правила и main PROGRESS прочитаны; продолжение а–в найдено в [#254](https://github.com/mpaykin1/meta6-lab/pull/254), [#269](https://github.com/mpaykin1/meta6-lab/pull/269), [#275](https://github.com/mpaykin1/meta6-lab/pull/275). Это подготовленные, не слитые улучшения; третья попытка #254 запрещена после двух STOROZHA отказов.
- Шаг 1 · 2026-11-13T04:14:00Z: последние schedule [43336396518](https://github.com/mpaykin1/meta6-lab/actions/runs/43336396518), [43284747015](https://github.com/mpaykin1/meta6-lab/actions/runs/43284747015), [43205929183](https://github.com/mpaykin1/meta6-lab/actions/runs/43205929183) success, интервалы 5:26:25 и 7:50:30. Workflow уже содержит hourly cron 13 * * * *; менять cron без доказанной причины задержек нельзя. Причина задержек не установлена.
- Шаг 2 · 2026-11-13T04:14:00Z: [#253](https://github.com/mpaykin1/meta6-lab/issues/253) open, updated_at 03:40:14Z (менее 70 минут). Поиск одноимённых Issues: #253 и закрытый #250; GraphQL/pin не предоставлен коннектором, закрепление НЕ подтверждено.
- Шаг 3 · 2026-11-13T04:14:00Z: две строки о schedule в [#253](https://github.com/mpaykin1/meta6-lab/issues/253) сверены с run 43336396518 (SHA 7d420ed8e0da7748b8ecea0e9082dbb80f09808d) и 43284747015 (SHA 4da1fea899da6d36c38d37431ed8648ac0a2a04d): conclusion=success и интервалы соответствуют API. Называть срез 00:21 текущим состоянием нельзя.
- Шаг 4 · 2026-11-13T04:14:00Z: текущий раздел 🚨 [#253](https://github.com/mpaykin1/meta6-lab/issues/253) не содержит конкретного нового нарушения для исправления; защищённые изменения #254/#269/#275 не сливать.
- Шаг 5: выбрано г) сверка ZADACHI с PR; отдельная ветка lab/auditor-task-table-20261113. [Регистрация задачи](https://github.com/mpaykin1/meta6-lab/commit/23bc6f6ca1fe82198c608faff70bf6f83413acb8).

### Урок
Main PROGRESS устарел относительно открытых веток. Перед выбором улучшения читать PROGRESS всех открытых auditor PR, объединять статусы по номеру PR и SHA, не повторять уже подготовленные а–в и не делать третью попытку заблокированного #254. Готовность реализации в ветке и готовность main учитывать отдельно.

- Шаг 5 · 2026-11-13T08:17:54Z: пункт г) реализован в scripts/auditor/task-table.cjs, без дополнительных API запросов; четыре мутации модуля и одна интеграционная, прежние три сохранены. Локальный запуск node scripts/auditor/mutate-auditor.mjs завершён exit 0; Actions ещё не подтверждены. Новый PR готовится из существующей ветки, защищённое подключение workflow — НУЖЕН CLAUDE.

### Урок
Прогресс каждого круга сразу дублировать в main с указателем на ветку. Перед новым улучшением проверять открытые auditor PR и незавершённые ветки, иначе предыдущая реализация и лимит двух попыток теряются. Расхождение статуса доказывать ответом по PR; отсутствие PR в ограниченной выборке обозначать ⚠️.

- Шаг 5: [PR #282](https://github.com/mpaykin1/meta6-lab/pull/282), [код 737ddad](https://github.com/mpaykin1/meta6-lab/commit/737ddad5813c9be1874dc11dcc5a2efe9318177c), [auditor run 43392251668](https://github.com/mpaykin1/meta6-lab/actions/runs/43392251668), [KONTUR 43392251632](https://github.com/mpaykin1/meta6-lab/actions/runs/43392251632). На момент записи проверки ещё не подтверждены; защищённое не сливать.
