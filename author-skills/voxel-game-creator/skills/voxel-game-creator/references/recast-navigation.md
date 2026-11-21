# Recast Navigation JS — optional NPC navmesh routing

Upstream: https://github.com/isaac-mason/recast-navigation-js
Revision: `8a2ece9f8b4947fcb328e17c7ac76c41744021b3` (MIT © 2025 Isaac Mason).
Pinned npm dependencies: `recast-navigation@0.44.0`, `@recast-navigation/three@0.44.0`.

Integration path:

1. Blockbench / Ragnagrok provide unchanged NPC skins and independently authored static props.
2. Lumenwild `createColumnSampler(SEED)` supplies actual terrain height near the player's spawn; Voxelize uses the existing *approximate* constant 82m client-side decoration plane (NOT its authoritative server terrain).
3. `scripts/recast_bridge.py` converts a bounded 1m-spaced heightmap (max 70×70m) and footprint blockers derived from genuine Ragnagrok static props into native Three.js BufferGeometry + BoxGeometry meshes.
4. Official `@recast-navigation/three.threeToSoloNavMesh` uses Recast WASM and Detour `NavMeshQuery.computePath` to route each authored NPC waypoint sequence. Nav mesh is generated ONCE per client/game launch and destroyed after the paths are calculated.
5. Yuka `Vehicle`, `Path`, `FollowPathBehavior`, and `EntityManager` use the computed local [x,z] waypoints; native Three.js updates the same previously selected Ragnagrok or Blockbench character mesh, preserving visuals and named walking clip.

Use the official `generate_game.py` with `--engine browser|server|both|all` and `--npc-mode auto|required`.

`--nav-mode auto|off|required`: auto (default) adds Recast only if npm can resolve **both exact dependencies** to npm (Lumenwild) or pnpm-workspace (Voxelize) manifest + lockfile. If unavailable, Yuka's prior authored waypoint-only route is retained. Required stops generation when Recast is unavailable, and requires active Yuka. Off preserves all v0.10 behavior. `--with-recast-source` optionally clones official source to a separate folder at pinned revision; a copy of full upstream code is NOT in this plugin ZIP.

`--nav-obstacles <path>` optionally reads a JSON file containing `{"obstacles":[{"x":7,"z":5,"w":3,"d":2,"h":2}]}` in local XZ meters from the start position. `w`, `d`, `h` describe an axis-aligned fixed obstruction; `rise` is optional Y offset. Defaults always include authored visible Ragnagrok prop footprints regardless of the `solid` flag — **navigation avoidance only**, not engine collisions. Manual blockers are the way to avoid GLB assets/voxel constructions not covered by automatic Ragnagrok footprints.

At runtime navmesh generation/wasm failure warns and returns to the authored Yuka patrol; an individually blocked or disconnected patrol with a working navmesh is disabled rather than crossing the blocker. Recast is used for **local path planning**, not continuous crowd avoidance, server-authoritative AI, dynamic voxel edits, combat, physical collision, multiplayer sync, game saves, bridge/stairs pathing or dynamic terrain regeneration. The original user-controlled hero, hitboxes, keyboard inputs and action clips are NEVER changed. Increased FPS is not guaranteed without runtime measurement. Optional Yuka patrol has to be explicitly enabled and is not a replacement for native enemies.
