# Meshoptimizer — VGC v0.7 (7 open-source projects)

Upstream MIT: https://github.com/zeux/meshoptimizer. Audited repository head: `f0a684f11ead064e176775c9b796f82a55910e92`. Maintainer Arseny Kapoulkine. MIT license copied to `MESHOPTIMIZER-LICENSE.txt`.

Official Meshoptimizer is actually used through the pinned official `@gltf-transform/cli@4.5.1` dependency (its `meshoptimizer` package ~1.2.0); the CLI provides the **`meshopt input.glb output.glb --level high`** command. The upstream Meshoptimizer repository revision and package version are intentionally distinct: v1.3 source can be fetched separately but is **not bundled**. Three.js r185/r187 already includes `examples/jsm/libs/meshopt_decoder.module.js` from the same MIT project. Generated browser game uses Three.js 0.185.x; generated Voxelize client 0.187.x. No network dependency or duplicate npm install is required for decoding in the game.

## Actual integration

1. Blockbench exports an author-owned, embedded glTF 2.0 GLB. The original may include named clips, skinned meshes, textures, UVs, and nodes; it remains untouched.
2. `gltf_transform_bridge.py` invokes `dedup`, optionally lossless WebP, **then** actual Meshoptimizer geometry+animation compression using the separate `meshoptimizer_bridge.py` verification module.
3. Compressed GLB MUST declare `EXT_meshopt_compression` as required/used, contain at least one compressed bufferView, keep named nodes, model count, skin joint lists and animated node/channel identities. Also rejects unsupported required extensions. No triangle simplification, no Draco, no KTX2.
4. For each model, the smallest fully validated candidate is selected. If Meshoptimizer is unavailable, output is bigger, or semantic checks fail, the previous uncompressed/baseline GLB is used automatically. In strict mode errors stop generation.
5. `blockbench_bridge.py` configures **both** generated Lumenwild and Voxelize `GLTFLoader` instances using `loader.setMeshoptDecoder(MeshoptDecoder)`, importing the official MIT decoder already bundled by Three.js. Ordinary uncompressed GLB keeps working. No changes to existing Rust physics or world layout.
6. The generated `world-blueprint.json` records actual bytes and status for each asset. Never claim savings, FPS improvements, or runtime compatibility without a successful encoder and launched game.

Meshoptimizer may **quantize geometry and animation**. This can introduce small numerical approximation. It is therefore not guaranteed mathematically lossless even when textures use true lossless WebP. If exact vertex data is needed, use `--geometry-compression off`. Scripts never mutate source models. Geometry quantization error/fidelity requires visual approval in a running game.

## Usage

```bash
python3 skills/voxel-game-creator/scripts/generate_game.py \
  --spec skills/voxel-game-creator/examples/game-spec.json \
  --out /mnt/data/my-game --engine all \
  --blockbench-assets-dir skills/voxel-game-creator/examples/blockbench-assets \
  --geometry-compression meshopt --meshopt-level high \
  --asset-optimizer auto
```

`--geometry-compression off`: retain original pre-v0.7 geometry behavior (dedup/WebP only). `--asset-optimizer off`: keep all source GLB bytes. `--asset-optimizer required`: require all enabled transforms, including valid Meshopt compression. `--texture-optimization off`: retain original texture encoding. `--meshopt-level medium` for alternate quantization preset.

Standalone single-file transform also supports `--geometry-compression meshopt|off` and `--meshopt-level high|medium`.

Fetch full official MIT source separately if desired (requires network):

```bash
python3 skills/voxel-game-creator/scripts/download_meshoptimizer.py --out /mnt/data/meshoptimizer-upstream
```

**Scope:** GLB 3D assets in browser/server; Ragnagrok native voxels and figures in Studio unaffected, Luanti Lua nodes unaffected. Meshoptimizer is not a multiplayer protocol and does not create colliders or automatically animate the hero.
