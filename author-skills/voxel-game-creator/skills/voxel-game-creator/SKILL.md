---
name: voxel-game-creator
description: "Создаёт воксельные 3D-игры на девяти open-source проектах: Lumenwild, Voxelize, Ragnagrok Engine, Blockbench, Luanti, glTF-Transform, Meshoptimizer, Blockwild, three-mesh-bvh и Yuka. Сохраняет авторские модели, риги, анимации и оптимизирует GLB для Three.js без упрощения формы."
---

# Voxel Game Creator v0.9 — девять открытых проектов, единый конвейер ассетов

Главное — передавай пользователя к **реальной запускаемой игре**, а не к картинке или псевдо-движку из Canvas-кубиков. Подключённые MIT-исходники сохраняют собственный код, лицензию, физику и управление. Все исходники скачиваются по пинованному SHA в момент генерации, либо принимаются локальными checkout через `--source-*`. Не выдавай за скачанный и собранный проект только манифест Skill. Если в среде нет сети, сборки или публикации, прямо обозначь это; не выдумывай ссылку на публичную игру.

## Подключённые основы

- **Lumenwild** (`browser`), https://github.com/Vincent-P-essy/minecraft-clone, MIT; SHA `593eddaf542a563c1e9c857d42239be1d5002335`. Игровой браузерный sandbox: Three.js WebGL2, CPU fallback, 10 биомов, пещеры, деревья, процедурные текстуры, день/ночь, погода, инвентарь/крафт, копание и строительство, сохранение, управление на ПК и мобильном. Статическое размещение `dist/` без Rust-сервера.
- **Voxelize** (`server`), https://github.com/voxelize/voxelize, MIT; SHA `0737bf40c4982bc1999042dd745e11b8104a74d2`. Multiplayer: Rust сервер с WebSocket, TypeScript Three.js клиент, инвентарь, voxel meshing, блоки, сущности, физика. Требуется настоящий Rust сервер, `pnpm`, `wasm-pack`, protobuf, сборка.
- **Ragnagrok Engine** (`studio`), https://github.com/Ragnagrok/ragnagrok-engine, MIT; SHA `66e80c3a7451c5455e713e9c94fe1cf3da423050`. Полноценный браузерный редактор воксельных объектов, скелетных фигур и клипов + настоящий фиксированно-камерный Adventure и WebAudio. Файл Project JSON можно импортировать в оба других движка как **статические авторские 3D-модели** с цветами и геометрией оригинального RLE формата.

## Режимы (один Skill)

`browser` по умолчанию — Lumenwild с декорациями на основе Ragnagrok Project Models. `server` — Voxelize с теми же моделями, но отдельной картой. `studio` — полноценный Ragnagrok editor + Adventure для создания/анимации персонажей. `both` — прежние `browser/` и `server/` с общими статическими Ragnagrok декорациями. `all` — четыре целевые среды: `browser/`, `server/`, `studio/`, `luanti/vgc_bridge/` и `shared-assets/ragnagrok-assets.json`. Стандартные режимы 0.2.0 сохранены; не создавай отдельный plugin.

### Workflow

1. Из описания и эскизов собери `examples/game-spec.json`: `title`, `theme` (`ash`, `forest`, `frost`, `dusk`), `seed`, при необходимости `colors` (строгие `#RRGGBB`). Для полноценного набора — `engine=all`. Не подменяй оригинальную пользовательскую графику шаблонной: при наличии утверждённых ассетов сначала согласуй совместимый экспорт, не уничтожай исходный стиль.
2. Выполни в рабочей среде с реальной сетью/исходниками:

```bash
python3 skills/voxel-game-creator/scripts/generate_game.py \
  --spec skills/voxel-game-creator/examples/game-spec.json \
  --out /mnt/data/voxel-world --engine all
```

