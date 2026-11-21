---
name: meta-game-fusion
description: Build new Three.js 3D games from approved assets, Rete.js + inkjs narrative, Rapier physics, Recast NPCs, Postprocessing visual effects, three-mesh-bvh spatial queries, Playwright and ScanCode license gate.
---

# META GAME FUSION v1.2 — Tree-sitter × Assimp × glTF-Transform × Qdrant × Rete.js × inkjs × Rapier × Recast × Postprocessing

## Module 13 — three-mesh-bvh static geometry acceleration (new)

**Always use the SAME plugin lineage**. `three-mesh-bvh@0.9.18` strengthens the existing Three.js `0.186.1` visual engine without replacing Rapier collision, Recast routing, or Ink story flow. The authored `templates/rapier-world/src/spatial-bvh.js` registers static scene geometry and verified GLB scenery, creates shared geometry BVHs, provides accurate first-hit pointer picking, and exposes a read-only LOS observation for the Recast scout. Dynamic crates, moving heroes, skinned rigs, morph targets and any animation-bearing GLBs are excluded. No auto actor commands or silhouette/rig changes.

The unified `scripts/fusion_builder.py` now calls `scripts/bvh_bridge.py` to produce a `bvh-manifest.json` from exact SHA-256-verified authorized GLB *output bytes*. Qdrant indexes the authored adapter as a reusable source-hashed engine component. The new Vite project pins the library in `package.json` for explicit installation. Do not claim a compiled/running browser scene until npm and Playwright execution genuinely succeed. Read `references/bvh-integration.md`.

## Module 12 — Three.js unified game builder (new)

**Mandatory accompanying skill:** `../animated-world-guard/SKILL.md` and `references/living-world-enforcement.md`. Every rendered NPC must use visible independent animations, and every interactive generated game must fill the portrait/landscape viewport. If no verified character animation assets are provided, ship only an incomplete tech preview, never a finished game.

Use `scripts/fusion_builder.py build --library LIBRARY --out NEW_DIRECTORY --concept "original idea" --visual-style ink` to assemble an original three-chapter playable **project**, or `--blueprint approved-fusion-scene-blueprint.json --workbench /path/to/approved-stories` to build from a validated Rete graph. It invokes the existing Rapier builder and adds `templates/rapier-world/src/living-world.js` Three.js layers: independent wind vegetation, glowing lanterns, ruins, drifting particles, depth silhouettes and animated chapter art. The renderer automatically matches the existing story/style system; all physical colliders remain Rapier-authoritative, and the NPC uses its Recast navmesh path. Procedural hero is a *demo placeholder* only. Keep uploaded approved art and character identity as-is; never replace an approved asset with procedural geometry or silently generate character animation.

**Strict rights gate:** all imported GLB assets must be individually approved and have a current ScanCode source-file record tied to SHA-256 and exact converted output hash. Missing, stale, or unclear records fail the build (no silent asset omissions). No harvested game code executes without an independently written and reviewed adapter. Output is atomic, new and outside source repositories. The skill does NOT contain the installed Three.js npm package, and browser playability remains unverified until dependencies are installed and rendered. See `references/three-unified-builder.md`.

## Module 11 — ScanCode Toolkit 32.5 (licensed source reuse)

Before reusing indexed game resources, run installed ScanCode CLI on explicitly authorized source folders with `scripts/scancode_bridge.py scan --library LIBRARY --game GAME_ID`. If ScanCode is unavailable, use `ingest` with an actual existing CLI report or explicitly mark rights as unverified. No online upload or automatic license approval. This preserves all Tree-sitter / Assimp / glTF-Transform / Qdrant / Rete / inkjs / Rapier / Recast / Postprocessing / Playwright functionality.

The new `scancode-rights.json` contains original file hashes, detected license expressions and statuses only. Qdrant metadata and Rete nodes show status. If a scan is present and rights are missing/restricted/ambiguous, reuse is blocked (including old approvals) until independently reviewed. Rights owners can record an exact-hash manual exception with `review`, then must separately approve individual reusable components via existing Rete workflow. **Licenses for original art, media and fonts must be reviewed independently.** Read `references/scancode-integration.md` before any reuse; do not silently run scanners or manufacture findings.

