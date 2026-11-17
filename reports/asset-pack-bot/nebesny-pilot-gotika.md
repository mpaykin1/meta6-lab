# Небесный пилот · Готический город — прогресс
Дата: 2026-11-17. Работа: [PR #367](https://github.com/mpaykin1/meta6-lab/pull/367).

## Очередь заказа
Исходный `ZAKAZ.json`: 21 пункт; не менять. PNG-ленты всех 21 ассета (19 PNG, 2 WAV) в `asset-packs/incoming/nebesny-pilot-gotika/stacks/`:
- gothicCathedral — 88 срезов 96×96.
- spireTower — 74 среза 64×64, в игре 3 варианта силуэта.
- archBridge — 42 среза 96×96, полый пролёт под аркой.
- sunsetSky — пиксельное небо 256×128 и GPU-композит заката.

Игровая копия `index.html` с `gothic-city.js`, эталон `reference/nebesny-pilot/v2/` не менялся.
Бот `kinds/spritestack.py`, версия 2.6.0, 11 ловушек и 7 мутаций.
Код сцены: [33d7574](https://github.com/mpaykin1/meta6-lab/commit/33d7574c2238e37e1fe91e5a24b1341299d422c2);
[PNG e872853](https://github.com/mpaykin1/meta6-lab/commit/e8728535b2b8089e099c6a50be50544a81a52578);
[тесты 2de7a2c](https://github.com/mpaykin1/meta6-lab/commit/2de7a2c1cf090295ebef302cd842d8ec6a6cfa1c).

## Следующий незавершённый шаг
21/21 файлов изготовлено, включая 19 видов PNG и 2 авторских WAV. В `_check/compare.html` есть эскиз и реальные срезы. Сверить рендер в браузере, добиться HARD=0 на полном паке и HTTP 200 для игровой публикации; до этого не объявлять пакет готовым. Исходный эталон не тронут.

**Итог итерации:** 21/21; образцы: `sunsetCloud`, `pigeonFlock`, `bellTower`, `rosetteBonus`, `windowSparks`, `descentGate`, `gothicTile`, `sailBoat`, `lanternGlow`, `bellChime.wav`, `cityAmbience.wav`; прогулка/пролёт, замедление времени, свет окон, фонари и многослойные виадуки в игровом коде.

## Исправление анимации и объёма, 17.11.2026
`sunsetCloud` и `sailBoat` прежде показывали один PNG-срез по таймеру. Рендер переведён на полную вертикальную стопку через `planeT`, добавлены движение, покачивание, след на воде, сохранение верхушки при LOD. [Исходный коммит](https://github.com/mpaykin1/meta6-lab/commit/16f270725c43aa8d6a10392de0092576cf05b3fa), [доработка](https://github.com/mpaykin1/meta6-lab/commit/5a88d5014ad8a4b2e2ebe034b16cd0e9238f79e4).
Осталось: полная сверка HARD=0, сравнение живого рендера с эскизом, публикация и HTTP 200.