3. Без сети доступны `--source-lumenwild`, `--source-voxelize`, `--source-ragnagrok` со строго корректными GitHub checkout. Скрипт отказывает при отсутствии лицензии или ожидаемых API. Не обещай готовую игру, если исходник не загружен.
4. Для **настоящего арт-обмена** пользователь экспортирует `Project` из Ragnagrok Studio, затем:

```bash
python3 skills/voxel-game-creator/scripts/generate_game.py \
  --spec skills/voxel-game-creator/examples/game-spec.json \
  --ragnagrok-project /path/to/studio-export.json \
  --engine all --out /mnt/data/voxel-world-edited
```

Реальный `scripts/ragnagrok_assets.py` читает исходные base64 RLE grid и палитры Ragnagrok, отклоняет повреждённые или слишком большие объекты. `scripts/ragnagrok_bridge.py` преобразует *видимые* цветные воксели в `THREE.InstancedMesh` объекты и внедряет их в живой `WorldRenderer.scene` Lumenwild и `VOXELIZE.World` Voxelize — один исходный ассет, два рендера без второго WebGL-контекста. В Studio исходная модель редактируется штатными инструментами, а также доступен rigged NPC на `createHumanoid()` с настоящими idle/walk клипами.

5. Если Project JSON не предоставлен, генератор создаёт 4 оригинальных Ragnagrok-совместимых модели: светящийся кристалл, дерево, рунический столб и фонарь. Это реальные сетки, а не заглушки в описании. Они автоматически добавляются в обе Three.js-сцены. `world-blueprint.json` сообщает, что карты и физика независимы.

### Сборка каждой версии

- Browser: `cd browser && npm ci && npm run build`, готовое `browser/dist`. Если только один режим browser, файлы находятся сразу в корне результата.
- Server: `cd server && ./run-voxel-game.sh`; локальный Three/WebGPU клиент и реальный Rust-сервер, публичный мультиплеер требует деплой обоих. Если один режим server, скрипт запуска в корне.
- Studio: `cd studio && npm ci && npm run build:site` для `studio/site`, `npm run dev` для `/editor/` и `/examples/adventure/`. Если один режим studio — корень результата.
- `both` только browser/server; `all` все три. Проверяй наличие всех импортов/браузерных модулей, компиляцию и запуск перед выдачей ссылки. Никогда не публикуй в GitHub без разрешения пользователя. Не обещай публичную ссылку, когда она не создана.

## Графическая режиссура

Четыре слоя: фон — фазы неба и туман; средний план — воксельные биомы, пещеры, деревья; ближний план — авторские Ragnagrok модели, emissive-кристаллы и локальный свет; экран — постобработка и минимальный HUD. Внутри родного Three.js WebGL/WebGPU, при необходимости GLSL/TSL согласно версии движка, адаптивный рендер для мобильных. Нет самопроизвольной смены героя: герой выполняет действия только по явному вводу, а анимация должна сохранять личность и ракурсы.

## Границы честной интеграции

Ragnagrok Studio figure rigging/animation уже работает **в Studio**; в Browser и Server переносится **только геометрия, палитра и позиции размещённых статичных моделей**. Внешние модели не получают автоматически хитбоксы: physics native. В Voxelize клиентские декорации сейчас ориентируются относительно высоты первичного spawn, не повторяют Rust terrain; в Lumenwild поверхность рассчитывается через родной `createColumnSampler`. Нельзя утверждать, что сохранения, seed=одинаковая карта, чанки или герой являются общими у трёх движков. Ragnagrok WebAudio и отдельный рендерер не наслаиваются на другие игры; звуковой движок доступен в Studio. Если пользователь хочет перенос анимированного героя и столкновений во все движки — это отдельная реализация, не текущая функция.

Подробности и лицензии: `references/upstream.md`, `references/lumenwild.md`, `references/ragnagrok.md`, `references/*-LICENSE.txt`. Никаких отчётов, тестовых логов и handoff в ответе без просьбы пользователя — только игра, код, ZIP и тот же линк плагина, когда реально готовы.

