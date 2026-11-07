# БЕЗ РЕКЛАМЫ — игры META GAMES публикуются без встроенной рекламы

**Решение владельца 07.11.2026. Обязательно для Claude, ChatGPT, Codex и всех агентов.**

Простыми словами: в META GAMES игрок просто играет. Реклама живёт только в версиях для Playgama.

## 1. Где действует

Все версии игр, которые попадают в META GAMES: веб-каталог `meta-games/`, папки `games/<игра>/`, `meta-games-worlds/<игра>/`, сборки Android (Google Play) и Steam из `platforms/`.

## 2. Что запрещено в версии META GAMES

1. Любой рекламный код: вызовы `advertisement.showInterstitial`, `showRewarded`, `showBanner`, рекламные SDK, рекламные скрипты и iframe.
2. Подключение `playgama-bridge.js` и других SDK площадок с рекламой.
3. Кнопки и награды «за просмотр рекламы» (возрождение за рекламу, бонус за рекламу и т.п.).
4. Сетевые запросы к рекламным доменам (playgama ads, googlesyndication, doubleclick и подобные).

## 3. Как делать правильно

1. Версия для Playgama и версия для META GAMES — **две разные папки**. Версию Playgama не трогать, она по-прежнему подчиняется RETENTION R1–R11.
2. В версии META GAMES рекламный код **удалить полностью**, а не прятать. Если игре нужен объект площадки (сохранения, язык), подключить заглушку без рекламы из библиотеки `shared/` (`no-ads-bridge`), в которой нет ни одного рекламного метода, который что-то показывает.
3. То, что раньше давалось «за рекламу», становится бесплатным и понятным (правило ПОНЯТНАЯ ПОЛЬЗА): например, одно бесплатное возрождение за забег. Без текста на экране (ЧИСТЫЙ ЭКРАН).
4. Ничего другого в игре не менять (НЕ МЕНЯТЬ НЕЗАПРОШЕННОЕ). Инвентаризация до и после: было N, осталось N, потеряно 0.

## 4. Проверка (обязательна перед публикацией в META GAMES)

1. Поиск по подключённым скриптам версии META GAMES не находит `showInterstitial|showRewarded|showBanner|playgama-bridge`.
2. Браузерный прогон 60 с: ноль запросов к рекламным доменам.
3. META BOT зелёный (телефон 390×844, ПК, второй заход).
4. Доказательства: PR, SHA, прогон Actions (правило [ОТЧЁТЫ ДЛЯ CLAUDE](../06-rabota-ii-s-kodom/OTCHETY_DLYA_CLAUDE.md)).

## 5. Игры, которые нужно очистить сейчас (загружены Claude 06.11.2026 с рекламой Playgama)

| Игра | Папка в META GAMES | Что найдено |
| --- | --- | --- |
| Archer in the Fog | `games/archer-in-the-fog/` | playgama-bridge.js, рекламные вызовы в src/ и сборке |
| Twilight Isle Classic | `games/twilight-isle-classic/` | playgama-bridge.js, вызовы в index.html |
| Twilight Isles 2 | `games/twilight-isles/` | playgama-bridge.js, вызовы в index.html |
| Broken City | `games/broken-city/` | showInterstitial, showRewarded (возрождение за рекламу) |

Очистку делает ChatGPT в песочнице `meta6-lab` (правило ПЕСОЧНИЦА), в `meta6` переносит Claude.
