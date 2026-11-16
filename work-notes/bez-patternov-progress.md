# БЕЗ ПАТТЕРНОВ — прогресс

Дата: 2026-11-13 UTC. Ветка: `lab/bez-patternov-20261113`.

- [x] Прочитаны AGENTS.md в МГ/МГЛ, ink.md; задача добавлена в ZADACHI.md.
- [x] INK: seeded 3D FBM + warp, без бумажной плитки 7×7 — e6ec18b6b6a1b849cd03ded48570ca720268c9ce.
- [x] Правило, рецепт INK и статический сторож: `scripts/visual/verify-no-patterns.mjs`, 5 мутаций в `mutate-no-patterns.mjs`. [Статический CI PASS](https://github.com/mpaykin1/meta6-lab/actions/runs/43416850310).
- [ ] Chromium + FFT реализованы (`capture-pattern-frames.mjs`, `measure-pattern-fft.py`, `mutate-pattern-fft.py`); реальная BEFORE/AFTER-калибровка и 3 скриншота ещё не выполнены.
- [x] Обновлены `shared/references/living-watercolor.json` (shader blob 3c3436d...) и `OSHIBKI.md`; `ink-fallen-guardian.json` существует только в ожидающем PR #283.
- [ ] [PR #290](https://github.com/mpaykin1/meta6-lab/pull/290) открыт; статический CI PASS; браузерный FFT, глобальные guard и публикация ещё не подтверждены.
- [ ] Передать изменение защищённого `meta6` владельцу/Claude через PR МГЛ.
- [ ] Далее: по одной игре на PR, с визуальным сравнением.

2026-11-13: shader blob 3c3436d066ab047780e63a0092b9217be1befc4d.

2026-11-13: [старый KONTUR](https://github.com/mpaykin1/meta6-lab/actions/runs/43416850242) потребовал OSHIBKI.md; строка добавлена (681a9f1). STOROZHA reference изначально заблокирован API 403; квота PR тоже красная. Не считать merge/публикацию доказанными.

2026-11-13: устранил повтор 7×7 сохранением масштаба штрихов на уникальном 896px листе; final shader blob 3c3436d066ab047780e63a0092b9217be1befc4d, паспорт обновлён (412796d7635ec42be606c8edac3f21296ec78a6c). Визуальный job в CI добавлен и 3 синтетические FFT ловушки готовы (b1cda7b585f6f25f5c95e4f35d19f4b64d54ec0c), но нет green-run на актуальном HEAD. Паспорт Павшего великана доступен лишь в ветке PR #283, в main отсутствует; МГ read-only по AGENTS.
2026-11-13: Указание по защищённому МГ и ожидающему паспорту «Павшего великана» добавлено в DLYA_CLAUDE.md: ddf1173874d2657afe97b478229f72d8ce56ce4d.
2026-11-13: Новый визуальный тип повтора — строго вертикальные/горизонтальные полосы. Исправлена FFT-маска частотных осей (2316995dba95329d4090c7f36998ad684e5f74a4), добавлена постоянная мутация vertical-wallpaper (ad6088b835428229b3c7ecae06ce408de09aab65); локальные синтетические проверки: чистый шум score 0.116222, осевые полосы 0.647159 (условная граница 0.38); не подменять ими настоящие скриншоты INK.

2026-11-15: продолжено по PR #290 без нового PR. Новая ловушка: уникальность всех трёх ракурсов по попарному среднему отклонению яркости в центральной области >= 2.5, иначе FAIL. Исправлено сравнение каждой пары (f57374c8); 3 мутации, в том числе обман «один другой кадр, два одинаковых», добавлены (8c69182c). Журнал ошибок дополнен. Синтетические мутации ещё требуют подтверждения CI на текущем SHA; реальных BEFORE/AFTER FFT скриншотов нет; не считать визуальным PASS. Следующий шаг — прогон Actions/артефакты и затем перенос в МГ по доступу владельца/Claude.

2026-11-15: по каталогу `meta-games/index.html` обнаружены невидимые сканеру корневые игры: `ashen-sumerek/`, `underwater-world/`, `observer-world-en-v7/`, `three-worlds-game/`. Сканер расширен из каталога (4a62feba), workflow paths на root JS/HTML/GLSL (68465d4f), мутации проверяют 4 включения и 3 исключения (6a0fd89b). Реальные CI на текущем HEAD и FFT-калибровка ещё не подтверждены.
2026-11-15: синхронный перенос INK на МГ в [PR #324](https://github.com/mpaykin1/meta6/pull/324), head e4f0e9a6da7d496a7978f9f9a23360fa73b38982. Шейдер МГ и МГЛ byte-identical SHA 3c3436d066ab047780e63a0092b9217be1befc4d; обновлены паспорт, AGENTS, ink.md и правило. МГ `main` не менялся; PR остаётся draft до проверок.

2026-11-15: после исправлений [STOROZHA #43748649829](https://github.com/mpaykin1/meta6-lab/actions/runs/43748649829) — success на 2ea0bf12; на МГ [META GAMES guard #43748214259](https://github.com/mpaykin1/meta6/actions/runs/43748214259) — success на e4f0e9a6. Workflow BEZ PATTERNOV на последнем HEAD ещё не запускался; артефактов трёх снимков и реальных BEFORE/AFTER FFT нет. PR #290 и МГ #324 draft, публикация исправленного эталона не подтверждена. Паспорта «Павшего великана» из PR #283 в ветке #290 по-прежнему нет; не подменять его фиктивным паспортом.

2026-11-16: продолжение PR #290. Закрыт обход статического запрета плитки: единый `texture.rotation` не уничтожает repeat > 2, даже с seed; текстовый `macroVariation` в комментарии больше не маскирует повтор. Guard [285f679](https://github.com/mpaykin1/meta6-lab/commit/285f679b079dbedee674f1522deccdfbd0091646), 3 новые мутации + clean-кейс [a830067](https://github.com/mpaykin1/meta6-lab/commit/a830067194eeff1d8f07803dbdcd59608b8de139), журнал [b421599](https://github.com/mpaykin1/meta6-lab/commit/b421599c873f3984d323e62bcf229b9e872bdc25). Локальная проверка логики новых выражений дала 3 отклонения и 1 разрешённый вариант; полный Node/Actions CI после последнего коммита не подтверждён. Реальная FFT-калибровка BEFORE/AFTER и 3 ракурса всё ещё не произведены; не объявлять visual PASS. Новый workflow `bez-patternov.yml` отсутствует на main, на ветке пока нет его run. Далее: добиваться фактического браузерного прогона, не ослабляя guard; затем один мир на PR.

2026-11-16: Путь запуска через существующий `game-browser-check.yml`: `bez-patternov.yml` объявлен reusable (`workflow_call`) в [2d2a52b](https://github.com/mpaykin1/meta6-lab/commit/2d2a52b2ddd0c39119ba473bfc5e7cd8e8db3cba), а существующий PR-browser workflow вызывает его отдельным job `no-patterns`, расширены paths для INK и сканера ([0a74e58](https://github.com/mpaykin1/meta6-lab/commit/0a74e5855df6f3cd09fbab9d8a5066bd8bfd9254)). Фактический `game-browser-check`/`BEZ PATTERNOV` Actions run на HEAD пока не обнаружен, и FFT-чисел по реальным кадрам нет. Не считать job успешным до реального run.

2026-11-16: следующий цикл — найден новый статический обход плиточного guard через `texture.repeat.setScalar(7)` и присваивания `texture.repeat.x/y = 7`. `verify-no-patterns.mjs` теперь отклоняет оба способа, сохраняя требование исполняемого macro-blend. [27bcc887](https://github.com/mpaykin1/meta6-lab/commit/27bcc88713085db49e2005f656f8ab89265b1df4). Ловушки, OSHIBKI и CI ещё требуется добавить/подтвердить.
