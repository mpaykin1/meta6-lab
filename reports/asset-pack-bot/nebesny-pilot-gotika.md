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

## Продолжение по эскизу, 17.11.2026
- Бот SS12/SS13, две ловушки, два мутанта, BOT_VERSION 2.7.0 — [5a1614d](https://github.com/mpaykin1/meta6-lab/commit/5a1614d50a0e5775aef8dc62f646b556f1a8ea0c), [255b481](https://github.com/mpaykin1/meta6-lab/commit/255b4810a333880f421c7fd75b80c1dade4987fb), [81889fe](https://github.com/mpaykin1/meta6-lab/commit/81889fe91e2578cd54e61f80c0b77eba7bf6f85e), [4e41977](https://github.com/mpaykin1/meta6-lab/commit/4e41977c04d32ac545ab9e25086bc342c75017af).
- Цельная земля, кварталы, каналы и дальние розовые шпили — [14423c5](https://github.com/mpaykin1/meta6-lab/commit/14423c55353c20bc61b6bc079816df2a4c76724d); замена островов городом и низкие пролёты камеры — [40c70d4](https://github.com/mpaykin1/meta6-lab/commit/40c70d48ec0bbb6a0aaab9b7a37a333e26a83a34).
- Витражи, окна, кровли и резная розетка — [19b1749](https://github.com/mpaykin1/meta6-lab/commit/19b174918d659dd1aeb9e760e3675f76a7d6906b); новый 88-срезный пиксельный собор с пятью шпилями — [3e4ea33](https://github.com/mpaykin1/meta6-lab/commit/3e4ea33391e856cda1a3f843eeb5b24e488ea6c9).
- Следующее: прогнать ASSET CHECK на свежем SHA; сделать реальный compare.png по четырём ракурсам; исправить HARD до нуля, только затем PR ready/merge и проверка страницы HTTP 200.