## v0.4 — четвёртый open source: Blockbench (GPL-3.0) с настоящим GLB-обменом

Проверенный исходник: https://github.com/JannisX11/blockbench, commit `ec0b2827104d0799c153bfb5f867579c0c44652f`. **Лицензия GPL-3.0**: Blockbench должен оставаться отдельным открытым редактором. Нельзя копировать его внутренние файлы в MIT-клиенты Lumenwild, Voxelize или Ragnagrok. Пользовательские художественные модели и анимации принадлежат их автору. В ZIP скилла GPL-движок НЕ находится — скачивание только при отдельном запуске команды с интернетом.

**Ключевой художественный конвейер:** Blockbench создаёт и правит кубические модели, текстуры, иерархию костей/узлов, keyframe анимации; экспорт в **glTF 2.0 .glb**. Python `scripts/blockbench_bridge.py` проверяет и переносит оригинальный GLB, не растрируя и не превращая в абстрактные примитивы. Нативный `GLTFLoader` и один существующий THREE.Scene каждого игрового движка отображают геометрию, материалы, UV/текстуры, иерархию и сохранённые анимации; `THREE.AnimationMixer` проигрывает лишь **явно указанную** `idleClip`. Другие действия не запускаются сами и требуют интеграции с игровым вводом. Сохраняются исходные модели пользователя и их идентичность во всех состояниях. Не заменять их новыми героями.

`--blockbench-assets-dir /путь/к/glb` добавляет все исходные `.glb`; `--blockbench-manifest /путь/assets.json` задаёт позиции, поворот, масштаб и необязательную idle-анимацию. Все файловые патчи и копирование выполняются самим скиллом. Пример готового **оригинального** GLB-ассета (сделан нами, не выдан за продукт Blockbench): `examples/blockbench-assets/voxel-lantern.glb`, с примером `examples/blockbench-assets.json`.

```bash
python3 skills/voxel-game-creator/scripts/generate_game.py \
 --spec skills/voxel-game-creator/examples/game-spec.json \
 --out /mnt/data/voxel-world --engine all \
 --blockbench-assets-dir skills/voxel-game-creator/examples/blockbench-assets \
 --blockbench-manifest skills/voxel-game-creator/examples/blockbench-assets.json
```

По желанию `--engine all --with-blockbench-editor` скачивает отдельный оригинальный GPL Blockbench checkout в `blockbench-editor/`, а три MIT-игры остаются самостоятельными. Или `python3 scripts/download_blockbench.py --out /mnt/data/blockbench-editor`. В обеих командах сеть обязательна; при отсутствии сети честно сообщи, что checkout не загружен. Движки Voxelize/Lumenwild/Ragnagrok аналогично получают исходники в момент генерации.

Ragnagrok Project JSON и Blockbench GLB теперь находятся в одном наборе игровых ассетов: настоящие Ragnagrok-кубики отрисовываются как `InstancedMesh`, оригинальные GLB Blockbench как `GLTFLoader` meshes; обе категории одновременно видны в Browser и Server. Ragnagrok rig и WebAudio остаются в Studio. Разные типы редакторов взаимодополняются, но не нужно утверждать совместимость `.bbmodel` ↔ Ragnagrok rig без отдельного конвертера. **Импортированные GLB пока только визуальные объекты, без коллизий и автоматического управления героем.** Подробнее: `references/blockbench.md`.


## Пятый open source: Luanti (formerly Minetest), v0.5

Репозиторий: https://github.com/luanti-org/luanti, исходники LGPL-2.1-or-later, SHA `8bb14e85d21a09d37961ed97548f6a9f71349422`. Медиаресурсы Luanti имеют отдельные лицензии (CC BY-SA и др.), поэтому никакие текстуры/звуки Luanti не копировать в MIT-игры. Новый оригинальный Lua-мод `vgc_bridge` и создаваемые им PNG-текстуры не являются форком движка Luanti.

