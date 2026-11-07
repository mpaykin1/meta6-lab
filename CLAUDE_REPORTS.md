# META GAMES — результаты ChatGPT для Claude

Единый публичный вход: [LAB_QUEUE](LAB_QUEUE.md). Все результаты ChatGPT, предназначенные для Claude, обязаны быть доступны **без доступа к истории ChatGPT**.

## Оперативная очередь 07.11.2026 — точные препятствия

- **World_server MCP PR #621**: head [2f7a0b5](https://github.com/mpaykin1/World_server/commit/2f7a0b5ad39f0f28fa0a1dbb81b77bbbb1c30740). Исходный Cloudflare Free error **Workers 100** (не ежедневная квота!) в [42326698847](https://github.com/mpaykin1/World_server/actions/runs/42326698847); освобождены 20 ресурсов типа старого numbered-canary, без оплаты и без удаления production. Новый [Cloudflare exact-head PASS](https://github.com/mpaykin1/World_server/actions/runs/42331036619); [Quality Regression PASS](https://github.com/mpaykin1/World_server/actions/runs/42331036635). [CI](https://github.com/mpaykin1/World_server/actions/runs/42331036596) и [public HTTPS](https://github.com/mpaykin1/World_server/actions/runs/42331036696) проверяются отдельно: live-smoke нельзя считать PASS по локальному тесту, требуется реальный Render list_games с Veil Terraces и точный production SHA. Итог слияния проверять по состоянию [PR #621](https://github.com/mpaykin1/World_server/pull/621).
- **Generated Confluence Vault**: [существующая игра](https://github.com/mpaykin1/meta6/blob/main/meta-games-worlds/generated-confluence-vault/index.html) содержит процедурный `three-glsl3-procedural` и `generated_world_geometry`, паспорт разрешённых source blobs отсутствует. [lab PR #11](https://github.com/mpaykin1/meta6-lab/pull/11) и [#12](https://github.com/mpaykin1/meta6-lab/pull/12) требуют сверять исходники в настоящем meta6 Git по `<commit>:<path>` и SHA; простая смена manifest недостаточна. Не публиковать/не переносить, пока не появится реальная donor-сборка и зелёный META BOT; в `meta6` переносит только Claude.
- **meta6 #290**: [PR](https://github.com/mpaykin1/meta6/pull/290), head [72b92d5](https://github.com/mpaykin1/meta6/commit/72b92d5c508571cc4fd69d4aa60c2692940cee16), [META BOT FAIL](https://github.com/mpaykin1/meta6/actions/runs/42186206581): уровень 1 не закончен за 570 секунд; `playLevel` вернул без победы. [guard](https://github.com/mpaykin1/meta6/actions/runs/42186206479) и [browser](https://github.com/mpaykin1/meta6/actions/runs/42186206540) прошли. Писать в meta6/merge GPT не имеет права; Claude переносит после lab-исправления.
- **meta6 #291**: [PR draft](https://github.com/mpaykin1/meta6/pull/291), head [77add70](https://github.com/mpaykin1/meta6/commit/77add700f428e8c9209e4dd2c58506480c5524f5), [META BOT FAIL](https://github.com/mpaykin1/meta6/actions/runs/42185128729): 20 секунд нет прироста `progress`, далее смерть героя; полная победа острова не доказана. [guard](https://github.com/mpaykin1/meta6/actions/runs/42185128724) и [browser](https://github.com/mpaykin1/meta6/actions/runs/42185128704) прошли. Нет права менять meta6 GPT; Claude переносит после lab-исправления.
- **Последняя проверенная измеренная готовность**: [LAB Progress 42330678551](https://github.com/mpaykin1/meta6-lab/actions/runs/42330678551): MCP **20%**, Библиотека **7%**, Бот **27%**, общий **18%**. Не пересчитывать оценку вручную; ждать нового `scripts/meta-progress/progress.mjs` по живым источникам.

## Канонические источники

- [PR песочницы — все состояния](https://github.com/mpaykin1/meta6-lab/pulls?q=is%3Apr) — полный текст изменений, описание, SHA, запуски Actions.
- [PR World_server](https://github.com/mpaykin1/World_server/pulls?q=is%3Apr) — MCP, лицензии и интеграции.
- [LAB_QUEUE](LAB_QUEUE.md) — короткие карточки готовности каждой идеи; источник для приёмки Claude.
- [PR #621 — лицензии и каталог MCP](https://github.com/mpaykin1/World_server/pull/621) — 5 игр, 2 проверенных компонента; статус берётся из GitHub.
- [PR #11 — запрет неэталонных игровых исходников](https://github.com/mpaykin1/meta6-lab/pull/11) — merged; неподтверждённые процедурные кандидаты блокируются.
- [PR #12 — сверка с точным upstream Git blob](https://github.com/mpaykin1/meta6-lab/pull/12) — merged; лабораторная копия не считается доказательством исходника.
- [PR #13 — два компонента общей библиотеки](https://github.com/mpaykin1/meta6-lab/pull/13) — байт-в-байт оригиналы из эталонного Twilight Island, пока без игровой интеграции.
- [World_server MCP #621 CI](https://github.com/mpaykin1/World_server/actions/runs/42326698847) — Cloudflare preview исчерпал лимит; PR не сливать и не считать Render обновлённым до зелёного релиза.
- [PR #9 — пробная сборка генератора](https://github.com/mpaykin1/meta6-lab/pull/9) — недопустима к переносу до проверки источников и полного META BOT.
- [PR #8 — безопасный FIX](https://github.com/mpaykin1/meta6-lab/pull/8).
- [PR #7 — поиск исходников](https://github.com/mpaykin1/meta6-lab/pull/7).
- [PR #5 — библиотеки MIT/ISC](https://github.com/mpaykin1/meta6-lab/pull/5) — **не игровые доноры** по ограничению META GAMES.

## Исправления к оценке готовности 07.11.2026

- **World_server/shared уже существует:** в master доступны `golden-components/`, `golden-physics.js`, `golden-ui-shell.js` и другие модули. Однако инфраструктурная библиотека World_server **не является сама по себе разрешённым игровым донором**; требуется проверка конкретных оригинальных ассетов.
- **В meta6 основной папки shared/ не было.** В песочнице после [PR #13](https://github.com/mpaykin1/meta6-lab/pull/13) создана `shared/` из двух разрешённых оригинальных модулей; другие игры на неё ещё не переведены.
- **Публичный MCP не объявлять готовым:** каталог пяти эталонов и два разрешённых модуля существуют в [PR #621](https://github.com/mpaykin1/World_server/pull/621), но PR пока не слит и Render не обновлён. Cloudflare PR preview получил ошибку лимита Workers (GitHub Actions 42326698847), live-smoke не подтвердил новый SHA.
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
