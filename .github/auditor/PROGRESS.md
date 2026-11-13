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

## Круг 2026-11-11 — truthful-cycle

- Основа main при начале: `799205b7a3bad0dfc937cadf2bbb9e7ade321efd` — https://github.com/mpaykin1/meta6-lab/commit/799205b7a3bad0dfc937cadf2bbb9e7ade321efd
- [x] Шаг 0 · 2026-11-11T13:54:16.807Z — прочитан PROGRESS и обязательные правила; исходник https://github.com/mpaykin1/meta6-lab/blob/main/.github/auditor/PROGRESS.md
- [ ] Шаг 1 — ещё нет трёх schedule после merge; первый прогон уже в main: https://github.com/mpaykin1/meta6-lab/actions/runs/43031781751 (workflow_dispatch)
- [x] Шаг 2 (дубликат) · 2026-11-11T13:54:16.807Z — Issue #250 закрыт как duplicate #253: https://github.com/mpaykin1/meta6-lab/issues/250 ; GraphQL-подтверждение pin #253 ещё требуется
- [x] Шаг 3 (исправление подготовлено, требуется merge) · 2026-11-11T13:59:43.736Z — обнаружено ложное доказательство плана от самого Issue #253; исправление workflow: https://github.com/mpaykin1/meta6-lab/commit/51a1c8b61ce9012bc044bb812d24b6f75071ad19
- [ ] Шаг 4 — нарушения в #253 отсутствуют, но отрицательное утверждение ненадёжно до исправления самоцитирования
- [x] Шаг 5 (а, реализация в PR) · 2026-11-11T13:59:43.736Z — GraphQL pinnedIssues, 9 мутаций, [PR #254](https://github.com/mpaykin1/meta6-lab/pull/254); [auditor run #43033906443](https://github.com/mpaykin1/meta6-lab/actions/runs/43033906443) зелёный на SHA `20a0c2f233490222ebe01392780236f234d8b58c`; [STOROZHA #43033906501](https://github.com/mpaykin1/meta6-lab/actions/runs/43033906501) красный (защищённые workflow + тест): **НУЖЕН CLAUDE**
- [x] Шаг 6 · 2026-11-11T13:59:43.736Z — Урок сохранён ниже; К6 требует строку `ПРОВЕРКА ИЗМЕНЕНА` в [PR #254](https://github.com/mpaykin1/meta6-lab/pull/254) по [KONTUR run #43033906437](https://github.com/mpaykin1/meta6-lab/actions/runs/43033906437)
- [x] Шаг 7 · 2026-11-11T14:00:50.241Z — итог/PR/блокер в [ZADACHI.md](https://github.com/mpaykin1/meta6-lab/blob/lab/auditor-truthful-cycle-20261111/ZADACHI.md), [commit d509d4a2](https://github.com/mpaykin1/meta6-lab/commit/d509d4a288e4f129c1b7be616d2e610d874e49e7)

### Урок
Само Issue ревизора и устаревшие одноимённые Issue не должны служить источником доказательств планирования ни одной из пяти ролей. Не подтверждённые GraphQL-pin и schedule нельзя маркировать зелёными.

- [x] Уточнение Issue #253 · 2026-11-11T13:59:43.736Z — пять ошибочных `✅ Issue #253` заменены на `⚠️` вручную, [Issue #253](https://github.com/mpaykin1/meta6-lab/issues/253); автоматическое предотвращение в PR #254.

## Продолжение следующего запуска

- Для текущего круга **НУЖЕН CLAUDE**: [PR #254](https://github.com/mpaykin1/meta6-lab/pull/254), защищённый `.github/workflows/auditor.yml` и тест `scripts/auditor/mutate-auditor.mjs` заблокированы [STOROZHA #43033906501](https://github.com/mpaykin1/meta6-lab/actions/runs/43033906501). Запрещено обходить STOROZHA.
- Schedule: до первого штатного запуска не называть «3/3 зелёных»; [ручной run #43031781751](https://github.com/mpaykin1/meta6-lab/actions/runs/43031781751) не считается schedule.
- Pin: подтвердить через GraphQL после одобренного workflow, не делать вывод из неоднозначного warning в [run #43031781751](https://github.com/mpaykin1/meta6-lab/actions/runs/43031781751).
- Следующее саморазвитие по списку: **б) обнаружение автозадачи без улучшений два часа подряд**, отдельный PR после закрытия или решения #254.

## Круг 2026-11-12 — проверка GraphQL и расписания

- [x] Шаг 1 · 2026-11-12T08:52:29.804Z: два schedule на main подтверждены: [#43102877168](https://github.com/mpaykin1/meta6-lab/actions/runs/43102877168) (2026-11-11T21:25:11Z, success) и [#43144961586](https://github.com/mpaykin1/meta6-lab/actions/runs/43144961586) (2026-11-12T02:57:57Z, success); 3-го нет в последней выборке, интервал 5 ч 32 мин. Канонический Issue [#253](https://github.com/mpaykin1/meta6-lab/issues/253) обновлён проверяемым срезом.
- [ ] Шаг 2: GraphQL pin #253 не доступен через текущий GitHub-коннектор, не приписывать статус.
- [ ] Шаг 3: две строки Issue #253 проверены на отсутствие подтверждающих коммитов; фиктивный план по самому Issue уже исправляется [PR #254](https://github.com/mpaykin1/meta6-lab/pull/254).
- [x] Исправление · 2026-11-12T08:52:29.804Z: повреждённый ответ GraphQL не должен обозначать незакреплённый Issue; теперь статус неизвестен: [SHA c92c062fa0b71135f9974d396b03da029b20fffd](https://github.com/mpaykin1/meta6-lab/commit/c92c062fa0b71135f9974d396b03da029b20fffd) в [PR #254](https://github.com/mpaykin1/meta6-lab/pull/254); 12 мутаций подготовлены: [SHA c5a47d2f7252b819be966bb3d2f420b89494ccb4](https://github.com/mpaykin1/meta6-lab/commit/c5a47d2f7252b819be966bb3d2f420b89494ccb4); ошибка №42 — [SHA 8495de23183957080898888363d4b23bcd48a30f](https://github.com/mpaykin1/meta6-lab/commit/8495de23183957080898888363d4b23bcd48a30f). Проверки нового HEAD не подтверждены.

- [x] Шаг 7 · 2026-11-12T08:54Z: строка [ZADACHI.md](https://github.com/mpaykin1/meta6-lab/blob/lab/auditor-truthful-cycle-20261111/ZADACHI.md) для [PR #254](https://github.com/mpaykin1/meta6-lab/pull/254) обновлена — [SHA 063d197f9e03493fb107c66cf88e8d9d079c4baf](https://github.com/mpaykin1/meta6-lab/commit/063d197f9e03493fb107c66cf88e8d9d079c4baf).
- [ ] Шаг 5: Claude должен согласовать защищённый diff [PR #254](https://github.com/mpaykin1/meta6-lab/pull/254); [STOROZHA #43186704732](https://github.com/mpaykin1/meta6-lab/actions/runs/43186704732) pending на предыдущем SHA, новую проверку не называть зелёной.

### Урок
Неполный GraphQL payload не равен достоверному «не закреплено». При ошибке схемы возвращать ⚠️ и требовать независимый ответ pinnedIssues. Не считать cron гарантом почасового запуска.

## Круг 2026-11-12 — approval-required

- [x] Шаг 0 · 2026-11-12T14:26:43.525Z — [правила](https://github.com/mpaykin1/meta6-lab/blob/main/AGENTS.md), [PROGRESS](https://github.com/mpaykin1/meta6-lab/blob/main/.github/auditor/PROGRESS.md) прочитаны до правок; main при сверке `024b108c4ba922b09321372966920eb7f6f39d05`.
- [ ] Шаг 1 · 2026-11-12T14:26:43.525Z — три последние schedule зелёные: [#43102877168](https://github.com/mpaykin1/meta6-lab/actions/runs/43102877168) (21:25:11Z), [#43144961586](https://github.com/mpaykin1/meta6-lab/actions/runs/43144961586) (02:57:57Z), [#43205929183](https://github.com/mpaykin1/meta6-lab/actions/runs/43205929183) (11:04:25Z); интервалы 5 ч 32 мин 46 с и 8 ч 06 мин 28 с, не час. Причина пропусков не установлена; cron не гарантирует время.
- [ ] Шаг 2 · 2026-11-12T14:26:43.525Z — [Issue #253](https://github.com/mpaykin1/meta6-lab/issues/253) open, скорректировано 14:22:50Z; [event pinned](https://github.com/mpaykin1/meta6-lab/issues/253) датирован 11.11, актуальное состояние через GraphQL в этой сессии недоступно, НЕ объявлять подтверждённым. Текущее утверждение GraphQL в [PR #254](https://github.com/mpaykin1/meta6-lab/pull/254), нужен Claude.
- [x] Шаг 3 · 2026-11-12T14:26:43.525Z — сверены [PR #242](https://github.com/mpaykin1/meta6-lab/pull/242), SHA [d2acbbd7bab619027ef4b82b4e46bce75c2dd473](https://github.com/mpaykin1/meta6-lab/commit/d2acbbd7bab619027ef4b82b4e46bce75c2dd473), [Actions #43204251493](https://github.com/mpaykin1/meta6-lab/actions/runs/43204251493) (action_required), и [PR #234](https://github.com/mpaykin1/meta6-lab/pull/234), [Actions #43203045335](https://github.com/mpaykin1/meta6-lab/actions/runs/43203045335) (success), [failed play job](https://github.com/mpaykin1/meta6-lab/actions/runs/43203045458/job/131131111386). Ложное «CI ❌» для #242 исправлено прямо в [Issue #253](https://github.com/mpaykin1/meta6-lab/issues/253).
- [ ] Шаг 4 — нарушения защищённых файлов в [PR #242](https://github.com/mpaykin1/meta6-lab/pull/242) и [PR #234](https://github.com/mpaykin1/meta6-lab/pull/234) не сливать и передать Claude; безопасное самостоятельное исправление этих protected originals запрещено.
- [ ] Шаг 5 (а) — [PR #254](https://github.com/mpaykin1/meta6-lab/pull/254) уже содержит GraphQL pinnedIssues и ждёт одобрения. Новое исправление достоверности CI внесено в тот же открытый PR, без дублирования: [workflow b7d0d2472392d32136b10355e19d38dc3f828e2b](https://github.com/mpaykin1/meta6-lab/commit/b7d0d2472392d32136b10355e19d38dc3f828e2b), [3 ловушки 5b50a26f0ddd989278eeddaa646280e2087d7821](https://github.com/mpaykin1/meta6-lab/commit/5b50a26f0ddd989278eeddaa646280e2087d7821), [ошибка №44](https://github.com/mpaykin1/meta6-lab/commit/5d368120a7b821afe7652a0de3f984b180f6e8ca). На предыдущем HEAD [STOROZHA #43186995869](https://github.com/mpaykin1/meta6-lab/actions/runs/43186995869) красный из-за protected workflow; новая проверка [#43237010166](https://github.com/mpaykin1/meta6-lab/actions/runs/43237010166) не подтверждена.
- [x] Шаг 6 · 2026-11-12T14:26:43.525Z — урок зафиксирован ниже.
- [x] Шаг 7 · 2026-11-12T14:31:33.001Z — существующая строка [PR #254](https://github.com/mpaykin1/meta6-lab/pull/254) в [ZADACHI.md](https://github.com/mpaykin1/meta6-lab/blob/lab/auditor-truthful-cycle-20261111/ZADACHI.md) обновлена без дубля: [commit 357e6fd736b80c718de4985569330207a8baa433](https://github.com/mpaykin1/meta6-lab/commit/357e6fd736b80c718de4985569330207a8baa433); [STOROZHA run #43237349989](https://github.com/mpaykin1/meta6-lab/actions/runs/43237349989) на этом SHA pending при сверке. Исправлена часовая граница тестовой фикстуры: [b2d51475662340e0bc5b6cfed1c6975c52d50943](https://github.com/mpaykin1/meta6-lab/commit/b2d51475662340e0bc5b6cfed1c6975c52d50943). Три мутации сценария `action_required` независимо смоделированы, CI на конечном HEAD не подтверждён.

### Урок
`action_required` — не падение теста. В любом отчёте разделять красные проверки `failure`/`timed_out`, ожидающее разрешения `action_required` и непроверенное состояние. Три мутации должны проверять именно эту разницу.

- [x] Коррекция заголовка Issue #253 · 2026-11-12T14:32:58.623Z — расчётный слот больше не называется фактическим запуском; обновлено [Issue #253](https://github.com/mpaykin1/meta6-lab/issues/253) (updated_at 2026-11-12T14:32:28Z). Постоянная защита от этой ошибки находится в [PR #269](https://github.com/mpaykin1/meta6-lab/pull/269), ожидает Claude. Новая версия PR #254 не объединена с #269/#275.

## Круг 2026-11-13 — расписание и идентичность Issue

- [x] Шаг 0 · 2026-11-13T03:41:29.149Z — сначала прочитан [PROGRESS в main](https://github.com/mpaykin1/meta6-lab/blob/main/.github/auditor/PROGRESS.md), затем AGENTS, ZADACHI, OSHIBKI, MG_PYAT_AVTOZADACH и KONTUR. Последний подтверждённый main из [schedule #43336396518](https://github.com/mpaykin1/meta6-lab/actions/runs/43336396518): `7d420ed8e0da7748b8ecea0e9082dbb80f09808d` (не выдавать за актуальный HEAD main).
- [ ] Шаг 1 · 2026-11-13T03:41:29.149Z — последние три schedule [#43205929183](https://github.com/mpaykin1/meta6-lab/actions/runs/43205929183) 12.11 11:04:25Z, [#43284747015](https://github.com/mpaykin1/meta6-lab/actions/runs/43284747015) 12.11 18:54:55Z, [#43336396518](https://github.com/mpaykin1/meta6-lab/actions/runs/43336396518) 13.11 00:21:20Z: все success, но 7 ч 50 мин 30 с и 5 ч 26 мин 25 с, не ежечасно. Исправление расписания требует защищённого workflow; не подменять результат новым «зелёным» утверждением.
- [ ] Шаг 2 · 2026-11-13T03:41:29.149Z — [Issue #253](https://github.com/mpaykin1/meta6-lab/issues/253) open, до ручной правки updated_at 00:21:30Z (старше 70 минут). [Issue #250](https://github.com/mpaykin1/meta6-lab/issues/250) closed. GraphQL pinnedIssues в доступном соединении не предоставлен: закрепление **не проверено**. [PR #254](https://github.com/mpaykin1/meta6-lab/pull/254) содержит защищённое исправление и ожидает Claude.
- [x] Шаг 3 · 2026-11-13T03:41:29.149Z — две строки таблицы в [Issue #253](https://github.com/mpaykin1/meta6-lab/issues/253) («MG-строитель-1», «MG-строитель-2») ошибочно называли расчётные 00:05/00:17 «Последний запуск»; вручную заменён заголовок на «Расчётное окно (UTC)», добавлены фактические интервалы schedule. Долговременная ловушка на заголовок — [PR #269](https://github.com/mpaykin1/meta6-lab/pull/269), защищённый workflow ждёт Claude. Следующий schedule может снова перезаписать ручное исправление.
- [x] Шаг 4 · 2026-11-13T03:41:29.149Z — текущий 🚨 в Issue содержит только «Доказанных нарушений не обнаружено»; самостоятельного исправимого нарушения из этого раздела не предъявлено. [Issue #253](https://github.com/mpaykin1/meta6-lab/issues/253).
- [x] Шаг 5 (а, усиление без защищённых файлов) · 2026-11-13T03:41:29.149Z — [PR #254](https://github.com/mpaykin1/meta6-lab/pull/254): добавлены 3 анти-регрессионные ловушки к 15 существующим, проверяющие канонический номер обновляемого Issue, совпадение Issue body с Actions Summary и node_id закрепления; [SHA eef98f9969bb2332138905ae948603596a29e5a9](https://github.com/mpaykin1/meta6-lab/commit/eef98f9969bb2332138905ae948603596a29e5a9). Запись [OSHIBKI AUDITOR-20261113-1](https://github.com/mpaykin1/meta6-lab/commit/cd256eaae97a0e398715aa00682aef233f4f3791). [LAB Pages #43360435318](https://github.com/mpaykin1/meta6-lab/actions/runs/43360435318) success на первом SHA; [STOROZHA protected #43360438031](https://github.com/mpaykin1/meta6-lab/actions/runs/43360438031) failure; остальные проверки конечного HEAD ещё не подтверждены. Самостоятельное слияние запрещено.
- [x] Шаг 6 · 2026-11-13T03:41:29.149Z — урок ниже.
- [x] Шаг 7 · 2026-11-13T03:42:19Z — существующая строка [PR #254](https://github.com/mpaykin1/meta6-lab/pull/254) обновлена без дубля: [SHA 17505b99b3ebd97b16793627a13f13e65ae09bbd](https://github.com/mpaykin1/meta6-lab/commit/17505b99b3ebd97b16793627a13f13e65ae09bbd), сохранено исходное время взятия задачи. Новый config с контрактом идентичности — [SHA 167dc3e8218972e1c5f14866f728ee54f0832f17](https://github.com/mpaykin1/meta6-lab/commit/167dc3e8218972e1c5f14866f728ee54f0832f17). [STOROZHA #43360438031](https://github.com/mpaykin1/meta6-lab/actions/runs/43360438031), [#43360793797](https://github.com/mpaykin1/meta6-lab/actions/runs/43360793797) — две неудачные проверки: workflow и mutate-auditor относятся к защищённым. **НУЖЕН CLAUDE**, не выполнять третью попытку. [LAB Pages #43360790923](https://github.com/mpaykin1/meta6-lab/actions/runs/43360790923) success на SHA config, но не доказывает полный CI.
### Урок
Если STOROZHA помечает тест как защищённый, даже если путь отсутствует в текстовом списке защищённых, менять правила нельзя: после 2 отклонённых прогонов — НУЖЕН CLAUDE; проверять фактическую классификацию по логам Actions.

Если GitHub schedule пропускает часы, успешный последний run не доказывает соблюдение интервала. Сравнивать UTC времени старта трёх последних запусков; расчётные слоты ролей не называть реальными запусками. При непроверенном GraphQL pin писать «не подтверждено», а не ✅ или ❌.

## Повтор 2026-11-13 — сверка по свежему GitHub

- [x] Шаг 0 — заново прочитаны PROGRESS.md в main, AGENTS.md, ZADACHI.md, OSHIBKI.md, MG_PYAT_AVTOZADACH.md, KONTUR. Источник main: https://github.com/mpaykin1/meta6-lab/commit/a41f62fd0381c3b9680d755cb30bde703f5d395a
- [ ] Шаг 1 — три последних schedule auditor.yml: https://github.com/mpaykin1/meta6-lab/actions/runs/43205929183 (2026-11-12 11:04:25Z, success), https://github.com/mpaykin1/meta6-lab/actions/runs/43284747015 (18:54:55Z, success), https://github.com/mpaykin1/meta6-lab/actions/runs/43336396518 (2026-11-13 00:21:20Z, success). Интервалы 7:50:30 и 5:26:25 вместо ~1 ч; периодичность НЕ пройдена. Исправление через защищённый .github/workflows/auditor.yml — CLAUDE, без обхода STOROZHA.
- [ ] Шаг 2 — https://github.com/mpaykin1/meta6-lab/issues/253 открыт, updated_at 2026-11-13T03:40:14Z (менее 70 мин на момент проверки). По событиям API есть pinned 2026-11-11T13:43:50Z: https://api.github.com/repos/mpaykin1/meta6-lab/issues/253/events; прямой GraphQL repository.pinnedIssues(first:3) соединением недоступен — текущее состояние pin нельзя выдавать за проверенное GraphQL. Дубликат https://github.com/mpaykin1/meta6-lab/issues/250 закрыт; других одноимённых открытых Issue в первых 100 выдачи не найдено.
- [x] Шаг 3 — строки MG-строитель-1 и MG-строитель-2 в https://github.com/mpaykin1/meta6-lab/issues/253 сверены с ZADACHI.md на SHA https://github.com/mpaykin1/meta6-lab/commit/7d420ed8e0da7748b8ecea0e9082dbb80f09808d (HEAD schedule https://github.com/mpaykin1/meta6-lab/actions/runs/43336396518). Новых взятий с 00:05/00:17Z там нет; расчётные окна не маркированы как реальные запуски. Достоверность отсутствия новых коммитов по всем веткам не доказана: статус остаётся ⚠️.
- [x] Шаг 4 — у раздела 🚨 https://github.com/mpaykin1/meta6-lab/issues/253 нет конкретного нового нарушения для незашищённой правки; существующая ошибка назначения планов Issue устранена лишь в неслитом https://github.com/mpaykin1/meta6-lab/pull/254.
- [ ] Шаг 5 (а) — текущий PR https://github.com/mpaykin1/meta6-lab/pull/254 уже содержит GraphQL pin-сверку и мутации; повторное создание PR запрещено. На его HEAD https://github.com/mpaykin1/meta6-lab/commit/c62de6b630383ac6c25929d56a8a6d87633fe36e STOROZHA отказал дважды: https://github.com/mpaykin1/meta6-lab/actions/runs/43361045946, https://github.com/mpaykin1/meta6-lab/actions/runs/43361095341; только LAB Pages https://github.com/mpaykin1/meta6-lab/actions/runs/43361042811 имеет success. **НУЖЕН CLAUDE** одобрить защищённое после согласования пересекающихся PR https://github.com/mpaykin1/meta6-lab/pull/269 и https://github.com/mpaykin1/meta6-lab/pull/275; не делать третью попытку.
- [x] Шаг 6 — урок ниже.
- [ ] Шаг 7 — существующая строка PR #254 в ZADACHI.md должна отражать новый HEAD, проверенные run и блокировку; не дублировать PR.

### Урок
После двух STOROZHA failure по защищённому файлу не создавать очередной коммит с тем же защищённым diff ради нового CI: сохранить точные два run и передать Claude. Событие `pinned` из REST доказывает факт закрепления в прошлом, но НЕ заменяет текущий GraphQL `pinnedIssues`; отсутствие GraphQL не обозначать ни ✅, ни ❌.
- [x] Шаг 7 · 2026-11-13T04:25Z — существующая строка [ZADACHI.md](https://github.com/mpaykin1/meta6-lab/blob/lab/auditor-truthful-cycle-20261111/ZADACHI.md) для [PR #254](https://github.com/mpaykin1/meta6-lab/pull/254) дополнена действительными schedule/run и блокировкой без дубля: [SHA 1f435a1233941e49203fa0224ffc450c2048f852](https://github.com/mpaykin1/meta6-lab/commit/1f435a1233941e49203fa0224ffc450c2048f852). Две строки и история pinned внесены вручную в [Issue #253](https://github.com/mpaykin1/meta6-lab/issues/253) (updated_at 04:25:27Z); автоматическое исправление ждёт [PR #254](https://github.com/mpaykin1/meta6-lab/pull/254). Всё ещё НУЖЕН CLAUDE по [STOROZHA #43361095341](https://github.com/mpaykin1/meta6-lab/actions/runs/43361095341).
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

- [ ] Шаг 5 · 2026-11-13T08:17:54Z: продолжен пункт г), [PR #282](https://github.com/mpaykin1/meta6-lab/pull/282), [код](https://github.com/mpaykin1/meta6-lab/commit/737ddad5813c9be1874dc11dcc5a2efe9318177c). Новый модуль вне защищённых путей, 5 новых ловушек в mutate-auditor; прежние 3 сохранены. Локальный exit 0 не заменяет Actions. [Auditor](https://github.com/mpaykin1/meta6-lab/actions/runs/43392251668), [KONTUR](https://github.com/mpaykin1/meta6-lab/actions/runs/43392251632), [STOROZHA](https://github.com/mpaykin1/meta6-lab/actions/runs/43392251606) — итог сверить по run, не считать merge выполненным. НУЖЕН CLAUDE: подключение workflow и mutation-тест.
- [x] Шаг 6 · 2026-11-13T08:17:54Z — урок: сохранять указатель на актуальную ветку и PR в main PROGRESS сразу, а не только в PR-ветке. Перед выбором улучшения объединять реестр открытых auditor PR и незавершённых веток; подготовленное не считать слитым.
- Шаг 7 · 2026-11-13T08:17:54Z — обновить существующую строку г) ссылкой #282 и Actions, общую ревизию оставить незавершённой из-за интервалов и неподтверждённого GraphQL pin.

### Осталось и следующий запуск
- Почасовые schedule и GraphQL pin не подтверждены; #254/#269/#275 остаются защищёнными, третью попытку #254 не делать.
- Пункт г): #282 ожидает проверок и одобрения защищённого подключения. Не создавать дубликат.
- Следующее ещё не начатое улучшение: д) число повторных ошибок OSHIBKI за сутки; г) пока НЕ завершён на main.

### Конечная фиксация текущего запуска
- Шаг 5 · 2026-11-13T08:23Z: [PR #282](https://github.com/mpaykin1/meta6-lab/pull/282), конечный [SHA 1086955](https://github.com/mpaykin1/meta6-lab/commit/1086955d099df2db451317dd3409bf0356f661d0). 11 ловушек: 3 прежние, 5 сверки таблицы, 3 формата журнала. Первая версия получила [auditor success](https://github.com/mpaykin1/meta6-lab/actions/runs/43392251668), но [KONTUR отказал](https://github.com/mpaykin1/meta6-lab/actions/runs/43392251632/job/131774812513) из-за текстового номера ошибки и сокращённого пути; исправлены числовые строки 1004/1005 с полными путями. На конечном SHA [STOROZHA 43392684848](https://github.com/mpaykin1/meta6-lab/actions/runs/43392684848) и [43392808558](https://github.com/mpaykin1/meta6-lab/actions/runs/43392808558) failure. НУЖЕН CLAUDE, третью попытку не делать. [Quota LIVE=42](https://github.com/mpaykin1/meta6-lab/actions/runs/43392251627) также блокирует слияние. Полный зелёный CI и merge НЕ подтверждены.
- [x] Шаг 7 · 2026-11-13T08:23Z: строки общего круга и пункта г) обновлены с PR/Actions и оставшимися условиями в main: [коммит ZADACHI](https://github.com/mpaykin1/meta6-lab/commit/37cb2890f89a128cfd76474f1af23d9ef5ad345c). [Передача Claude](https://github.com/mpaykin1/meta6-lab/commit/e1145331745c1d9da9eb11102aebad82e0e5f84e).
- Урок: OSHIBKI требует числовой ID и полный scripts/.../mutate-* путь в последнем столбце. При конфликте общей таблицы читать её по точному свежему SHA main и менять только свои строки; не перезаписывать сторожа.

## Продолжение по просьбе владельца — 2026-11-13 08:30 UTC
- Проверен [PR #282](https://github.com/mpaykin1/meta6-lab/pull/282), HEAD [1086955d099df2db451317dd3409bf0356f661d0](https://github.com/mpaykin1/meta6-lab/commit/1086955d099df2db451317dd3409bf0356f661d0): mergeable=false, mergeable_state=dirty. Конфликт с main объясняет отсутствие обычных pull_request run для конечного HEAD; pull_request_target STOROZHA продолжает отклонять защищённый diff. Не исправлять это закрытием/переоткрытием PR и не выдавать проверку старого SHA за текущую.
- Подготовлен локальный пакет разрешения конфликта на [main 2d225010c405b0320415d0b893dab747d02c7df7](https://github.com/mpaykin1/meta6-lab/commit/2d225010c405b0320415d0b893dab747d02c7df7): сохранён текущий OSHIBKI с добавлением собственных строк, основные журналы main не заменяются. `outputs/auditor-282-review.patch` в рабочей папке чата; `git apply --no-index --check` exit 0. Кандидат локально проходит 11 ловушек и KONTUR `--policy-only`. Это НЕ Actions run и НЕ полный KONTUR на GitHub.
- НУЖЕН CLAUDE: применить разрешение конфликта #282, одобрить workflow и mutation-тест, согласовать пересечение #254/#269/#275, затем запустить CI на конечном SHA; квота остаётся отдельным обязательным блокером. Третья правка/CI попытка в ветку не отправлялась по исходному лимиту владельца.
- Урок: у конфликтующего PR обычный pull_request workflow может не стартовать; проверять mergeable_state до повторных запусков. Патч для Linux сохранять с LF и проверять применимость к точному SHA main.
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

## Круг 2026-11-12 — twohour-stall (main 7f6463db0bb91b0dac2401f5fb47a62ede2ead40)

- [x] Шаг 0 · 2026-11-12T06:56:26.863Z — прочитаны PROGRESS и обязательные правила: https://github.com/mpaykin1/meta6-lab/blob/main/.github/auditor/PROGRESS.md
- [ ] Шаг 1 · 2026-11-12T06:56:26.863Z — сверен один schedule run https://github.com/mpaykin1/meta6-lab/actions/runs/43144961586 (success, SHA 29b4c6f3ea5d80f1e14720986f126ad20900271c); три последовательных прогона не подтверждены.
- [ ] Шаг 2 · 2026-11-12T06:56:26.863Z — Issue #253 открыт: https://github.com/mpaykin1/meta6-lab/issues/253 ; pin через GraphQL не подтверждён, PR https://github.com/mpaykin1/meta6-lab/pull/254 ожидает Claude.
- [x] Шаг 3 · 2026-11-12T06:56:26.863Z — срез Issue сверен с https://github.com/mpaykin1/meta6-lab/actions/runs/43144961586; заголовок «Последний запуск» ошибочно называл расчётный слот запуском; исправлено непосредственно в https://github.com/mpaykin1/meta6-lab/issues/253 .
- [ ] Шаг 4 — конкретных строк нарушений в 🚨 нет; отсутствие нарушений требует полного подтверждения.
- [x] Шаг 5 (б, реализация в ветке, НЕ MERGED) · 2026-11-12T07:01:03.060Z — два последовательных почасовых среза с подтверждённым нулём, запись в Issue; [workflow SHA 1dd625e](https://github.com/mpaykin1/meta6-lab/commit/1dd625e4034939a89d80ca9e1d55b410205ee4d3), [4 ловушки SHA 5b54ef3](https://github.com/mpaykin1/meta6-lab/commit/5b54ef3cc6a592352892a74358d6fcd0bdd40349), [OSHIBKI #41](https://github.com/mpaykin1/meta6-lab/commit/9cd6c2db79d5bc808f1450ea03518f68e3822727). Требует проверки CI и Claude для защищённого workflow.
- [x] Шаг 6 · 2026-11-12T07:01:03.060Z — «Урок» ниже, расчётные слоты отдельно от фактических запусков.
- [x] Шаг 7 · 2026-11-12T07:03:38.553Z — [PR #269](https://github.com/mpaykin1/meta6-lab/pull/269) в [ZADACHI.md](https://github.com/mpaykin1/meta6-lab/commit/8d68f5b196d57eb3ec6a58c59dd018da025051f3); [auditor run #43172228764](https://github.com/mpaykin1/meta6-lab/actions/runs/43172228764) success для HEAD 226dffca442c9e0ce984cce5081b46337fb0f662; [STOROZHA #43172228737](https://github.com/mpaykin1/meta6-lab/actions/runs/43172228737) красный, защищённые workflow и mutate-auditor; [quota #43172228843](https://github.com/mpaykin1/meta6-lab/actions/runs/43172228843) красный: 50 открытых PR, первыми указаны #3, #54, #72, #87, #133.

### Урок
Расчётный часовой слот — не реальный запуск задачи. В отчёте различать окно, Actions run и подтверждённую активность.

## Продолжение после PR #269

- НУЖЕН CLAUDE: одобрить защищённые `.github/workflows/auditor.yml` и `scripts/auditor/mutate-auditor.mjs` в [PR #269](https://github.com/mpaykin1/meta6-lab/pull/269) вместе с конфликтующим [PR #254](https://github.com/mpaykin1/meta6-lab/pull/254); не обходить STOROZHA.
- Квота новых PR: [run #43172228843](https://github.com/mpaykin1/meta6-lab/actions/runs/43172228843). Нельзя удалять чужие PR без разбора; один безопасный шаг — Claude разбирает #3 первым.
- Сверить 3 последние schedule-прогона main, GraphQL pinnedIssues, обновление Issue <= 70 мин после разрешённого merge. Единственный в этом круге независимо проверенный [run #43144961586](https://github.com/mpaykin1/meta6-lab/actions/runs/43144961586).
- Следующее улучшение после б): **в) находить PR старше 24 часов с конфликтами или красным CI**.
## Круг 2026-11-12 — main 984aaeeeed53ebba902bb9f216c2c0bba72bce94

- [x] Расписание (10:11 UTC): только два подтверждённых schedule: [#43102877168](https://github.com/mpaykin1/meta6-lab/actions/runs/43102877168) и [#43144961586](https://github.com/mpaykin1/meta6-lab/actions/runs/43144961586); 5 ч 32 мин 46 с между ними; третьего в актуальной выборке schedule нет. Причина пропусков не доказана.
- [x] Issue #253 открыт, 08:51:38 UTC — [Issue](https://github.com/mpaykin1/meta6-lab/issues/253); GraphQL-pin недоступен через подключённое API, status неизвестен. Дубликат [#250](https://github.com/mpaykin1/meta6-lab/issues/250) закрыт.
- [x] Сверка двух ссылок из #253: [schedule #43102877168](https://github.com/mpaykin1/meta6-lab/actions/runs/43102877168) (success, SHA 238ed8178aa4fc65c336dc141167ba731a1c60c3), [#43144961586](https://github.com/mpaykin1/meta6-lab/actions/runs/43144961586) (success, SHA 29b4c6f3ea5d80f1e14720986f126ad20900271c).
- [x] Улучшение (в), 10:13 UTC: добавлена проверка PR старше 24 ч с конфликтом/красным check по текущему head, лимит четыре кандидата за проход. [Коммит c4a70d81c9c3a0325ebb497ea6122cacf9f6b8aa](https://github.com/mpaykin1/meta6-lab/commit/c4a70d81c9c3a0325ebb497ea6122cacf9f6b8aa). Проверенный пример: [PR #241](https://github.com/mpaykin1/meta6-lab/pull/241), mergeable_state=dirty, [красная browser-open-all](https://github.com/mpaykin1/meta6-lab/actions/runs/43055319496/job/130643325707).
- [x] Добавлены три мутации (`stale-pr-age-reversed`, `stale-merge-conflict-ignored`, `deception-failed-ci-replaced-with-success`), [коммит c093e6780bec7e82b300f6e5401101303849c9eb](https://github.com/mpaykin1/meta6-lab/commit/c093e6780bec7e82b300f6e5401101303849c9eb).
- [x] Ошибка №42 внесена в [OSHIBKI.md](https://github.com/mpaykin1/meta6-lab/blob/lab/auditor-stale-pr-20261112/OSHIBKI.md), [коммит 8cbd3df78f144b6c3073ea06738cd908806841c3](https://github.com/mpaykin1/meta6-lab/commit/8cbd3df78f144b6c3073ea06738cd908806841c3).
- [x] Создан [PR #275](https://github.com/mpaykin1/meta6-lab/pull/275), head [82b148e8f5052a5ac0664a03fd56ea78e02e5745](https://github.com/mpaykin1/meta6-lab/commit/82b148e8f5052a5ac0664a03fd56ea78e02e5745). Контролируемый переход защищённого workflow — только Claude.
- [x] Таблица ZADACHI.md связана с [PR #275](https://github.com/mpaykin1/meta6-lab/pull/275) и Actions — [коммит 29e769b449bf0b3004345a98b8525067e3d3de3f](https://github.com/mpaykin1/meta6-lab/commit/29e769b449bf0b3004345a98b8525067e3d3de3f).
- [x] Циклическая выборка: каждый час следующая группа из четырёх старых PR; отсутствие нарушений в частичной выборке не выдавать за проверку всех PR — [коммит 87e8075ff8a47344a223ba210b60ecad5a05426b](https://github.com/mpaykin1/meta6-lab/commit/87e8075ff8a47344a223ba210b60ecad5a05426b).
- [ ] На head 87e8075ff8a47344a223ba210b60ecad5a05426b [auditor run #43199333311](https://github.com/mpaykin1/meta6-lab/actions/runs/43199333311) в очереди, [KONTUR #43199332947](https://github.com/mpaykin1/meta6-lab/actions/runs/43199332947) в очереди. После следующего коммита статус считать неизвестным до проверки нового HEAD.
- [ ] НУЖЕН CLAUDE: [PR #275](https://github.com/mpaykin1/meta6-lab/pull/275) меняет защищённый workflow; совместить уникальные правки с [PR #254](https://github.com/mpaykin1/meta6-lab/pull/254) и [PR #269](https://github.com/mpaykin1/meta6-lab/pull/269), не обходя STOROZHA/KONTUR.
- **Урок:** GitHub schedule не гарантирует запуск точно по cron; проверять реальные timestamps из runs и никогда не объявлять равномерность по YAML.
