# ДИСПЕТЧЕР МГ/МГЛ

Итог: зависло 5 · конфликт 3 · непроверено 0 · красные проверки 1 · нужен Claude 26

### PR #221
- PR: https://github.com/mpaykin1/meta6-lab/pull/221
- Ветка: `lab/zadachi-tolkach`
- SHA: `757890f0aa4809e92d3466c55a1db98269f133e6` · последний коммит: 2026-11-10T08:48:21Z
- Проблема: Конфликт с main
- Задание: Смержи актуальный main в ветку. Разреши файлы из git diff --name-only --diff-filter=U и перезапусти CI.
- Взял: MG-строитель-1 2026-11-11T07:08:00Z
- НУЖЕН CLAUDE: PR изменяет защищённые `.github/workflows/zadachi-watch.yml` и `scripts/zadachi/`; самостоятельное слияние запрещено.

### PR #228
- PR: https://github.com/mpaykin1/meta6-lab/pull/228
- Ветка: `lab/game-design-expertise-audit-20261110`
- SHA: `777e647ee135af1d15a81d437ae251fb6e4930da` · последний коммит: 2026-11-11T06:51:19Z
- Проблема: Конфликт с main
- Задание: Смержи актуальный main в ветку. Разреши файлы из git diff --name-only --diff-filter=U и перезапусти CI.
- Взял: чат ChatGPT — Рабочий чат МГ/МГЛ 2026-11-11T06:49:50Z

### PR #237
- PR: https://github.com/mpaykin1/meta6-lab/pull/237
- Ветка: `lab/chat-pr-queue-1111`
- SHA: `d0f838f452ac64f8ef296c9faa4c27e35c6a7e50` · последний коммит: 2026-11-11T06:25:01Z
- Проблема: Конфликт с main
- Задание: Смержи актуальный main в ветку. Разреши файлы из git diff --name-only --diff-filter=U и перезапусти CI.
- Взял: чат ChatGPT 2026-11-11T06:58:22Z

