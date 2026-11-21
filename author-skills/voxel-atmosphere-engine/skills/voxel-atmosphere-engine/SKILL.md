---
name: voxel-atmosphere-engine
description: Build playable atmospheric 3D/voxel-pixel worlds from an image/video/GIF with original assets in a unified Goxel + Blockbench + Blender bpy + Three.js + pmndrs/postprocessing + Rapier 0.21.0 physics pipeline. Include editable VOX, BBMODEL, GLB, night fog, glowing ruins, cinematic pixelated lighting, and proper PC/mobile controls.
---

# Voxel Atmosphere Engine 0.8.0 — Pixelorama × Goxel × Blockbench × Blender × Three.js × postprocessing

Always build **a fully playable Three.js game with an actual scene**, not a collection of static sketches or a prose-only recommendation. When a user requests an improvement to the skill, update this **same plugin** and preserve working modules; avoid multiple competing skill versions. Use original graphics and disclose if an actual public playable link was not deployed.


## Rapier 0.21.0 physics — ninth synergistic open-source module

**Always integrate real geometry and input, not a physics-themed visual imitation.** The independent `templates/embergrove/fx/rapier-physics.js` dynamically imports the pinned upstream `@dimforge/rapier3d-compat@0.21.0` (Apache-2.0); it uses the same original Three.js hero Group with a kinematic capsule collider, not a second avatar. Hero jumps only on explicit Space/touch jump input; attacks `J` trigger nearby rigid-body impulses; movement is `WASD`/arrows; `H` toggles the physics mode. Rig motion, camera, pixel art, GLSL/postprocessing and GLB AnimationMixer all remain independent and unchanged. There are 12 interactive rigid-body crates with realistic gravity, restitution and friction, and static colliders extracted from the **actual** Goxel/Blockbench/Blender GLB meshes (trunks, rocks, lantern posts), plus portal pillars and crystal relics. Use stable fixed 1/60-second steps and bounded substeps.

- The *full Rapier/WASM library* is not embedded in the source ZIP when npm download fails. The game tries the local vendored module, then pinned jsDelivr and esm.sh CDN; on failure it keeps the previous playable movement and collision checks without blanking the screen.
- When npm/network is available, run `python scripts/install_rapier.py --game /path/to/game`. It downloads the exact upstream compat build and copies the embedded-WASM ESM to `fx/vendor/rapier.es.js`. Do not describe CDN loading as offline. The output remains a normal static Three.js site; no backend required.
- In any future games, derive colliders from actual imported mesh structure and do not obstruct intended passages (moon gate uses two pillars, not one solid portal AABB). Do not let physics reposition an animated GLB root (use external anchors).
- Source and terms: `references/RAPIER-UPSTREAM.md`.

## Integration architecture

- **Goxel (GPL-3.0, separate upstream editor)**: dense voxel sculpting, colored crystal groups, rock outcrops, detailed ruins, multilayer drawings, MagicaVoxel `.vox` export. Goxel upstream is not embedded in this plugin.
- **Independent `goxel_bridge.py` (MIT)**: handles Goxel-compatible `VOX 150` (SIZE / XYZI / optional RGBA), preserves palette, generates surface-only real GLB 3D meshes with vertex colors, and merged editable voxel cubes in native `.bbmodel` with a PNG swatch atlas. Explicitly rejects unsupported multiple models and scene graphs; never silently omit assets.
- **Blockbench 5.x (GPL-3.0, separate editor)**: open generated `.bbmodel` in File → Open Model, edit the shapes, proportions and textures. The included independent Blockbench JS plugin adds prepared forest props. Export revised glTF/GLB for games. The Goxel-generated asset can therefore be edited in either tool.
- **Blender (GPL-3.0, separate upstream suite)**: import the exact Goxel/Blockbench GLB, create a named object animation in Blender `bpy`, preserve the real geometric source, save editable `.blend` and export keyed GLB. An optional static mesh join reduces CPU draw calls; never destructively optimize animated characters. Source is used via its public API and installed editor, not copied into the game.
- **`blender_bridge.py` (original MIT integration)**: launch Blender in background, link the authored asset to a `VAE_ArtRoot` pivot, write `*.blend` and Three.js-compatible `*_animated.glb` with keyframe animation. The additional standard-library `glb_motion.py` is a Blender-independent fallback that **appends real glTF 2.0 animations** to the same original GLB asset while keeping materials, textures, mesh and geometry unmodified; Blender later imports these clips for adjustment.
- **Three.js 0.187.0 (MIT)**: imports the GLBs into the playable scene; camera, input, lighting, fog and action-locked hero rig. No hardcoded 2D imitations of voxel assets.
- **pmndrs/postprocessing 6.39.6 (Zlib)**: official EffectComposer/RenderPass/EffectPass pipeline with HDR-like Bloom for bonfire and cyan crystals, subtle Color Grade, Vignette, Noise, ACES Filmic tone mapping. Runtime loaded lazily, with native renderer fallback. Versions match peer dependency range.

