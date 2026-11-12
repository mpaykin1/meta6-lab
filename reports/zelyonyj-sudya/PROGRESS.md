# Зелёный судья — META BOT на main

**СЛЕДУЮЩИЙ ШАГ: PR #245, ветка `lab/remont-main-veil-terraces`, HEAD `02ba0f5812afcae9467cdefa5cb7f3b381f6ee2f`: проверить, снят ли `action_required` для META BOT [43018578169](https://github.com/mpaykin1/meta6-lab/actions/runs/43018578169) и перестала ли Library Machine повторно менять два файла `shared/library/`; только после всех зелёных проверок и устранения смешанных изменений — squash PR, затем два META BOT на main. При сохранении блокировки — Claude, новых попыток HTTP 403 не делать (лимит 2/2).**

Источник: [workflow](https://github.com/mpaykin1/meta6-lab/blob/main/.github/workflows/meta-bot.yml), [код перечисления игр](https://github.com/mpaykin1/meta6-lab/blob/main/scripts/meta-bot/run.mjs), [последний подтверждённый запуск на main](https://github.com/mpaykin1/meta6-lab/actions/runs/42982185772). Исходный SHA прогона: `43859e2676ab681bbc4e63cf81283126e4bfbb20` (11.11.2026 07:48 UTC). Проверка каталога: [`meta-games/index.html`](https://github.com/mpaykin1/meta6-lab/blob/main/meta-games/index.html). Не принимать статус PASS без зелёного прогона META BOT на main после слияния исправления.

| Игра | Бот подключён? | Результат (PASS / ошибка, уровень) | PR | Ссылка на прогон | Попытки по причинам |
|---|---|---|---|---|---|
| `games/archer-in-the-fog/` | нет | НЕ ПРОВЕРЕНО: нет конфигурации/ручки META BOT | — | — | 0 — ремонт не начат |
| `games/asqura-ilya-reference/` | нет | НЕ ПРОВЕРЕНО: нет конфигурации/ручки META BOT | — | — | 0 — ремонт не начат |
| `games/broken-city-copy/` | нет | НЕ ПРОВЕРЕНО: нет конфигурации/ручки META BOT | — | — | 0 — ремонт не начат |
| `games/broken-city/` | нет | НЕ ПРОВЕРЕНО: нет конфигурации/ручки META BOT | — | — | 0 — ремонт не начат |
| `games/rainbow-acceleration/` | нет | НЕ ПРОВЕРЕНО: нет конфигурации/ручки META BOT | — | — | 0 — ремонт не начат |
| `games/skin-trainer/` | нет | НЕ ПРОВЕРЕНО: нет конфигурации/ручки META BOT | — | — | 0 — ремонт не начат |
| `games/sumerki-i-pepel-2-copy/` | нет | НЕ ПРОВЕРЕНО: нет конфигурации/ручки META BOT | — | — | 0 — ремонт не начат |
| `games/sumerki-i-pepel-2/` | нет | НЕ ПРОВЕРЕНО: нет конфигурации/ручки META BOT | — | — | 0 — ремонт не начат |
| `games/twilight-isle-classic/` | нет | НЕ ПРОВЕРЕНО: нет конфигурации/ручки META BOT | — | — | 0 — ремонт не начат |
| `games/twilight-isles/` | нет | НЕ ПРОВЕРЕНО: нет конфигурации/ручки META BOT | — | — | 0 — ремонт не начат |
| `games/veil-terraces/` | да | **FAIL на main** [42982185772](https://github.com/mpaykin1/meta6-lab/actions/runs/42982185772). **PASS только PR**: META BOT [43012984334](https://github.com/mpaykin1/meta6-lab/actions/runs/43012984334), focused BOT [43012984307](https://github.com/mpaykin1/meta6-lab/actions/runs/43012984307) на `50bba9b`. После безопасного слияния свежего `main` в игровую ветку [13d85bb](https://github.com/mpaykin1/meta6-lab/commit/13d85bbf4e324cb01729c8a8464bf73364889a74) Library Machine повторно добавил 2 посторонних файла [02ba0f5](https://github.com/mpaykin1/meta6-lab/commit/02ba0f5812afcae9467cdefa5cb7f3b381f6ee2f). Новый META BOT [43018578169](https://github.com/mpaykin1/meta6-lab/actions/runs/43018578169) = `action_required`; STOROZHA [43012984349](https://github.com/mpaykin1/meta6-lab/actions/runs/43012984349) FAIL HTTP 403 rate limit. PASS после слияния на main отсутствует | [#245](https://github.com/mpaykin1/meta6-lab/pull/245), [блокер для Claude](https://github.com/mpaykin1/meta6-lab/blob/main/DLYA_CLAUDE.md) | [PR BOT PASS](https://github.com/mpaykin1/meta6-lab/actions/runs/43012984334), [focused PASS](https://github.com/mpaykin1/meta6-lab/actions/runs/43012984307), [новый action_required](https://github.com/mpaykin1/meta6-lab/actions/runs/43018578169) | маршрут: 1 PASS ([43012984334](https://github.com/mpaykin1/meta6-lab/actions/runs/43012984334)); HTTP 403: 2/2 ([43012984349](https://github.com/mpaykin1/meta6-lab/actions/runs/43012984349)); `action_required`: 0 |
| `observer-world-en-v7/` (витрина: Twilight Island) | нет — вне `games/` | НЕ ПРОВЕРЕНО: `run.mjs` обходит только `games/` | — | — | 0 — ремонт не начат |
| `ashen-sumerek/` (витрина: Ashen Path) | нет — вне `games/` | НЕ ПРОВЕРЕНО: `run.mjs` обходит только `games/` | — | — | 0 — ремонт не начат |
| `underwater-world/` (витрина: Underwater World) | нет — вне `games/` | НЕ ПРОВЕРЕНО: `run.mjs` обходит только `games/` | — | — | 0 — ремонт не начат |
| `three-worlds-game/` (витрина: Three Worlds) | нет — вне `games/` | НЕ ПРОВЕРЕНО: `run.mjs` обходит только `games/` | — | — | 0 — ремонт не начат |


**Сверка подключений 11.11.2026:** на `main` [`8a37e692`](https://github.com/mpaykin1/meta6-lab/commit/8a37e6927b95da79964017afc89084adc74887aa) повторно найдены 11 папок `games/`: у 10 нет `bot.json`, `bot-strategy.mjs` и строки `__META_BOT__` в `index.html`; у `veil-terraces` есть все три. В [`meta-games/index.html`](https://github.com/mpaykin1/meta6-lab/blob/8a37e6927b95da79964017afc89084adc74887aa/meta-games/index.html) также 4 пути игр вне `games/`, не охватываемых `run.mjs`. Новых игр к карте не добавилось.

**Покрытие:** 1 из 15 уникальных игровых путей (11 папок `games/` и ещё 4 игры витрины вне `games/`). **Подтверждённых PASS на main:** 0 из 15. У `veil-terraces` desktop проходил 6/6 в [старом красном прогоне](https://github.com/mpaykin1/meta6-lab/actions/runs/42982185772), но mobile провалился, поэтому это не PASS.

**Порядок ремонта:** `games/veil-terraces/` (PR #245 упёрся в защищённую автоматику и `action_required`; не сливать до устранения), затем 10 неподключённых папок `games/`, затем 4 игровых пути витрины, не охваченные текущим обнаружением. Исключение тестов, порогов и правок `scripts/meta-bot/` нет.

**Критерий завершения:** два последовательных зелёных прогона META BOT на `main` при полном охвате; каждая строка либо PASS со ссылкой на зелёный прогон `main` после слияния, либо конкретная запись в `DLYA_CLAUDE.md`.

## УРОКИ

- `run.mjs` проверяет только `games/` с `bot-strategy.mjs`, `bot.json` или `__META_BOT__`; успешный общий прогон **не** означает охват остальных игр.
- `action_required` без выполненных jobs — не игровая ошибка и не PASS; сначала снять блокировку GitHub, не ослабляя проверок.
- Автоматический Library Machine после коммита восстановил `shared/library/*` в игровом PR; повторная очистка без устранения причины не помогает. ([02ba0f5](https://github.com/mpaykin1/meta6-lab/commit/02ba0f5812afcae9467cdefa5cb7f3b381f6ee2f))
