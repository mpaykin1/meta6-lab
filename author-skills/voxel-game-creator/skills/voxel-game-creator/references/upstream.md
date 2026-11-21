# Upstream / Voxelize integration

Source repository: https://github.com/voxelize/voxelize
Reviewed revision: `0737bf40c4982bc1999042dd745e11b8104a74d2`.
License: MIT — Shaoru Ian Huang, 2022. Attribution retained in upstream/LICENSE; also reproduced in `references/VOXELIZE-LICENSE.txt` for distribution.
Docs: https://docs.voxelize.io
Demo: https://create.town

Verified architecture at review:
- `examples/server/main.rs`: starts authoritative Rust server port 4000 and registers worlds "test", "terrain", "flat".
- `examples/server/worlds/terrain/mod.rs`: terrain generator seeds, biome and stage pipelines.
- `examples/client/src/main.ts`: `new VOXELIZE.World`, camera, renderer, `world.sky.setShadingPhases`, `RigidControls`, `Inputs`, `VoxelInteract`, hotbar.
- `examples/client/src/world.ts`: `setupWorld` applies textures to known block names.
- `examples/client/index.html`: Vite entry point.
- `pnpm install; pnpm proto; pnpm build; pnpm demo`: official monorepo demo flow.

**Full source is not embedded in the Skill archive.** It is acquired at execution time by `scripts/create_game.py` through `git clone`, or supplied as `--source` (offline local checkout). This avoids redistributing the entire large upstream monorepo and makes the source auditable. If connectivity is blocked, do not claim full source has been downloaded.

The Skill's preset generator changes only sky gradients, block texture colors, terrain seed and HTML HUD. It does not yet synthesize new creatures, mechanics or arbitrary terrain styles automatically. Further mechanics are source work, not promises of the preset generator.

Operational distinction: Voxelize is a full-stack multiplayer engine, not a pure static HTML exporter. GitHub Pages hosts the client only; running the game requires network accessibility to the separate authoritative Rust server. A game published only on GitHub Pages without server connectivity is incomplete.

## New in v0.2: Lumenwild single-player browser mode

See `references/lumenwild.md`. The user can export both backends with a shared art/seed spec, not shared world state. Browser mode is now default, Voxelize remains multiplayer mode.

## New in v0.3: Ragnagrok Studio and native art interchange

The third MIT upstream is Ragnagrok Engine (`references/ragnagrok.md`). It supplies the editable voxel Model, Scene and Figure Project format, a browser editor and its playable Adventure. We use its authentic RLE model schema as a shared 3D art transport; the browser and server games render these meshes natively with Three.js InstancedMesh while maintaining their separate gameplay simulations. `--engine studio|all` installs the complete official Ragnagrok checkout at the pinned commit during game generation. `--ragnagrok-project` accepts an exported editor Project JSON and imports its placed static model instances into Lumenwild and Voxelize. Ragnagrok figures/animation are Studio-native only at this release.

## New in v0.4: Blockbench model and animation bridge

Blockbench is **GPL-3.0**, not MIT. The source is a separate editor, optionally cloned via `scripts/download_blockbench.py` (pinned commit). None of Blockbench's GPL code is embedded in the three MIT gameplay engines. See `references/blockbench.md` for exact command, GLB validation and boundary. The generator injects native Three.js `GLTFLoader` to render exported GLB source assets in both existing 3D game scenes, preserving skinned geometry and selected explicitly requested idle keyframe clips. Models are *visual props*, not colliders or controlled players.


## Luanti (Minetest, separate native runtime)
- Repository: https://github.com/luanti-org/luanti
- Commit: `8bb14e85d21a09d37961ed97548f6a9f71349422`
- Engine: LGPL-2.1-or-later. Textures/music licenses are distinct, so only use self-generated source and textures for the bridge.
- Native Lua modding API `core.register_node`, `core.register_chatcommand`, `core.get_node_or_nil`, `core.is_protected`, `core.bulk_set_node`: https://github.com/luanti-org/luanti/blob/master/doc/lua_api.md
- Mod generator: `scripts/create_luanti.py`; optional source downloader `scripts/download_luanti.py`.


## glTF-Transform (sixth project, v0.6)

MIT, Don McCurdy. https://github.com/donmccurdy/glTF-Transform pinned source SHA `8e2a94a2616d293c4b503d0fb6a4b42e6ec7c62f`, npm CLI pinned `@gltf-transform/cli@4.5.1`. CLI downloaded at game-generation time into the private npm cache; not bundled. A pure-python launcher orchestrates official CLI calls and validates that glTF visual and animation identity remains unchanged. See `references/gltf-transform.md` and `references/GLTF-TRANSFORM-LICENSE.txt`.


## Meshoptimizer (seventh open source, v0.7)

- https://github.com/zeux/meshoptimizer
- Reviewed head `f0a684f11ead064e176775c9b796f82a55910e92` (MIT, Arseny Kapoulkine)
- Geometry/animation encoder used through the official `@gltf-transform/cli@4.5.1` dependency `meshoptimizer@~1.2.0`; decoder provided by Three.js's bundled `MeshoptDecoder` module (MIT). Source checkout optional: `scripts/download_meshoptimizer.py`.
- `EXT_meshopt_compression` requires `GLTFLoader.setMeshoptDecoder` in the browser/server client. Quantization may be visually lossy; original model preserved, best validated candidate used.

## three-mesh-bvh
- MIT: https://github.com/gkjohnson/three-mesh-bvh (`0375ada0d674af3a4a169c4ad890239cf3d60cda`)
- npm `three-mesh-bvh@0.9.18`, only static GLB triangle raycast; never server physics

## Blockwild (eighth OSS, separate backend)
- MIT RedLynx101/Blockwild pinned d7173526945b60109f7c43f3b6b65b0548f7e160. Existing backend and docs preserved separately in plugin. BVH optional bridge does not touch Blockwild.

## Yuka (tenth project, v0.10)
- https://github.com/Mugen87/yuka (MIT, source revision `10591304811222d6856020d5de129b39ef43b58d`)
- Official npm release `yuka@0.7.8`; DefinitelyTyped `@types/yuka@0.7.4`.
- Bridge `scripts/yuka_bridge.py` creates validated client-side authored patrol NPCs in Lumenwild/Voxelize using the shared Ragnagrok voxel RLE and optional original Blockbench GLBs. It controls neither the player nor authoritative Rust entities. NPM manifest/lockfile installation is atomic or fully skipped. Other runtime backends stay independent. Source checkout `scripts/download_yuka.py` is optional and requires network.