## Four visual layers

1. **Deep background**: blue-black forest, distant low-poly silhouettes, moon haze and exponential fog.
2. **Midground**: original Blockbench forest plus Goxel-compatible `.vox` sculpted moon gate and crystal clusters, converted to real GLB via the bridge; Blender can subsequently author and edit motion clips.
3. **Foreground**: warm fire, sparks, woodland fireflies, animated cyan floating lights, stone/grass/roots, moving actor.
4. **Screen**: pixelated low-res rendering, stable viewport on touch, GPU bloom and color grading via postprocessing, adaptive fallback, small UI and controls.

## Standard workflow — complete game from a reference

1. Inspect the user-provided video or pictures directly; identify geometry, palette, lighting, depth and main gameplay actions.
2. Identify artistic elements by category (static mesh, particles, transient lights, shader, UI, sound). Keep identity of all characters stable across frames and action states.
3. Generate a full starter in an empty directory:

   `python scripts/create_game.py --out /mnt/data/embergrove_game --seed 214`

   This copies the template and builds a unique night forest plus two voxel-sculpted relics. Confirm `index.html`, `game.js`, `assets/night_forest.glb`, `assets/moon_gate.glb`, and `assets/moon_crystals.glb` exist before describing it as a game.
4. If reference visuals require more geometry: first create/edit voxel volume in Goxel. Export `model.vox`, then:

   `python scripts/goxel_bridge.py --input model.vox --out /mnt/data/voxel_art`

   The bridge creates **`model.glb` + `model.bbmodel` + `model.json`** without needing Goxel to be installed on the game machine. `model.bbmodel` can be opened in Blockbench Generic Model and edited. If a new Blockbench export is used, preserve the original `.vox` as its artistic source.
5. After the sculpting stage, optionally animate in Blender:

   `python scripts/blender_bridge.py --input /mnt/data/voxel_art/model.glb --out /mnt/data/voxel_art/model_animated.glb --blend /mnt/data/voxel_art/model.blend --motion hover`

   If `blender` is not installed, run `python scripts/glb_motion.py --input /mnt/data/voxel_art/model.glb --out /mnt/data/voxel_art/model_animated.glb --motion hover` and later open the result inside Blender. These are true GLB animation tracks, not GIFs or a placeholder sprite.
6. Add GLB to the existing Three.js loader. Ensure world scale, centroid, foot position and collision volumes match the new object. Keep the original forest, character animations, input controls and game loop operational.
7. Use `THREE.AnimationMixer(gltf.scene)` for exported GLB animation clips. Put asset placement on an *external anchor*, or authored root position animation can snap props to world origin. Animated environment is independent of hero input/identity lock.
8. Start with optional post-FX from `templates/embergrove/fx/postfx.js`. Preserve import map with matching `postprocessing@6.39.6` + `three@0.187.0`; composer must resize with renderer, update each frame and must not blank the game when CDN is offline. Use `B` or FX button to toggle. Never trigger attacks, jumps, crouches or rolls without input. In particular, attacks must not change the hero's mesh or face. Keyboard: WASD/arrows, Shift, Space, J, C and Q. Mobile: screen controls.
9. Presentation: atmosphere comes from complementary warm fire and cool cyan crystals, silhouette readability, animated particles and temporal light movement; not only pixelated texture.
10. Game links: user needs a **real published URL** if publishing is available. Otherwise return the verifiable ZIP and state it has not been deployed. Do not fabricate links or claim offline operation: the HTML template imports pinned Three.js from jsDelivr and must be served over HTTP.

## Commands

```bash
# From the skill folder
python scripts/create_game.py --out /mnt/data/embergrove_game --seed 214
python scripts/generate_relics.py --out /mnt/data/relic-art --seed 21
python scripts/goxel_bridge.py --input /mnt/data/relic-art/moon_gate.vox --out /mnt/data/export
# Blender headless when installed:
python scripts/blender_bridge.py --input /mnt/data/export/moon_gate.glb --out /mnt/data/export/moon_gate_animated.glb --motion breathe
# Always-available fallback makes the same genuine glTF animation:
python scripts/glb_motion.py --input /mnt/data/export/moon_gate.glb --out /mnt/data/export/moon_gate_animated.glb --motion breathe
# Optional sparse source checkout:
python scripts/download_blender.py --out /mnt/data/blender-upstream
# Optional source checkout when internet is available. The editor is kept separate.
python scripts/download_goxel.py --out /mnt/data/goxel-upstream
# Optional first editor (same rule)
python scripts/download_blockbench.py --out /mnt/data/blockbench-upstream
```

