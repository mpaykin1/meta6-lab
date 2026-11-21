# glTF-Transform — build-time optimization (v0.7)

- Official source: https://github.com/donmccurdy/glTF-Transform
- npm packages: @gltf-transform/core@4.5.1, @gltf-transform/extensions@4.5.1, @gltf-transform/functions@4.5.1. License MIT. Upstream license text in `GLTF-TRANSFORM-MIT-LICENSE.txt`.
- This is a BUILD tool. It does not add runtime dependency or new compression decoder to Three.js/GLTFLoader.
- `scripts/gltf-transform/optimize.mjs` calls genuine `NodeIO`, `dedup()` and conservative `prune(...)`; these functions are provided by the upstream package, not rewritten or faked.
- `python scripts/create_game.py --out /mnt/data/game --optimize-assets --install-optimizer` installs the official pinned npm package into the build tool dir and attempts the optimization. Network is needed for npm installation, not for game runtime.
- `--optimize-assets` without installation requires the pinned dependency to be installed already. Output is not replaced when it is larger; errors stop the requested optimization without claiming success.
- Retain `.bbmodel` editable master. Optimized GLB has the SAME filename (`models/pastel-bunny.glb`) and is loaded through existing `model-loader.js`. The unoptimized GLB is retained as `models/pastel-bunny.source.glb` only when a smaller transformed model was produced.
- No quantization, polygon simplification, lossy texture conversion, Draco or meshopt coding; future optional compression must be paired with `DRACOLoader`/`MeshoptDecoder` at runtime.
- Unlike mesh geometry optimizers, glTF-Transform does NOT perform physics calculations, tween animation, particle simulation, or drawcall batching. It only improves assets supplied to those engines.
- If npm cannot resolve registry.npmjs.org, the optimizer is NOT installed. Existing game continues with the original GLB; do not describe it as optimized.

Optional Meshoptimizer 1.3.0 via `--meshopt` (lossy quantization). See `references/meshoptimizer.md`.
