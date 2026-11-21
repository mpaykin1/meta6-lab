# Yuka — open-source NPC patrol agents (v0.10)

- Source: https://github.com/Mugen87/yuka
- Reviewed source revision: `10591304811222d6856020d5de129b39ef43b58d`
- License: MIT, © 2023 Yuka authors. Official LICENSE copied in `YUKA-LICENSE.txt`.
- Packages: `yuka@0.7.8`, `@types/yuka@0.7.4`. Official game AI classes `EntityManager`, `Vehicle`, `Path`, `FollowPathBehavior`, `Vector3`; see `src/core/EntityManager.js`, `src/steering/Vehicle.js`, and `src/steering/behaviors/FollowPathBehavior.js`.
- Optional source checkout: `python3 scripts/download_yuka.py --out <dir>`; source is NOT bundled in the Skill. Git and internet access are required. Dependencies are installed via npm only when generating a game and network/cache is available.

## Integration

- `scripts/yuka_bridge.py`: create a unique original Ragnagrok-compatible voxel humanoid model (`vgc_watcher`). Model uses the real RLE palette and surface voxel geometry. The same body is used in all frames, and only NPC motion is automated. The original player entity, keyboard bindings and all player animations remain unchanged.
- In browser mode, Yuka mounts its agents to the native Lumenwild Three.js scene and uses the game terrain height sampler. In server mode Yuka mounts to the Voxelize Three.js client's scene; vertical height defaults to the same 82 used for the static Ragnagrok props. Steering runs on the client and **is not authoritative AI**: no network synchronization, save-state transfer, NPC combat or physics collision.
- Yuka `Vehicle` steering follows authored looped patrol paths with up to eight NPCs at bounded 30Hz steps. No navmesh or obstacle-aware routing yet. Do not describe these as intelligent pathfinding enemies; the next planned Recast integration can add real pathfinding.
- `ragnagrok:<model_id>` references any verified existing Ragnagrok voxel model in the shared asset pack. `glb:<asset_id>` references a Blockbench GLB passed via `--blockbench-assets-dir` or `--blockbench-manifest`. The optional named `walkClip` must exist in the GLB. A given NPC's one and only GLB stays the same for idle and walking; no replacement with placeholders. When a load fails the NPC is omitted, not replaced with another figure.
- `scripts/generate_game.py` flags: `--npc-mode auto|off|required` (default auto), `--npc-manifest path.json`, `--with-yuka-source` (pinned full MIT checkout, separate); `--engine browser|server|both|all`. `auto` only emits Yuka code after `npm install --package-lock-only --save-exact --ignore-scripts` succeeds, checking package and lock versions. Otherwise original manifests restored and game output continues without AI. `required` refuses to generate without Yuka. There are no npm dependencies for Luanti Lua or native Ragnagrok Studio.
- `--npc-manifest` JSON has `{ "agents": [{ "id": "keeper-01", "asset": "ragnagrok:vgc_watcher", "path": [[5,3],[9,3],[10,8]], "speed": 0.9, "loop": true }] }`, or use included `examples/npc-patrol.json`. Coordinates are local (X,Z) offsets in meters. `glb` asset may set `walkClip` to an exported animation clip name. Max 8 agents; max 12 waypoints per agent.

## Behavior and boundaries

1. Each Yuka agent is its own NPC Vehicle. `manager.update(1/30)` computes only its independent translation/velocity. One position sync updates a separate THREE.Group and optional AnimationMixer, driven by the same original model.
2. Existing three-mesh-bvh static prop indexing remains untouched. Never BVH-index moving NPC geometry with a static tree.
3. Existing `glTF-Transform` + `Meshoptimizer` pipeline still applies to GLBs before NPC loading; a meshopt-enabled model uses the Three.js bundled decoder. Ragnagrok NPC meshes use real InstancedMesh, not Canvas primitives.
4. Three.js scene, voxel chunk collision, savegames, multiplayer gameplay and Blockwild backend are unchanged.
5. No network source checkout/build/hosted game claim without actual evidence. No benchmark claim without runtime measurement.
