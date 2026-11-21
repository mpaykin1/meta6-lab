# 3D Model & Animation Enhancer v1.9

Single private ChatGPT Skill integrating Blender, PyMeshLab, Instant Meshes, SkinTokens, Open Mocap, Rigger, Material Maker, glTF Transform, and meshoptimizer/gltfpack. Living-world mobile animation guard retained.

### Material Maker integration

Use real upstream Material Maker to generate PBR texture maps from `.ptex`, or provide existing exported maps. A separate Blender step assigns PBR textures to one explicitly named, UV-mapped mesh object and creates a GLB for Three.js, preserving other geometry, materials, armatures and animation clips. Explicit opt-in required; output appearance may differ from approved original.

```bash
python skills/blender-model-animation-enhancer/scripts/run_enhancer.py \
 --input hero.glb --output hero-pbr.glb \
 --material-ptex material.ptex --material-maker-bin /path/to/material_maker \
 --material-object HeroMesh
```

Without a native Material Maker installation, use `--material-textures-dir` with an exported PBR set.

All upstream applications and model weights require separate installation. Original adapters are MIT-licensed; upstream Material Maker is MIT. Rigger and other modules retain their individual upstream licenses. Actual in-Blender material export requires installed Blender. The original asset is never overwritten. See `references/MATERIAL_MAKER_BRIDGE.md` for the connected pipeline.


## glTF Transform: post-export GLB size optimization

The eighth integration invokes the official `@gltf-transform/cli` from the existing launcher. Safe mode removes duplicate/unused data without adding new runtime decoder dependencies; opt-in codecs enable WebP/Draco/Meshopt. Each output is structurally checked for animation clips, skeleton joints and morph targets.

```bash
python skills/blender-model-animation-enhancer/scripts/run_enhancer.py \
  --input hero.glb --output hero-optimized.glb --gltf-optimize
```

Official package: `npm install -g @gltf-transform/cli@4.5.1` (Node 20+). The upstream CLI is not included in the ZIP; full repository download from this environment was blocked by DNS. See `references/GLTF_TRANSFORM_BRIDGE.md`.


## meshoptimizer / gltfpack — ninth integration

The new **official native gltfpack CLI** is invoked only when `--meshoptimizer` is selected. Default `safe` mode avoids new decoding dependencies and preserves structural identity; opt-in modes `compressed`, `webp`, `ktx2` and `simplify` are available with strict protection for named bones, meshes, materials, animations, and morph targets. Two postprocesses complement each other: glTF Transform dedup/prune → gltfpack GPU vertex fetch/cache optimization. No source files are overwritten.

```bash
python skills/blender-model-animation-enhancer/scripts/run_enhancer.py \
  --input hero.glb --output hero-mobile.glb \
  --gltf-optimize --gltf-mode safe \
  --meshoptimizer --meshoptimizer-mode compressed
```

Install/download native gltfpack from https://github.com/zeux/meshoptimizer/releases and set `GLTFPACK_BIN` if not on PATH. Native project source is not included: the network in this environment could not resolve GitHub. See `references/MESHOPTIMIZER_BRIDGE.md`. Compressed Meshopt output requires a MeshoptDecoder inside the packaged Three.js game.

## glTF Validator v1.9

Official KhronosGroup/glTF-Validator (Apache-2.0) is integrated as a validated atomic publication gate. By default the Skill uses official `gltf_validator` if present; pass `--gltf-validation require` to fail when it is unavailable, or `--gltf-validation off` to explicitly bypass the native check. This complements (does not replace) built-in protection of mesh, bone, clips and materials in glTF Transform and meshoptimizer. Source and binary are external; this ZIP includes an original adapter and fetch/build script, not the validator engine. See `references/GLTF_VALIDATOR_BRIDGE.md`.
