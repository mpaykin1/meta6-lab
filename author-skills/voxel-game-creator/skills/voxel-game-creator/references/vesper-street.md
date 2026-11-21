# Vesper Street → Voxel Game Creator 0.11

- MIT upstream: https://github.com/winchxyz/vesper-street
- Immutable reviewed commit: `fcc2f6eda84311194c0834de6cd7081c2965086f`
- License: MIT, © 2026 winchxyz. Keep `LICENSE` with redistributed copied code.
- Source is downloaded at **game generation time**, never described as embedded in this plugin ZIP.
- Original Three.js is importmapped to version `0.169.0`, full standalone Vesper Street remains its own game with its own story and controls.

## Functional two-way exchange

### Original Vesper Street as playable output

`voxel_game.py --engine vesper` clones the real Vesper source at the pinned commit (or verifies `--source-vesper`) then uses the existing VGC `ragnagrok_assets.acquire_assets()` model library and `create_blockwild.colored_voxels()` surface reduction. It injects real `THREE.InstancedMesh` geometry into Vesper Street's existing scene. Optional artist-owned Blockbench embedded GLB files use Three.js `GLTFLoader` and optional `MeshoptDecoder`. Character identity, save, authored campaign, camera, collision and player action code remain upstream, untouched. Imported props are not automatically collidable or interactable.

### Vesper atmosphere in existing Blockwild output

`voxel_game.py --engine blockwild --vesper-atmosphere` runs unchanged native Blockwild generator first; copies the **original upstream** `js/effects.js` and `js/util.js` (and MIT `LICENSE`) into an isolated `app/game/vgc-vesper/` folder. Adds an effect-only Three.js module mounted on `engine.scene` and following `engine.position`: GPU-instanced GLSL rain, animated multi-plane GLSL mist, ambient particle lighting, adaptive rain instance budget. It uses the host renderer, existing player position, existing scene, and cleans up on React unmount. It does NOT copy Vesper's full horror game or merge its collision, game state, flashlight combat or WebAudio into Blockwild.

## Commands

```bash
python3 skills/voxel-game-creator/scripts/voxel_game.py \
 --engine vesper --spec skills/voxel-game-creator/examples/game-spec.json \
 --out /mnt/data/vesper-voxel
# Host generated output over HTTP (ES module importmaps cannot load under file://):
cd /mnt/data/vesper-voxel && python3 -m http.server 8801
```

```bash
python3 skills/voxel-game-creator/scripts/voxel_game.py \
 --engine blockwild --vesper-atmosphere \
 --spec skills/voxel-game-creator/examples/game-spec.json \
 --out /mnt/data/blockwild-vesper
cd /mnt/data/blockwild-vesper && npm ci && npm run dev
```

Both commands accept `--source-vesper /absolute/pinned/git/checkout` for offline use; Blockwild weather also accepts `--source-blockwild` for a pinned Blockwild checkout. Both accept `--ragnagrok-project`, `--blockbench-assets-dir`, and `--blockbench-manifest`. Do not use GPL editor code inside these games. All user images/3D models need appropriate user-owned licenses.

## Constraints

- React/Vite architecture: leave original Blockwild/WGPU/Next functionality, Yuka, Ragnagrok, glTF/Meshopt, three-mesh-bvh, Luanti and Voxelize unaffected.
- Two-way integration is at **visual asset/effect level**, not shared save, world generation, physics, NPC control, or co-op server.
- Do not claim successful live deployment, playable static URL or real FPS uplift without running the generated game.
- Vesper standalone primarily targets desktop; mobile responsiveness of original full game has not been established.
- `--vesper-atmosphere` currently supports only `--engine blockwild`. Leave native Lumenwild and Voxelize weather alone; a blind shader injection into other render loops is forbidden.
