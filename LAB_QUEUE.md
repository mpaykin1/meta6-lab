# LAB_QUEUE — очередь идей песочницы

Формат карточки и правила: [automation/prompts/meta6-lab-sandbox.md](automation/prompts/meta6-lab-sandbox.md) §5. Новые карточки — сверху, не длиннее 15 строк. «Михаил» — только его слова. «ЗАБРАНО → SHA» ставит только Claude.

Бот для карточки: ссылка на прогон `META BOT` на PR `lab/<имя>` → `main` в этом репозитории.

Все опубликованные результаты и ссылки для Claude: [CLAUDE_REPORTS.md](CLAUDE_REPORTS.md). Каждый новый PR и его проверки публиковать здесь; сведения только из чата недоступны Claude.

**ЗАМОРОЖЕНО ДО ФИНИША (09.11.2026):** Steam, Google Play, Earn / реклама / 100 DAU, аккаунты, профили, уведомления — не делать, пока не зелёные все 18 проверок [FINISH.md](rules/09-platforma/FINISH.md). Сначала M1 → M2 → B1 → B2.

<!-- карточки ниже -->
### lab/link-guard-recovery-1111 — ССЫЛКА = 200: восстановление и защита (11.11.2026)
- Шаг 1/6: DONE — [PR #266 закрыт как дубль](https://github.com/mpaykin1/meta6-lab/pull/266), [комментарий](https://github.com/mpaykin1/meta6-lab/pull/266#issuecomment-6801260398).
- Шаг 2/6: CODE — 11 файлов восстановлены [4204e3f](https://github.com/mpaykin1/meta6-lab/commit/4204e3fdc7398de8a5071a8587010db510e7435e); sync защищён [0ff9507](https://github.com/mpaykin1/meta6-lab/commit/0ff9507aa40b1ca5b4fa6f8d3a6c1935cf8138cd); twilight-island убран из LINKS [21b3641](https://github.com/mpaykin1/meta6-lab/commit/21b364123acb818b77dac280945689dd6adedc84).
- Шаг 3/6: CODE — обязательные PR-проверки на каждом PR подключены в KONTUR Guard [88d72f2](https://github.com/mpaykin1/meta6-lab/commit/88d72f23cc2b7b15f5997d25fda2825e32e12aec).
- Шаг 4/6: CODE — проверка import/export по JS и мутации [156d830](https://github.com/mpaykin1/meta6-lab/commit/156d83077ab102726c9e18e81da4c94fd34325db).
- Шаг 5/6: CODE — обязательная регистрация добавленных games/demos/assets index.html [9db8dcf](https://github.com/mpaykin1/meta6-lab/commit/9db8dcf4c87e2473d9f837c1d39ed2d54305e297).
- Шаг 6/6: CODE — поддержка /meta6/ink/ и защитные случаи [d0f79eb](https://github.com/mpaykin1/meta6-lab/commit/d0f79ebf015286557a0684d12655a04ce5f65d73).
- Ветка: `lab/link-guard-recovery-1111`; статус: ЖДЁТ PR CI И LIVE 200; main ещё не изменён.

### lab/living-watercolor-owner-pass-reference — Living Watercolor 3D (OWNER PASS)
- Польза: одобренный эталон живой 3D-акварели; оригинальный код рендера и генераторов доступен для повторного использования.
- Смотреть: https://mpaykin1.github.io/meta6-lab/demos/living-watercolor/
- Источник: `demos/living-watercolor/` (main), исходники не изменены.
- Машинный паспорт: `shared/references/living-watercolor.json`, точные blob SHA.
- Live: https://github.com/mpaykin1/meta6-lab/actions/runs/43015257477/job/130504589418 — HTTP 200.
- Ветка: `lab/living-watercolor-owner-pass-reference`.
- Статус: OWNER PASS 11.11.2026; PR на добавление в эталоны; не считать отдельной игрой.
- Михаил: «Супер. Это пасс!! Добавь это к нам в эталоны на МГЛ».


### lab/asqura-ilya-reference-1109 — ASQURA OFFICE / Ilya version (Copy)
- Польза: исходная игра и её пиксельная изометрия сохранены байт-в-байт как эталон, доступен машинный паспорт.
- Играть после merge: https://mpaykin1.github.io/meta6-lab/games/asqura-ilya-reference/
- Источник: `games/asqura-ilya-reference/index.html`, blob `b7b7167b3fb48776b2c82433087cb13e867e5abb`.
- Каталог: `shared/references/asqura-ilya-reference.json`; 3D требует CDN Three.js r128.
- Ветка: `lab/asqura-ilya-reference-1109`; PR — см. ветку.
- Статус: В РАБОТЕ — Pages и бот ещё не подтверждены.
- Михаил: запросил включение в эталоны; оценку игры не дал.

### lab/rainbow-acceleration-reference-1109 — «Радужный разгон»
- Польза: неизменённый авторский эталон, 28 объектов галереи, игровые трассы, шейдеры, анимации и FX.
- Играть после merge: https://mpaykin1.github.io/meta6-lab/games/rainbow-acceleration/
- Исходник: `games/rainbow-acceleration/source-upload.html` (blob `8ebdbe4bb14291c77fb209a2f04a6a6c8920480b`).
- Просмотр: `games/rainbow-acceleration/index.html` (локальный Three.js вместо CDN).
- Каталог: `shared/references/rainbow-acceleration.json` (28 ассетов).
- Ветка: `lab/rainbow-acceleration-reference-1109`.
- Статус: В РАБОТЕ — PR и публикация Pages ещё не подтверждены; Михаил: вердикта «нравится» о запуске нет.

### lab/broken-city-copy-reference-1109 — «Сломанный город (Copy)»
- Польза: отдельный эталон с 3D-графикой, GLSL и галереей ассетов; основной Broken City не изменён.
- Играть: https://mpaykin1.github.io/meta6-lab/games/broken-city-copy/
- Оригинал: `games/broken-city-copy/source-upload.html`; SHA `e8815120498c15c744f393b5ed8a34bd3676e98e`.
- Рабочая версия: `games/broken-city-copy/index.html`; Three.js из соседнего эталона вместо CDN.
- Машинный каталог: `shared/references/broken-city-copy.json`.
- Ветка: `lab/broken-city-copy-reference-1109`; PR #180.
- Статус: В РАБОТЕ — Pages и прохождение ещё не подтверждены.
- Михаил: —; Claude: —


### lab/sumerki-i-pepel-2-uploaded-reference — эталон «Сумерки и пепел II (Copy)»
- Польза: исходная игра, графика и шейдеры доступны как неизменённый эталон для библиотеки.
- Играть после merge: https://mpaykin1.github.io/meta6-lab/games/sumerki-i-pepel-2-copy/
- Источник: `games/sumerki-i-pepel-2-copy/index.html`, blob `90d83a77049e8edb7aab847ecbbf4e9723a3c2e5`.
- Каталог: `shared/references/sumerki-i-pepel-2-copy.json`.
- Ветка: `lab/sumerki-i-pepel-2-uploaded-reference`; PR: https://github.com/mpaykin1/meta6-lab/pull/179
- Статус: В РАБОТЕ — оригинал сохранён; прохождение ботом и мобильная совместимость не подтверждены.
- Михаил: запросил загрузку как эталона, вердикта «нравится» о запуске не было; Claude: —.



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



### lab/ashen-path-asset-pack-original-1108 — эталон «Пепельный путь»
- Польза: доступен оригинальный интерактивный воксельный ассет-пак, его анимации, модели и исходный код.
- Открыть: https://mpaykin1.github.io/meta6-lab/games/ashen-path-asset-pack/
- Ветка: `lab/ashen-path-asset-pack-original-1108`.
- Исходники: `games/ashen-path-asset-pack/index.html`, `source.md`, `README.md`.
- Каталог: `shared/references/ashen-path-asset-pack.json`.
- Статус: ИСХОДНИК В БИБЛИОТЕКЕ; мобильная проверка не заявлена.
- Михаил: передан владельцем как эталон 08.11.2026.
