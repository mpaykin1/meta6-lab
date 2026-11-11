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

## Очередь PR 11.11.2026 — продолжение рабочего чата
- PR #229 уже слит ранее: [merge 40dfc50](https://github.com/mpaykin1/meta6-lab/commit/40dfc505c5427f8d0b17b679d2f5df74352bc7c1), не повторять.
- PR #231: [повтор неуспешных jobs](https://github.com/mpaykin1/meta6-lab/actions/runs/42963587611) инициирован через Actions API 11.11; ответ `success=true`. Проверить результат повторного прогона перед слиянием.
- PR #126: в ветку влит актуальный `main@34eef6c` безопасным двухродительским [коммитом c153bd9](https://github.com/mpaykin1/meta6-lab/commit/c153bd90b530ed30aea5f1b1cf152432637b99a6); документ сохранён byte-for-byte, SHA blob `93a8682d5cdac625c990c667bf02f987a288f57d`. Дальше проверить CI на c153bd9.
- PR #225: конфликт со свежим main ещё требует бережного объединения OSHIBKI.md и docs/progress/PR54_59_60.md; не менять защищённый workflow.

### PR #225 — согласование с main 11.11.2026
- [Двухродительский merge dfe311e](https://github.com/mpaykin1/meta6-lab/commit/dfe311e5bbfff7db31c329229ff7154ed692be98): branch head `95f3736` + актуальный main `e818b2f`. Из OSHIBKI.md сохранены все записи обеих сторон; добавлена новая #32, устранены коллизии существовавших #18→#33 и #17→#34 без удаления текста. В docs/progress/PR54_59_60.md все строки ветки уже были в main, сохранён полный вариант main. Защищённые workflow не изменялись вручную. `shared/library/index.json` сохранён из свежего main.
- Дальше: проверки нового HEAD и независимая проверка кода; при красном CI код не сливать. Публикацию Broken City проверять только после разрешённого слияния.

### PR #126 и #231 — 11.11.2026
- PR #126: [слит squash 7f56165](https://github.com/mpaykin1/meta6-lab/commit/7f5616591ca5baa37186d86621299d32c77230b1), same HEAD `c153bd9`, четыре зелёных: [B1](https://github.com/mpaykin1/meta6-lab/actions/runs/42968765796), [KONTUR](https://github.com/mpaykin1/meta6-lab/actions/runs/42968765740), [META guard](https://github.com/mpaykin1/meta6-lab/actions/runs/42968765788), [library guard](https://github.com/mpaykin1/meta6-lab/actions/runs/42968765785). Проверить main после слияния.
- PR #231: повторный [MG Dispatcher 42963587611](https://github.com/mpaykin1/meta6-lab/actions/runs/42963587611) завершился SUCCESS (попытка 2). После конфликта с быстро меняющимся main синхронизирована ветка: [merge 90dd097](https://github.com/mpaykin1/meta6-lab/commit/90dd0973baced380bcda4dad402bb4287520419c), `main@39063f7`, весь журнал ошибок сохранён, коллизии номеров 18→32, 17→33, 31→34 устранены. Дальше CI нового HEAD, без зелёных не сливать.
- #225: другой процесс обновил HEAD до `d3e2cb1dccfafcda5d1686d5dafa7ebf3ade5590`; не перезаписывать. На предыдущем HEAD красные `KONTUR Guard` и `Library Machine` — читать точные логи и чинить на фактическом HEAD.

### #225 — устранён KONTUR_REJECT benchmark 11.11.2026
- [Сбой KONTUR 42969244400](https://github.com/mpaykin1/meta6-lab/actions/runs/42969244400) точно: `KONTUR_REJECT scripts/lab/broken-city-bench.mjs:64: ветвление по окружению CI/тестов process.env.GITHUB_STEP_SUMMARY (К4.1)`.
- [Коммит 3bd8ecf](https://github.com/mpaykin1/meta6-lab/commit/3bd8ecfca1a12242094a5c6c24c242e3e7c97542): тест печатает summary одинаково в любой среде (stdout), без специального поведения CI; guard и workflow не менялись.
- [Library Machine 42969244774](https://github.com/mpaykin1/meta6-lab/actions/runs/42969244774) отклонил устаревший `shared/library/index.json`; другой исполнитель уже синхронизировал индекс коммитом `d3e2cb1`. Дальше новый HEAD CI; не сливать красный.

### 11.11.2026 — последующие изменения очереди
- [PR #231](https://github.com/mpaykin1/meta6-lab/pull/231) слит после полного CI свежего HEAD: [merge 8790e63](https://github.com/mpaykin1/meta6-lab/commit/8790e6339ccf62af9584a4353749c864d4cf7785); [MG Dispatcher](https://github.com/mpaykin1/meta6-lab/actions/runs/42969549118), [KONTUR](https://github.com/mpaykin1/meta6-lab/actions/runs/42969549175), [B1](https://github.com/mpaykin1/meta6-lab/actions/runs/42969549125), [guard](https://github.com/mpaykin1/meta6-lab/actions/runs/42969549095).
- [PR #232](https://github.com/mpaykin1/meta6-lab/pull/232), отдельный зависший документационный PR: свежий main влит [431b4c6](https://github.com/mpaykin1/meta6-lab/commit/431b4c6b57e3efd6bbe54bcb2f677064dd031a6c) без изменения документа; после четырёх зелёных CI слит [d7c3dac](https://github.com/mpaykin1/meta6-lab/commit/d7c3dac578c1b841fe7d259c944b7d7aec18cf98).
- [PR #225](https://github.com/mpaykin1/meta6-lab/pull/225): [Performance 42969763597](https://github.com/mpaykin1/meta6-lab/actions/runs/42969763597) не прошёл абсолютные пороги (mobile p95 166.7ms >20, draws 128>40; desktop 45>40), нельзя смягчать порог. [META BOT 42969763787](https://github.com/mpaykin1/meta6-lab/actions/runs/42969763787) не нашёл read-only handle на mobile/desktop. Восстановлены существующие адаптер, стратегия и bot.json из #200 плюс наблюдательный мост только чтения в самой игре, без правки ядра/охранников: [commit 91688bd](https://github.com/mpaykin1/meta6-lab/commit/91688bdc506b2a006ff5b91ccc9df2c5d61c95fa). Следующее: новый CI #225; абсолютные performance budget остаются блокером, нужен реальный выигрыш, не обход проверки.

### 11.11.2026 — #125 и Bot #225
- #125 (ЗАБРОШЕНО): альтернативный, явно неканонический лор синхронизирован без изменения документа с актуальным main в [merge bfa141b](https://github.com/mpaykin1/meta6-lab/commit/bfa141b3daf3ed48be6a4a493f0a87406d4edd05); новый CI: [B1](https://github.com/mpaykin1/meta6-lab/actions/runs/42970998542), [KONTUR](https://github.com/mpaykin1/meta6-lab/actions/runs/42970998413), [library](https://github.com/mpaykin1/meta6-lab/actions/runs/42970998461), [META](https://github.com/mpaykin1/meta6-lab/actions/runs/42970998488). Только после зелёных сливать.
- #225: после нашего [read-only bot adapter 91688bd](https://github.com/mpaykin1/meta6-lab/commit/91688bdc506b2a006ff5b91ccc9df2c5d61c95fa) другой исполнитель обновил автоиндексы библиотеки HEAD `3895b1aabcfbda047aec756873b951ecdf03f4f8` (три файла, по compare); новый HEAD не перетирать. Повторно проверить performance и META BOT на этом HEAD.

### Закрытие очередного шага 11.11.2026
- #125 (из ЗАБРОШЕНО): [слияние 9f50910](https://github.com/mpaykin1/meta6-lab/commit/9f50910368238775bda40729722ec3512f14e623) после [KONTUR 42970998413](https://github.com/mpaykin1/meta6-lab/actions/runs/42970998413), [B1 42970998542](https://github.com/mpaykin1/meta6-lab/actions/runs/42970998542), [META guard 42970998488](https://github.com/mpaykin1/meta6-lab/actions/runs/42970998488), [library guard 42970998461](https://github.com/mpaykin1/meta6-lab/actions/runs/42970998461); документ явно помечен как альтернативный лор, канон не меняет.
- Прогресс очереди оформлен [PR #237](https://github.com/mpaykin1/meta6-lab/pull/237). Первая проверка [KONTUR 42971329913](https://github.com/mpaykin1/meta6-lab/actions/runs/42971329913) обнаружила в описании PR слово, трактуемое как ремонт без новой строки OSHIBKI; описание теперь фактологическое (журнал Markdown без исправления кода), охранник не отключён. Новые CI требуются на актуальном HEAD.
