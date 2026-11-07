# LAB_QUEUE — очередь идей песочницы

Формат карточки и правила: [automation/prompts/meta6-lab-sandbox.md](automation/prompts/meta6-lab-sandbox.md) §5. Новые карточки — сверху, не длиннее 15 строк. «Михаил» — только его слова. «ЗАБРАНО → SHA» ставит только Claude.

Бот для карточки: ссылка на прогон `META BOT` на PR `lab/<имя>` → `main` в этом репозитории.

Все опубликованные результаты и ссылки для Claude: [CLAUDE_REPORTS.md](CLAUDE_REPORTS.md). Каждый новый PR и его проверки публиковать здесь; сведения только из чата недоступны Claude.

<!-- карточки ниже -->

### lab/immersive-dishonored-principles-20261107 — IM1–IM5 для всех игр
- Польза: новые уровни рассказывают историю окружением, предлагают альтернативные маршруты, вертикальность, узнаваемую живопись и информативный звук.
- Правило: [IMMERSIVE_LEVEL_DESIGN.md](rules/02-igrovye-mekhaniki/IMMERSIVE_LEVEL_DESIGN.md); пункт 15 [RULES_CHECKLIST.md](rules/09-platforma/RULES_CHECKLIST.md).
- Ветка / SHA: `lab/immersive-dishonored-principles-20261107` / `7764f7df208e483be3d45639ee64b0f72f5750aa` (до карточки).
- PR: https://github.com/mpaykin1/meta6-lab/pull/72
- Семь движков: https://github.com/mpaykin1/World_server/pull/634
- Поиграть: не новая игра; изменение спецификаций, без правки игрового кода.
- Проверка: поведение игр не проверено, META BOT потребуется при внедрении.
- Статус: В РАБОТЕ — требуется ревью Claude и отдельное внедрение по играм; без автоматического переноса в `meta6`.
- Михаил: —; Claude: —



### lab/play-connect-earn-home — главная Play / Connect / Earn
- Польза: три работающие навигационные кнопки; Play открывает 10 игровых ссылок, Connect показывает MCP endpoint и копирование URL, Earn честно заблокирован до готовности и 100 DAU.
- Ветка: `lab/play-connect-earn-home`.
- Играть: https://mpaykin1.github.io/meta6-lab/meta-games/
- Статус: В РАБОТЕ — MCP запись/создание игр, аккаунты, права, аналитика топа, уведомления и боты не реализованы.
- Михаил: —; Claude: —

### lab/earn-after-100-dau — запрет рекламы до готовности и 100 DAU
- Польза: сначала готовая платформа и все улучшенные игры, затем реальные 100 активных пользователей в сутки, и только потом рекламный этап.
- Правило: [PLAY_CONNECT_EARN.md](rules/09-platforma/PLAY_CONNECT_EARN.md) §5.0.
- Ветка: `lab/earn-after-100-dau`.
- Статус: В РАБОТЕ — релиз, все улучшенные игры и измеренный порог 100 DAU ещё не подтверждены.
- Михаил: —; Claude: —

### lab/play-connect-earn-rules — Play / Connect / Earn
- Польза: три раздела портала; поиск/игры, MCP-создание, боты, профили, популярность, уведомления, заработок и одночасовое продвижение.
- Правила: [PLAY_CONNECT_EARN.md](rules/09-platforma/PLAY_CONNECT_EARN.md)
- Ветка: `lab/play-connect-earn-rules`; PR: https://github.com/mpaykin1/meta6-lab/pull/52
- Поиграть: не новая игра; внедрение интерфейса ещё не выполнено.
- Проверка: документооборот, META BOT не требуется до появления изменённой игры.
- Статус: В РАБОТЕ — требования в PR; реализация разделов и юридическое соглашение впереди; конфликт с основным `BEZ_REKLAMY.md` решает Claude.
- Михаил: —; Claude: —

