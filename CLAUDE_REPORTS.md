# META GAMES — результаты ChatGPT для Claude

Единый публичный вход: [LAB_QUEUE](LAB_QUEUE.md). Все результаты ChatGPT, предназначенные для Claude, обязаны быть доступны **без доступа к истории ChatGPT**.

## Оперативная очередь 07.11.2026 — точные препятствия

- **World_server MCP PR #621 — MERGED + LIVE PASS:** [PR #621](https://github.com/mpaykin1/World_server/pull/621), [merge SHA 0cf9723](https://github.com/mpaykin1/World_server/commit/0cf972347edfc11c6aa4b62dbb2228fdd078d59b). [CI PASS](https://github.com/mpaykin1/World_server/actions/runs/42332097936), [Cloudflare exact-head PASS](https://github.com/mpaykin1/World_server/actions/runs/42332097917) (20 устаревших Workers удалены бесплатно для снятия квоты 100), [Render CD PASS](https://github.com/mpaykin1/World_server/actions/runs/42332660003), [REAL PUBLIC HTTPS MCP PASS](https://github.com/mpaykin1/World_server/actions/runs/42332660062): `/health` вернул `games=5`, `licensed_assets=2`, `source_sha=0cf972347edfc11c6aa4b62dbb2228fdd078d59b`; `tools/call list_games` → `observer-v7, ashen, three-worlds, underwater, veil-terraces`; 8 инструментов, 2 оригинальных разрешённых источника, 4 заблокированных кандидата. В публичном MCP подтверждено; это **не** означает готовность `create_game` и остальных элементов фабрики. Прямой ответ и SHA также приложены к [описанию PR #621](https://github.com/mpaykin1/World_server/pull/621).
- **Generated Confluence Vault / LAB**: [draft PR #58](https://github.com/mpaykin1/meta6-lab/pull/58), first commit [fbfcbb4](https://github.com/mpaykin1/meta6-lab/commit/fbfcbb4d0534af59633571b90151270ca6f15bcf). Forbidden World_server procedural gameplay and GLSL removed **in the lab PR only**; new `SOURCE_ASSETS.json` maps `index.html` to **byte-identical** approved donor `meta6` at `ea74a313bb24eb25575f8021e218083c987bc280`, `meta-games-worlds/veil-terraces/index.html`, blob `99243a7d78b4249a13683e881db5000b8e6452a5`. Strict independent upstream Git verification remains ([#11](https://github.com/mpaykin1/meta6-lab/pull/11), [#12](https://github.com/mpaykin1/meta6-lab/pull/12)). This is **not yet a distinct Confluence Vault**: source game still Veil Terraces, no new Vault META BOT pass, no replacement of public `meta6` until Claude transfers compliant gameplay. CI status: pending, see PR checks.

- **meta6 #290**: [PR](https://github.com/mpaykin1/meta6/pull/290), head [72b92d5](https://github.com/mpaykin1/meta6/commit/72b92d5c508571cc4fd69d4aa60c2692940cee16). [META BOT FAIL](https://github.com/mpaykin1/meta6/actions/runs/42186206581) exact job [127787036166](https://github.com/mpaykin1/meta6/actions/runs/42186206581/job/127787036166): mobile and desktop never complete level 1 after **570 s** (FPS 2.1/2.0), independent mobile attempt exits `playLevel` before victory. [Guard](https://github.com/mpaykin1/meta6/actions/runs/42186206479) / [browser](https://github.com/mpaykin1/meta6/actions/runs/42186206540) successful; bot is not. **No merge while game win condition unreachable**. ChatGPT cannot change or comment in read-only `meta6`; ask Claude to apply tested lab patch and merge.

- **meta6 #291**: [draft PR](https://github.com/mpaykin1/meta6/pull/291), head [77add70](https://github.com/mpaykin1/meta6/commit/77add700f428e8c9209e4dd2c58506480c5524f5). [META BOT FAIL](https://github.com/mpaykin1/meta6/actions/runs/42185128729) exact job [127783552313](https://github.com/mpaykin1/meta6/actions/runs/42185128729/job/127783552313): both viewports fail **20 s `progress` no growth** in level 1, independent mobile attempt ends in hero death (FPS mobile 5.5, desktop 5.6). [Guard](https://github.com/mpaykin1/meta6/actions/runs/42185128724) / [browser](https://github.com/mpaykin1/meta6/actions/runs/42185128704) successful; bot is not. **Do not merge draft without genuine island completion**, no time/stuck threshold relaxation. ChatGPT cannot change or comment `meta6`; Claude applies tested lab fix.

- **Последняя проверенная измеренная готовность**: [LAB Progress 42330678551](https://github.com/mpaykin1/meta6-lab/actions/runs/42330678551): MCP **20%**, Библиотека **7%**, Бот **27%**, общий **18%**. Не пересчитывать оценку вручную; ждать нового `scripts/meta-progress/progress.mjs` по живым источникам.

## Канонические источники

- [PR песочницы — все состояния](https://github.com/mpaykin1/meta6-lab/pulls?q=is%3Apr) — полный текст изменений, описание, SHA, запуски Actions.
- [PR World_server](https://github.com/mpaykin1/World_server/pulls?q=is%3Apr) — MCP, лицензии и интеграции.
- [LAB_QUEUE](LAB_QUEUE.md) — короткие карточки готовности каждой идеи; источник для приёмки Claude.
- [PR #621 — лицензии и каталог MCP](https://github.com/mpaykin1/World_server/pull/621) — 5 игр, 2 проверенных компонента; статус берётся из GitHub.
- [PR #11 — запрет неэталонных игровых исходников](https://github.com/mpaykin1/meta6-lab/pull/11) — merged; неподтверждённые процедурные кандидаты блокируются.
- [PR #12 — сверка с точным upstream Git blob](https://github.com/mpaykin1/meta6-lab/pull/12) — merged; лабораторная копия не считается доказательством исходника.
- [PR #13 — два компонента общей библиотеки](https://github.com/mpaykin1/meta6-lab/pull/13) — байт-в-байт оригиналы из эталонного Twilight Island, пока без игровой интеграции.
- [World_server MCP #621 PRE CI](https://github.com/mpaykin1/World_server/actions/runs/42332097936), [Cloudflare](https://github.com/mpaykin1/World_server/actions/runs/42332097917), [LIVE Render](https://github.com/mpaykin1/World_server/actions/runs/42332660062) — все PASS после бесплатной очистки устаревших previews, PR слит.
- [PR #9 — пробная сборка генератора](https://github.com/mpaykin1/meta6-lab/pull/9) — недопустима к переносу до проверки источников и полного META BOT.
- [PR #8 — безопасный FIX](https://github.com/mpaykin1/meta6-lab/pull/8).
- [PR #7 — поиск исходников](https://github.com/mpaykin1/meta6-lab/pull/7).
- [PR #5 — библиотеки MIT/ISC](https://github.com/mpaykin1/meta6-lab/pull/5) — **не игровые доноры** по ограничению META GAMES.

## Исправления к оценке готовности 07.11.2026

- **World_server/shared уже существует:** в master доступны `golden-components/`, `golden-physics.js`, `golden-ui-shell.js` и другие модули. Однако инфраструктурная библиотека World_server **не является сама по себе разрешённым игровым донором**; требуется проверка конкретных оригинальных ассетов.
- **В meta6 основной папки shared/ не было.** В песочнице после [PR #13](https://github.com/mpaykin1/meta6-lab/pull/13) создана `shared/` из двух разрешённых оригинальных модулей; другие игры на неё ещё не переведены.
- **Публичный MCP-каталог подтверждён**, 5 игр и 2 лицензированных модуля: [Render exact SHA + real HTTPS smoke](https://github.com/mpaykin1/World_server/actions/runs/42332660062). **НЕ объявлять готовыми** write-инструменты фабрики игр, интеграцию общей библиотеки в игры и обход уровней ботом.
- **Бот**: полный подтверждённый проход только Veil Terraces (6+6+6). [meta6 #290](https://github.com/mpaykin1/meta6/pull/290) и [#291](https://github.com/mpaykin1/meta6/pull/291) на момент проверки ещё открыты; не выдавать их за PASS.
- **Созданная процедурным генератором игра** не отвечает донорской политике. [PR #9](https://github.com/mpaykin1/meta6-lab/pull/9) сделан черновиком и заблокирован; это не означает, что уже опубликованная в `meta6` generated-confluence-vault исправлена. Переносит изменения в `meta6` только Claude.
- **28%** из старого отчёта — субъективная оценка, не измеренная готовность. До новых объективных метрик не повышать проценты автоматически.

## Правило публикации

1. Любое сообщение «готово», «исправлено», «проверено», относящееся к разработке, должно иметь публичную запись в **описании PR**, доступную Claude через постоянную ссылку, с SHA, затронутыми файлами, результатом Actions и ограничениями. Ничего не считать готовым только по сообщению в чате.
2. В `LAB_QUEUE.md` добавить ссылку на PR; не объявлять результат принятым без зелёного META BOT и решения владельца.
3. Все решения о праве копирования игрового кода привязаны к [разрешённым эталонам](https://github.com/mpaykin1/meta6/blob/main/rules/06-rabota-ii-s-kodom/META_GAMES_SOURCE_ALLOWLIST.md). Собственные новые шейдеры/геометрия генератора **не являются эталонными ассетами** без решения владельца; отсутствие `referenceIds` не доказывает соблюдение правила.
4. Если отчёт был опубликован только в чате, он **не доступен Claude по умолчанию**: прежде чем ссылаться на него, опубликовать результат в PR и добавить ссылку сюда.
5. Claude переносит в `meta6`; ChatGPT работает только с `meta6-lab`. Не менять защиту основного репозитория.

Этот индекс связывает публичные записи, не заменяет проверки или одобрение.
