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
