# Casual Game Studio v0.8 — Seven integrated game technologies

Three.js r187 renders original toy-like pastel 2.5D/3D art. The bundled upstream Tween.js 23.1.3 ESM controls interactive animation. The pmndrs/postprocessing 6.39.6 adapter adds real Bloom and Vignette post-effects, with impact glow animated by Tween.js. Upstream GLSL shader samples and Zlib license are included; full compiled postprocessing is available through a pinned CDN or optional official npm package vendoring.

Generate: `python scripts/create_game.py --out /mnt/data/game --title "Candy Tower"`
To make a generated game fully offline (requires network just once): `python vendor_engines.py --game /mnt/data/game`.
Run: `python -m http.server 8000 --directory /mnt/data/game` and open http://localhost:8000/.

### Blockbench integration

`examples/blockbench/pastel-bunny.bbmodel` → `python scripts/bbmodel_to_glb.py --src examples/blockbench/pastel-bunny.bbmodel --out templates/pastel-blocks/models/pastel-bunny.glb` → Three.js GLTFLoader in `model-loader.js` → Tween.js user-triggered bouncing + pmndrs bloom.

The full Blockbench editor is GPL-3.0 and is NOT shipped with this plugin. Optionally download it separately via `python scripts/install_blockbench_source.py`. Keep model editable in Blockbench or supply the original `.glb` for complex models.


## v0.5: Real Rapier 3D dynamics

`physics.js` uses real Rapier 0.21.0 WebAssembly for falling projectiles, kinematic block colliders, true hit events, physics shards, gravity and bounce. It shares the Three.js render loop and emits Tween.js UI/Bloom effects on real contact. The physics engine can be vendored locally via `scripts/vendor_engines.py`; the plugin does not prebundle its WASM-embedded binary.


## VFX v0.6
Real Three.quarks 0.17.1 is integrated as `particles.js` with shared Three.js/Bloom scene and Rapier collision events; install the verified official distributions via `scripts/vendor_engines.py` for offline play. See `references/three-quarks.md`.


## v0.8 — glTF-Transform 4.5.1 asset pipeline

Native `.bbmodel` export to `.glb` → build-time glTF-Transform `dedup` + `prune` (when installed) → same Three.js GLTFLoader. The source `.bbmodel` and the full game logic are preserved. Official npm packages are installed only when requested; no false size claims if the registry is unavailable. Run:

`python scripts/create_game.py --out /mnt/data/candy-game --optimize-assets --install-optimizer`

See `references/gltf-transform.md`. This tool does not require extra browser dependencies; optional Draco/Meshopt compression is deliberately off by default.

Meshoptimizer v1.3.0 integration: add `--meshopt --install-optimizer` to generator for genuine quantizing compression. Compressed asset requires official decoder; original GLB stays available. Lossy quantization is opt-in, not a guaranteed FPS improvement.


## v0.9 — Three-VRM 3.5.5

Added genuine pixiv Three-VRM avatar support in `vrm-avatar.js`. Run the game and press **♡ HERO** to show the included original humanoid `models/pastel-scout.vrm`; press **↑ VRM** to import a file. **WAVE** and **BLINK** are user-initiated on the exact same instance. The Blockbench bunny remains the initial mascot and is not changed spontaneously. Import may require Internet, or use `python vendor_engines.py --game .` on an internet-connected machine for local vendoring. Generate with `python scripts/create_game.py --out /mnt/data/game --vrm /path/to/approved-avatar.vrm` if you have your own asset. See `references/three-vrm.md`.


## 10 — KTX-Software 4.4.2 GPU texture compression

Includes original PNG tile art, the real Khronos `ktx` build adapter (`scripts/encode_ktx2.py`), a manifest-driven `KTX2Loader` runtime module, and full official Three.js KTX2Loader/Basis transcoder vendoring in `vendor_engines.py`. If the tool is installed, `python scripts/create_game.py --out /mnt/data/game --ktx2` generates actual UASTC KTX2 textures; otherwise the game uses original canvas textures and makes NO compression claim. The build machine here lacks the Khronos executable and outbound DNS, so sample ZIPs ship without pre-compressed assets. KTX-Software official project: https://github.com/KhronosGroup/KTX-Software/tree/v4.4.2


## v1.1 — Three Mesh BVH 0.9.18

The existing static rounded tiles share one triangle BVH. The exact pointer hit determines the Tween.js contact ripple and existing Rapier shot column. This is NOT a new physics engine: Rapier owns all collisions. The Three-VRM animated avatar and mascot are not patched. The game shows `PICKING · BVH` only after the official library successfully constructs the tree, otherwise standard Three.js raycasting remains active. Official npm ESM source is installed for offline builds by `vendor_engines.py` with SHA-512 verification (requires network); see `references/three-mesh-bvh.md`.


## v1.2 — Three BVH CSG

User-command **◇ CARVE** or **C** performs a real three-bvh-csg 0.0.18 subtraction on a chosen board tile. Its own geometry is rebuilt with a new BVH. Rapier collisions, Quarks impact particles, Tween ripples and Bloom share the same tile object. Original geometry and character identities are never changed. Collision remains a conservative box, not a cut-out. Use the pinned CDN at runtime or `vendor_engines.py` to vendor source when npm access is available. This is an experimental geometry tool, not a geometry guarantee.
