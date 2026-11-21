# Instant Meshes: field-aligned retopology integration

## Canonical upstream project

- Repository: https://github.com/wjakob/instant-meshes (master)
- License: BSD-style, see https://github.com/wjakob/instant-meshes/blob/master/LICENSE.txt
- Batch CLI: https://github.com/wjakob/instant-meshes/blob/master/src/main.cpp
- Build instructions: https://github.com/wjakob/instant-meshes#compiling

The Blender enhancer bundles **an original Python adapter** to the upstream C++ command-line program, not the binary or a substitute retopology algorithm. Its batch options were checked against upstream `src/main.cpp`: `--output`, `--faces`, `--rosy 4`, `--posy 4`, and `--deterministic`.

## Safe connected pipeline

1. Blender `bpy` imports GLB, glTF, FBX, OBJ, or BLEND. It preserves object names, scene transforms, parenting, armatures and existing animation actions.
2. Optional PyMeshLab bridge removes duplicate/degenerate triangles/vertices on eligible geometry-only static meshes; it runs in a separate Python interpreter.
3. Optional Instant Meshes bridge triangulates the eligible mesh in **local object coordinates**, creates temporary source OBJ, invokes the actual upstream executable in batch mode, and parses resulting quads/triangles.
4. Safety gate validates OBJ indices, finite coordinates, mesh size and bounding-box drift before Blender atomically replaces the mesh datablock on the **same object**. On errors, the original Blender mesh and source input remain unchanged.
5. Blender exports an ordinary `.glb` for Three.js.

The bridge does **not** preserve or invent deformation weights, UVs, materials, textured detail, procedural shaders, shape keys or blend shapes. Meshes with any such data, modifiers, authored attributes, animation data, constraints, skinning or multiple users are **skipped**, not re-topologized. This is intentional: a real animation-ready character retopology requires attribute projection, rigging/weight transfer, and deformation checks, which are not bundled.

## Running

Local dependencies:
- Blender 4.5+ executable.
- Instant Meshes compiled or prebuilt binary, with local executable path specified by `INSTANT_MESHES_BIN` or `--instant-meshes-bin`.
- Optional `pymeshlab` and `numpy` on a separate Python if the PyMeshLab stage is requested.

Single tool:

```bash
python scripts/run_enhancer.py --input scene.blend --output scene-game.glb --instant-retopo-static --instant-meshes-bin /path/to/InstantMeshes
```

Three-tool chain:

```bash
python scripts/run_enhancer.py --input rock.glb --output rock-game.glb --pymeshlab-clean-static --instant-retopo-static --instant-faces 1800 --pymeshlab-python /path/to/python-with-pymeshlab --instant-meshes-bin /path/to/InstantMeshes
```

If `--instant-faces` is 0 (default), the worker requests approximately half the source triangle count (capped at 30,000 and floored at 100). It skips source meshes smaller than 100 triangles to avoid needless remeshing. This does not guarantee a reduced number of exported triangles: output quads and tri counts can differ.

**No native binaries are included in the Skill ZIP.** If the toolchain is unavailable, report the exact missing executable; do not claim any mesh was processed. The `scripts/get_official_instant_meshes_source.sh` helper attempts to clone the upstream repository with submodules when network permits.
