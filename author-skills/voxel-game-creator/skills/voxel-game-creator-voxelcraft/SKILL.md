---
name: voxel-game-creator-voxelcraft
description: "Готовая воксельная survival-игра из одного HTML на исходниках Voxelcraft MIT с оригинальными ассетами Ragnagrok/Blockbench и погодой Vesper Street в том же Three.js-рендерере."
---

# Voxel Game Creator — Voxelcraft edition v0.14

**Это новый режим в существующем Voxel Game Creator, не отдельный конкурирующий плагин.** Остальные движки, инструменты ассетов, Recast/Yuka, BVH и оптимизация GLB не меняются.

Основа: https://github.com/bridge-mind/voxelcraft, MIT, commit `30e8a2a2f7c8be9450983fa1d57aa197e875faf6`. При выполнении скрипт загружает полный исходный репозиторий по этому SHA, проверяет его MIT-лицензию и создаёт запускаемый **index.html** с оригинальным кодом survival-игры, greedy chunk meshing, биомами, крафтом, мобами, разрушением/строительством, погодой, сохранениями и меню. НЕ подменяет игровой код схемой или заглушкой.

```
python3 skills/voxel-game-creator/scripts/voxel_game.py \
  --engine voxelcraft \
  --spec skills/voxel-game-creator/examples/game-spec.json \
  --out /mnt/data/voxelcraft-game
```

Файлы результата — `index.html`, оригинальные LICENSE/README, `VGC_VOXELCRAFT.json`, `VGC_README.md`. Открыть `index.html` в браузере; базовые Three.js r128 и JSZip загружаются из CDN, поэтому требуется интернет, несмотря на единый HTML. Не выдавай CDN-зависимый HTML за полностью автономный офлайн-продукт. Если подключены GLB, дополнительно требуется оригинальный `THREE.GLTFLoader` r128 из CDN.

## Взаимное усиление систем

- Ragnagrok Studio → Voxelcraft: общий реальный RLE-пакет моделей (`--ragnagrok-project /path/to/Project.json`) преобразуется в видимые инстансы `THREE.InstancedMesh`, ставится по высоте собственной поверхности Voxelcraft. По умолчанию создаются оригинальные 4 декоративные модели из общей библиотеки. Это декоративная геометрия, НЕ Minecraft-блоки и НЕ физические коллайдеры.
- Blockbench → Voxelcraft: `--blockbench-assets-dir /path/to/glb` или `--blockbench-manifest ...`; встраивается оригинальный полностью самодостаточный GLB в исходный HTML (без подмены модели), glTFLoader r128 отображает в той же сцене. Именованный `idleClip` разрешён, остальные клипы не запускаются без явного управления. Суммарное ограничение embedded GLB 18 MiB. В этом режиме принимаются лишь **несжатые** модели: EXT_meshopt_compression не поддерживается GLTFLoader r128 без отдельного декодера. В других движках glTF-Transform/Meshoptimizer остаются доступны.
- Vesper Street → Voxelcraft: `--vesper-rain on` (по умолчанию) добавляет адаптированный MIT GLSL GPU-rain; его видимость и интенсивность следуют настоящему weather state Voxelcraft. В дождь родной CPU-рендер дождя отключается; снег работает прежним оригинальным способом. Под землёй дождь гаснет. При низком FPS число рисуемых инстансов сокращается. Одна THREE.Scene / один renderer, никакого отдельного canvas. `--vesper-rain off` сохраняет оригинальную погоду без замен.
- Воксельные Java-паки текстур: пользовательский **с разрешением на использование** `--resource-pack /path/resourcepack.zip` копируется рядом с HTML; для автоподключения открыть игру через HTTP, например `python3 -m http.server 8765`. Исходная поддержка загрузки ZIP перетаскиванием сохраняется. Пакеты из сети автоматически не скачиваются и их права не подразумеваются.

Offline checkout: `--source-voxelcraft /path/to/git-checkout`; checkout должен быть строго на `30e8a2a...`. Без интернета или локальных исходников нельзя обещать, что готовый игровой движок скачан.

## Важные границы

Игровой мир Voxelcraft и отдельные миры Lumenwild, Minecraft-W, Voxelize, Blockwild, Vesper, Luanti независимы. Воксельные пропсы не имеют коллизий, не сериализуются в сохранение блоков, не заменяют героя. Существующие сохранения, физику, действия пользователя, AI и управление не подменять. Voxelcraft не получает автоматически Yuka/Recast, MBVH, физику или сетевую синхронизацию из соседних режимов. Внешние JS библиотеки остаются из оригинальных CDN. Проверить сборку/игру и публиковать только после фактического выполнения, не выдумывать игровую ссылку. Пользователю выдавать игровой результат, а не отчёт.
