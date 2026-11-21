# Recast Navigation JS × META GAME FUSION v0.8

## Pinned upstream and module contract

- Recast Navigation JS upstream: https://github.com/isaac-mason/recast-navigation-js, MIT, commit `8a2ece9f8b4947fcb328e17c7ac76c41744021b3` (2026-10-30).
- Native npm dependencies `recast-navigation@0.44.0`, `@recast-navigation/three@0.44.0`, Three.js `0.186.1`; these depend on WASM. Only the verified upstream MIT license and **new, originally authored adapters** are bundled in this skill. Full upstream source, WASM and node_modules are **not** installed or bundled.
- `src/navigation.js` creates a walkable collision-aligned floor mesh from `FusionPhysics.navFixedObstacles` (static Rapier colliders). It invokes genuine WASM `init()`, `threeToSoloNavMesh()`, `NavMeshQuery.findClosestPoint()`, `computePath()`.
- Navigator controls exactly one distinct NPC scout. `physics-world.js` owns the NPC collider and controller, so Rapier remains authoritative for physical collisions. Player capsule/controller/input remain unchanged and are never moved by Recast.
- Rete.js stage transitions call `navigator.setTarget(node.id, world.markers[node.id])` on the original event graph. Ink choices still update typed flags; navigator never automatically triggers a story event or hero action.
- Qdrant catalog indexes a source-hashed adapter card as `engine-adapter` with `npc-ai`/`navmesh` tags, referencing plugin-local code. No foreign original game code is copied/exec'd.
- The demo provides an on-demand `NavMesh` debug overlay (toolbar button or N), a visible gold path and a lantern-bearing scout.

## Runtime behavior and boundaries

- `recast-navigation` queries only the static collider-derived floor; decorative meshes, arbitrary imported GLBs and dynamic props are excluded to avoid misleading walkable routes.
- Dynamic crates remain physical obstacles. The NPC may attempt a new path when blocked, but **no tile cache or dynamic NavMesh updates** are claimed. Collision responses cannot guarantee a route around a crate. This is a genuine navigation sample, not automatic AI reconstruction of all imported games.
- World manifest marks navigation engine and origin. Missing WASM or failed navmesh produces an explicit UI state (`ПРОВОДНИК · НЕДОСТУПЕН`), while the Rapier game remains playable.
- The current floor bounds are intentionally scoped to the sample viaduct. Larger or multi-height levels require tile navmeshes and authored off-mesh connections. Never silently translate other games' world units, paths, skins or animation rigs.
- A full browser launch and pathfinding verification require successful `npm install --ignore-scripts` in the generated Vite game and a browser with WASM/WebGL; this environment did not provide npm registry DNS.
- Never modify protected meta6 original source games. Only explicitly approved, SHA-verified GLB assets may be copied into the generated output.

## Build invocation

```bash
python skills/meta-game-fusion/scripts/rapier_bridge.py prepare \
  --library /path/to/fusion-library --out /path/to/new-recast-world
cd /path/to/new-recast-world
npm install --ignore-scripts
npm run dev
```
