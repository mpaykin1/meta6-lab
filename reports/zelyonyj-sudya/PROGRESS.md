# Зелёный судья — META BOT на main

Источник: [workflow](https://github.com/mpaykin1/meta6-lab/blob/main/.github/workflows/meta-bot.yml), [код перечисления игр](https://github.com/mpaykin1/meta6-lab/blob/main/scripts/meta-bot/run.mjs), [последний подтверждённый запуск на main](https://github.com/mpaykin1/meta6-lab/actions/runs/42982185772). Исходный SHA прогона: `43859e2676ab681bbc4e63cf81283126e4bfbb20` (11.11.2026 07:48 UTC). Проверка каталога: [`meta-games/index.html`](https://github.com/mpaykin1/meta6-lab/blob/main/meta-games/index.html). Не принимать статус PASS без зелёного прогона META BOT на main после слияния исправления.

| Игра | Бот подключён? | Результат (PASS / ошибка, уровень) | PR | Ссылка на прогон |
|---|---|---|---|---|
| `games/archer-in-the-fog/` | нет | НЕ ПРОВЕРЕНО: нет конфигурации/ручки META BOT | — | — |
| `games/asqura-ilya-reference/` | нет | НЕ ПРОВЕРЕНО: нет конфигурации/ручки META BOT | — | — |
| `games/broken-city-copy/` | нет | НЕ ПРОВЕРЕНО: нет конфигурации/ручки META BOT | — | — |
| `games/broken-city/` | нет | НЕ ПРОВЕРЕНО: нет конфигурации/ручки META BOT | — | — |
| `games/rainbow-acceleration/` | нет | НЕ ПРОВЕРЕНО: нет конфигурации/ручки META BOT | — | — |
| `games/skin-trainer/` | нет | НЕ ПРОВЕРЕНО: нет конфигурации/ручки META BOT | — | — |
| `games/sumerki-i-pepel-2-copy/` | нет | НЕ ПРОВЕРЕНО: нет конфигурации/ручки META BOT | — | — |
| `games/sumerki-i-pepel-2/` | нет | НЕ ПРОВЕРЕНО: нет конфигурации/ручки META BOT | — | — |
| `games/twilight-isle-classic/` | нет | НЕ ПРОВЕРЕНО: нет конфигурации/ручки META BOT | — | — |
| `games/twilight-isles/` | нет | НЕ ПРОВЕРЕНО: нет конфигурации/ручки META BOT | — | — |
| `games/veil-terraces/` | да | **FAIL на main** [42982185772](https://github.com/mpaykin1/meta6-lab/actions/runs/42982185772). **PASS только PR**: META BOT [43012984334](https://github.com/mpaykin1/meta6-lab/actions/runs/43012984334), focused BOT [43012984307](https://github.com/mpaykin1/meta6-lab/actions/runs/43012984307) на `50bba9b`. После безопасного слияния свежего `main` в игровую ветку [13d85bb](https://github.com/mpaykin1/meta6-lab/commit/13d85bbf4e324cb01729c8a8464bf73364889a74) Library Machine повторно добавил 2 посторонних файла [02ba0f5](https://github.com/mpaykin1/meta6-lab/commit/02ba0f5812afcae9467cdefa5cb7f3b381f6ee2f). Новый META BOT [43018578169](https://github.com/mpaykin1/meta6-lab/actions/runs/43018578169) = `action_required`; STOROZHA [43012984349](https://github.com/mpaykin1/meta6-lab/actions/runs/43012984349) FAIL HTTP 403 rate limit. PASS после слияния на main отсутствует | [#245](https://github.com/mpaykin1/meta6-lab/pull/245), [блокер для Claude](https://github.com/mpaykin1/meta6-lab/blob/main/DLYA_CLAUDE.md) | [PR BOT PASS](https://github.com/mpaykin1/meta6-lab/actions/runs/43012984334), [focused PASS](https://github.com/mpaykin1/meta6-lab/actions/runs/43012984307), [новый action_required](https://github.com/mpaykin1/meta6-lab/actions/runs/43018578169) |
| `observer-world-en-v7/` (витрина: Twilight Island) | нет — вне `games/` | НЕ ПРОВЕРЕНО: `run.mjs` обходит только `games/` | — | — |
| `ashen-sumerek/` (витрина: Ashen Path) | нет — вне `games/` | НЕ ПРОВЕРЕНО: `run.mjs` обходит только `games/` | — | — |
| `underwater-world/` (витрина: Underwater World) | нет — вне `games/` | НЕ ПРОВЕРЕНО: `run.mjs` обходит только `games/` | — | — |
| `three-worlds-game/` (витрина: Three Worlds) | нет — вне `games/` | НЕ ПРОВЕРЕНО: `run.mjs` обходит только `games/` | — | — |

**Покрытие:** 1 из 15 уникальных игровых путей (11 папок `games/` и ещё 4 игры витрины вне `games/`). **Подтверждённых PASS на main:** 0 из 15. У `veil-terraces` desktop проходил 6/6 в [старом красном прогоне](https://github.com/mpaykin1/meta6-lab/actions/runs/42982185772), но mobile провалился, поэтому это не PASS.

**Порядок ремонта:** `games/veil-terraces/` (PR #245 упёрся в защищённую автоматику и `action_required`; не сливать до устранения), затем 10 неподключённых папок `games/`, затем 4 игровых пути витрины, не охваченные текущим обнаружением. Исключение тестов, порогов и правок `scripts/meta-bot/` нет.

**Критерий завершения:** два последовательных зелёных прогона META BOT на `main` при полном охвате; каждая строка либо PASS со ссылкой на зелёный прогон `main` после слияния, либо конкретная запись в `DLYA_CLAUDE.md`.
