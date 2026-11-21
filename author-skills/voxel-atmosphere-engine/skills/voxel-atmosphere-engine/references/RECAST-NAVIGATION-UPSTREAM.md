# Recast Navigation JS 0.44.0 integration

Upstream: https://github.com/isaac-mason/recast-navigation-js
License: MIT, Copyright (c) Isaac Mason and contributors. Full license in RECAST-NAVIGATION-LICENSE.txt.
Recast 0.44.0 source and documentation inspected via official GitHub; `npm` and `git` external DNS unavailable in build environment. This skill does not claim to contain an installed or compiled WASM runtime.

`fx/recast-living-world.js` is an independently authored adapter:
- reads original `night_forest.glb` 3D geometry to extract walkable terrain and impassable rocks/trees;
- builds Recast navmesh with `@recast-navigation/core` + `@recast-navigation/generators` and the SAME shared WASM module, all pinned 0.44.0;
- runs `Crowd` with five distinct animated autonomous inhabitants;
- uses verified collision-aware A* if WASM or CDN is absent; never freezes a scene or teleports the player;
- maintains the original human-controlled avatar, original 3D meshes, Rapier colliders, Pixelorama sprite atlas, Quarks VFX and glTF animations.

Install real upstream runtime in network-capable environments:
`python scripts/install_recast.py --game /path/to/EMBERGROVE`

IMPORTANT: The installer creates local vendor ESM and importmap; in networkless environments the existing pinned CDN importmap and deterministic A* must be used. Do not claim Rapier or Recast is running without verifying the on-screen `RECAST` indicator or checking the engine mode. Fallback displays `NAV`.

Upstream API references:
- `new Crowd(navMesh,{maxAgents,maxAgentRadius})`, `crowd.addAgent()`, `requestMoveTarget()`, `crowd.update(1/60,delta,4)`
- `new NavMeshQuery(navMesh)`, `findClosestPoint()`, `computePath()`
- `generateSoloNavMesh(positions,indices,config)`
- default glTF authored 3D height and scale are Y-up in Three.js.

Recast generator builds require suitable triangle geometry, not pixel collision masks. For large scenes, precompute navmesh off-thread or offline. `A*` pathfinder is the independently authored deterministic fallback, not upstream Recast.
