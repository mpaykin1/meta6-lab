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
- [ ] Шаг 3 — обнаружено ложное доказательство плана от самого Issue #253; исправление workflow: https://github.com/mpaykin1/meta6-lab/commit/51a1c8b61ce9012bc044bb812d24b6f75071ad19
- [ ] Шаг 4 — нарушения в #253 отсутствуют, но отрицательное утверждение ненадёжно до исправления самоцитирования
- [ ] Шаг 5 (а) — добавить факт GraphQL-pin к отчёту Issue #253
- [ ] Шаг 6 — урок и правило после CI
- [ ] Шаг 7 — обновить строку в ZADACHI.md после PR

### Урок
Само Issue ревизора и устаревшие одноимённые Issue не должны служить источником доказательств планирования ни одной из пяти ролей. Не подтверждённые GraphQL-pin и schedule нельзя маркировать зелёными.
