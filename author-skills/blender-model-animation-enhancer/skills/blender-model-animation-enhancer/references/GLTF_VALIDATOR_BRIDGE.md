# Khronos glTF Validator — tenth integration (v1.9)

Official upstream: https://github.com/KhronosGroup/glTF-Validator
License: Apache-2.0. Native tool written in Dart. Inspect upstream README for CLI build and usage.

## Exact pipeline

Blender / PyMeshLab / Instant Meshes / SkinTokens / Open Mocap / Rigger / Material Maker -> glTF Transform -> meshoptimizer/gltfpack -> **Khronos glTF Validator** -> publish GLB.

**By default** `run_enhancer.py` attempts to locate the official `gltf_validator` executable. If present and output is `.glb`, all pipelines stage the final file and validate it before publishing. If the executable is absent, old pipeline behavior and existing semantic checks remain unchanged; no false validation claims. Use `--gltf-validation require` for fail-closed behavior without the executable. Use `--gltf-validation off` to disable the external check explicitly. `--gltf-validator-strict` additionally rejects warning diagnostics.

## Usage

```bash
python scripts/run_enhancer.py --input hero.glb --output hero-final.glb \
  --gltf-optimize --meshoptimizer --gltf-validation require \
  --gltf-validator-bin /path/to/gltf_validator
```

Standalone pass that leaves input unchanged and publishes a validated copy (no Blender needed):

```bash
python scripts/run_enhancer.py --input hero.glb --output hero-checked.glb \
  --gltf-validation require --gltf-validator-bin /path/to/gltf_validator
```

Underlying CLI: `gltf_validator --stdout --validate-resources scene.glb`. The bridge parses `issues.numErrors` and `issues.numWarnings`, checks process exit status, and rejects corrupt/unparseable responses. Output is written atomically only after successful validation; stdout contains a short status, **not a report artifact**. Never treat an unvalidated output as a PASS.

The validator verifies glTF 2.0 syntax, binary accessors, animation data and embedded resources. It **does not guarantee** artistic identity, same vertex positions, perfect animation appearance, mobile FPS or supported Three.js decoders. Pre-existing glTF Transform/meshoptimizer semantic guards must still run. Draco/Meshopt/KTX2 require game loader configuration.

## Installing upstream

```bash
# From the official project, using Dart SDK (when networking and tools are available):
git clone https://github.com/KhronosGroup/glTF-Validator.git
cd glTF-Validator
dart pub get
dart run grinder exe
# executable at build/bin/gltf_validator (platform-dependent)
```

Local ZIP contains only original adapter; it does not bundle the upstream Dart SDK or compiled validator binary. Upstream is Apache-2.0; attribution in `vendor/glTF-Validator-SOURCE.md`.
