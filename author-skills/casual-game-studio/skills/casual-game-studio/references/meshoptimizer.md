# Meshoptimizer 1.3.0 — official MIT source and game build integration

Upstream: https://github.com/zeux/meshoptimizer (release v1.3)
JS npm package: `meshoptimizer@1.3.0` (`meshopt_decoder.mjs`, `MeshoptEncoder`, `MeshoptDecoder`).
GitHub: `js/meshopt_decoder.mjs`, `js/meshopt_encoder.js`, `js/package.json`.
Copyright/license: see `MESHOPTIMIZER-MIT-LICENSE.txt` (preserve notice on distribution).

## Pipeline

Blockbench `.bbmodel` / `.glb` -> official glTF-Transform `dedup()+prune()` -> optional official `meshopt({encoder: MeshoptEncoder,level:'medium'})` -> `.meshopt.glb` -> Three GLTFLoader `.setMeshoptDecoder(MeshoptDecoder)` -> existing scene/physics/FX.

Run:
```
python scripts/create_game.py --out /mnt/data/my-game --meshopt --install-optimizer
```
This uses Node.js and installs *exact* package versions 4.5.1/1.3.0 via npm in the build tool folder. Requires internet access the first time. If source asset is already smaller, it is NOT replaced. The original source `.bbmodel` and `.glb` are immutable on Meshopt output.

For compressed GLB, the game imports the official `meshoptimizer@1.3.0/meshopt_decoder.mjs` once; install using `python vendor_engines.py --game .` for an integrity-checked local decoder (and all other engines) and offline play. The loader falls back to original GLB if the compressed file cannot be decoded; no identity change or placeholder model is allowed.

**Important:** `meshopt` transform uses lossy vertex quantization. Do NOT describe as lossless. It can reduce transfer bytes, but decompression does not itself increase FPS; optimise vertex counts, batching, physics or GPU load separately. The decoder does not touch Rapier collider sizes, camera, or Tween/Quarks timelines. Avoid compressing already compressed GLBs repeatedly. Compare visuals before publishing a transformed asset. No output is claimed compressed unless the official npm package and round-trip are successful. Meshopt plus HTTP Brotli usually compresses best.