**Задача:** Ragnagrok-совместимые воксельные модели → настоящие ноды Luanti с цветами, светящимися блоками и коллизиями. Идентичный пакет моделей используется в Lumenwild и Voxelize в виде Three.js InstancedMesh. Исходный проект Studio остаётся редактируемым. Перенос Blockbench GLB в Luanti НЕ реализован: GLB остаются в Three.js.

**Новый `--engine luanti`** полностью автономен и может создавать мод без исходников движка, сети, Node.js и Rust:

```bash
python3 skills/voxel-game-creator/scripts/generate_game.py \
  --spec skills/voxel-game-creator/examples/game-spec.json \
  --out /mnt/data/vgc-luanti --engine luanti
```

Готовый мод: `/mnt/data/vgc-luanti/vgc_bridge/`. Скопируй папку `vgc_bridge` в mods/ выбранного мира Luanti, включи мод, зайди в мир и введи `/vgc_list`, затем `/vgc_build vgc_tree` (или другое имя). Конструктор занимает только свободные, загруженные, незапротектированные клетки, требует `interact`, не перезаписывает постройки. Один воксель Ragnagrok становится целым узлом Luanti, поэтому оригинальный масштаб метров не сохраняется. Luanti — отдельный установленный C++/Lua-клиент; браузерного запуска у этого режима нет.

`--engine all` теперь выдаёт **browser + server + studio + luanti** с единой палитрой и Ragnagrok-моделями; прежние `browser`, `server`, `both`, `studio` сохранены. `--ragnagrok-project <file>` экспортирует пользовательские модели вместо четырёх демо-моделей. `scripts/create_luanti.py` проверяет исходные размеры, палитры, лимиты и RLE; генерирует действительный исходный Luanti-мод и PNG с родными цветами. Отсутствие Luanti executable на данной машине не является успешной проверкой запуска игры.

Для получения **полных исходников** Luanti по проверенному коммиту отдельно, когда есть интернет:

```bash
python3 skills/voxel-game-creator/scripts/download_luanti.py --out /mnt/data/luanti-upstream
```

или дополни `generate_game.py` флагом `--with-luanti-source` (скопирует source checkout в отдельную папку сборки). Код Luanti не подмешивать в MIT-исходники; эти пять проектов взаимодействуют через данные/модели и общие визуальные настройки, а не через общий цикл физики. Не утверждай, что Luanti исходники полностью скачаны или что мод запущен в Luanti, если это не проверено. См. `references/luanti.md`.


## Шестой проект — glTF-Transform (v0.6, MIT)

Официальный репозиторий https://github.com/donmccurdy/glTF-Transform, commit `8e2a94a2616d293c4b503d0fb6a4b42e6ec7c62f`, пакет CLI `@gltf-transform/cli@4.5.1`. **Добавлен рабочий скрипт `scripts/gltf_transform_bridge.py`, не просто рекомендация.**

При наличии пользовательских `.glb` (например, из Blockbench) `scripts/generate_game.py` перед импортом вызывает официальный glTF-Transform один раз на ассет: `dedup` + при наличии текстур `webp --lossless true`. Геометрия, масштабы, риг, названия и состав анимаций должны остаться прежними; проверка сравнивает структуру GLB до/после. Исходники ассетов не перезаписываются. Берётся только результат меньшего размера, иначе оригинал. Не применять Draco/Meshopt-сжатие без декодеров текущего GLTFLoader, не упрощать низкополигональные формы персонажей, не менять анимации attack/jump автоматически.

**Автоматическая установка:** ищет `gltf-transform`, потом скачивает **прикреплённый к версии** npm CLI в кеш; если сеть или Node недоступны, `--asset-optimizer auto` сохраняет оригинал без потери запуска игры. Для обязательной оптимизации используй `--asset-optimizer required`. Для сохранения текстур в PNG используй `--texture-optimization off`. Детали, команды, лицензия и ограничения — `references/gltf-transform.md`. Нельзя заявлять, что 3D-ассет стал меньше, пока не подтверждён `status: optimized` в `world-blueprint.json`.