## Trigger

Use for user-owned game source reuse, mechanic and asset discovery, library creation, game-combination preparation, or further updates to the **same** META GAME FUSION plugin. Never create a second plugin when asked to add the next open-source project.

## Current working scope

1. **Tree-sitter `scripts/fusion.py`** statically indexes JavaScript/JSX/TypeScript/TSX code, exported symbols, imports and candidate mechanics. Writes `fusion-index.json`, `component-library.json`, `model-candidates.json` with original paths and hashes. Tags are heuristics, not evidence of functional reuse.
2. **Assimp `scripts/assimp_bridge.py`** reads the same index, inventories model candidates, optionally uses an installed native Assimp CLI to convert to GLB2 into a separate library. Maintains game origin and SHA-256; checks structural container metadata; leaves rig/material/animation acceptance `false` until verified.
3. **glTF-Transform `scripts/gltf_optimize.py`** consumes Assimp `model-library.json` in that same library, verifies original model and GLB hashes, performs conservative deduplication using pinned CLI `4.5.1`, checks glTF scene/mesh/nodes/skins/animation channel invariants and saves smaller artifacts to `optimized-glb/`. The resulting `optimized-model-library.json` preserves original records and adds optimization metadata.
4. **Three.js `templates/three-loader.mjs`** is a reusable import adapter for the optimized GLBs and optional MeshoptDecoder; returns the existing authored animation clips without automatically playing any actions, replacing sprites or changing character identity.

5. **Qdrant `scripts/qdrant_bridge.py`** builds a shared search catalog from Tree-sitter code mechanics, source assets, Assimp models and glTF-Transform optimized GLB references. Stores provenance, SHA hashes, license flags and candidate compatibility only. Defaults to private embedded Qdrant local mode. A deterministic multilingual lexical hash is the offline embedding; genuine multilingual semantic search requires explicit optional FastEmbed + model weights. **No model or source code is transferred into Qdrant payload.**
6. **Rete.js 2 `scripts/rete_bridge.py` + `templates/rete-workbench/`** generates a complete graphical node editor (core NodeEditor + AreaPlugin + ConnectionPlugin + LitPlugin) using the same Qdrant candidate metadata, with draggable scene/mechanic/asset/branch/ending nodes and typed event/resource sockets. Export graphs to JSON, import, preserve editable browser-local state, and validate story reachability, DAG, source hashes, ownership approvals and branch conditions into a **non-executable scene blueprint**. Model/code sources stay read-only. See `references/rete-integration.md`.

7. **inkjs `scripts/ink_bridge.py` + `templates/rete-workbench/scripts/compile-stories.mjs` + `src/ink-story.js`/`ink-player.js`** compile only specifically registered `.ink` story copies using pinned `inkjs/full@2.4.0` into JSON, preserve source SHA and legal permissions, expose actual dialogue choices within the Rete graph preview, and export approved Ink variables into typed `flag:`/`item:` world state driving branch results. Browser-local save/restore belongs to one graph. Included original example story: **Последний виадук**. See `references/inkjs-integration.md`. This is an executable **narrative-only prototype**; it does not execute imported game mechanics.

8. **Rapier 0.21 `scripts/rapier_bridge.py` + `templates/rapier-world/`** compiles a fresh **playable 3D physical scene prototype** from either the built-in original Rete/Ink demo or an already validated `fusion-scene-blueprint.json`. Three.js renders a nighttime viaduct; Rapier runs one kinematic hero capsule, fixed world colliders, dynamic props, authored movement/jump and per-stage sensors. Rete stage nodes map to typed physical triggers, Ink dialogue choices update `flag:`/`item:` state, and branches route to authored endings. The reusable 3D adapter has mobile controls, third-person camera, quality toggle and local story saves. Only SHA-verified explicitly rights-approved optimized GLBs are copied as scenery. **Imported mechanic source is NOT executed and the 3D level itself is a physics sample, not an automatic merger of whole games.** See `references/rapier-integration.md`.

