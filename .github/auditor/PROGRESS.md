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
