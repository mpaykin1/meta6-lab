# Twilight Island × Sunken City — parallel development contract

Status: **IN DEVELOPMENT; NOT OWNER PASS/FAIL**. Source task: https://github.com/mpaykin1/World_server/issues/522

## Truthful baseline
Accepted source game V7: https://github.com/mpaykin1/meta6/tree/main/observer-world-en-v7
Sunken City original pack and procedural generation code: https://github.com/mpaykin1/World_server/pull/521
Do not overwrite V7, V6, or a prior user-accepted game. A new separate game must be assembled under `underwater-world/`.

This branch is the PRIMARY ChatGPT integration development branch. It initially stores the exact scope/handoff; it does **not** yet contain a playable underwater game. Until real graphics, physics, mobile testing and public deployment are verified, do not circulate a guessed playable URL.

## Ownership / no file collisions

**Primary ChatGPT (integrator)** owns:
- `underwater-world/index.html` and original V7 game cloning/integration
- `underwater-world/underwater-runtime.js` water physics, vertical swim/buoyancy, batyscaphe, surface transitions
- `underwater-world/terrain/` seeded chunk terrain, native-style continuous slopes, islands
- `underwater-world/assets/` loading the Sunken City pack
- `underwater-world/mobile/` viewport/joystick and buttons
- integration tests and final merge/release, with independent review

**Second ChatGPT / Codex (parallel specialist)** owns **only new isolated modules**:
- `underwater-world/quests/`: a data-driven quest engine, underwater ghost NPC, deterministic progress state, dialog/story texts, quest tests.
- `underwater-world/creatures/`: underwater creature catalog, passive/rarely-hostile FSM/AI, shared event dispatch contract, unit tests.
- `underwater-world/docs/CODEX_HANDOFF.md`: documentation for hooks and integration examples.
Do NOT edit `index.html`, `underwater-runtime.js`, `terrain/`, `mobile/`, `assets/`, baseline V7, or root CLAUDE.md/AGENTS.md. No edits to World_server PR #521 or unrelated game PRs.

Codex should branch from `ai/chatgpt/twilight-underwater-20261016` to `ai/codex/twilight-underwater-quests-20261016` and propose a PR with only the assigned files. Preserve all existing primary changes; make clean cherry-pick possible. Report PR, SHA and test results.

## Module interface to implement (Codex)
ES modules, no new npm runtime deps, no imports of game renderer:
- `createQuestSystem({seed, emit, onReward})`: `interact(npcId, worldState)`, `onEvent(event)`, `serialize()`, `restore(state)`, `getAvailableQuests()`.
- `createCreatureSystem({seed, emit})`: `spawnForChunk(chunkX,chunkZ,biome)`, `update(dt, context)`, `onPlayerAction(action)`, `serialize()`. Stable ids from seeds, bounded active entity count, neutral bias, occasional contextual hostility, avoid continuous combat.
- Event shapes and asset ids described in the Codex handoff document, with no engine monkeypatching. Main ChatGPT owns adapters binding to actual Three.js simulation / combat.
- Unit tests must run with `node --test underwater-world/quests/*.test.mjs underwater-world/creatures/*.test.mjs`.

## Acceptance
Preserve original terrestrial weapons, loot, lighthouse ghost/warden gameplay, camera, 3D visuals, phone HUD. Underwater jump: hold rises, release descends smoothly; top-right weapon-change button enters/exits bathyscaphe underwater; shooting only if a genuinely picked-up ranged weapon and its original ammo are available. 3D seabed with shoreline ramps; deterministic seamless unlimited chunks horizontally. Joystick must never pan browser/document/world by touch-drag; only controls hero, original camera follow can persist. Ocean wildlife usually non-aggressive. Underwater ghost «Хранитель Глубин» offers six exploration-first quests: lost bell voice, cartographer fragments, lighthouse beacons, coral restoration, ship trail, stopped clock. Playable public release under `https://mpaykin1.github.io/meta6/<new-game>/` **only after independently measured >=85% player-visible quality**, live browser and phone evidence. Owner alone decides PASS/FAIL; never commit verdict-based learning before owner decision.
