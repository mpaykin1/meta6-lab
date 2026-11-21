# PyMeshLab → Blender mesh bridge (v1.1)

## Upstream

- PyMeshLab (GPL-3.0): https://github.com/cnr-isti-vclab/PyMeshLab
- Mesh API: https://pymeshlab.readthedocs.io/en/latest/classes/mesh.html
- Filters: https://pymeshlab.readthedocs.io/en/latest/filter_list.html
- Install: `python -m pip install pymeshlab numpy`

PyMeshLab is an external GPL-3.0 dependency; **its binary and full source are not bundled**. This package contains only our original adapter scripts and source links. Keep any third-party code and licensing separate from original adapter files.

## Actual integration

`run_enhancer.py` → headless Blender (`auto_enhance.py`) → an isolated Python process (`pymeshlab_worker.py`) → back to Blender → GLB/BLEND export.

The bridge sends local-space triangle vertices to the worker. It uses exact-duplicate-vertex, duplicate-face, zero-area-face, and unreferenced-vertex filters. It checks that the output remains nonempty with valid indices and nearly identical bounds. The Blender object, name, parent transform, original armature and animation datablocks are never replaced. Source input remains untouched.

- `--pymeshlab-analyze`: read-only diagnostics on all triangle meshes, including skinned meshes.
- `--pymeshlab-clean-static`: inspect all, update only unskinned static mesh with NO UVs, material slots, shape keys, custom vertex attributes, color layers, vertex groups, modifiers, custom normals, shared datablocks, or mixed smooth/flat faces.
- Ineligible meshes are deliberately analyzed without modification. If the mesh is textured, the Blender-only `--repair-static` option might still change topology if separately requested; do not silently enable it.
- PyMeshLab is not invoked by default; optional flags must be explicitly requested.

## Commands

```bash
python -m pip install pymeshlab numpy
python skills/blender-model-animation-enhancer/scripts/run_enhancer.py --input tree.obj --output tree-clean.glb --pymeshlab-clean-static
python skills/blender-model-animation-enhancer/scripts/run_enhancer.py --input hero.fbx --output hero.glb --pymeshlab-analyze
```

Run PyMeshLab in a *separate* Python environment from Blender's bundled `bpy` to avoid native extension/Qt compatibility issues. Supply `--pymeshlab-python /path/to/python` when necessary. If PyMeshLab isn't available, explicitly fail instead of simulating improvements.

## Limits

The bridge does not infer new textures, rig weights, LODs, UV unwraps, animations, blendshapes, remesh the sculpt, repair self-intersections, or retarget a character automatically. Texture/material preservation is prioritized over destructive cleanup. No Blender/PyMeshLab computation can run without the actual binaries and an input 3D asset.