9. **Recast Navigation JS 0.44 `templates/rapier-world/src/navigation.js`** constructs a genuine Recast/Detour NavMesh from Rapier-authoritative **static collision footprints** (not decorative meshes). An independently rendered scout NPC requests `NavMeshQuery.computePath` routes to the current typed Rete stage marker; a separate NPC Rapier kinematic collider processes physical movement. Story choices remain inkjs-owned; the hero is never driven by AI. `N` or the `NavMesh` button toggles a real NavMesh helper. Qdrant indexes this originally authored nav adapter with its bundled SHA and clear origin. Static obstacle avoidance is real, while dynamic obstacle handling is collision/repath best effort — no dynamic tile cache is claimed. See `references/recast-integration.md`. Runtime requires npm-installed `recast-navigation@0.44.0` + `@recast-navigation/three@0.44.0` and their WASM; no binary/full upstream clone is included.

10. **Postprocessing 6.39.6 `templates/rapier-world/src/postfx.js`** now provides a working *authored* GPU film and colour shader, `EffectComposer` with bloom, tone mapping, vignette, grain, optional pixelation and physically depth-dependent Three.js fog. Scene progression via Rete sets smooth visual mood transitions; six style presets (`nocturne`, `ink`, `ember`, `horror`, `dream`, `pixel`) can also be manually switched with `V`/Style button. `P`/FX cycles `cinema` / `eco` / `off`; FPS safeguard can reduce quality. Qdrant indexes this actual adapter and source SHA. The rendering module **cannot** alter the hero rig, actions, physics/NavMesh or Ink variables, and the original game art remains untouched. A new `scripts/postfx_bridge.py` edits only generated world `visual_direction` metadata. `postprocessing@6.39.6` is npm runtime only; dependency installation and browser rendering are not verified here. See `references/postprocessing-integration.md`.

11. **Playwright 1.65.1 `templates/rapier-world/e2e/runtime.spec.mjs` + `scripts/playwright_bridge.py`** checks real browser launch, keyboard/touch movement, Rapier grounded jump, idle hero identity/no autonomous actions, Recast NPC/marker connection, Ink choices and ending, save/load, and postFX style/quality transitions. It does not bypass the real input handler, edit player state, simulate scripted success or touch source games. `window.__MGF_STATE__()` is a read-only telemetry snapshot, not a cheat API. Uses Chromium and real Vite dev server; dependency and browser provisioning are opt-in. No saved screenshots/videos/reports by default. See `references/playwright-integration.md`.

The unified Three.js builder now assembles a fresh Vite/Rapier/Recast/Ink/Postprocessing scene project from a validated Rete blueprint, or an original three-chapter concept. It does **not** execute harvested gameplay scripts; each imported mechanic still needs an explicit authored adapter and rights clearance. It is a game scaffold, not an automatic port of multiple full games. No public URL or runtime PASS is implied.

## Workflow (one shared workspace)

Use real user-provided or authorized repository source directories. Source games are never edited. Use `meta6-lab` for new work; preserve protected `meta6` originals.

