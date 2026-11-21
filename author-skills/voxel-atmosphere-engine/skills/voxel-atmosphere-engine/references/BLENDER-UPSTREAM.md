# Blender integration — separate GPL editor, real glTF animations

Official source: https://github.com/blender/blender
Official site and binaries: https://www.blender.org/download/
Source README examined at commit blob `b84e8622c8f5e20a9bbf64ec3eb7edc7de8c91b0`.
Stock official Blender glTF 2.0 addon: `scripts/addons_core/io_scene_gltf2/__init__.py`, source blob `c71e20c8913dc4e916bdae7fa1c9bcf785831110`; header SPDX-License-Identifier Apache-2.0. The Blender package itself is GPL-3.0; no Blender executable, embedded Blender binary or copied GPL runtime ships with this plugin.

## Why this improves the shared pipeline

1. Goxel `.vox` → `goxel_bridge.py` → actual 3D GLB mesh with preserved voxel colors.
2. Blockbench opens `.bbmodel`, allows artist to edit silhouettes/UV/shape, and exports GLB.
3. Blender headless imports the exact GLB, adds authored named keyframes and optionally joins static meshes to reduce draw calls. It can save editable `.blend` and re-export GLB. Do **not** substitute new meshes or textures for artist-approved content.
4. Three.js `GLTFLoader` loads **the original models** and all glTF `animations`, plays clips in `AnimationMixer`, with an external placement anchor so root animation does not teleport the prop. postprocessing adds Bloom, color grading and screen ambience.

## Commands

Download full source when network is permitted:

```sh
python scripts/download_blender.py --out ./upstream/blender --full
```

Sparse source checkout (only glTF IO and bpy API code, faster and smaller):

```sh
python scripts/download_blender.py --out ./upstream/blender
```

Run Blender-installed machine to create GLB animation + editable blend:

```sh
python scripts/blender_bridge.py --input ./assets/moon_crystals.glb --out ./assets/moon_crystals_animated.glb --blend ./assets/moon_crystals.blend --motion hover
python scripts/blender_bridge.py --input ./assets/night_forest.glb --out ./assets/night_forest_optimized.glb --motion static --optimize-static
```

The `--optimize-static` command never attempts to merge skeletons or animated nodes. Preserves mesh materials and voxel outline. Verify visual output in Blender before adopting it to a production game.

When Blender executable is unavailable, game generation uses the independent `glb_motion.py` standard-glTF2 writer. It preserves original BIN geometry, materials, textures, meshes and nodes, only appends animation accessors, and never requires a Blender installation. Blender can import this resulting GLB later.

## Known constraints

- Blender itself is not embedded in the plugin and cannot run without installation. Full upstream source fetch is unavailable where GitHub DNS is blocked; do not claim it was cloned.
- `bpy` export scripts use the official `bpy.ops.import_scene.gltf` / `bpy.ops.export_scene.gltf` API. Actual `.blend` export must occur on a computer with Blender installed; the supplied animated GLB is pre-generated and can run without Blender.
- Coordinate system and tangents can change in third-party GLBs: confirm scene scale and bounds before using collision. Animation must affect props only unless user explicitly supplies hero animations and identity locks.
- Keep one game identity and action lock: walking, jumping, attack, crouching, rolling and dodging occur only on user command. Environmental looping animations are allowed.
