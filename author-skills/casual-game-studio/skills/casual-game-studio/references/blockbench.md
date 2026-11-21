# Blockbench editor → Casual Game Studio — v0.4

- Upstream project: https://github.com/JannisX11/blockbench, tag `v5.2.0`.
- Licence of **editor code**: GPL-3.0, full official terms: https://github.com/JannisX11/blockbench/blob/v5.2.0/LICENSE.MD. The Blockbench editor is not copied into this plugin/game.
- Official editor README explicitly distinguishes user-created model assets from the editor's GPL code; artists retain their authored models.
- Official native codec: `js/formats/bbmodel.js` at tag v5.2.0. The .bbmodel format is a Blockbench project format and can change with versions; keep editable sources.
- Source inspections: `README.md` Git blob `f03d92c37098b5b9c0979d8060cea4258f1a8002`, `bbmodel.js` blob `66ccb9124a7157e700a743c729e68e9082e30eb0`, `LICENSE.MD` blob `e72bfddabc15be5718a7cc061ac10e47741d8219`.

## Workflow

1. Create 3D model in Blockbench (free-mode cube models). Save `.bbmodel` so the original editable project is retained.
2. For basic cube models only: `python scripts/bbmodel_to_glb.py --src art/mascot.bbmodel --out models/pastel-bunny.glb`. The converter emits glTF 2.0 binary, pastel PBR materials, actual faces, normals and indexed triangles. Material color is read from the native `cube.color` palette index (0–7).
3. For complex models, textured meshes, rigging, nested group transforms and animations, use **File → Export → glTF/GLB** from Blockbench rather than the simple converter.
4. `model-loader.js` imports the official `GLTFLoader.js` addon from the **same pinned Three.js** as the game. Never turn a 3D model into a billboard sprite. The real glb receives lights, shadows and its own event-triggered Tween.js transforms.
5. An original bunny is included in `examples/blockbench/pastel-bunny.bbmodel` and is converted into the game template's `models/pastel-bunny.glb`. This file is a **Casual Game Studio created sample**, not Blockbench or third-party artwork.
6. `python scripts/install_blockbench_source.py --out /desired/path` is a separate optional `git clone` of the full official Blockbench editor, requiring network access. Do not import or bundle its GPL JavaScript in a permissive runtime without fulfilling its licence.

## Scope

`bbmodel_to_glb.py`: supports visible cube elements, axis-aligned bounds, single-axis cube rotation about origin, outliner ordering and simple color-index materials. It deliberately raises an error for multi-axis rotations and does not interpret group rigs, textures, arbitrary meshes or animations; use the editor's native glTF export for those. Only build a GLB from authored/licensed inputs.

## Offline

`vendor_engines.py` now downloads exactly three official Three.js addons (`GLTFLoader.js`, `BufferGeometryUtils.js`, `SkeletonUtils.js`) along with Three.js core and the postprocessing build, and remaps the `three/addons/` import prefix to local files. Tween.js and the original bunny GLB already ship with the generated game.