For runtime use, `python -m http.server 8000 --directory /mnt/data/embergrove_game` and visit `http://localhost:8000`. The default template CDN requires internet for Three.js 0.187.0. Postprocessing CDN is optional with safe fallback. For an **offline JS bundle**, run `python scripts/vendor_postprocessing.py --game /mnt/data/embergrove_game` with npm network access; the bundle packages both libraries. The generated scene GLB files themselves are local and now include authored glTF2 animation clips on both relic assets.

## Limits and licensing

- This skill adds **Blender** via a standalone `bpy` command-line bridge, never bundling Blender GPL core or claiming an embedded Blender binary. See `references/BLENDER-UPSTREAM.md`.
- This skill integrates upstream **pmndrs/postprocessing via pinned CDN and original adapters**, not a vendored full upstream repository; script downloads repo or npm build when external network is available.
- This skill includes **Goxel-compatible exports and converters**, not a fully cloned Goxel installation. Full upstream `git clone` is unavailable in no-network environments. Be precise.
- `VOX 150` single-model support: 24-bit RGB / alpha palette; only opaque voxel surfaces. No implicit `nTRN/nGRP/nSHP` transforms or multiple model instances. Such input reports an error so geometry isn't silently corrupted.
- `Blockbench` and `Goxel` are each GPL editors used as separate tools; do not copy their code into the game bundle. MIT custom scripts and original sample art are independent.
- `references/ART-DIRECTION.md`, `references/BLOCKBENCH-UPSTREAM.md`, `references/GOXEL-UPSTREAM.md` contain concise references.
- Do not modify `mpaykin1/meta6`; if explicitly asked to deploy into the user's projects, work in the `meta6-lab` sandbox only.

## Postprocessing commands

```bash
python scripts/download_postprocessing.py --out /mnt/data/postprocessing-source
python scripts/vendor_postprocessing.py --game /mnt/data/embergrove_game
```

For postprocessing attribution, preservation and details, see `references/POSTPROCESSING-UPSTREAM.md` and `references/POSTPROCESSING-LICENSE.txt`.

## Pixelorama layer: version 0.5.0 — 2D animation painted over true 3D geometry

**Sixth project: Pixelorama (MIT; external Godot editor)**. Keep all previous art/model/physics modules intact. Original `pixelorama_bridge.py` reads a genuine Pixelorama PNG spritesheet or invokes the Pixelorama CLI for `.pxo` projects. `pixelorama_assets.py` generates an initial **original editable PNG sheet of 32 hand-drawn frames** in four animated rows; these are starter assets, not purported Pixelorama-editor output. Pixelorama is the preferred manual editor for later replacements. `pixel_palette_vox.py` transfers the **shared color palette** onto original Goxel `.vox` voxel volumes with exact unchanged coordinates. `goxel_bridge.py` then regenerates `.bbmodel + .glb`. Blender or `glb_motion.py` attaches authentic GLB animation. Three.js `fx/pixelorama.js` loads the sprite sheet as nearest-filtered animated billboards positioned in the *existing* 3D world next to the actual voxel props; the GPU postprocessing path blooms those emissive sprites with no loss of voxel depth.

Workflow:

```bash
# Make all editable pixel source PNGs and palette
python scripts/pixelorama_assets.py --out /mnt/data/pixelorama_art
# Use a Pixelorama-authored sprite-sheet PNG; preserve the 4 rows and 8 frames per row
python scripts/pixelorama_bridge.py --input /mnt/data/pixelorama_art/sprite_sheet.png --out /mnt/data/atlas --frame-width 32 --frame-height 32 --columns 8 --clips /mnt/data/pixelorama_art/sprite_sheet.json
# Shared palette maps actual Goxel voxels to their next pixel-art look with geometry preserved
python scripts/pixel_palette_vox.py --input /mnt/data/embergrove_game/assets/moon_gate.vox --palette /mnt/data/atlas/palette.json --out /mnt/data/modified_voxel --scale .14
# Pixelorama CLI optional: only if user actually has editor installed
python scripts/pixelorama_bridge.py --input my_custom.pxo --out /mnt/data/atlas --pixelorama /path/to/pixelorama
```