```bash
python -m pip install -r skills/meta-game-fusion/requirements.txt
python skills/meta-game-fusion/scripts/fusion.py scan \
  --game broken-city=/path/to/broken-city \
  --game twilight-isles=/path/to/twilight-isles \
  --out /path/to/fusion-library

python skills/meta-game-fusion/scripts/assimp_bridge.py inventory \
  --index /path/to/fusion-library/fusion-index.json \
  --out /path/to/fusion-library
# Optional conversion only if the external native Assimp CLI is already installed:
python skills/meta-game-fusion/scripts/assimp_bridge.py convert \
  --index /path/to/fusion-library/fusion-index.json \
  --out /path/to/fusion-library --assimp-cli assimp

# An offline index of what could be optimized (requires no npm installation):
python skills/meta-game-fusion/scripts/gltf_optimize.py inventory \
  --models /path/to/fusion-library/model-library.json

# Runtime dependency: perform only when explicitly authorized and network available.
npm install --ignore-scripts --prefix skills/meta-game-fusion/optimizer-deps
python skills/meta-game-fusion/scripts/gltf_optimize.py optimize \
  --models /path/to/fusion-library/model-library.json --profile safe

# Qdrant local mode (free, persistent, no cloud/server required)
python -m pip install -r skills/meta-game-fusion/requirements-search.txt
python skills/meta-game-fusion/scripts/qdrant_bridge.py build \
  --library /path/to/fusion-library --backend local
python skills/meta-game-fusion/scripts/qdrant_bridge.py search \
  --library /path/to/fusion-library --backend local --query 'лес туман персонаж'

# Without the Qdrant runtime, an explicit lexical JSON fallback is available:
python skills/meta-game-fusion/scripts/qdrant_bridge.py build \
  --library /path/to/fusion-library --backend json
python skills/meta-game-fusion/scripts/qdrant_bridge.py search \
  --library /path/to/fusion-library --backend json --query 'combat'

# Rete.js 2 visual scene compositor (new, empty output dir; npm packages not bundled)
python skills/meta-game-fusion/scripts/rete_bridge.py prepare \
  --library /path/to/fusion-library --out /path/to/fusion-library/rete-workbench --theme "лес бой загадки"
cd /path/to/fusion-library/rete-workbench && npm install --ignore-scripts && npm run dev
# Export a fusion-story-graph.json in the browser, then validate a strict storyboard:
python skills/meta-game-fusion/scripts/rete_bridge.py validate \
  --library /path/to/fusion-library --graph /path/to/fusion-story-graph.json \
  --stories-manifest /path/to/fusion-library/rete-workbench/public/stories/manifest.json \
  --out /path/to/fusion-library/fusion-scene-blueprint.json
```

# Real 3D physical level (Rapier + Three.js + Rete graph + Ink)

```bash
# Reuses the same authorized game library. No source game will be modified.
python skills/meta-game-fusion/scripts/rapier_bridge.py prepare \
  --library /path/to/fusion-library \
  --workbench /path/to/fusion-library/rete-workbench \
  --blueprint /path/to/fusion-library/fusion-scene-blueprint.json \
  --out /path/to/fusion-library/rapier-world
cd /path/to/fusion-library/rapier-world
npm install --ignore-scripts
npm run dev
```


# After generating a fresh Rapier world, optionally retarget art direction:
python skills/meta-game-fusion/scripts/postfx_bridge.py presets
python skills/meta-game-fusion/scripts/postfx_bridge.py set \
  --world /path/to/fusion-library/rapier-world/public/world.json \
  --default ink --scene scene1=ember

# Inside 3D prototype: V = artistic preset, P = FX quality; touch UI mirrors both.

For a **playable original built-in demo** of the 3D physics + two-final Ink story, omit `--blueprint` and `--workbench`; only `--library` and fresh `--out` are required. The builder itself only copies an authored Vite/Three.js/Rapier template and approved Ink source into a separate folder; it does not install anything implicitly. npm `predev` compiles the pinned original Ink story. The external runtime must really be installed and served. A compiled site is not a hosted URL; deploy only after the app actually launches. The controller prevents walls from being passed through, makes falling dynamic crates physical, and allows jumping only on explicit keyboard/touch input. The Rete storyboard events are made interactive, but imported game component code remains descriptive only.

For genuine semantic search: install `requirements-search-semantic.txt` and use `--embedding multilingual --allow-model-download` when explicitly authorized; first run may download weights. `--backend server --allow-remote --url https://...` is also opt-in. Do not equate hashed lexical search with semantic intelligence. Index metadata is not proof of compatibility or license permission.

