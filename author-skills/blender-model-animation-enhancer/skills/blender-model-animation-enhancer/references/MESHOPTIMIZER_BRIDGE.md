# Meshoptimizer / gltfpack bridge (v1.8)

Upstream: https://github.com/zeux/meshoptimizer (`gltfpack`, MIT license). Official CLI reference: https://github.com/zeux/meshoptimizer/blob/master/gltf/README.md . The skill invokes an **installed official executable**; `meshoptimizer_worker.py` is an independent Python validator/adapter, not a reimplementation of the algorithms. The full upstream source and native binaries are **not bundled**.

## Pipeline

The intended order is:

1. Blender/PyMeshLab/Instant Meshes: author-approved modeling and geometry changes.
2. SkinTokens: optional auto-rig **only for unrigged characters**.
3. Open Mocap/Rigger: captured/retargeted motion, existing identity and bone weights preserved.
4. Material Maker: PBR textures on explicit objects, author approval.
5. glTF Transform `--gltf-optimize --gltf-mode safe`: dedup/prune.
6. gltfpack `--meshoptimizer`: vertex cache/fetch ordering and final web GLB optimization.

Do not apply a Draco/Meshopt compressed glTF Transform output **before** gltfpack. `--gltf-mode safe` is required when both stages are selected. gltfpack does not support Draco-compressed input; unknown extensions and custom attributes may be discarded, so a strict validation gate halts before accepting output.

## Execution

Run standalone, with official gltfpack on PATH (or `GLTFPACK_BIN`):

```bash
python scripts/run_enhancer.py --input hero.glb --output hero-fast.glb --meshoptimizer
```

Run glTF Transform safe dedup first, then gltfpack:

```bash
python scripts/run_enhancer.py --input hero.glb --output hero-compressed.glb \
 --gltf-optimize --gltf-mode safe \
 --meshoptimizer --meshoptimizer-mode compressed
```

Run geometry preparation followed by compression (the source must exist and native dependencies must be available):

```bash
python scripts/run_enhancer.py --input original.fbx --output mobile.glb \
 --meshoptimizer --meshoptimizer-mode compressed
```

## Modes

- `safe` (default): `gltfpack -kn -km -ke -noq`, preserve node/material names and extras, no new decoder requirements. Only return its result when smaller than the original; structural validation still runs first. A fallback copy is not evidence of optimization.
- `compressed`: add `-c`, which requires `GLTFLoader.setMeshoptDecoder(MeshoptDecoder)` in Three.js.
- `webp`: add `-tw`, explicitly changes original image encoding. Requires WebP support and visual approval.
- `ktx2`: add `-tc`, requires official native gltfpack build with BasisU support; Three.js `GLTFLoader.setKTX2Loader(KTX2Loader)` and `detectSupport(renderer)`, plus user visual approval.
- `simplify`: `-si R -noq`, **only for static unskinned non-morph and nonanimated GLB**, explicit topology change. Never simplify a playable hero, its armor, clothing or skinned accessories; source character identity cannot be guaranteed by a static signature.

The script validates GLB v2 headers, original extension compatibility, skin-joint hierarchy, named mesh links, morph target layouts, animation clip/channel names/interpolations, primitive materials and PBR slot presence. It rejects unknown source extensions, data loss, unanticipated output extensions, or changed protected identity. Output is committed atomically; original bytes are never modified. This is a structural gate, **not pixel-perfect deformation testing**; rendering review remains mandatory for approved characters.

If custom game vertex attributes or interactive glTF extensions are present, gltfpack may drop them, so do not apply this stage. No external CDN links required by the tool itself; the output with Meshopt or KTX2 compression requires Three.js loader support in the shipped game. Do not claim complete offline game support without packaging decoder modules and verifying load in portrait/landscape, as required by the animated-world-guard.

## Installation

Get official binary from https://github.com/zeux/meshoptimizer/releases or use the upstream source helper `scripts/get_official_meshoptimizer_source.sh`. Download, install and execution must be verified; the provided script is not a binary and does not bypass missing system dependencies. The source is MIT; bundled original Python adapter is MIT.