Роль в общей системе: Blockbench создаёт и анимирует пользовательский GLB; **glTF-Transform** чистит повторяющиеся данные и упаковывает исходные текстуры без ухудшения; затем **тот же** оптимизированный GLB копируется в **Lumenwild** и **Voxelize**; **Ragnagrok** сохраняет редактируемые процедурные и rigged воксельные модели; **Luanti** получает только воксельные Lua-ноды и не зависит от GLB. Полный исходный репозиторий glTF-Transform загружается отдельно через `scripts/download_gltf_transform.py`, если доступен интернет.


## Седьмой проект — Meshoptimizer (v0.7, MIT)

Официальный исходник https://github.com/zeux/meshoptimizer, SHA `f0a684f11ead064e176775c9b796f82a55910e92`, лицензия MIT. **Реальное подключение через официальный glTF-Transform CLI 4.5.1 (`meshopt` command), использующий зависимость meshoptimizer ~1.2.0**, и MIT-декодер, уже входящий в Three.js клиента. Полные исходники Meshoptimizer доступны отдельно через `scripts/download_meshoptimizer.py`, но не входят в ZIP. На рабочем хосте без интернета их можно не скачать; не утверждать обратное.

Теперь pipeline: **Blockbench .glb → glTF-Transform dedup + опционально WebP lossless → Meshoptimizer (EXT_meshopt_compression, геометрия + треки) → GLTFLoader.setMeshoptDecoder(MeshoptDecoder) → Lumenwild и Voxelize**. Импортируются именно авторские модели и анимации; никаких Canvas-заглушек, замены героя или действий без ввода. Риги, имена узлов и состав клипов структурно проверяются. Если библиотека недоступна, компрессия портит структуру или файл получается больше, автоматически используется лучшая проверенная версия. `world-blueprint.json` содержит статус и фактический размер.

**Важно:** Meshopt может количественно немного изменить вершины/анимацию из-за *квантования*. Это не строго lossless. Нельзя обещать сохранение пиксельной геометрии 1:1 или увеличение FPS без просмотра в реальной игре; оригинальные GLB не перезаписываются. Если требуется исходная геометрия, `--geometry-compression off`. Анимации атаки/прыжка не запускаются сами; только заранее заданный `idleClip` по старому контракту. Ragnagrok Studio и Luanti не нуждаются в этом декодере.

**Новые флаги** `--geometry-compression meshopt|off` (по умолчанию meshopt), `--meshopt-level high|medium`. Предыдущие `--asset-optimizer auto|off|required`, `--texture-optimization lossless-webp|off` сохранены; `required` требует валидного результата включённых шагов. Синтаксис и лицензии: `references/meshoptimizer.md`.

## Девятый проект — three-mesh-bvh (v0.9, MIT)

Исходники: https://github.com/gkjohnson/three-mesh-bvh, коммит `0375ada0d674af3a4a169c4ad890239cf3d60cda`. Пакет `three-mesh-bvh@0.9.18` (MIT). Библиотека ускоряет точные пересечения луча с треугольниками **статичных** Mesh объектов. Её нельзя бесконтрольно использовать для движущихся skinned/morph мешей.

**Реальная интеграция** в `scripts/bvh_bridge.py`: импортированные в Lumenwild и Voxelize GLB из Blockbench индексируются MeshBVH после GLTFLoader (без упрощения геометрии), raycast ускоряется только на этих mesh без подмены штатной физики. `J` по нажатию пользователя выбирает геометрию из центра камеры (до 5 м) и на короткое время показывает название/расстояние. Игровой герой, коллизия чанков, Rust server, Luanti-мод и анимации не меняются. `MeshBVH` `indirect:true` сохраняет исходные индексы. Вложенные static prop могут иметь BVH; SkinnedMesh и morph пропускаются.

