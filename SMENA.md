# СМЕНА — рабочий чат МГ/МГЛ

Имя исполнителя: **чат ChatGPT — Рабочий чат МГ/МГЛ**.
Точка продолжения: [инструкция](automation/prompts/CHAT_RABOTA.md), [очередь задач](ZADACHI.md).
Ветка собственной подготовки: `lab/chat-rabota`. Не занимать карточки другого исполнителя.

## Текущий захват

- Карточка диспетчера: **#191**, `lab/sunken-city-reference-1109`, SHA `a65f18c2def89f8acf462ccec3da23d1fe5be041`; захват [1b95ae3](https://github.com/mpaykin1/meta6-lab/commit/1b95ae31a55a7700e61ee60c209f39a5bd23bc92) в 2026-11-10T10:12:26Z, исполнитель чат ChatGPT.
- Предпосылка выполнена: [PR #227 — MG Dispatcher](https://github.com/mpaykin1/meta6-lab/pull/227) слит Claude, merge `2a4558a4b3993d6d0583c004155508d084eb6496`.
- Текущая работа: две карточки заняты по диспетчеру: #191 ([захват 1b95ae3](https://github.com/mpaykin1/meta6-lab/commit/1b95ae31a55a7700e61ee60c209f39a5bd23bc92), [код + безопасный main merge 27537b0](https://github.com/mpaykin1/meta6-lab/commit/27537b0c086b567f6f546b066088ccf8ee44f2bd), исходный архив не менялся, protected shared возвращены); #208 ([захват 7ecb6eb](https://github.com/mpaykin1/meta6-lab/commit/7ecb6ebb13090462ddf7d2fc223246c3d5a12904), [KONTUR Guard 42756903905](https://github.com/mpaykin1/meta6-lab/actions/runs/42756903905/job/129633324473) требует решения Claude по точному оригиналу с LEGACY_LIGHTS).
- Запись о задаче уже существует в `ZADACHI.md`: «Рабочий чат МГ/МГЛ» — не дублировать.

## Правило передачи

Перед взятием карточки прочитай фактические `main`, `DISPETCHER.md`, PR и HEAD. Запиши здесь: PR, ветка, SHA, точное действие, время UTC, исполнитель и ссылку на последний коммит.

Не путай подготовленную инструкцию с выполнением карточек диспетчера. Не изменяй чужой захват. После двух безуспешных исправлений одной причины — `НУЖЕН CLAUDE` со ссылками; затем бери следующую доступную карточку.

## Дальше

1. Довести #191 без изменения исходных байтов владельца, не выдавать адаптер за пройденную игру.
2. После #191 проверить новую очередь и следующую свободную карточку; #200 не захвачен.
3. Сравнить очередь через два часа только при следующем фактическом запуске.

- Диспетчер mergeable=null: [PR #231](https://github.com/mpaykin1/meta6-lab/pull/231), 12/12 unit + 4 мутанта; rerun dispatch после ошибки API 403; без зелёного CI не сливать.

## Смена 2026-11-10 — A1 #219

- Исполнитель: чат ChatGPT — Рабочий чат МГ/МГЛ. Захват #219 в DISPETCHER.md подтверждён [fe91db9](https://github.com/mpaykin1/meta6-lab/commit/fe91db9133634c26ba0db0ef7346a763a71b774e) (2026-11-10T10:24:35Z).
- Ветка: `lab/status-a1-20261110`; PR [#219](https://github.com/mpaykin1/meta6-lab/pull/219). Начальный HEAD: `ea42a0c576e7798017481b6ca7890f53401bbc16`; HEAD после исправления: `88c4fa259b9b3fd576ebfdb21f4fa163128dfc0c`.
- Исправление: убраны CI-specific обращения из генератора STATUS, добавлен CLI с явной конфигурацией из Git remote и stdin; три мутации, одна обманная; [коммит ловушек](https://github.com/mpaykin1/meta6-lab/commit/43658a2cfb21d0ec204becc76b336a912e7bd2ce); [коммит CI](https://github.com/mpaykin1/meta6-lab/commit/129438c105595356addcad30ed4c9989a3cef13c).
- **Сделано / дальше:** PR #219 не слит. На HEAD `88c4fa2` пока нет завершённого KONTUR Guard и прочих обязательных проверок; branch отстаёт от main. Проверить актуальные проверки и конфликты на новом HEAD. Не сливать самостоятельно: затронут workflow, нужен Claude. Ошибка Veil Terraces в browser-open-all отдельная и не исправлена этим PR.
- Соседние карточки: #191 закреплена ранее за чатом ChatGPT и уже обновлялась другим запуском; #200 захвачена MG-строитель-2 2026-11-10T10:19:40Z. Не перетирать чужую работу.

## Дополнение A1 после устранения конфликта

- [4634c05](https://github.com/mpaykin1/meta6-lab/commit/4634c05ecc9ad59290ae403c46e167057e556576) — двухродительский merge main в `lab/status-a1-20261110`; весь текущий main сохранён, OSHIBKI A1 перенумерована #31. PR #219 перешёл в `mergeable=true` после устранения конфликта.
- [A1 STATUS 42800345085](https://github.com/mpaykin1/meta6-lab/actions/runs/42800345085): success на HEAD `4634c05`. [KONTUR 42800343788](https://github.com/mpaykin1/meta6-lab/actions/runs/42800343788), [B1 42800344148](https://github.com/mpaykin1/meta6-lab/actions/runs/42800344148): выполнялись при проверке. LAB Pages [42800339516](https://github.com/mpaykin1/meta6-lab/actions/runs/42800339516): `kick-main` 403 GitHub API rate limit, не считать ошибкой A1.
- **Следующий конкретный шаг:** повторно прочитать HEAD и проверки PR #219; исправить подтверждённый новый дефект при наличии, не сливать самостоятельно из-за workflow; затем вернуться к первой незанятой карточке.

## Захват 11.11.2026 — Broken City #225
- Исполнитель: чат ChatGPT — Рабочий чат МГ/МГЛ. UTC: 2026-11-11T04:57:58.874Z.
- Карточка: [PR #225](https://github.com/mpaykin1/meta6-lab/pull/225), ветка `lab/render-broken-city-safe-1110`, исходный HEAD `db5b1f42061b73b5a24777e024766e3f0e728190`.
- Действие: исключить ложное понижение DPR после восстановления фоновой вкладки/снятия игровой паузы, без изменения физики, текстур, защищённого бота, workflow и правил охранников.
- Отложено: #87 — самотест защищённого META BOT (нужен Claude); #132 — другой исполнитель обновил PR в текущем цикле.
- Сделано: захват и проверка фактических diff/HEAD; дальше — исправление и регрессионная ловушка в PR #225, проверки по точному SHA; без зелёного CI не сливать.

### Результат #225 — возобновление качества
- Ветка `lab/render-broken-city-safe-1110`; HEAD на момент записи: `95f37363c687799823ebc33bbe162f77d086d088`.
- Сделано: [контроллер](https://github.com/mpaykin1/meta6-lab/commit/bd16cff3adcba7adf805fe2315dfbdd6765b7788), [игра](https://github.com/mpaykin1/meta6-lab/commit/a34ea732774180300c77fba09f2bfb5102eec000), [5 ловушек](https://github.com/mpaykin1/meta6-lab/commit/0e2a8a4bf029e63fe1f72ee7ff524ebfeeced09b), [подключение бенчмарка](https://github.com/mpaykin1/meta6-lab/commit/0bb69684803f0973893a61fae2b5d434e42700b4), [OSHIBKI](https://github.com/mpaykin1/meta6-lab/commit/95f37363c687799823ebc33bbe162f77d086d088). Проверка алгоритма Node локально: медленные кадры 0.65 DPR → быстрые 0.90 DPR, резкий кадр после pause игнорируется; браузерный CI на этом HEAD не завершён.
- Дальше: проверить выполнение [CI PR #225](https://github.com/mpaykin1/meta6-lab/pull/225/checks) на новом SHA, согласовать историю с main и пройти независимую перекрёстную проверку; до всех зелёных не сливать. Новый SHA другой сессии в середине работы содержал только индексы библиотеки; не переписывать его.

## Захват 11.11.2026 — диспетчер #231
- Исполнитель: чат ChatGPT — Рабочий чат МГ/МГЛ; UTC 2026-11-11T05:04:16.358Z.
- Карточка: [PR #231](https://github.com/mpaykin1/meta6-lab/pull/231), исходный HEAD `710b10da752cd9de09b35a50468c7ac0544ff78c`.
- Обнаружена логическая ошибка: `previousConflict()` трактует любую старую красную проверку как подтверждённое отсутствие конфликта (false), хотя прошлый вывод не содержал такой проверки; при повторном `mergeable=null` статус должен оставаться неизвестным.
- Дальше: исправить только парсер истории и мутационные проверки; обновить PR и CI. Не трогать workflows, охранники и главную ветку.

### Результат #231 — история конфликта
- Рабочий HEAD `lab/dispetcher-mergeable-null-1110` на момент проверки `014f04e612d8a904358baf52d9b4eb670a96f965`.
- Исправление [b2cf736](https://github.com/mpaykin1/meta6-lab/commit/b2cf73615ad390d587ac961f8661aa0e312f1254): прежняя красная проверка более не доказывает отсутствие конфликта; [ловушка и тесты](https://github.com/mpaykin1/meta6-lab/commit/290eecbf1cd3a398e755300cf8077b0e89c1afd0), 5 мутаций.
- [MG Dispatcher 42963587611](https://github.com/mpaykin1/meta6-lab/actions/runs/42963587611): 13/13 тестов PASS, но runtime завершился HTTP 403 на запросе `/pulls/87`. Красный прогон не является доказательством дефекта исправления; полный CI не зелёный.
- Дальше: выяснить 403 (лимит или права), повторить полный CI на актуальном HEAD, затем независимое ревью и разрешённое слияние. [PR #231](https://github.com/mpaykin1/meta6-lab/pull/231) обновлён.

## Захват 11.11.2026 — безопасная синхронизация #126
- Исполнитель: чат ChatGPT — Рабочий чат МГ/МГЛ; UTC 2026-11-11T05:11:20.571Z.
- PR [#126](https://github.com/mpaykin1/meta6-lab/pull/126), исходная ветка `lab/sketch-to-game-standard`, HEAD `2151d7ad654ac992c63f382cf74f653ed7387182`, база main `db713cf4629c0694e4cd3e565bef5fc94ad022a8`.
- Один новый документ `automation/prompts/SKETCH_TO_GAME_STANDARD_RU.md` отсутствует в main, Git blob `93a8682d5cdac625c990c667bf02f987a288f57d`; сохраняю исходные байты. Цель — двухродительский merge, не переписывание ветки, без изменения других файлов.
- Дальше: актуальный PR HEAD/CI после merge; без всех зелёных не сливать.

### Результат #126 — синхронизированный оригинал
- [Двухродительский merge 3405980](https://github.com/mpaykin1/meta6-lab/commit/340598077b3ad39a4e29e65af498cc0368bef44f): `main@db713cf` + `lab/sketch-to-game-standard@2151d7a` → новый HEAD `340598077b3ad39a4e29e65af498cc0368bef44f`. Синхронизация без force и без замены чужих правок; compare: 0 behind, один новый документ; его Git blob `93a8682d5cdac625c990c667bf02f987a288f57d` сохранён.
- [PR #126](https://github.com/mpaykin1/meta6-lab/pull/126) описан, CI на текущем SHA в очереди: [KONTUR](https://github.com/mpaykin1/meta6-lab/actions/runs/42964148498), [B1](https://github.com/mpaykin1/meta6-lab/actions/runs/42964148481). Дальше — проверить реальные исходы всех обязательных проверок, затем независимая проверка и только разрешённое слияние.
- За запуск обработаны три карточки: #225, #231, #126. Следующий запуск снова читает актуальный DISPETCHER.md и продолжает с первого свободного пункта, не дублируя готовое.

## Продолжение 11.11.2026 — PR #87 (Play / Connect / Earn)
- Исполнитель: чат ChatGPT — Рабочий чат МГ/МГЛ. Приоритетная существующая задача в ZADACHI.md, без дублирования.
- Проверены main: CHAT_RABOTA.md и DISPETCHER.md доступны. PR #229 merge `40dfc505c5427f8d0b17b679d2f5df74352bc7c1` и PR #236 merge `afc35df467af8e6f60fb8a5c9c11f62aef5dfa05` — оба являются предками актуального main по GitHub compare.
- PR [#87](https://github.com/mpaykin1/meta6-lab/pull/87): head `d66f304967540ca9b9c144140ea51c971b3e2365`, main при сравнении `fceb4e6f164da5abf6a4816593649ca6ce51808f`; behind 161, ahead 5. Отличие PR от main — только `meta-games/index.html` (GitHub compare), поэтому сохранить файл из PR и все прочие файлы из main.
- Двухродительский merge пока НЕ выполнен: подключённый GitHub API позволяет создать дерево/commit/ref, но не возвращает SHA дерева main; прямой git clone недоступен (DNS github.com). Попытка создать дерево по SHA коммита отклонена GitHub 422; ref не менялся, force не применялся. Нельзя подменять merge копированием отдельных файлов без корректного tree SHA.
- Следующий шаг: получить tree SHA актуального main через Git Data API или авторизованный git-клиент; создать tree от main с `meta-games/index.html` из PR, commit с родителями [head #87, main], обновить ref только fast-forward при expected SHA; затем проверить новый HEAD, все CI, независимое ревью и право на merge. Не считать kick-main HTTP 403 дефектом игрового кода; повторить позже.
- После #87 вернуться к актуальному DISPETCHER.md и брать первую свободную карточку; запись о ходе каждого шага продолжать здесь.

### PR #87 — восстановление и проверка источников 2026-11-11T06:53Z
- Исполнитель: чат ChatGPT — Рабочий чат МГ/МГЛ. Задача #87 уже в ZADACHI.md; повторную строку не добавлять.
- Подтверждены merge PR #229 `40dfc505c5427f8d0b17b679d2f5df74352bc7c1` и PR #236 `afc35df467af8e6f60fb8a5c9c11f62aef5dfa05`.
- Актуальный PR https://github.com/mpaykin1/meta6-lab/pull/87: head `faf69f129ae3510a81e59a48328534fed8a5f944`, main `036bc0722f98753288326a4523f1c93280ee5321`, behind 30, ahead 6. Сравнён файл `meta-games/index.html` в merge-base/main/head: main и merge-base имеют одинаковый blob `6d7b6f9a13df90fa09dccbe0cb36fca183e4273b`, PR blob `9b857feaf02c1361f1d94126af52fbfbc48944c3`. Других отличий от main по compare нет.
- Сейчас делаю: реальный двухродительский merge с деревом main и файлом портала из ветки, без force; только если HEAD не изменился. Затем новые CI на SHA, перекрёстная проверка, допустимое слияние, новая свободная карточка.

### PR #87 — merge main в ветку
- Двухродительский коммит [2a1d22c](https://github.com/mpaykin1/meta6-lab/commit/2a1d22c9bcd5ddb1e4f2eb6ae599a6816371ef7d), родители: PR `faf69f129ae3510a81e59a48328534fed8a5f944` и main `eaaef9d0b4dfe702d21870e5db755b80ec049816`; сохранено дерево main с единственным отличием `meta-games/index.html` (blob `9b857feaf02c1361f1d94126af52fbfbc48944c3`). `update_ref` без force: success. Редактирования `scripts/meta-bot/` нет.
- Следующий шаг: получить все workflow/checks по новому SHA, проверить реальные выводы и независимое ревью; до полного зелёного CI PR #87 не сливать.

### PR #87 — исход CI и защищённая история (2026-11-11T07:05:51.883Z)
- HEAD: `2a1d22c9bcd5ddb1e4f2eb6ae599a6816371ef7d`; merge только дерева main + `meta-games/index.html` зафиксирован ссылкой https://github.com/mpaykin1/meta6-lab/commit/2a1d22c9bcd5ddb1e4f2eb6ae599a6816371ef7d .
- Новый guard **FAIL**: https://github.com/mpaykin1/meta6-lab/actions/runs/42975697783/job/130374149800 — исторические коммиты `faf69f129ae3510a81e59a48328534fed8a5f944` и `d66f304967540ca9b9c144140ea51c971b3e2365` меняют `.github/protected` без подписи Claude. Скрипт `scripts/meta-games-guard.sh` проверяет коммиты через `git rev-list "$GUARD_RANGE" -- .github/protected`. Дополнительный non-force merge не исключит эти коммиты из истории; защищённый guard и старые SHA не менять.
- Новый kick-main https://github.com/mpaykin1/meta6-lab/actions/runs/42975692657 — **success**, предыдущий HTTP 403 был временным; снова запускать старый run на чужом SHA не требуется.
- PR описание обновлено: https://github.com/mpaykin1/meta6-lab/pull/87 . **НУЖЕН CLAUDE**: безопасно устранить проблему истории (или согласовать чистый PR-перенос), решить замороженный Earn, провести независимое ревью, подтвердить весь CI. Слияние запрещено до зелёного guard/бота.
- Пересмотрен текущий DISPETCHER.md: #225 и #235 уже в разделе НУЖЕН CLAUDE, #237 занят другим чатом, #221 защищён; следующая безопасная карточка — только после новой проверки статуса и правил источников.
 Автодоводчик 11.11.2026
- Шаг 1: предложен безопасный workflow `MG PR autofinish` в ветке `lab/pr-autofinish-1111`. Защищённые файлы не сливаются автоматически; новый workflow требует решения Claude перед слиянием.
- Далее: бесконфликтные журналы; приоритет зависших; охранник отчёта; пробный PR.

- Шаг 3 (11.11.2026): общий промпт пяти автозадач изменён: древнейшие ЗАВИС/ЗАБРОШЕНО первые, новые задачи запрещены. Порог 60 минут задан на уровне исполнителей; protected watch требует отдельного решения Claude.

- Шаг 4 (11.11.2026): CI-охранник новых строк отчётов и SMENA.md; негативные мутации без ссылки, с простой ссылкой на PR и с отвлекающей URL. Включение workflow после разрешения Claude.

- Шаг 2 (11.11.2026): без потерь перенесены действующие записи в `journal/entries/**`; `scripts/journal/build.mjs` формирует общие представления `journal/compiled/**`. Исходные файлы до переключения защищённых writers/guard оставлены без изменений. Новый workflow требует Claude.

- Исправление (11.11.2026): охранник распознаёт кириллическое «слить» без ошибочного ASCII word boundary; approve `action_required` ограничен доверенными PR после независимой проверки; обход PR ограничен 20 за цикл с ротацией.

- Пробный PR [#239](https://github.com/mpaykin1/meta6-lab/pull/239), намеренно отставшая база `e178381dcb446958f7ddc3afa800e397bf73c880`; [фикстура 5240beb](https://github.com/mpaykin1/meta6-lab/commit/5240bebee277f57819922917174595a97606cc75). Live-автообновление/автослияние ещё не доказаны: workflow #238 пока не в main и нужна независимая проверка.

- Журнальный bridge: новые записи формата YYYY-*.md централизованно добавляются в общие файлы на main. Сторож ZADACHI и KONTUR остаются защищёнными и не менялись.

- Защищённый workflow: запись `НУЖЕН CLAUDE` для PR #238 в действующем ZADACHI.md main — [bd9fe9a](https://github.com/mpaykin1/meta6-lab/commit/bd9fe9a2fa1dc72517a9601df59b3897238391d7). Пробный PR [#239](https://github.com/mpaykin1/meta6-lab/pull/239) не сливать вручную. CI-охранник запускает доверенный `main` [2387df7](https://github.com/mpaykin1/meta6-lab/commit/2387df7db6bcdecdfec69d696be1ee517ee0f52a), запись журнала охвачена [4dca53b](https://github.com/mpaykin1/meta6-lab/commit/4dca53b4eedfad1b183fe293d3fbcaca8f6e7fda).

- CI-исправление PR #238: [красный run 42977588661](https://github.com/mpaykin1/meta6-lab/actions/runs/42977588661), отсутствующий в main `scripts/autofinish/mutate-report-guard.mjs`; [правка 2bd4bc8](https://github.com/mpaykin1/meta6-lab/commit/2bd4bc81729389af31e024a3effedfad8eeb215a). Новый workflow запускает код из immutable PR HEAD только с `contents: read` без сохранения учётных данных; до зелёного CI не сливать.
## Захват 2026-11-11T09:56:55.681Z — PR #132 / Archer
- Исполнитель: чат ChatGPT — Рабочий чат МГ/МГЛ; карточка #132, ветка `lab/cycle5-archer-meta-adfree-1108`, проверенный HEAD `6a8f0de72673b4ab6f71e984e11ffa04715b2322`.
- Дефект: [mobile META BOT changed-games](https://github.com/mpaykin1/meta6-lab/actions/runs/42980721793/job/130390337689) остановился на уровне 4 (task=hold); исходник считал время выживания только в фазе fight, игнорируя реальные атаки дракона. Действие: исправить учёт времени реального выживания в combat-фазах без ускорения времени и изменения META BOT, добавить регрессионную ловушку и проверить новый CI.

### Результат #132 2026-11-11T10:01:11.928Z
- Исполнитель: чат ChatGPT — Рабочий чат МГ/МГЛ. Реальный патч [2993049a8](https://github.com/mpaykin1/meta6-lab/commit/2993049a8e4b47d82514a02ed99dd7de2b1bb3a8); текущий HEAD `ecfdb2558b76243dc605bc7cee4e5f77b953146d` ([автоиндекс](https://github.com/mpaykin1/meta6-lab/commit/ecfdb2558b76243dc605bc7cee4e5f77b953146d)).
- Исправлена остановка счётчика выживания в боевых фазах при низком FPS; четыре дополнительные К3 мутации, OSHIBKI #36. Новая очередь CI на bot HEAD `action_required` не даёт права на слияние.
- Следующий шаг: проверить исходы [focused META BOT на патче](https://github.com/mpaykin1/meta6-lab/actions/runs/42999845500), весь CI на актуальном HEAD и причину `action_required`. Не сливать до доказанного PASS.

## Захват 2026-11-11T10:02:04.852Z — PR #228 / чистая история геймдизайн-аудита
- Исполнитель: чат ChatGPT — Рабочий чат МГ/МГЛ. Исходный PR #228, HEAD `604b244eafe9a8d23b486c6ef2ed82e0c2c2bf3e`.
- [Guard 42976034408](https://github.com/mpaykin1/meta6-lab/actions/runs/42976034408/job/130375223141) отклоняет исторический коммит `777e647ee135af1d15a81d437ae251fb6e4930da` с правкой `.github/protected`. Текущий diff PR содержит только документ, но история загрязнена; force-push и ослабление guard запрещены.
- Действие: перенести исходные байты единственного документа в чистую ветку от текущего main, открыть draft PR вместо заблокированного и закрыть старый только после успешного создания нового.

### Результат #228 → #243 (2026-11-11T10:05:48.364Z)
- Исходный [PR #228](https://github.com/mpaykin1/meta6-lab/pull/228) закрыт **без слияния** из-за guard: исторический коммит `777e647ee135af1d15a81d437ae251fb6e4930da` менял `.github/protected` без подписи Claude.
- Создан [draft PR #243](https://github.com/mpaykin1/meta6-lab/pull/243), branch `lab/game-design-audit-clean-20261111`, HEAD `d6d968e9b3dbd84a841b9b8efeeb888ecfbcf587`: исходный документ с неизменным blob `43825546a4973020dee7871e60efb90dbb45de23`. Ровно один файл, без force push и изменения guard/эталонов.
- [META GAMES guard](https://github.com/mpaykin1/meta6-lab/actions/runs/43000236527), [deletion guard](https://github.com/mpaykin1/meta6-lab/actions/runs/43000236568), [KONTUR Guard](https://github.com/mpaykin1/meta6-lab/actions/runs/43000236333) success. [B1](https://github.com/mpaykin1/meta6-lab/actions/runs/43000236648) ещё in_progress. До всех зелёных и независимой проверки Claude не сливать.
- [PR #132](https://github.com/mpaykin1/meta6-lab/pull/132): KONTUR Guard `42999845629` success, восемь Archer mutation traps включая обман пойманы ([job](https://github.com/mpaykin1/meta6-lab/actions/runs/42999845629/job/130453076731)). [META BOT](https://github.com/mpaykin1/meta6-lab/actions/runs/42999844931) и [focused META BOT](https://github.com/mpaykin1/meta6-lab/actions/runs/42999845500) in_progress на SHA `2993049`; библиотека автоматически обновила индекс HEAD `ecfdb2558b76243dc605bc7cee4e5f77b953146d`, на нём Actions имеют `action_required` — **не считать зелёными**.
- Следующий запуск: проверить новые CI на точных SHA, если Archer fail — читать свежий log и чинить до лимита 2; если success — обеспечить проверки на последнем HEAD, затем независимый обзор; по #243 дождаться B1/ревью Claude. Другие карточки диспетчера сейчас заняты или `НУЖЕН CLAUDE`.

## Захват 2026-11-11T11:19:19.756Z — PR #241 / защита shared-index
- Исполнитель: чат ChatGPT — Рабочий чат МГ/МГЛ; исходная ветка `lab/shared-index-symlink-1111`, HEAD `65e48d5ef9eba78f974b617e2c7d7db14a6c2f4a`, PR https://github.com/mpaykin1/meta6-lab/pull/241.
- Карточка не закреплена в DISPETCHER.md; продолжаю собственную зависшую строку ZADACHI.md (последний коммит 2026-11-11T07:20Z). Никакую чужую активную ветку не меняю.
- Найденная незакрытая угроза: `shared/` как symlink-предок и `shared/index.json` как symlink-назначение обходят проверки конечных входных файлов. Действие: закрыть оба пути и дополнить существующие мутации, затем свежий CI; слияние только при независимой проверке.

### Продолжение #241 2026-11-11T11:25Z
- Исполнитель: чат ChatGPT — Рабочий чат МГ/МГЛ; коммиты [8d0296c](https://github.com/mpaykin1/meta6-lab/commit/8d0296cda802613bab6e3a61d51efe6a2db9a391), [31bf6dd](https://github.com/mpaykin1/meta6-lab/commit/31bf6dd3de97877609822555309266f66dac834c), merge [6eb127a](https://github.com/mpaykin1/meta6-lab/commit/6eb127a275c9f3bcc97ca9d18f66f9903f42cd61).
- Две новые защиты и мутации, ошибки #38–39. Новый CI https://github.com/mpaykin1/meta6-lab/actions/runs/43011648218 / https://github.com/mpaykin1/meta6-lab/actions/runs/43011648077 ещё выполняется. Осталось: проверить все обязательные workflow актуального HEAD и независимое ревью, затем разрешённое слияние.

### Состояние PR #241 2026-11-11T11:31Z
- SHA [077142ee](https://github.com/mpaykin1/meta6-lab/commit/077142ee8278fd8bb153cf8a026a9c7626860912) после 2 отдельных подтверждённых CI-дефектов: [index job](https://github.com/mpaykin1/meta6-lab/actions/runs/43011648218/job/130492473827), [STOROZHA job](https://github.com/mpaykin1/meta6-lab/actions/runs/43011648388/job/130492561123). Исправлены мутации, восстановлен защищённый verifier; новые shared-original, STOROZHA reference и META GAMES guard — success. Остались незавершённые KONTUR, B1 и browser, новое изменение main с момента merge, независимый reviewer. Не сливать раньше.
 
## Продолжение 11.11.2026 — Archer #132 / текущий рабочий цикл

- Исполнитель: чат ChatGPT — Рабочий чат МГ/МГЛ, продолжение ранее взятой карточки #132 (не новая задача).
- Исходный HEAD: `ecfdb2558b76243dc605bc7cee4e5f77b953146d`; мобильный бот [42999845500](https://github.com/mpaykin1/meta6-lab/actions/runs/42999845500) остановился на уровнях 4–5, desktop 7/7.
- Реальное изменение: [f1455c5](https://github.com/mpaykin1/meta6-lab/commit/f1455c56700c4e8cf9c787ec3dbddaceebdef968) — на устойчивом низком FPS прямая отрисовка активной сцены вместо многопроходного bloom. Регрессионные проверки и 3 мутации: [04306d1](https://github.com/mpaykin1/meta6-lab/commit/04306d117db37bcd4f281ad0ce048e3436c4358e), [bfe0d7d](https://github.com/mpaykin1/meta6-lab/commit/bfe0d7d92bdf333e5db35a4d8d602373cccbd5cb).
- Синхронизация с main: [dd933de](https://github.com/mpaykin1/meta6-lab/commit/dd933de3b699c93151dee3ff7d3bbab03eeea4f4) — двухродительский merge, защита основного дерева, OSHIBKI #39–41; GitHub compare `behind=0`, `mergeable=true` на момент проверки.
- Следующий шаг: проверить все обязательные Actions **на `dd933de3b699c93151dee3ff7d3bbab03eeea4f4`** и логи мобильного META BOT, при подтверждённом падении исправить причину; затем независимое ревью. Пока CI queued/in_progress — **не сливать**.

## Продолжение Archer — чистый PR #255 (11.11.2026)

- Исходный PR #132 отклонён именно из-за защищённой **истории**: [META GAMES guard 43033158406](https://github.com/mpaykin1/meta6-lab/actions/runs/43033158406) нашёл коммит `182bf01d486b28be5335dc322d94d8b185b0aba7` с `.github/protected` без подписи Claude. Текущий diff не решает проблему истории.
- Чистый [PR #255](https://github.com/mpaykin1/meta6-lab/pull/255) от `main@e93338ba08b1ee06b08ed39103bc2d15d113ba39`, единственный [commit 343c632](https://github.com/mpaykin1/meta6-lab/commit/343c6326952a18f9a5431f3aa39fa48d0dd947cd), 13 нужных путей, сохранены byte-identical изменения из старой ветки. Без force, без `.github/protected` в истории. Старый PR #132 закрыт без merge после создания замены.
- [META GAMES guard 43034032750](https://github.com/mpaykin1/meta6-lab/actions/runs/43034032750) — success на новом SHA; Library Machine, shared-original, deletion guard и STOROZHA quota тоже success, остальные проверки продолжаются.
- **Следующий шаг:** получить итог META BOT mobile/desktop, KONTUR и других проверок на `343c6326952a18f9a5431f3aa39fa48d0dd947cd`; исправить подтверждённое новое падение не изменяя guard/бот/уровни; независимое ревью, оставить draft до реального PASS. Не объявлять игру завершённой до live-подтверждения.

## Захват 2026-11-11T16:07:36.917Z — PR #241, устранение конфликта с main
- Исполнитель: чат ChatGPT — Рабочий чат МГ/МГЛ. Собственная существующая задача в ZADACHI.md: L2 shared-index symlink, PR https://github.com/mpaykin1/meta6-lab/pull/241, HEAD `077142ee8278fd8bb153cf8a026a9c7626860912`.
- Проверено: на предыдущем HEAD CI success, конфликт с новым main; `scripts/shared/build-index.mjs` в main без защиты symlink. Сейчас: объединить актуальный main и ветку через двухродительский коммит, сохранить историю main, устранить конфликт ID OSHIBKI без удаления ловушек, затем проверить свежие CI. Не сливать без независимого ревью.

### Продолжение 2026-11-11T16:11:40.100Z: #241 + #255
- #241: [двухродительский merge 40d24bfd](https://github.com/mpaykin1/meta6-lab/commit/40d24bfd3833cf425a6803a8289434acc167f897) main `7e2b281475ce5f548b19b5dc1bdead129e2be491` → ветка `lab/shared-index-symlink-1111`, сохранены 3 файла diff и symlink-ловушки, коллизия OSHIBKI исправлена на #1002–1003. [KONTUR](https://github.com/mpaykin1/meta6-lab/actions/runs/43055319487), [META guard](https://github.com/mpaykin1/meta6-lab/actions/runs/43055319596), shared-original 43055318879 — success; [B1](https://github.com/mpaykin1/meta6-lab/actions/runs/43055319496) и [browser](https://github.com/mpaykin1/meta6-lab/actions/runs/43055319277) — in_progress. Main снова сдвинулся служебными коммитами. Дальше: проверить полный CI на 40d24bfd, свежую совместимость и независимое ревью; без этого не сливать.
- #255: красные браузерные jobs на исходном SHA 343c632 имеют подтверждённый инфраструктурный DNS fail при загрузке apt, не доказана ошибка игры. Запрошены [B1 retry](https://github.com/mpaykin1/meta6-lab/actions/runs/43034032867) и [META BOT retry](https://github.com/mpaykin1/meta6-lab/actions/runs/43034032868) — сейчас in_progress. Следующий шаг: проверить два повторных прогона, при восстановлении DNS перезапустить остальные упавшие на установке браузера; отдельный gameplay PASS обязателен.
