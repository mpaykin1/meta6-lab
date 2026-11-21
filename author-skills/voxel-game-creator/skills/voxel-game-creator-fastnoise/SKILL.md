---
name: voxel-game-creator-fastnoise
description: "Расширение Voxel Game Creator: оригинальный FastNoiseLite MIT и Ragnagrok voxel-модели для детерминированных биомов в Three.js (Lumenwild, Voxelize)."
---

# Voxel Game Creator — FastNoiseLite

Это расширение **существующего** Voxel Game Creator, а не новый плагин.

Используй на основе общей генерации `skills/voxel-game-creator/scripts/generate_game.py`
для `--engine browser|server|both|all`, по умолчанию `--noise-mode auto`.

- Исходный open-source: https://github.com/Auburn/FastNoiseLite,
  MIT, pin `785f37a9ad76e283586a379675085f2063ae03f7`.
  NPM `fastnoise-lite@1.1.1` официального JavaScript-порта.
- `--noise-mode auto` подключает оригинальный шум, если npm/pnpm смог
  обновить lockfile; при недоступной сети сохраняет исходный игровой мир.
  `--noise-mode required` строго требует работу зависимости; `off` её отключает.
- `--noise-config skills/voxel-game-creator/examples/fastnoise-biomes.json`
  задаёт seed, частоту, плотность, зону и идентификаторы авторских моделей.
- FastNoiseLite OpenSimplex2 FBm + Cellular + OpenSimplex2S 3D Ridged
  определяет группы леса, минералов и рунических артефактов; рендерятся
  **существующие** Ragnagrok RLE-воксельные модели, собранные в
  InstancedMesh внутри **тех же** оригинальных сцен Three.js.
- Не создавать нового движка/Canvas, не заменять персонажа, не управлять
  его действиями, не добавлять фиктивных физик/коллизий. Декор не
  является частью настоящих блоков мира, NavMesh и сохранений.
- Нет подтверждённого изменения исходного игрового terrain/caves;
  об этом нельзя заявлять. Recast/Yuka, Vesper, Blockwild,
  Minecraft-W, Voxelcraft и Luanti остаются независимыми.
- Полные исходники клонировать отдельно только при наличии сети:
  `scripts/download_fastnoise.py --out /path/to/source`.

См. `skills/voxel-game-creator/references/fastnoise-lite.md`.