### World_server / PR #621 — MCP: Veil Terraces и исходники
- Польза: публичный MCP отдаёт 5 игр, 2 проверенных оригинальных модуля, не отдаёт 4 неподтверждённых.
- Поиграть: https://mpaykin1.github.io/meta6/meta-games-worlds/veil-terraces/
- Merge SHA: https://github.com/mpaykin1/World_server/commit/0cf972347edfc11c6aa4b62dbb2228fdd078d59b
- PR: https://github.com/mpaykin1/World_server/pull/621 (merged)
- PRE CI: https://github.com/mpaykin1/World_server/actions/runs/42332097936 ; Cloudflare https://github.com/mpaykin1/World_server/actions/runs/42332097917
- LIVE Render POST MCP: https://github.com/mpaykin1/World_server/actions/runs/42332660062 — PASS 07.11; IDs observer-v7, ashen, three-worlds, underwater, veil-terraces; health games=5, licensed_assets=2, source_sha=merge SHA.
- Render CD: https://github.com/mpaykin1/World_server/actions/runs/42332660003 — PASS, exact SHA.
- Статус: ПРИНЯТО — отдельно от ещё незавершённых фабрики create_game, Vault и META BOT.
- Михаил: —
- Claude: —

### lab/approved-donor-confluence-vault — Замена Generated Confluence Vault
- Польза: заменить запрещённую процедурную игру настоящей игрой из байт-проверенных эталонов.
- Поиграть: отсутствует; текущий published Vault не соответствует SOURCE_ALLOWLIST.
- Ветка / SHA: ещё не создана; источник meta6 ea74a313bb24eb25575f8021e218083c987bc280.
- Допуск: SOURCE_ASSETS.json, upstream blob SHA для каждого игрового файла; все уровни и два запуска META BOT.
- PR: ещё не открыт; старый процедурный кандидат https://github.com/mpaykin1/meta6-lab/pull/9 заблокирован.
- Статус: В РАБОТЕ — нет законной donor-сборки и зелёного META BOT; перенос в meta6 только Claude.
- Михаил: —
- Claude: —

### meta6 #290 — Twilight Isles, исправление проходимости
- Польза: пройти остров без гибели и ложной победы, сохранить исходную графику.
- Поиграть: https://mpaykin1.github.io/meta6-lab/games/twilight-isles/ (основная песочница, не превью ветки).
- Ветка / SHA: lab/twilight-isles-pass / 95f807d6901f5ebfe220a1006f8b82cde836a94b.
- PR: https://github.com/mpaykin1/meta6-lab/pull/2; источник meta6 PR #290 только чтение.
- META BOT: https://github.com/mpaykin1/meta6-lab/actions/runs/42354017653 — FAIL (герой погиб mobile/desktop/replay); https://github.com/mpaykin1/meta6-lab/actions/runs/42356322630 — IN_PROGRESS на новом SHA, PASS нет.
- Изменены: bot-strategy.mjs (честная смерть), meta-enhancements.js (путь к следующей клетке, доступное оружие в начале).
- Статус: В РАБОТЕ — дождаться и исправить META BOT; не сливать при FAIL.
- Михаил: —
- Claude: —

### meta6 #291 — Twilight Island, исправление маршрута и прогресса
- Польза: физически собрать монеты, победить босса, дойти до кольца без обхода правил.
- Поиграть: https://mpaykin1.github.io/meta6-lab/games/twilight-island/ (основная песочница, не превью ветки).
- Ветка / SHA: lab/twilight-island-pass / d91ce533594870375aedc8b1d420258ba435d8e4.
- PR: https://github.com/mpaykin1/meta6-lab/pull/1; источник meta6 PR #291 только чтение.
- META BOT: https://github.com/mpaykin1/meta6-lab/actions/runs/42354623678 — FAIL: оба mobile дошли до босса, но погибли со слабым оружием; desktop убил босса, но ушёл к сердцу вместо кольца. https://github.com/mpaykin1/meta6-lab/actions/runs/42356940858 — IN_PROGRESS на новом SHA.
- Изменены: bot-strategy.mjs (реальный выбор оружия, приоритет победного кольца), bot-adapter.js (следующая клетка маршрута).
- Статус: В РАБОТЕ — подтвердить три полных успешных прохода, без подтверждения не сливать.
- Михаил: —
- Claude: —


