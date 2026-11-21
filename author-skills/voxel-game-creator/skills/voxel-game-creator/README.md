# Voxel Game Creator v0.9 — nine complementary open-source projects

- **Lumenwild (MIT)**: single-player browser game, procedural terrain, physics, crafting and weather.
- **Voxelize (MIT)**: Rust authoritative multiplayer and native Three.js browser client.
- **Ragnagrok Engine (MIT)**: voxel scene/model editor, rigged characters, synth sound and adventure.
- **Blockbench (GPL-3.0, separate)**: low-poly/voxel-model and animation editor, export as user-owned glTF 2.0 binary (`.glb`).

The first three engines remain unchanged. Blockbench assets are added as real glTF meshes via native Three.js loaders in Lumenwild and Voxelize, side by side with the Ragnagrok art pipeline. Supports materials, textures, hierarchy, skinning and optional idle clips; no automatic colliders or cross-engine game-state sync. GPL Blockbench code stays separate, never mixed into MIT game source.

To generate all versions: `python3 scripts/generate_game.py --spec examples/game-spec.json --out /mnt/data/my-world --engine all --blockbench-assets-dir /path/to/glb-folder`.
For an executable demonstration with included glTF sample, use `--blockbench-assets-dir examples/blockbench-assets --blockbench-manifest examples/blockbench-assets.json`.

To separately download Blockbench source: `python3 scripts/download_blockbench.py --out /mnt/data/blockbench-editor` (requires git+network). Read `SKILL.md` and `references/blockbench.md`.


## Luanti native output (v0.6)

Add `--engine luanti` for an installable Lua mod without network access or `--engine all` to get browser + server + studio + Luanti outputs. The Luanti mod exports the same Ragnagrok voxel model shapes and palette into genuine solid Luanti nodes. Install `vgc_bridge` in a Luanti world and run `/vgc_list`, `/vgc_build vgc_tree`. Source and media of Luanti are **not** bundled. For an optional pinned source checkout: `scripts/download_luanti.py`.


## v0.6 — glTF-Transform

Official MIT `@gltf-transform/cli@4.5.1` joins Blockbench GLB and the Lumenwild/Voxelize Three.js runtime: lossless-first deduplication and optional true lossless WebP texture compression. Originals are retained; the model, hierarchy and animation clips are checked; larger results are discarded. Optimization is automatic when GLB assets are supplied and installed CLI/network is available; unavailable CLI does NOT break gameplay.

Use `--asset-optimizer required` for strict mode; `--asset-optimizer off` to skip; `--texture-optimization off` to preserve PNG/JPEG encoding. Source and details: `references/gltf-transform.md`. The Ragnagrok voxel-native models and the Luanti Lua mod are unaffected by the GLB compressor.


## v0.7 — Meshoptimizer

Official MIT Meshoptimizer (`zeux/meshoptimizer`) is now integrated with the existing glTF-Transform v4.5.1 optimizer pipeline. With valid GLB input and the CLI installed, `meshopt --level high` compresses mesh/animation buffers. Both generated Lumenwild + Voxelize clients import Three.js's bundled MIT `MeshoptDecoder`, enabling the required `EXT_meshopt_compression` GLB extension. Other game engines unchanged. Runtime never needs an extra decoder npm dependency.

Default is `--geometry-compression meshopt` with automatic validation and original-file fallback; disable with `--geometry-compression off` or require with `--asset-optimizer required`. Geometric quantization is **not mathematically lossless**; visually verify important hero silhouettes before publication. Actual byte savings are recorded only if the new GLB is smaller. See `references/meshoptimizer.md`.

### v0.9: three-mesh-bvh (MIT)

В браузерной игре и Voxelize client для импортированных статичных GLB добавлены ускоренные треугольные raycasts (клавиша `J`, когда объект в центре камеры ближе 5 м). Скрипт ставит pinned three-mesh-bvh@0.9.18 с корректным npm lockfile; при отсутствии сети `--bvh-mode auto` безошибочно использует базовый Three.js. `--bvh-mode required` требует обязательную установку. Анимированные скелетные меши сохраняют обычный raycast, физическая модель игры не меняется. Полный исходник доступен через `download_three_mesh_bvh.py` с интернетом.

### Blockwild (восьмой OSS, сохранён)

Отдельный MIT backend Blockwild использует `scripts/voxel_game.py --engine blockwild` и `create_blockwild.py`. Он остаётся доступен в установленном плагине. BVH v0.9 применяется пока к Lumenwild и Voxelize, не к Blockwild.

### v0.10 — Yuka (MIT) AI for independent patrol NPCs

Native Yuka `Vehicle` + `EntityManager` + `FollowPathBehavior` steers real voxel or optional GLB NPCs in the existing Lumenwild and Voxelize Three.js scenes. Original Ragnagrok RLE `vgc_watcher` is the default mobile agent body; original player controls and all authored animations are unchanged. Custom NPCs may refer to a supplied Blockbench GLB with a verified `walkClip`. Configure with `--npc-mode auto|off|required` and `--npc-manifest examples/npc-patrol.json`. `auto` skips NPCs when official MIT npm dependency + types cannot resolve, retaining native physics and a valid npm lockfile. No navmesh, actor collision or Rust authoritative NPC AI yet. Source downloader: `scripts/download_yuka.py`. See `references/yuka.md`.
