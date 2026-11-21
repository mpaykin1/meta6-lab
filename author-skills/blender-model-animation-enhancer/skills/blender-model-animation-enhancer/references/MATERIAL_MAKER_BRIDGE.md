# Material Maker -> Blender PBR -> Three.js / GLB

Official upstream: https://github.com/RodZill4/material-maker (MIT)
Verified upstream code: `parse_args.gd`, `material_maker/doc/command_line.rst`, `material_maker/doc/export.rst` and `addons/material_maker/nodes/material.mmg`, master commit `7d6daae3c74c09720afe4138ce09699ab3591ce1` (2026-10-24). Official Blender glTF exporter reference: https://docs.blender.org/manual/en/4.5/addons/import_export/scene_gltf2.html

## What each tool does

- **PyMeshLab** checks and repairs only unrigged, non-textured static mesh geometry.
- **Instant Meshes** optionally rebuilds static topology; after retopology, UVs generally need deliberate unwrapping. Do not create arbitrary UVs on a protected/approved character.
- **SkinTokens** creates a new rig and weight data only on an otherwise unrigged character.
- **Open Mocap** extracts body motion in separate Blender 4.0; **Rigger** retargets animations to the approved rig in modern Blender.
- **Material Maker** authoring happens in its separate Godot-based program. `material_maker_worker.py` invokes upstream `--export-material` on `.ptex`, then `material_maker_blender.py` creates a new Principled BSDF material on a named target mesh and exports a GLB/BLEND. No shape, skeleton or animation editing happens during material stage.

## Why `GLTF/Plane` is used instead of `Blender`

The upstream `Blender` export target emits separated albedo PNG, roughness/metallic EXR, normal PNG and other EXR maps. The upstream `GLTF/Plane` profile produces portable PNGs with `albedo`, `normal`, `emission`, **ORM packed**: occlusion in R, roughness in G, metallic in B. The exporter also writes a demo `.gltf` plane, which our adapter intentionally **does not** use; we only take its maps and connect them to the approved object's existing UV set in Blender. If the specific `.ptex` has a custom export target and no PBR maps, fail safely instead of inventing maps.

## Workflow

1. Preserve the original GLB/FBX/.blend, textures, mesh and all animation clips.
2. Import/create/material-author `.ptex` in the official Material Maker application (license MIT). If executable is present, run `.ptex` export with `--material-ptex`, otherwise pass an **existing folder of exported image maps** as `--material-textures-dir`.
3. Require an explicit `--material-object` matching an existing mesh object with a UV map. Reject ambiguous channels or missing files; do not apply generated textures to all scene objects.
4. Apply textures using Principled BSDF, `Non-Color` for normal/ORM/scalars, Normal Map node for tangent-space normal, and glTF Material Output Occlusion channel where available. For shared mesh data use an object-linked material slot; never change other shared-mesh objects. Keep original material via fake user in BLEND.
5. Export GLB with animations, skins and morph targets; check output and original scene geometry/skeleton/action signatures.
6. User must visually approve the appearance. The material phase is **opt-in** because new textures can intentionally change appearance. Do not claim that a new material is identical to the approved original.

## CLI examples

New procedural PBR authored in Material Maker (headless export):

```bash
python skills/blender-model-animation-enhancer/scripts/run_enhancer.py \
  --input hero-rigged.glb --output hero-pbr.glb \
  --material-ptex wood.ptex --material-maker-bin /path/to/material_maker \
  --material-object HeroMesh --material-size 1024
```

Existing exported maps without starting Material Maker:

```bash
python skills/blender-model-animation-enhancer/scripts/run_enhancer.py \
  --input hero.blend --output hero-textured.glb \
  --material-textures-dir ./maps/ --material-object HeroMesh
```

Native Material Maker executable is **not** bundled: use official source download helper `scripts/get_official_material_maker_source.sh`, or official application installers. GitHub clone may be blocked by offline execution environments. Never report a material operation as completed if Blender/Material Maker are unavailable. Do not run this directly in ChatGPT without a capable local executor. Do not change PBR maps or assign textures silently without explicit user request.

## Supported map names

Suffixes: `_albedo`, `_basecolor`, `_base_color`, `_diffuse`, `_normal`, `_orm`, `_rough`, `_roughness`, `_metal`, `_metallic`, `_occlusion`, `_ao`, `_emissive`, `_emission` (PNG; Blender may also read EXR, JPG, WEBP). If an output profile uses different suffixes, rename/match explicitly; do not guess arbitrary filenames.

Blender GLB exporter can recognize packed ORM and glTF occlusion group, but version-specific behavior should be checked when accurate AO channel export is essential. Height/displacement, SSS, exotic shaders and hand-painted style are *not* reimplemented as real-time PBR; they require dedicated baking/shader work, not an invented approximation.
