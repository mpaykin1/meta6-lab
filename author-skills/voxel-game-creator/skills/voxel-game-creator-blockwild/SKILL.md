---
name: voxel-game-creator-blockwild
description: "Расширение Voxel Game Creator v0.8: добавляет полный MIT Blockwild TypeScript/Three.js RPG в единый воксельный конвейер. Использует настоящую сцену Blockwild и импортирует Ragnagrok RLE и Blockbench GLB без подмены игрового движка или героя."
---

# Voxel Game Creator — Blockwild integration v0.8

Этот Skill — дополнение к **существующему** `voxel-game-creator`, а не новая версия чужой игры в Windows ZIP. Семь ранее интегрированных OSS остаются нетронутыми; этот восьмой режим использует оригинальный репозиторий [RedLynx101/Blockwild](https://github.com/RedLynx101/Blockwild) `edition/typescript` по закреплённому коммиту `d7173526945b60109f7c43f3b6b65b0548f7e160`. Лицензия MIT, Copyright (c) 2026 Noah Hicks. Сохранить исходный `LICENSE` в игре и лицензионное уведомление в skill.

## Когда применять

При просьбах «интегрировать Blockwild», «создать игру из Blockwild», «добавить модели в Blockwild», «воксельная RPG с живой экосистемой», «миры Blockwild», «сделай воксельную игру на Three.js» можно выбирать `--engine blockwild`. Не подменять этот runtime на самостоятельные Canvas-кубы или скриншоты. Не смешивать с проприетарным Windows-архивом `BLOCKWILD_v0.22.1_Windows.zip`: он никак не включён в skill, даже если названия совпадают.

## Единственный рабочий генератор для восьми интеграций

Новый объединённый диспетчер — `skills/voxel-game-creator/scripts/voxel_game.py`. Для всех ранее работавших опций он передаёт управление без изменений `generate_game.py`. Только `--engine blockwild` вызывает `create_blockwild.py`.

```bash
python3 skills/voxel-game-creator/scripts/voxel_game.py \
  --engine blockwild \
  --spec skills/voxel-game-creator/examples/game-spec.json \
  --out /mnt/data/voxel-blockwild
```

При разрешённом интернет-доступе генератор **скачивает настоящий полный upstream**: `git clone --depth 1 --single-branch --branch edition/typescript https://github.com/RedLynx101/Blockwild.git`, сверяет HEAD с закреплённым SHA; если ветка сдвинулась, берёт только проверенный commit SHA. Полный исходник игры, её оригинальные модели, NPC, крафт, экосистема, рендерер, сохранения и управление не заменяются. Для среды без сети допускается уже скачанный Git checkout по точно закреплённому HEAD:

```bash
python3 skills/voxel-game-creator/scripts/voxel_game.py \
  --engine blockwild \
  --source-blockwild /path/to/Blockwild \
  --spec skills/voxel-game-creator/examples/game-spec.json \
  --out /mnt/data/voxel-blockwild
```

Выполнить на готовой копии `npm ci && npm run dev` (официальный `package.json` требует Node >=22.13). Не утверждать, что игра запущена или опубликована, пока реально не запущена.

## Авторские модели + реальный рендер

По умолчанию `ragnagrok_assets.py` создаёт четыре *настоящие авторские voxel-модели* (рунический камень, кристалл, дерево и фонарь) и переносит их в `app/game/vgc-decor.ts`. Процедура импортирует оригинальные RLE-voxel-данные, удаляет внутренние кубы и создаёт материализованные `THREE.InstancedMesh` прямо в одной `VoxelEngine.scene`, с сохранением палитры и пропорций. Никакой дополнительной отрисовки Canvas или второго WebGL.

Вместо встроенного набора можно указать собственные модели Ragnagrok Studio:

```bash
python3 skills/voxel-game-creator/scripts/voxel_game.py \
  --engine blockwild --spec skills/voxel-game-creator/examples/game-spec.json \
  --ragnagrok-project /path/to/project.json --out /mnt/data/voxel-blockwild
```

Для уникальных 3D моделей и анимаций из Blockbench экспортировать user-owned `.glb` с встроенными текстурами и передать **`--blockbench-assets-dir /path/to/glb`**; при необходимости использовать **`--blockbench-manifest`** с позициями и строго указанным `idleClip`. `blockbench_bridge.py` проверяет glTF2-содержимое и запрещает внешние `uri`, path traversal и несовместимые расширения. Runtime использует `GLTFLoader` и, если необходимо, `MeshoptDecoder`, а не рендерит заглушки. Не добавлять GPL-3.0 код редактора Blockbench к MIT-движку.

**Границы:** добавленные модели — декорации возле исходной позиции героя, без автоматических коллизий, изменения мира, общего сохранения, синхронизации сидов или героев между движками; если пользователь просит об этом, надо дописать отдельный bridge и проверить. Существующие блоки, монстры, мир, мобили, анимации Blockwild сохраняются в оригинале. Не добавлять самостоятельных атак/приседаний/прыжков без ввода пользователя. Не менять идентичность героя.

## Визуальная режиссура

1. **Дальний слой:** стандартные атмосферные биомы, свет и sky Blockwild; не подменять.
2. **Средний:** нативный воксельный мир, экологию и существ Blockwild.
3. **Ближний:** авторские Ragnagrok экземпляры/GLB внутри той же Three.js сцены.
4. **Экран:** штатный HUD Blockwild и встроенные эффекты; не добавлять тяжёлые постобработки по умолчанию.

Для браузера / сервера / студии / Luanti работают старые `--engine browser|server|studio|luanti|both|all` без изменения исходников или лицензионного режима. Документация: `skills/voxel-game-creator/references/blockwild.md`.