*The second command produces the spritesheet and frame manifest, but not a palette; when syncing voxels, use `pixelorama_art/palette.json` or another palette authored by the artist.* The atlas does not replace GLB geometries, characters, camera, collisions or art identity. Buttons `P` / `PIXEL ART` toggle these graphics independently of `B` / `FX`. On missing PNG or external Pixelorama app, 3D game stays playable. `create_game.py` now generates the original pixel layer, palette-recolors actual voxel GLBs and regenerates their real glTF animation clips automatically. See `references/PIXELORAMA-UPSTREAM.md`.

## Seventh open-source integration: glTF Transform CLI 4.5.1 (MIT)

**Goal: efficient transfer between the existing art pipeline and browser without visual drift.** Do not replace artistic voxel geometry, source GIF/PNG frames, or change the single hero or his action control. Keep Goxel/Blockbench/Blender source intact; optimize only duplicate final GLBs. Animated `.glb` must keep clips and named scene nodes. All optimized copies are conditional, verified, and rollback-safe.

1. Author VOX, BBMODEL, BLEND and Pixelorama spritesheets with the existing tools. The editor assets retain artist provenance.
2. Build GLB via `scripts/create_game.py`, which calls `scripts/gltf_optimize.py` if official CLI is present. Install once using `scripts/install_gltf_transform.py --dir /tmp/vae-gltf` where Node/npm network works; then pass `--cli /tmp/vae-gltf/node_modules/.bin/gltf-transform`. Pinned CLI `4.5.1` with MIT license.
3. Default profile `safe`: use glTF Transform `dedup` + `prune`. If a model is larger or changes clip names, clip counts, named nodes, scene count or mesh count, discard optimized copy. Never silently substitute lower-quality geometry. Original file is fallback.
4. Optional profile `meshopt`: enable only with explicit need, verify `EXT_meshopt_compression`, and use Three.js `MeshoptDecoder` from the same pinned Three.js CDN before loading. Any decoder/network failure loads original GLB.
5. Pixelorama spritesheet is optionally encoded as **lossless WebP** when it reduces bytes. Original PNG kept for artist edits. Maintain nearest-neighbor filtering and unchanged clip manifest.
6. The optimization manifest (`assets/optimized/manifest.json`) is empty until the official upstream CLI actually generates and verifies compressed models. NEVER say GLBs are optimized based only on the existence of integration scripts.

Integration sources and CLI instructions: `references/GLTF-TRANSFORM-UPSTREAM.md`. Full upstream source is NOT bundled: GitHub/git/npm network blocked during this build. Future integrations must modify this single existing plugin, not create overlapping versions.


## Eighth open-source module: meshoptimizer / gltfpack 1.3.0 (MIT)

This module **strengthens glTF Transform** rather than replacing it. `gltfpack` applies GPU vertex order optimization and binary Meshopt compression with `EXT_meshopt_compression` when installed. The original source assets Goxel `.vox`, Blockbench `.bbmodel`, Blender `.blend` and Pixelorama spritesheets are untouched. All optimized GLBs are optional copies.

```bash
python scripts/install_meshoptimizer.py --dir /tmp/vae-meshoptimizer
python scripts/meshoptimizer_bridge.py --game /mnt/data/game --binary /tmp/vae-meshoptimizer/node_modules/.bin/gltfpack
```

**Mandatory:** `meshoptimizer_bridge.py` checks scene counts, named node and material identities, animation tracks, skins, extension actual usage, source hash, and strictly smaller resulting size. It rejects unsafe conversions, does not silently allow simplification or texture recoloring, and writes an atomic `optimized/manifest.json`. The JS asset loader decodes with upstream `meshoptimizer@1.3.0/meshopt_decoder.mjs` with a Three.js decoder fallback and original GLB fallback. Decoding failures **must not** blank the scene. Do not claim compression if there is no accepted manifest entry.

**GPU instancing:** the existing portal motes, bonfire sparks, and fireflies use 3 `THREE.InstancedMesh` objects rather than 106 separate meshes, while animations continue. This is a real draw-call reduction independent of network and maintains the same positions and light colors. Preserve original per-frame animation and character identity.

`install_meshoptimizer.py` can use the npm package when a network-capable runner is available. No full upstream source or binary is bundled in this archive because GitHub/npm DNS resolution failed during packaging. Source API, license and documentation were checked through GitHub connector. Full details: `references/MESHOPTIMIZER-UPSTREAM.md` and `references/MESHOPTIMIZER-LICENSE.txt`.


