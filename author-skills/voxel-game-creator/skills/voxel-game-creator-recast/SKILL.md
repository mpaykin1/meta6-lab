---
name: voxel-game-creator-recast
description: "Маршруты NPC по локальной навигационной сетке Recast/Detour в Voxel Game Creator; использует имеющийся Yuka AI и неизменённые Ragnagrok/Blockbench модели."
---

# Recast Navigation JS bridge for Voxel Game Creator

Use the existing Voxel Game Creator plugin and `skills/voxel-game-creator/scripts/generate_game.py`, not a new game engine or fake scene. Real MIT Recast Navigation JS v0.44.0 + `@recast-navigation/three` create a bounded navmesh and Detour path. The existing MIT Yuka Vehicle and `FollowPathBehavior` follow the resulting waypoints. This applies only to `--engine browser|server|both|all` (Lumenwild browser and Voxelize Three.js client).

Default `--nav-mode auto` tries pinned npm dependency install; `--nav-mode required` is fail-closed; `--nav-mode off` preserves original straight Yuka patrol. Requires `--npc-mode auto|required` and active Yuka npm dependency. To define static blocker boxes use `--nav-obstacles skills/voxel-game-creator/examples/recast-obstacles.json`. Existing authored Ragnagrok props automatically contribute static navigation footprints. Source checkout only on demand: `scripts/download_recast_navigation.py --out ./recast-src` (requires git+internet). Keep MIT notice `references/RECAST-NAVIGATION-LICENSE.txt`.

**The hero, its 3D/2.5D visual identity, controls and animation states are untouched.** Recast does not implement physics colliders, authoritative Rust NPC simulation, dynamic obstacle avoidance, or navigation for Vesper, Minecraft-W, Blockwild, Luanti, or Ragnagrok Studio. Voxelize terrain uses the current static approximate decoration plane, not replicated server chunks. Do not assert real obstacle avoidance on live voxel changes or a published playable URL without actual verification. If the WASM navmesh cannot be initialized, runtime warns and falls back to original authored Yuka waypoints. If a specific navmesh path is disconnected, that NPC is not spawned rather than steering through blocked space.

Refer to `skills/voxel-game-creator/references/recast-navigation.md` for exact pipeline, limitations, and parameters. Preserve all other engines and sources in the parent skill; do not create alternate plugin identities.
