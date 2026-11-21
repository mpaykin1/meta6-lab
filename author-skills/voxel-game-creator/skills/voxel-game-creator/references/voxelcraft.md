# Voxelcraft — 14-й open-source модуль Voxel Game Creator

- Upstream: https://github.com/bridge-mind/voxelcraft
- Reviewed immutable revision: `30e8a2a2f7c8be9450983fa1d57aa197e875faf6`
- MIT copyright 2026 BridgeMind, see `VOXELCRAFT-LICENSE.txt`.
- Vanilla JS in one HTML; Three.js r128 and JSZip from CDN. Greedy chunk meshing, 10 biomes, crafting/mobs/fluids/redstone, native localStorage saves, Java resource packs.
- `scripts/create_voxelcraft.py` adds a new independent `--engine voxelcraft` mode to `scripts/voxel_game.py`. Full original game source is cloned only when generating. It is NOT embedded in the skill zip.
- Cross-project effects: MIT Vesper Street GPU-instanced rain with native Voxelcraft weather/biome signals. Source inspiration: https://github.com/winchxyz/vesper-street/blob/fcc2f6eda84311194c0834de6cd7081c2965086f/js/effects.js (copyright 2026 winchxyz; separate license `VESPER-STREET-LICENSE.txt`). Voxelcraft's own snow and weather simulation remain intact.
- Art: Ragnagrok MIT grid RLE voxels -> native THREE.InstancedMesh in existing scene; Blockbench self-authored GLB -> original r128 GLTFLoader with embedded assets and named idle clips. Art props visual only, no collision/block edits or player identity replacement.
- GLTFLoader r128 cannot decode already Meshopt-compressed GLB through the default plugin integration. Reject those; export standard glTF GLB, or use the modern clients Lumenwild/Voxelize/Minecraft-W for compression.
- Build requirements: git + Python 3; internet to clone if not supplying exact local Git checkout. Result's JS libraries need internet/CDN even when the one HTML is opened directly via file://. `--resource-pack` adds user-supplied licensed resource pack, loaded automatically only over HTTP.
- Saved game format/world physics are NOT synchronized with other runtimes. Do not claim offline, dynamic NPC navigation or perf gains without actual validation.