For existing approved `.ink` source copies add them explicitly to the workbench before the next npm run:

```bash
python skills/meta-game-fusion/scripts/ink_bridge.py add \
  --workbench /path/to/fusion-library/rete-workbench \
  --source /path/to/owned-game/story.ink --id healer_prologue \
  --title 'Пролог' --game last-healer --license OWNED \
  --approved --rights-basis owner --export healed=flag:healed
# cd to workbench && npm run dev (predev compiles pinned Ink scripts locally)
```

`--profile meshopt` is opt-in and requires `EXT_meshopt_compression` decoder in Three.js; `--profile webp` is opt-in and lossy. The included `templates/three-loader.mjs` wires MeshoptDecoder. `safe` runs only deduplication and rejects changed scene topology, nodes, rig/skin references and animation channels. None of the profiles auto-approve visual fidelity, licensing or identity. When an optimization would enlarge an asset, it is skipped by default.

## Three.js game assembly

```bash
python skills/meta-game-fusion/scripts/fusion_builder.py build --library /path/to/fusion-library --concept "Живой остров и разбитый маяк" --visual-style ink --out /path/to/new-game
# Requires installed pinned npm dependencies in the generated project to run.
```

The generated exploration contains actual interactive scene sensors and story transitions but no imported mechanics execution or automatic hosting. Do not call an unlaunched project PASS.

## Required invariants

- Keep input tree **read-only**. Output always outside original game directories; the Assimp GLBs also stay untouched while optimizing.
- Use source hash checks, explicit game origin, safe relative file paths, strict GLB2 metadata reading, bounded subprocess calls and no shell commands on model data.
- Never delete nodes, meshes, animated clips, skins, morph targets or authored pixel/sprite sheets to improve performance. No automatic controller actions or hero substitutions.
- No silent `npx`, npm install, pip install, neural-model download, remote Qdrant transmission, native dependency execution/download, nor claim successful import/optimization if CLI missing. Tree-sitter Python and Assimp/GLTF runtimes must be installed separately when accessible.
- Confirm exact pinned glTF-Transform CLI version 4.5.1 before running; other versions are not accepted. The vendor directory includes MIT license text, **not** full source or binary.
- Preserve original per-asset legal review requirements (`approved_for_reuse=false`, `license=review_required`). Model/texture licenses are separate from engine licenses.
- A verified GLB is not proof of correct look, playable animation or engine compatibility. View it in the actual Three.js game before distribution. A game URL requires actual hosting, not just an `index.html` file.
- Rete.js graphs describe proposed gameplay wiring, not execution of imported mechanics; the embedded inkjs story preview *does* execute authored narrative choices. Non-approved components are only preview candidates, and the validator rejects them; branch conditions are declarative and must never be evaluated as arbitrary code. A validated blueprint is NOT a complete 3D game; only the local narrative preview executes dialogue/branches. npm packages are NOT installed in the plugin, so do not claim the editor was launched until real installation and browser render.
- Qdrant is a retrieval layer only: matching vectors, tags or names do not verify runtime compatibility, licenses, animation identity or gameplay. Do not expose local absolute source paths to remote servers. Keep `--backend local` by default.
- Rapier must use `@dimforge/rapier3d-compat@0.21.0` with `await RAPIER.init()` and fixed 1/60 steps. A single kinematic player collider is authoritative for movement, with the Rapier computedMovement applied via setNextKinematicTranslation. All visual meshes mirror the physics position. Do not fabricate successful Rapier runtime installation or deployed game URL.
- BVH is a static *visual spatial query* layer. Rapier is authoritative for hitboxes/collision, and Recast for NPC routing; no BVH shortcut routes or auto character controls. Index only actual stationary meshes with valid source-rights/hash metadata and skip all animated/skinned/morph-target geometry.
- For new projects continue this SAME plugin/version lineage; use read/edit plugin tools and guard by release ID. Do not create a replacement plugin.

## Reference files

