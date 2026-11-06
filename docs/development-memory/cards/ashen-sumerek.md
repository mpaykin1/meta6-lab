# Карточка опыта: ashen-sumerek

Краткая выборка; все исходные записи сохранены в ../events.jsonl.
При конфликте не выбирай победителя по дате: проверь обе ссылки, запиши новую запись с supersedes.

## build/generated-index-html
- 2026-10-21 · failure · technical · 2026-10-21-ashen-generated-index
- **Наблюдение:** index.html в ashen-sumerek собирается patch_ash.py; правка руками пропадает при пересборке.
- **Применять:** Править ash_*.js, ashen_core.js, pack_ash.js, patch_ash.py и пересобирать patch_ash.py; CI sumerek-golden-guard проверяет воспроизводимость.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/1590a29ca8094c4d462691ff70592a2699099e21/reference/sumerek-golden/README.md) · SHA 1590a29ca8094c4d462691ff70592a2699099e21

## engine/max-kinds-shader-arrays
- 2026-10-21 · failure · technical · 2026-10-21-ashen-max-kinds
- **Наблюдение:** Добавление видов врагов сверх лимита 16 ломает загрузку: 'too many enemy kinds (max 16)'.
- **Применять:** Поднять MAX_KINDS и размеры массивов в шейдере вместе (было 16, стало 24); MAX_FOES=12. Проверять registry().errors после добавления врага.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/1590a29ca8094c4d462691ff70592a2699099e21/docs/SUCCESS_SUMERKI_I_PEPEL_2026-10-21.md) · SHA 1590a29ca8094c4d462691ff70592a2699099e21

## engine/pack-scope-stalk
- 2026-10-21 · failure · technical · 2026-10-21-ashen-stalk-scope
- **Наблюдение:** STALK виден только внутри пака; вызов из движка даёт 'STALK is not defined'.
- **Применять:** Передавать STALK параметром в функции движка (nomadThink(f,dt,s,STALK)), не использовать как глобал.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/1590a29ca8094c4d462691ff70592a2699099e21/docs/SUCCESS_SUMERKI_I_PEPEL_2026-10-21.md) · SHA 1590a29ca8094c4d462691ff70592a2699099e21

## fx/bloom-whiteout
- 2026-10-21 · failure · technical · 2026-10-21-ashen-bloom
- **Наблюдение:** Белая пелена вокруг костра происходила из чрезмерного bloom, а не из тумана.
- **Применять:** При белой засветке сначала изолировать bloom и снять одинаковые кадры; в зафиксированном случае множитель 0.12.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/715ae2ad43b07e47c9d2e6a4f65eedd608091bdd/docs/SUCCESS_SUMERKI_I_PEPEL_2026-10-21.md) · SHA 715ae2ad43b07e47c9d2e6a4f65eedd608091bdd

## fx/low-cloud-bands
- 2026-10-21 · solution · technical · 2026-10-21-ashen-low-cloud-bands
- **Наблюдение:** Рябые облака у земли (3 плоскости, ряды барашков) читаются серыми полосами и в тёмной сцене тусклее фото-референса.
- **Применять:** Делать слоями у земли с шумом-рядами; яркость и плотность решает владелец по кадру; сравнивать кадры при выключенных соседних слоях.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/1590a29ca8094c4d462691ff70592a2699099e21/docs/SUCCESS_SUMERKI_I_PEPEL_2026-10-21.md) · SHA 1590a29ca8094c4d462691ff70592a2699099e21

## fx/visible-dark-particles
- 2026-10-21 · solution · technical · 2026-10-21-ashen-opaque-ash
- **Наблюдение:** Мелкие additive частицы теряются на тёмной сцене; заметный чёрный пепел получен обычным смешиванием, крупными тёмными точками.
- **Применять:** Сравнивать кадры с отключёнными соседними FX; не заменять непрозрачный пепел добавочным свечением.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/715ae2ad43b07e47c9d2e6a4f65eedd608091bdd/docs/SUCCESS_SUMERKI_I_PEPEL_2026-10-21.md) · SHA 715ae2ad43b07e47c9d2e6a4f65eedd608091bdd

## gameplay/ally-enemy-companion
- 2026-10-21 · decision · technical · 2026-10-21-ashen-nomad-rules
- **Наблюдение:** Странник: союзник со старта; враг после двух ударов героя или при жадности (80% монет, шанс 50%); перемирие при 25% здоровья или если далеко 20 с.
- **Применять:** Менять правила только по слову владельца; герой и 21 оружие базы не трогать.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/1590a29ca8094c4d462691ff70592a2699099e21/docs/SUCCESS_SUMERKI_I_PEPEL_2026-10-21.md) · SHA 1590a29ca8094c4d462691ff70592a2699099e21

## perf/far-lod-flat-pictures
- 2026-10-21 · solution · technical · 2026-10-21-ashen-far-lod
- **Наблюдение:** Далёкие модели заменяются плоскими картинками в тумане: зарегистрировано 49 LOD, около 21 подменено на расстоянии.
- **Применять:** Использовать agRegisterLod; перед правкой FPS мерить до и после на одинаковой сцене.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/1590a29ca8094c4d462691ff70592a2699099e21/docs/SUCCESS_SUMERKI_I_PEPEL_2026-10-21.md) · SHA 1590a29ca8094c4d462691ff70592a2699099e21

## tests/live-events-loop
- 2026-10-21 · failure · technical · 2026-10-21-ashen-live-events
- **Наблюдение:** sim() не запускает игровой директор событий; для проверки событий необходим реальный кадровый цикл G.play.
- **Применять:** Тестировать события в живом игровом цикле Chromium, а не объявлять покрытие по sim().
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/715ae2ad43b07e47c9d2e6a4f65eedd608091bdd/docs/SUCCESS_SUMERKI_I_PEPEL_2026-10-21.md) · SHA 715ae2ad43b07e47c9d2e6a4f65eedd608091bdd
