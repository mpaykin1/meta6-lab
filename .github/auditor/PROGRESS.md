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