## Tenth open-source project: three.quarks 0.17.1 living VFX (MIT) — release 0.9.0

Use `templates/embergrove/fx/quarks-vfx.js` for a *real* Three.Quarks `BatchedRenderer`
and particle systems. Original models, hero, Rapier bodies and Pixelorama frame
atlases remain unchanged. Quarks provides independently animated fire embers,
portal wisps, ground-hugging mist, forest spores and cyan crystal motes. It samples
Pixelorama's original 8×4 spritesheet and the exact shared colors from `palette.json`. They
respond to game interactions: on **manual** J attack and automatically when
forest relics are collected (this is a world event, not a hero action).

1. Keep the same Three.js 0.187.0 import map. The optional `fx/quarks-vfx.js`
   dynamically imports the pinned `three.quarks@0.17.1` through a local bundle,
   then a hosted fallback. Do not load a second Three.js instance.
2. To bundle the real library for a self-hosted game, run
   `python scripts/vendor_quarks.py --game /path/to/game` (requires npm network).
   Do not ship `file://` or offline claims unless it and Three.js have been bundled.
3. `V` and `QUARKS` button cycle CINEMATIC/LITE/OFF; low FPS reduces effects.
   On failure, 3 original GPU instanced particle layers remain and controls work.
4. Update the renderer **once per frame** using `batch.update(dt)`, not a second
   requestAnimationFrame loop. Keep each effect inside its own emitter.
5. Never swap the player model on attack, standing or motion. Retain animation
   mixer, physics colliders, mobile responsiveness, particle sprites/terrain.
6. A reliable browser render must be checked before reporting visual PASS.

Upstream installation/attribution/limits: `references/THREE-QUARKS-UPSTREAM.md`.
The upstream source was inspected via GitHub; full `git clone` is not included
because external DNS is restricted in some environments. Implemented adapter
is original and the library is fetched at runtime through CDN unless vendored.


## Mandatory living-world & mobile guard — preserved from 0.8.1

Every game must have an independently animated world, not merely blinking lights.
NPCs must have real looping pose/body/action changes and no static cutouts posing as
animated characters. Keep exact approved artwork and character identity; character
jump, attack, dodge, crouch and roll are always triggered by user input, never random.
Buildings/locations need multiple independent motion channels (weather, materials,
objects, gameplay events, light) rather than a lone object transform.

Use 100dvh + viewport-fit=cover, mobile touch controls, safe-area padding, and responsive
camera/UI for **both** portrait (390x844) and landscape (844x390). Never letterbox
because of a horizontal-only fixed canvas. Before claiming a finished playable game,
open the real game in a browser and observe actual animation over several seconds in
both orientations. If browser or CDN unavailable, label the ZIP a preview and do not
claim a visual PASS. Never fabricate a public link. Do not use fake Canvas character
substitutes for approved source art. Keep third-party MIT attribution and GPL editor
source separated from independently written game code.


## Eleventh open-source module: Recast Navigation / Detour 0.44.0 (MIT)

**Mandatory living NPCs:** every on-screen villager must independently move or carry out recognizable actions (inspect, wave, listen, check lanterns, breathe). The original user-controlled hero NEVER moves autonomously. `fx/recast-living-world.js` creates five distinct voxel inhabitants with individual appearance and animation phases and dynamically computes walkable paths. The floor, tree trunks, rocks, lantern posts and mushroom houses are extracted from *real original night_forest.glb meshes*. Recast/Detour transforms that geometry into a NavMesh and uses a Crowd (five agents). `N` displays routes. Rapier stays responsible for player and rigidbody collision; Quarks stays responsible for atmosphere; Pixelorama + Blender/GLB stay responsible for artist-made graphics.

**Graceful fallback is required:** if WebAssembly/core cannot load, independently authored collision-aware A* computes real paths around the same scene obstacles and keeps villagers animated without a blank scene. Do not claim Recast is executing if the UI says `NAV`; `RECAST` appears only after the WASM NavMesh and Crowd initialize. The external engine is **not embedded** unless the user runs `scripts/install_recast.py` with network. Verify both portrait and landscape dimensions and all NPC loops before claiming visual readiness.

Workflow: `python scripts/install_recast.py --game /path/to/game` (network) and `python scripts/create_game.py --out /path/to/empty_game_dir`. See `references/RECAST-NAVIGATION-UPSTREAM.md`. Preserve original GLBs, sprite assets and physics. No static substitutes.
