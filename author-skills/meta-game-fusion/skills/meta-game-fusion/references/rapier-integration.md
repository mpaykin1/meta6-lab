# Rapier 0.21.0 × META GAME FUSION

## Concrete integration

- Upstream: https://github.com/dimforge/rapier, Apache-2.0. Verified master commit `475caa3ff4646fd9a796b67d14116256f4962bc7` (2026-10-10). JS package `@dimforge/rapier3d-compat@0.21.0` (latest tag verified 2026-11-21). Its WASM is base64-embedded in the npm package, **not** in the plugin archive.
- `scripts/rapier_bridge.py prepare --library DIR --out NEWDIR [--workbench WORKBENCH] [--blueprint validated.json]` produces a complete Vite + Three.js + Rapier + inkjs project without modifying original source. Existing standalone original `last_viaduct.ink` ships in the previous workbench template.
- `--blueprint`: only already validated Rete scene blueprint (`scene_plan`). Nodes start/scene/mechanic/dialogue/branch/ending become runtime flow nodes; resources only provide candidates, no automatic execution. `--workbench` provides SHA-pinned, approved Ink source copies. `npm run dev` compiles registered Ink into bytecode and `inkjs.Story` runs dialogue selections with typed flag/item branches.
- Physical stage: one position-based kinematic capsule + Rapier `KinematicCharacterController` for movement, obstacles, stair autostep, snap-to-ground; gravity/jump applied in 60 Hz fixed step; `world.step()` advances rigid bodies; mesh transforms read from bodies each rendered frame. Player has explicit WSAD/arrows, Space, E and touch buttons; no automatic moves or attacks.
- Fixed meshes/physics match. Sensor markers are created with Rapier sensor colliders; `intersectionPair` or bounded proximity fallback detects player interaction. Dynamic crate bodies are rendered by their exact Rapier translation/quaternion.
- Authorized GLB art is SHA-checked from `optimized-model-library.json`, never assumed game-ready, copied *only* when both model inventory and linked resource explicitly approve reuse, have a license, and agree on SHA and optimized path. Asset importer does not change skins, animations, model/character identity or authored files. Optional GLB scenery is never substituted as the player.
- The world manifest (`public/world.json`, schema `meta-game-fusion.physics-world.v1`) contains serialized graph nodes and typed edges, location markers, and vetted copied asset references. Runtime interpretation is allowlisted; never eval arbitrary node code or grant network/file access to imported scripts.
- Browser output uses `THREE.WebGLRenderer`, atmospheric fog/light/shadow-free performance defaults and a single hero marker that may be replaced *only on explicit art approval*. This is a runnable example of physics/narrative integration, not an auto-generated production-grade game.

## Runtime limits

- Node >=20, `npm install --ignore-scripts` must succeed in the **generated** directory. If npm/DNS unavailable, keep the full source artifact; do not claim the game was actually rendered.
- Pinned dependencies: `three@0.186.1`, `@dimforge/rapier3d-compat@0.21.0`, `inkjs@2.4.0`, `vite@6.3.5`. Existing Rete workbench dependency set is unchanged.
- The developer must play the actual browser build and verify collisions, the real selected hero, mobile controls and performance before release. Rapier does not automatically reconcile incompatible source physics engines. Importing copyrighted game art requires separate asset-by-asset permission.
- No new plugin identity. Update same `meta-game-fusion` plugin, and never write to protected `meta6` source paths.