- `references/three-unified-builder.md` — Three.js unified builder and source-rights rules.
- `references/bvh-integration.md` — static scene BVH geometry, collision/nav authority boundaries and exact asset hash gate.
- `scripts/bvh_bridge.py` — hash-verified imported static GLB spatial manifest.
- `templates/rapier-world/src/spatial-bvh.js` — actual Three.js picking and NPC static-visibility adapter.
- `scripts/fusion_builder.py` — deterministic build from original concept or validated Rete scene blueprint.
- `templates/rapier-world/src/living-world.js` — living Three.js atmospheric visual layers and chapter-specific scene events.

- `references/scancode-integration.md` — SHA-256-pinned ScanCode read-only license policy and safe catalog gating.
- `references/catalog-schema.md` — cumulative game, model, optimized model index formats.
- `references/assimp-integration.md` — native import and safety rules.
- `references/gltf-transform-integration.md` — optimizer profiles and loader contract.
- `references/upstream.json` — verified upstream sources, licensing, pins.
- `references/qdrant-integration.md` — exact indexing/search contracts, local/semantic/server modes.
- `references/rete-integration.md` — visual editor, typed graph rules and storyboard blueprint schema.
- `references/rapier-integration.md` — real 3D scene physics adapter, world manifest, Ink/Rete event mapping and safety.
- `references/recast-integration.md` — Recast NavMesh, scout NPC and collision-aligned pathfinding integration.
- `references/postprocessing-integration.md` — GLSL art direction, post effects and quality fallback.
- `references/inkjs-integration.md` — real narrative preview, Ink compiler, variables/rights/source hashes.
- `scripts/rete_bridge.py` — catalog→Rete workbench adapter and rigorous graph validator.
- `templates/rete-workbench/` — actual Rete.js 2 + Lit visual editor for local build.
- `templates/rapier-world/src/navigation.js` — actual Recast/Detour navmesh and Rapier NPC collision integration.
- `scripts/qdrant_bridge.py` — actual Qdrant local/server adapter and optional JSON fallback.
- `vendor/{tree-sitter,assimp,gltf-transform,qdrant,qdrant-client,rete*,inkjs,rapier,recast-navigation-js,postprocessing}/LICENSE*` — license notices.
- `optimizer-deps/package.json` — exact npm package version for opt-in install.

- Postprocessing is the visual layer only; the `EffectComposer` is never allowed to alter Rete/Ink state, physical world, user input, the single hero's identity or animation tracks. If the FX renderer fails, use original bare Three.js; no claim of visually verified output without browser startup. `postprocessing@6.39.6` peer supports Three.js `>=0.168,<0.188`, compatible with pinned `0.186.1`. Preserve Zlib notice. Do not claim that full upstream code is embedded in the archive.

**Deliver only actual requested artifacts; don't generate unsolicited reports.**

## Browser runtime verification (opt-in, never fake PASS)

```bash
python skills/meta-game-fusion/scripts/playwright_bridge.py check --project /path/to/fusion-library/rapier-world
# For installed project dependencies and explicit Chromium provisioning:
python skills/meta-game-fusion/scripts/playwright_bridge.py run --project /path/to/fusion-library/rapier-world
```

Playwright only observes the genuine game. If npm/browser dependencies are missing, return a clear unverified state. Do not publish screenshots, videos, reports or handoff artifacts when not requested.

## ScanCode read-only rights scanning (optional installed CLI)

```bash
python skills/meta-game-fusion/scripts/scancode_bridge.py scan --library /path/to/fusion-library --game game-id
python skills/meta-game-fusion/scripts/scancode_bridge.py preflight --library /path/to/fusion-library
# When ScanCode already ran externally:
python skills/meta-game-fusion/scripts/scancode_bridge.py ingest --library /path/to/fusion-library --game game-id --report /path/to/scancode.json
```

The executable and licensed data corpus are not bundled. Missing ScanCode must not be represented as PASS. Copyright and model ownership require human judgment even if code appears permissively licensed. The technical check is conservative, not legal advice.
