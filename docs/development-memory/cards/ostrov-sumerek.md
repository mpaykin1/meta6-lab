# Карточка опыта: ostrov-sumerek

Краткая выборка; все исходные записи сохранены в ../events.jsonl.
При конфликте не выбирай победителя по дате: проверь обе ссылки, запиши новую запись с supersedes.

## animation/emergence-alpha
- 2026-10-21 · failure · technical · 2026-10-21-world-lesson-2
- **Наблюдение:** Попадание во время всплытия могло остановить проявление врага на alpha<0.6.
- **Применять:** Отделять visual alpha от состояния AI; проверять hit во время rise и выход на полную видимость.
- **Источник:** [доказательство](https://github.com/mpaykin1/World_server/blob/567a48442ed1dee39e2baad87df2df998b231f95/games/ostrov-sumerek/docs/ERRORS.md) · SHA 567a48442ed1dee39e2baad87df2df998b231f95

## animation/stop-orbit-damp
- 2026-10-21 · failure · technical · 2026-10-21-world-lesson-3
- **Наблюдение:** Крылья дёргались при остановке, а бумеранг застревал на орбите из-за ограниченного поворота.
- **Применять:** Углы вести через damp, при нулевой скорости удерживать ориентацию; близкий возврат — прямое наведение.
- **Источник:** [доказательство](https://github.com/mpaykin1/World_server/blob/567a48442ed1dee39e2baad87df2df998b231f95/games/ostrov-sumerek/docs/ERRORS.md) · SHA 567a48442ed1dee39e2baad87df2df998b231f95

## art/pixel-ramps
- 2026-10-21 · baseline · technical · 2026-10-21-world-lesson-5
- **Наблюдение:** Стандарт оригинального pixel-art: 16×16 бесшовные тайлы, рампы со сдвигом оттенка, свет сверху-слева и 1 px обводка спрайтов.
- **Применять:** Использовать art/pixel.py и зафиксированную палитру; не сглаживать и не подменять рендер градиентами.
- **Источник:** [доказательство](https://github.com/mpaykin1/World_server/blob/567a48442ed1dee39e2baad87df2df998b231f95/games/ostrov-sumerek/docs/STYLE.md) · SHA 567a48442ed1dee39e2baad87df2df998b231f95

## combat/enemy-hit-band
- 2026-10-21 · failure · technical · 2026-10-21-world-lesson-1
- **Наблюдение:** Враг может быть зарегистрирован, но бесконечно кружить, не нападать или бить в 6–7 раз чаще нормы.
- **Применять:** Живой тест должен измерять полосу частоты попаданий и уклонение, а не только существование сущности.
- **Источник:** [доказательство](https://github.com/mpaykin1/World_server/blob/567a48442ed1dee39e2baad87df2df998b231f95/games/ostrov-sumerek/docs/ERRORS.md) · SHA 567a48442ed1dee39e2baad87df2df998b231f95

## visual/bright-silhouette-burn
- 2026-10-21 · failure · technical · 2026-10-21-world-lesson-4
- **Наблюдение:** Сильные additive-крылья выжгли тёмную моль в белое пятно, глаз не осталось.
- **Применять:** Сохранять читаемое тёмное ядро, кант и глаза; сравнивать в сумерках и ночью с существующими врагами.
- **Источник:** [доказательство](https://github.com/mpaykin1/World_server/blob/567a48442ed1dee39e2baad87df2df998b231f95/games/ostrov-sumerek/docs/ERRORS.md) · SHA 567a48442ed1dee39e2baad87df2df998b231f95
