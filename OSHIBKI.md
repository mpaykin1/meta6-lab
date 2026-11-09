# OSHIBKI — журнал ошибок и вечных ловушек

Правило: [КОНТУР БЕЗ ОШИБОК](rules/06-rabota-ii-s-kodom/KONTUR_BEZ_OSHIBOK.md) К3. Новые строки — снизу. Строка без ловушки = ошибка не исправлена.

| # | Дата | Ошибка | Как поймали | Ловушка (путь к тесту) |
|---|---|---|---|---|
| 1 | 09.11.2026 | PR #178: MCP прятал `list_games` от клиентов без `protocolVersion` (флаг `legacyClient`), чтобы старый тест с 4 инструментами остался зелёным — подгонка кода под тест (К4.1) | Ловушка Claude: `initialize` без `protocolVersion` → в `tools/list` нет `list_games` | `scripts/shared/mutate-mcp-list-games.mjs`, мутация `hide-unversioned-tool` — есть (cd95fa2) |
| 2 | 09.11.2026 | PR #178: проверка `verify-mcp-list-games.mjs` не ловила захардкоженный список игр (К4.2) | Ловушка Claude: тело `listGames()` заменено готовым массивом — проверка осталась зелёной | `scripts/shared/mutate-mcp-list-games.mjs`, мутация `hardcoded-games` — есть (cd95fa2) |
| 3 | 09.11.2026 | PR #178: проверка запускала MCP-сервер только из корня репозитория — сервер, читающий файлы от текущей папки, проходил, хотя у реальных ИИ-клиентов он сломался бы | Ловушка Claude (К10): `listGames()` читает `process.cwd()+'/meta-games/index.html'` — проверка осталась зелёной | `scripts/shared/mutate-mcp-list-games.mjs`, мутация `cwd-dependent` — есть (abcaa0b) |
