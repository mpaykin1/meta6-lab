# glTF-Transform + Rapier + Three.js + original Hero Animator art

Upstream: https://github.com/donmccurdy/glTF-Transform (MIT) — packages `@gltf-transform/core`, `extensions`, `functions` pinned to **4.5.1**. For optional Meshopt compression: https://github.com/zeux/meshoptimizer (MIT), npm `meshoptimizer@1.3.0`. Both are build-time dependencies, not image-generation engines. Use local package versions; do not use external CDN in a shipped game.

## Unified pipeline

`source GIF/PNG → rembg (optional candidates) → RIFE (optional candidates) → approval & SHA256 → MaxRects sprite atlas → runtime/hero-hybrid.mjs` for animated hero. In parallel, `original static world.glb → gltf_prepare.mjs → optimized world.glb + colliders.json`, then `GLTFLoader/MeshoptDecoder → THREE scene + original-geometry Rapier colliders → hero-rapier-postfx-loop.mjs → selective bloom/fog`. The two branches only meet inside the actual game. Never process authored hero PNG/GIF/atlas, character rig or animated GLB with the static-scene meshopt command.

## Actual invocation

Install dependencies in `skills/hero-animator`: `npm install --no-audit --no-fund` (requires existing trusted npm registry access). `package.json` pins MaxRects, glTF-Transform and Meshopt together. Node 18+.

In Blender/GLB export, add triangle mesh objects named `COLLIDER_TERRAIN_*` for ground or `COLLIDER_*` for walls/obstacles. Keep them static, ensure original world-space transforms match the visible terrain and the world root remains at the origin. This is intentional source-authored collision proxy geometry, not inferred from a changed or compressed visual mesh.

`node scripts/gltf_prepare.mjs art/original_world.glb game/assets/world.glb --meshopt --require-colliders`

Output: `world.glb` (optimized if smaller), `world.glb.hero.json` (asset integrity), `world.glb.colliders.json` (full-precision source Rapier triangles). The original asset is **never modified**. If Meshopt changes names, textures, alpha behavior, node transforms, animation/skin structure, or a collider is absent, the adapter blocks. Without `--meshopt`, only exact duplicate vertex accessors are deduplicated. Only `TRIANGLES` collision proxies supported; no procedural physics shortcuts. `--meshopt` refuses skins, animations and morph targets. If optimization makes output bigger, original GLB is retained.

The game builds with the existing pinned `three@0.180.0` (which provides GLTFLoader and MeshoptDecoder), `@dimforge/rapier3d-compat@0.21.0` and `postprocessing@6.39.6`. `node scripts/prepare_postfx_game.mjs PATH_TO_GAME` copies `runtime/gltf-rapier-scene.mjs` with existing runtime modules. Usage in the game module:

```js
import {loadGLBIntoRapierWorld} from './src/hero-animator/gltf-rapier-scene.mjs';
// physics is the actual createRapierHeroPhysics({...}) object, already initialized.
await loadGLBIntoRapierWorld({url:'./assets/world.glb',scene,physics});
// THEN run ONE Rapier/animation/PostFX loop, no separate second render or gravity tick.
```

The loader uses the real Three.js `GLTFLoader` and `MeshoptDecoder` and registers all generated source-based static triangle colliders in the existing Rapier physics object. It hides physical proxy objects in the rendered scene, does not alter the hero's materials or sprites, and does not start automatic actions. PostFX only affects world emissive meshes; never add hero sprite to bloom selection. Never modify the imported scene root transform after generating world-space colliders.

## Safeguards

- Geometry transforms and material states checked before/after model rewrite. Source GLB/PNG/atlases remain immutable; input and output SHA256 recorded. This is structural validation, not a claim of absolute visual equivalence. A full visual game check is still required.
- Meshopt compression applies geometry quantization; its visual world may deviate slightly. Colliders always use source full precision, so physically exact contact vs quantized surface may differ slightly; inspect on the game scene before acceptance. For no quantization use command without `--meshopt`.
- When the game is offline, ensure the 3D bundle includes Three.js GLTFLoader, MeshoptDecoder code, WASM Rapier, actual `.glb` content and collider manifest. A local module+fetch template without asset bundling is **not** a standalone offline HTML.
- No hidden fake ground or substitute Canvas hero. If `COLLIDER_` assets, approved hero clips, npm dependencies or actual runtime bundle are missing, do not label the game complete.