### PR #132
- PR: https://github.com/mpaykin1/meta6-lab/pull/132
- Ветка: `lab/cycle5-archer-meta-adfree-1108`
- SHA: `0578f035b4e0092de6a3aa5ef788d66413e07e4e` · последний коммит: 2026-11-10T21:49:15Z
- Проблема: Красная проверка: mutate-kontur-guard (https://github.com/mpaykin1/meta6-lab/actions/runs/42908743176/job/130153488252), mutate-kontur-guard (https://github.com/mpaykin1/meta6-lab/actions/runs/42908732928/job/130153466790), bot (https://github.com/mpaykin1/meta6-lab/actions/runs/42908733267/job/130153453440), library-machine (https://github.com/mpaykin1/meta6-lab/actions/runs/42908732957/job/130153452894), changed-games (https://github.com/mpaykin1/meta6-lab/actions/runs/42908733024/job/130153452778), verify-storefront (https://github.com/mpaykin1/meta6-lab/actions/runs/42908732934/job/130153452132)
- Задание: Исправь mutate-kontur-guard по логу https://github.com/mpaykin1/meta6-lab/actions/runs/42908743176/job/130153488252 и повтори CI.
- Взял: чат ChatGPT — Рабочий чат МГ/МГЛ 2026-11-11T07:27:58Z

### PR #222
- PR: https://github.com/mpaykin1/meta6-lab/pull/222
- Ветка: `lab/ci-ochered-concurrency`
- SHA: `029164aebd1b34edf406a147b0af7b080f9e16ae` · последний коммит: 2026-11-10T08:53:27Z
- Проблема: 🛑 ЗАВИС
- Задание: Продолжи работу по PR, проверь CI и доведи до слияния.
- Взял: MG-строитель-2 2026-11-11T07:17:00Z
- НУЖЕН CLAUDE: PR изменяет 21 защищённый workflow, включая оба охранника; самостоятельное слияние запрещено.

### PR #233
- PR: https://github.com/mpaykin1/meta6-lab/pull/233
- Ветка: `lab/import-five-cc0-packs`
- SHA: `0ae6fcc6008e59f9304e65f1f8f5ee67ecac3827` · последний коммит: 2026-11-10T10:38:05Z
- Проблема: 🛑 ЗАВИС
- Задание: Продолжи работу по PR, проверь CI и доведи до слияния.
- Взял: чат ChatGPT 2026-11-11T07:02:06Z

### PR #16
- PR: https://github.com/mpaykin1/meta6-lab/pull/16
- Ветка: `lab/readiness-evidence-gates`
- SHA: `efc33f33e8f70ddb18020256b26eaa361011f1a5` · последний коммит: 2026-11-07T02:44:44Z
- Проблема: 💤 ЗАБРОШЕНО более 2 суток
- Задание: Закрой устаревший PR с причиной в OSHIBKI.md либо доведи его.
- Взял: MG-строитель-3 2026-11-11T07:29:00Z

## НУЖЕН CLAUDE
- [#190](https://github.com/mpaykin1/meta6-lab/pull/190) PR #190: разрешить конфликт с main и повторить CI
- [#191](https://github.com/mpaykin1/meta6-lab/pull/191) Эталон «Затонувший город»: исходный ZIP, 3D-витрина и каталог ассетов
- [#200](https://github.com/mpaykin1/meta6-lab/pull/200) Довести PR #200 (B2 ч.2) до зелёных проверок и слияния
- [#209](https://github.com/mpaykin1/meta6-lab/pull/209) Библиотека игр: эталоны, системы, ассеты и MCP
- [#54](https://github.com/mpaykin1/meta6-lab/pull/54) Оптимизация всех игр: довести PR #54, #59, #60
- [#134](https://github.com/mpaykin1/meta6-lab/pull/134) ABYSS GLOW — второй эталон графики и анимации
- [#133](https://github.com/mpaykin1/meta6-lab/pull/133) Довести PR #133: эталон графики Asqura
- [#202](https://github.com/mpaykin1/meta6-lab/pull/202) Эталон: Лучник в тумане — исходный HTML владельца
- [#189](https://github.com/mpaykin1/meta6-lab/pull/189) Синхронизировать PR #189 с main, сохранить эталон Golden Knight и проверить CI
- [#207](https://github.com/mpaykin1/meta6-lab/pull/207) Эталон: Король Пепла — исходная игра и каталог 34 ассетов
- [#210](https://github.com/mpaykin1/meta6-lab/pull/210) SKIN FACTORY: ножницы и ловушки для parts-sheet
- [#220](https://github.com/mpaykin1/meta6-lab/pull/220) Сторож таблицы: конфликты, красные проверки и МГ
- [#3](https://github.com/mpaykin1/meta6-lab/pull/3) Разблокировать проверки PR #3 Twilight Island
- [#218](https://github.com/mpaykin1/meta6-lab/pull/218) РЕМОНТ R1: пересборка библиотеки и исключение копий
- [#208](https://github.com/mpaykin1/meta6-lab/pull/208) Restore original Ashen Path asset pack reference after sync
- [#204](https://github.com/mpaykin1/meta6-lab/pull/204) B6/B7 ч.1: бот правил — тренажёр, экран и звуковой мастер
- [#192](https://github.com/mpaykin1/meta6-lab/pull/192) M6
- [#203](https://github.com/mpaykin1/meta6-lab/pull/203) Устранить конфликт PR #203 с main
- [#205](https://github.com/mpaykin1/meta6-lab/pull/205) Пульт владельца
- [#201](https://github.com/mpaykin1/meta6-lab/pull/201) PR #201: проверить эталон и ограничения слияния
- [#193](https://github.com/mpaykin1/meta6-lab/pull/193) К7
- [#219](https://github.com/mpaykin1/meta6-lab/pull/219) A1: STATUS.md — автоматический краткий статус МГЛ
- [#235](https://github.com/mpaykin1/meta6-lab/pull/235) Неподвижный экран при джойстике — все игры МГЛ
- [#225](https://github.com/mpaykin1/meta6-lab/pull/225) Broken City: чистый PR оптимизации вместо #60
- [#129](https://github.com/mpaykin1/meta6-lab/pull/129) fix(meta): Twilight Isles 2 plays without ads, with free revival
- [#131](https://github.com/mpaykin1/meta6-lab/pull/131) META GAMES: 10 эталонов графики и анимации из оригиналов владельца
