# glTF Transform — asset pipeline extension (v0.6.0)

Upstream: https://github.com/donmccurdy/glTF-Transform
CLI package: https://www.npmjs.com/package/@gltf-transform/cli
Documentation: https://gltf-transform.dev/cli
License: MIT (in `GLTF-TRANSFORM-LICENSE.txt`).
Upstream version pinned by this skill: **4.5.1**, Node 20+.

This is an independent integration, not a redistribution of the upstream npm code. The full upstream source and npm tarball could not be downloaded in the build environment (DNS inaccessible). Install on a networked machine using the included installer. Do not claim local glTF Transform optimizations ran unless CLI is present and the game manifest contains verified outputs.

## Interoperability (all non-destructive)

- Goxel (`.vox`) -> Blockbench (`.bbmodel`) -> Blender (`.blend`, animated `.glb`); the artist's original files and the animated glTF source never get overwritten.
- CLI `dedup` -> `prune`, optional `meshopt` through `scripts/gltf_optimize.py`. Meshopt output is only selected if it is smaller and the animation topology can be validated. No mesh simplification, palette loss, image recompression, joint-removal, or changed characters by default.
- Original sources remain in `assets/`; optimized runtime copies in `assets/optimized/` and selection is controlled via `assets/optimized/manifest.json`. Runtime Three.js uses `MeshoptDecoder` for files requiring `EXT_meshopt_compression` and falls back to originals on any failure.
- Pixelorama PNG spritesheet is losslessly repacked to WEBP only if smaller, retaining nearest-neighbor visual appearance. Original PNG remains editable, runtime manifest may point to WebP.

## Install dependencies

```
python scripts/install_gltf_transform.py --dir /path/to/game/tools/gltf-transform
```

`npm install --save-exact @gltf-transform/cli@4.5.1` happens in that isolated directory. Installation must complete successfully for native glTF Transform operations. No hidden npm downloads in browser gameplay.

## Build optimized copies

```
python scripts/gltf_optimize.py --game /path/to/game --cli /path/to/game/tools/gltf-transform/node_modules/.bin/gltf-transform --profile safe
# explicit opt-in geometry compression: decoder auto-initialized in GLTFLoader
python scripts/gltf_optimize.py --game /path/to/game --cli /path/to/game/tools/gltf-transform/node_modules/.bin/gltf-transform --profile meshopt
```

Without a working CLI: the script writes an empty manifest, retains originals, and reports an unavailable optimizer. It must never claim files have been optimized.
