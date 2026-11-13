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