**Генерация**: `--bvh-mode auto` (по умолчанию) устанавливает pinned npm пакет и обновляет lockfile из фактического npm resolver. При отсутствии сети/npm/валидного lockfile полностью откатывает npm-манифесты и сохраняет обычные raycasts; не оставляет битых импортов. `--bvh-mode required` — обязательный BVH, ошибка при невозможности установить. `--bvh-mode off` — отключено. Дополнительный `--with-bvh-source` скачивает оригинальный MIT checkout отдельно, только при наличии сети. Имеющиеся оптимизации glTF-Transform и Meshoptimizer сохраняются; сжатые GLB декодируются как прежде. Подробно: `references/three-mesh-bvh.md`. Нельзя выдавать raycast за настоящие физические хитбоксы.

## Восьмой проект (параллельная интеграция) — Blockwild

В существующем плагине сохранён отдельный backend Blockwild (MIT, TypeScript/Three.js). Команда `scripts/voxel_game.py --engine blockwild --spec ... --out ...` использует `create_blockwild.py`, не переписывай этот режим через `generate_game.py`. См. `skills/voxel-game-creator-blockwild/SKILL.md` и `references/blockwild.md`. Текущий three-mesh-bvh включается в Lumenwild и Voxelize с Blockbench GLB, но не заявляй его поддержку в Blockwild без отдельной интеграции.

## Десятый проект — Yuka (v0.10, MIT)

Yuka добавляет настоящую автономную логику NPC в **Lumenwild** и в 3D-клиент **Voxelize**. Источник: https://github.com/Mugen87/yuka, commit `10591304811222d6856020d5de129b39ef43b58d`, пакет `yuka@0.7.8`, MIT. Подключение: `scripts/yuka_bridge.py`; официальный код устанавливается через npm с проверкой lockfile только при сборке, исходник отдельно — `scripts/download_yuka.py`.

**Обязательные правила:** НИКОГДА не передавать Yuka управление игроком и не запускать атаки/прыжки героя без соответствующего ввода. Автономными являются только отдельные NPC. В каждом кадре используется **ОДНА И ТА ЖЕ** Ragnagrok-воксельная модель либо один пользовательский GLB из Blockbench, в том числе при остановках и поворотах. Изначально доступен собственный воксельный смотритель `vgc_watcher`, реальные цветные RLE-модели общего пакета. Никаких Canvas-замен.

Запуск `python3 skills/voxel-game-creator/scripts/generate_game.py --engine browser --spec ... --out ... --npc-mode auto` порождает NPC (если удалось установить pinned `yuka@0.7.8` + `@types/yuka@0.7.4`). Можно передать `--npc-manifest skills/voxel-game-creator/examples/npc-patrol.json`. Каждая запись включает `id`, `asset` (`ragnagrok:<id>` или `glb:<id>`), `path` (2D-пункты), `speed`, `loop`, опционально `walkClip` для GLB. Yuka `Vehicle` + `FollowPathBehavior` патрулирует по заданным точкам с ограниченными 30Hz обновлениями; Three.js отображает один и тот же оригинальный ассет. В `--npc-mode auto` при отсутствии npm/сети скилл полностью откатывает изменения package.json и lockfile и выпускает игру **без NPC**. `--npc-mode required` требует работающий Yuka или завершает сборку ошибкой. `--npc-mode off` отключает модуль. Опция `--with-yuka-source` клонирует отдельно официальные MIT-исходники, если доступна сеть.

**Не заявлять:** это НЕ полноценный navmesh/обход препятствий и НЕ серверные боты; NPC визуальные, не влияют на физику и мультиплеерную синхронизацию. Luanti и Ragnagrok Studio сохраняют свои независимые системы, Blockwild остаётся отдельной неизменённой интеграцией. `three-mesh-bvh` по-прежнему используется только для статических GLB, не для подвижных NPC. Подробно: `references/yuka.md`.
