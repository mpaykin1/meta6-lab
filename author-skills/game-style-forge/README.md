# Game Style Forge 1.7

Видео → OpenCV/PySceneDetect/MiDaS → 3D-scene with Three.js/GLSL/Postprocessing/Rapier → glTF Transform 4.5.1 model optimization. Single skill. Source snapshot of upstream glTF Transform is pinned and partial; npm runtime is separate.

## v1.8
three-mesh-bvh 0.9.18: static mesh visual raycasts, camera occlusion and E-key scan ring; does not replace Rapier. Runtime npm install required.

## v1.9
three-bvh-csg 0.0.18 creates true arched openings and windows in 3D; resulting static geometry is indexed by three-mesh-bvh, while Rapier uses explicit solid-part box proxies. Animated portal glows and fireflies run independently. Requires separate npm install for full CSG runtime. The stored GitHub source snapshot is partial.

## v1.10 Recast navigation

Pinned recast-navigation-js 0.44.0 (MIT): built once from authored floor geometry, CSG ruin and static props. Four persistent ambient NPCs walk patrol routes around real openings; Rapier registers their kinematic collision bodies. In absence of WASM, use the separately authored grid route planner. No fake AI path claim; web runtime requires npm install, not included in plugin ZIP.
