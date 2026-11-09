# Библиотека-станок META GAMES (L1, часть 1)

- Источник истины — исходные файлы в `games/*` и пять путей из таблицы `META_GAMES_SOURCE_ALLOWLIST.md`.
- `node scripts/library/extract-all.mjs` — обнаружить все папки, перепостроить манифесты и глобальный индекс.
- `node scripts/library/extract.mjs games/<название>` — проверить путь и переиндексировать библиотеку.
- Выход: `shared/library/<game>.json`, `shared/library/index.json`, бинарные точные копии в `shared/library/assets/`.
- В индексах: исходный путь, тип, назначение, диапазон строк и SHA-256; никакой перерисовки.
- Файлы .glb/.gltf/.png/.webp/.jpg/.mp3/.ogg/.wav/.json и дополнительные SVG, шрифты, bin — как файловые ассеты.
- `<style>`, SVG, data-URI, base64, таблицы и GLSL — как встроенные ассеты, с хешем исходных строк.
- Функции, классы, модули и inline-скрипты — решения; теги определяются именем символа.
- Общий предел точных копий — 50 МиБ; остальные записи содержат исходный путь и SHA-256.
- Существующие `shared/index.json` и `shared/asset-library/catalog.json` не перезаписываются.
- Добавить тип файла: расширение в `ASSET_EXT` в `scripts/library/machine.mjs` и независимую проверку расширения в `verify-library.mjs`.
- Добавить решение: правило распознавания в `scan()` и purpose-тег в `tags()`; новые данные обязаны ссылаться на исходные строки.
- Поиск без чтения целой игры: `node scripts/library/search.mjs --game=veil-terraces --kind=solution --purpose=camera`.
- Проверка: `node scripts/library/verify-library.mjs`.
- Мутации (включая подмену другой игрой): `node scripts/library/mutate-library.mjs`.
- GitHub Actions: `library-machine.yml` индексирует новые игры на ветке и предлагает отдельный PR для изменений после merge в main.
