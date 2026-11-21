# Three Mesh BVH 0.9.18 — interactive spatial queries

Upstream: https://github.com/gkjohnson/three-mesh-bvh (MIT), release tag v0.9.18.
Official npm module `three-mesh-bvh@0.9.18`, compatible with Three.js 0.187.0 (peer three >=0.159).

Integration: `templates/pastel-blocks/bvh-picking.js` loads upstream `computeBoundsTree`, `disposeBoundsTree`, `acceleratedRaycast` and `SAH` via pinned import map. Build **one** tree on immutable shared tile geometry, not one tree for each tile. Patch only static individual mesh raycast functions, never `THREE.Mesh.prototype` and never rigged VRM meshes. Set `raycaster.firstHitOnly = true`. A BVH hit provides its actual surface point to existing Tween.js animated impact ring.

The static BVH has NO authority over rigid body collisions: Rapier is the sole physics engine. Physics debris and VRM skin animations retain their original code. If module download or BVH building fails, `PICKING · STANDARD` means the ordinary Three.js raycast still works. `PICKING · BVH` appears only after actual boundsTree was built. It is a spatial query accelerator, not an extra renderer or a replacement for Meshoptimizer, which compresses network asset size.

For true offline builds, run `python vendor_engines.py --game .` with network. This obtains and SHA-512-verifies the official npm archive and copies **all** `src/*.js` relative imports to `vendor/three-mesh-bvh/src/`. The module is not prebundled in the ZIP if npm DNS is unavailable.

Do not promise FPS increases: on a small board the cost of BVH construction can outweigh saved raycast time. Benefits increase with static, complex imported GLB meshes and repeated spatial queries. Never compute BVH every frame or for deforming meshes without an appropriate refit. Maintain both mobile portrait and landscape viewport, user-controlled hero actions, and animated ambient scene.
