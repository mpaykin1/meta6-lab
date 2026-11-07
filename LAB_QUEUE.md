# LAB_QUEUE — очередь идей песочницы

Формат карточки и правила: [automation/prompts/meta6-lab-sandbox.md](automation/prompts/meta6-lab-sandbox.md) §5. Новые карточки — сверху, не длиннее 15 строк. «Михаил» — только его слова. «ЗАБРАНО → SHA» ставит только Claude.

Бот для карточки: ссылка на прогон `META BOT` на PR `lab/<имя>` → `main` в этом репозитории.

<!-- карточки ниже -->

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