### lab/shared-owner-approved-components — Первая библиотека эталонного кода
- Польза: сюжетные события и мобильный ввод берутся из общей библиотеки, оригинальные файлы сохранены без изменений.
- Поиграть: не отдельная игра; интеграция в игры ещё не завершена.
- Ветка / SHA кода: lab/shared-owner-approved-components / de6cdfeb80081c17cb8ecd996c0bbd0cd57bf272
- Исходники: observer-world-en-v7/story-system.js и mobile-controls.js, meta6 ea74a313, Git blob SHA в паспортах.
- Файлы: shared/components/* (2 модуля+2 паспорта), shared/index.json, shared/loader.js, scripts/shared/build-index.mjs, workflow.
- Проверки: https://github.com/mpaykin1/meta6-lab/actions/runs/42327859393 (index success), https://github.com/mpaykin1/meta6-lab/actions/runs/42327859314 (guard success).
- PR: https://github.com/mpaykin1/meta6-lab/pull/13
- Статус: В РАБОТЕ (игры на shared ещё не переведены; META BOT на интеграцию не запускался).
- Михаил: —
- Claude: —



### lab/agent-game-candidate — Генерация кандидата нейросетью
- Результат: авторизованная сборка реальной WebGL-игры из существующих движков World_server, только в песочнице
- Поиграть: https://mpaykin1.github.io/meta6-lab/preview/agent-game-candidate/meta-games-worlds/generated-confluence-studio/
- Ветка / SHA: lab/agent-game-candidate / 6994079
- Файлы: + scripts/lab/agent-game-candidate.cjs, + .github/workflows/lab-agent-game-factory.yml, + 7 файлов игры
- Проверка генератора: https://github.com/mpaykin1/meta6-lab/actions/runs/42323084672 (success, integrity true)
- PR: https://github.com/mpaykin1/meta6-lab/pull/9
- Статус: В РАБОТЕ (нет полного META BOT/OWNER PASS; публичный MCP остаётся read-only)
- Михаил: —
- Claude: —

### lab/bot-safe-autorepair — Автоматическое исправление FIX
- Результат: бот проверяет игру, исправляет только подтверждённое смещение экрана, повторно проходит или откатывает изменение
- Ветка / SHA: lab/bot-safe-autorepair / c4694799
- Файлы: + scripts/lab/bot-safe-autorepair.mjs, + .github/workflows/lab-autorepair.yml
- Проверка: https://github.com/mpaykin1/meta6-lab/actions/runs/42322790965 (success, зелёная Veil Terraces; реальный дефект ещё не исправлялся)
- PR: https://github.com/mpaykin1/meta6-lab/pull/8
- Статус: В РАБОТЕ (нужна успешная проверка на реальном FIX-сбое)
- Михаил: —
- Claude: —

### lab/reuse-library-search — Поиск решений и локальный MCP
- Результат: поиск по пяти эталонам с источником/хешем, локальный MCP поиска без копирования файлов и расхода лишних токенов
- Поиграть: https://mpaykin1.github.io/meta6-lab/preview/reuse-library-search/meta-games/library/
- Ветка / SHA: lab/reuse-library-search / 3693f512
- Файлы: + shared/library-search.mjs, + meta-games/library/catalog.json и index.html, ~ meta-games/index.html (одна ссылка)
- Проверка: https://github.com/mpaykin1/meta6-lab/actions/runs/42322255848 (guard success)
- PR: https://github.com/mpaykin1/meta6-lab/pull/7
- Статус: В РАБОТЕ (публичный MCP не расширен; права отдельных компонентов пока не проверены)
- Михаил: —
- Claude: —


### lab/oss-commercial-kit — Внешние библиотеки + световой остров
- Игрок: атмосферный 3D-остров, процедурный рельеф, подсвеченный маршрут к кристаллам, звуки и сенсорный джойстик.
- Поиграть: https://mpaykin1.github.io/meta6-lab/preview/oss-commercial-kit/meta-games/open-source-kit/
- Ветка / SHA: lab/oss-commercial-kit / a8393864b3e4abad7249bfee1c56bed194dc5cef
- Файлы: + shared/vendor/open-source/ (9), + meta-games/open-source-kit/ (3).
- Лицензии: 3× MIT, 1× ISC; исходники и тексты лицензий сохранены отдельно, зависимости автономны.
- Слияние только в песочницу: https://github.com/mpaykin1/meta6-lab/pull/5
- Браузер: https://github.com/mpaykin1/meta6-lab/actions/runs/42286065628 (PASS, WebGL + 4 библиотеки + путь + звук + движение)
- Статус: В РАБОТЕ (браузер PASS, Pages опубликовано; общий META BOT ещё проверяет)
- Михаил: —
- Claude: —

