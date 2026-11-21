# Rigger bridge (sixth source)

Official project: https://github.com/asu37/Rigger
Upstream source pin: `c8f1d1b9a8729582c61fa0ffa9a658ec4f4f6e77` (2026-10-19).
License: GPL-3.0-or-later. Upstream source **is not included** in the GPT Skill ZIP; it must be installed or checked out separately on a machine with Blender 4.2 or newer. The Skill's original bridge scripts remain under the existing Skill license. Do not describe upstream as downloaded when the network was unavailable.

## Why Rigger is complementary

Blender 4.2+ handles imports and glTF. PyMeshLab and Instant Meshes process eligible geometry *before skinning*. SkinTokens generates an initial bone hierarchy and skin weights on a previously unrigged mesh. Open Mocap extracts motion from video in its own compatible Blender 4.0 environment. **Rigger applies mocap/FBX/GLB actions to a pre-existing rig through semantic bone matching or an explicit map**, creating fresh actions without replacing the hero mesh. Optional Quick Rig adds non-destructive IK/FK controller hierarchy to a copy of the original scene. Original game exporter remains compatible with Three.js.

## Obtain upstream

```
bash scripts/get_official_rigger_source.sh /work/Rigger
```

No automatic network install or arbitrary external downloaded project execution. An explicit repo path is required. The official source contains `rigger/__init__.py`, `rigger/retarget.py`, `rigger/quick_rig.py`, and `rigger/export.py`.

## Invocation

Retarget motion from existing FBX/GLB onto the SAME character:

```
python scripts/run_enhancer.py --input hero-rigged.glb --output hero-run.glb \
  --rigger-source runner-motion.glb --rigger-dir /work/Rigger \
  --rigger-source-action Run --rigger-clip Run
```

Only when requested, add an animator control rig to a BLEND copy in `PRESERVE` mode:

```
python scripts/run_enhancer.py --input hero-rigged.glb --output hero-with-controls.blend \
  --rigger-controls --rigger-dir /work/Rigger
```

Export the Rigger control rig's clean game skeleton:

```
python scripts/run_enhancer.py --input hero-with-controls.blend --output hero-engine.glb \
  --rigger-game-export --rigger-dir /work/Rigger
```

For nonspecific/nonhumanoid SkinTokens bone names, supply a mapping JSON object `{"SourceBone":"TargetBone",...}` with at least three valid pairs (`--rigger-bone-map`). Never invent semantic matches. Use `--rigger-rig-name` or `--rigger-source-rig-name` if the scene contains multiple armatures. `--rigger-in-place` removes root travel on retargeted loops. To prevent wrong animation, choose `--rigger-source-action` for files with multiple clips.

## Constraints

- Rigger retarget requires an existing weighted armature; it does not replace generated geometry.
- No changing hero identity, no generating new characters, no automatic action triggering in games.
- Strict input/output inequality and explicit overwrites; `--rigger-clip` cannot collide with any target GLB animation.
- Retarget mode checks target mesh vertex count, face count, material names, shape key names, vertex group names, bone names and pre-existing Action datablocks. GLB export requires new + previous clip names and a mesh + skin.
- Optional Quick Rig writes `.blend` only. Always use `PRESERVE` rather than `CONVERT`, and never delete the original skeleton, vertex groups or original actions. These operations may change scene hierarchy and therefore are not default.
- Rigger game exporter is opt-in for scenes containing an actual Rigger control rig. Source model material fidelity and animation names must be inspected on game import; a Rigger export can legitimately change bone and clip naming. Do not promise byte-for-byte mesh/material equality after game export.
- Rigger has its own video-to-animation tools, but this bridge uses the distinct, independently maintained Open Mocap stage for capture. Avoid silently replacing one capture backend with another.
- Blender 4.2+ and upstream Rigger are REQUIRED to run; Blender is not installed in a generic ChatGPT skill sandbox. Never report successful in-Blender retargeting unless actually executed.
