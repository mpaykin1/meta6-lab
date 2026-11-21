# three-mesh-bvh — девятый OSS (v0.9.0)

Official source https://github.com/gkjohnson/three-mesh-bvh, pinned SHA `0375ada0d674af3a4a169c4ad890239cf3d60cda`, npm `three-mesh-bvh@0.9.18`, MIT © Garrett Johnson. Three.js peer version >=0.159.

## Where actually installed

`scripts/bvh_bridge.py`: after real Blockbench GLB model injection into `browser/` (Lumenwild) and/or `server/examples/client/` (Voxelize), `npm install --package-lock-only --save-exact ... three-mesh-bvh@0.9.18` updates **both** the package manifest and lockfile. We verify the package and lock entry; if npm/network is unavailable in `auto` mode, both original manifests are restored and no BVH imports are added to game code. Required mode fails closed.

`scripts/bvh_bridge.py` then creates `src/vgc/asset-bvh.ts`, injects `indexImportedStaticMeshes` after each GLTFLoader-loaded model and passes each game's existing camera. Default keyboard `J` performs triangle-accurate mesh hit testing on the loaded user asset and shows an in-world name/distance HUD for 2 seconds. The player decides when to inspect. Rigs, morph targets and skins NEVER receive a static hierarchy; they retain native raycast. `mesh.raycast` is set **per imported static mesh only** (never the global THREE.Mesh prototype or terrain meshes). The model's `BufferGeometry` is not cloned and retains glTF animation, materials and vertex indices; `MeshBVH` indirect mode avoids triangle reorder. The raycaster uses `firstHitOnly` and limits distance to five meters. No new render loop.

**This is precision ray picking, NOT character collisions**. We do not claim that imported props block walking or that server-side Rust physics is modified. Luanti's solid nodes already have independent collisions, not affected. Static raycasts are not suitable for deforming meshes. World terrain chunks use original engine block physics and hits.

`--bvh-mode auto|off|required`, default auto. `--with-bvh-source` optionally clones the MIT repo separately in the output. `python3 scripts/download_three_mesh_bvh.py --out <folder>` uses the pinned SHA. If the generation host lacks network, the full source is NOT embedded and `auto` falls back to native Three.js raycasting.
