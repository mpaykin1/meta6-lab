# Three BVH CSG 0.0.18 · real constructive solid geometry

Upstream: https://github.com/gkjohnson/three-bvh-csg
Pin: 0.0.18, MIT. Compatible with Three.js 0.187.0 (requires >=0.179) and three-mesh-bvh 0.9.18 (requires >=0.9.7).

`templates/pastel-blocks/csg-workshop.js` imports the actual official `Brush`, `Evaluator`, `SUBTRACTION` and `MeshBVH` classes. On a user CARVE command, it subtracts a closed cylinder from the selected two-manifold tile mesh. The result replaces only that tile's geometry, and a fresh MeshBVH is created for correct ray picking. It does not replace the tile object, materials of other tiles, Blockbench bunny, or the VRM character.

Rapier retains conservative box colliders (CSG only modifies render geometry in this example). Later projectile hits still trigger Rapier contact, Quarks particles, Tween contact ripple, and Bloom; the original block scene remains if CSG module loading or subtraction fails. Ten cuts max for phone performance. Never run CSG from the RAF or every frame; always precompute or trigger on user action.

For offline game delivery on an online machine: `python vendor_engines.py --game .` downloads *actual* upstream npm package, validates registry SHA-512, vendors its complete source `src/`, and updates importmaps. In an environment without network, CSG is optional and clearly marked UNAVAILABLE; do not call it an offline bundle.

Upstream is experimental; input solids must be watertight (two-manifold), and CSG may have non-manifold output in corner cases. Validate geometry and recover to the unmodified original on failure. Do not apply CSG directly to deforming/skinned VRM heroes or use it as an automatic replacement for Rapier physics.
