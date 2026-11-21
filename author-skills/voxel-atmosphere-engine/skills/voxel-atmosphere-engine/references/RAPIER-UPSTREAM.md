# Rapier physics upstream — 0.21.0

Open source: https://github.com/dimforge/rapier (Apache-2.0).
Official JavaScript source: `bindings/typescript/` of the Rapier repository.
Official user docs: https://rapier.rs/docs/user_guides/javascript/getting_started_js/
Character controller: https://rapier.rs/docs/user_guides/javascript/character_controller_setup/

## Integration with the existing modules

- Goxel `.vox` → Blockbench `.bbmodel` → Blender `.glb` remains unchanged.
- Three.js GLTFLoader keeps original artwork; `fx/rapier-physics.js` traverses the actual loaded glTF and derives static box colliders for tree trunks, rocks, and lantern posts.
- Two-part portal collision keeps the central passage physically open; one crystal-cluster collision proxy complements the interactive level.
- Rapier capsule controller governs *the same* scene-graph player, never changes hero or spawns another actor. Keyboard & touch controls are identical to previous releases.
- Dynamic rigid-body crates fall onto a static ground collider and receive impulses on `J` attack. Fixed-step simulation at 60 Hz limits variable-frame instability.
- PostFX, Pixelorama billboards, meshoptimizer decoder, GLB AnimationMixer and GPU InstancedMesh all coexist, as physics does not edit their meshes.
- Press `H` or use PHYSICS button to toggle. If CDN / WASM fails, preserve original non-physics movement and show disabled status.

## Fetch model / offline policy

Pinned npm package: `@dimforge/rapier3d-compat@0.21.0` (bundles WASM into JavaScript).
The game loads local `fx/vendor/rapier.es.js` if present; otherwise the pinned jsDelivr or esm.sh ESM module. Run:

`python scripts/install_rapier.py --game /path/to/game`

This requires npm and network. If the download cannot complete, do not claim the upstream binary was downloaded; the game still runs using native Three.js collision fallback. The *Rapier feature* needs a compatible CDN or local vendored module.

No GPL engine source is copied; adapters are independent code and upstream remains separately licensed Apache-2.0.
