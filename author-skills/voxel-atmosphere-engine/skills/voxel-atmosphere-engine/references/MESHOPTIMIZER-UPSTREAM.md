# Meshoptimizer 1.3.0 — eighth open-source integration

- Upstream: https://github.com/zeux/meshoptimizer
- JS npm module: https://www.npmjs.com/package/meshoptimizer 1.3.0
- Official native encoder: https://www.npmjs.com/package/gltfpack 1.3.0
- License: MIT (Arseny Kapoulkine), see `MESHOPTIMIZER-LICENSE.txt`.
- Source format/API verified from upstream `README.md`, `gltf/README.md`, `js/README.md` and `js/package.json`.
- `meshopt_decoder.mjs` is imported dynamically from pinned meshoptimizer@1.3.0 CDN; if blocked, Three.js's own MeshoptDecoder can be tried. If both fail, original uncompressed GLB is loaded.

## Original artistic asset pipeline remains unchanged

Pixelorama palette/animations → Goxel sculpt (`.vox`) → Blockbench `.bbmodel` → Blender `.blend`/GLB animation → optional glTF Transform → meshoptimizer/gltfpack compressed GLB → Three.js plus postprocessing.

`meshoptimizer_bridge.py` calls *real* official `gltfpack` and never simulates meshopt coding. The source stays intact, and smaller results are published only after checking GLB structure, named nodes, material identity, animation targets, extension presence, and sha256 non-mutation. `-kn -km -ke -noq -c` retains source names, metadata and unquantized coordinates. Fallback remains explicit. This policy can reject optimizations even where a developer might otherwise accept changes.

## Local install (only where npm network works)

```bash
python scripts/install_meshoptimizer.py --dir /tmp/vae-meshoptimizer
python scripts/meshoptimizer_bridge.py --game /path/to/embergrove --binary /tmp/vae-meshoptimizer/node_modules/.bin/gltfpack
```

No cloned full repository, npm binary, or source contents are included in the skill: GitHub DNS was unreachable in the current runtime. The pinned download helper is bundled. Do not claim real GLB compression until a verified manifest entry exists. A fallback GPU draw-call improvement is built into the game via instanced sparkle systems independent of the upstream package.
