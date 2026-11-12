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
- [x] Исправление · 2026-11-12T08:52:29.804Z: повреждённый ответ GraphQL не должен обозначать незакреплённый Issue; теперь статус неизвестен: [SHA c92c062fa0b71135f9974d396b03da029b20fffd](https://github.com/mpaykin1/meta6-lab/commit/c92c062fa0b71135f9974d396b03da029b20fffd) в [PR #254](https://github.com/mpaykin1/meta6-lab/pull/254); ловушки ещё в работе.

### Урок
Неполный GraphQL payload не равен достоверному «не закреплено». При ошибке схемы возвращать ⚠️ и требовать независимый ответ pinnedIssues. Не считать cron гарантом почасового запуска.
