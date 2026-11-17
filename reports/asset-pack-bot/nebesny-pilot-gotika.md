# Небесный пилот · Готический город — прогресс
Дата: 2026-11-17. Работа: [PR #367](https://github.com/mpaykin1/meta6-lab/pull/367).

## Очередь заказа
Исходный `ZAKAZ.json`: 21 пункт; не менять. PNG-ленты первых 4 ассетов в `asset-packs/incoming/nebesny-pilot-gotika/stacks/`:
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
Проверить ASSET CHECK [PR #367](https://github.com/mpaykin1/meta6-lab/pull/367); исправить найденное, добавить лист сравнения `_check/compare.png`, затем 17 оставшихся позиций заказа партиями по 4–6. До HARD=0 и HTTP 200 URL игры не публиковать.
