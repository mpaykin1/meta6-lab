# META GAME FUSION catalog schema — additive module 2

`fusion-index.json`: `meta-game-fusion.index.v1`; `games[].{id,source_root,readonly,files,symbols,imports,warnings}`. Each file includes `path`, `size`, `sha256`, `kind`. Tags on symbols are **unverified** keyword indications, not functional verification.

`component-library.json`: `meta-game-fusion.components.v1`; extracted code candidates with stable origin/hashes.

`model-candidates.json`: `meta-game-fusion.model-candidates.v1`; automatically written during Tree-sitter source scans. Every model includes `id,game,source_root,path,source_sha256,bytes_indexed,format,license,compatibility,approved_for_reuse,conversion`.

`model-library.json`: `meta-game-fusion.models.v1`; created/updated by `assimp_bridge.py` from an existing `fusion-index.json` with identical origin keys. Each converted asset has output path relative to the model-library root, output SHA-256, and `gltf2` with counts of meshes, nodes, materials, textures, animations and skins; **structural validity does not mean motion or visual fidelity**.

Valid conversion state: `not_attempted`, `catalogued`, `unavailable`, `converted`, `copied_glb2`, `existing`, `failed`. `approved_for_reuse=false` unless checked by the rights owner. Treat missing license and unsupported format as blockers, not assumed permission.

No source code or source game art is copied by the scanner. Only optional authorized model-conversion output is written into the separate library directory.

`possible_code_links` are Tree-sitter observed import-path associations to the model; they are **heuristic** candidate usage, not proof of game behavior.

## Module 3 — optimized-model-library.json

`meta-game-fusion.optimized-models.v1` is produced by `gltf_optimize.py` from an existing `model-library.json`. Its `models` entries are **additive copies** of Assimp entries, including `{id,game,source_root,path,source_sha256,output,output_sha256,conversion,license,approved_for_reuse}` and a new `optimization` object with `{status,profile,input_sha256,input_bytes,output,output_sha256,output_bytes,saved_bytes,requires_decoder}` when available. `optimization.output` is relative to the optimization library root; never confuse it with Assimp's original `output`.

`optimization.status`: `catalogued`, `not_attempted`, `skipped_no_glb`, `unavailable`, `optimized`, `existing`, `not_smaller`, `failed`. Output is never written under game source roots. Lossy/extension introducing modes require explicit selection. Absence of npm binary is not a success.

## Module 4 — Qdrant search documents

`fusion-search-documents.json` schema `meta-game-fusion.search-documents.v1` stores sanitized candidate metadata only. Each `documents[]` has `id` (stable UUID), `kind`, `game`, `file` (relative source path only), `name`, `tags`, `source_sha256`, `license`, `approved_for_reuse`, `compatibility`, `optimized_output` (relative optimized GLB location where verified) and `search_text` (derived tags/names, **not source code**).

`qdrant-index.json` schema `meta-game-fusion.search.v1` is written after successful Qdrant upsert and records embedding mode, workspace-scoped collection, doc count and backend. Local Qdrant persistence is in `<library>/.fusion-qdrant/`. An offline JSON manifest is not proof that Qdrant was installed or indexed.

Source references remain user-owned; Qdrant does not store source code, model bytes, image bytes or audio bytes. `license=review_required`, `approved_for_reuse=false`, `compatibility=unverified` remain hard constraints until independently reviewed. Results are suggestions, not automatic integration approval.


## Module 5 — Rete compositor

`rete-workbench/public/catalog.json`: `meta-game-fusion.rete-catalog.v1` copies sanitized Qdrant candidate metadata, NEVER code/media. Includes component IDs, SHA-256, `approved_for_reuse`, and rights metadata.

`fusion-story-graph.json`: `meta-game-fusion.graph.v1` stores graph title, typed nodes (`start, scene, branch, ending, mechanic, resource`) and typed edges (`source, sourceOutput, target, targetInput`). Node positions are in editor virtual units. Branch conditions are declarative `flag:name` or `item:name`. Re-import is supported by the visual Rete editor.

`reuse-approvals.json`: `meta-game-fusion.reuse-approvals.v1` stores explicitly reviewed component IDs and associated SHA-256, permission basis, and license, outside game originals. `fusion-scene-blueprint.json`: `meta-game-fusion.scene-blueprint.v1` is a storyboard plan with ordered flow and attached source references; `runtime_executable=false` explicitly.

The graph editor is not yet a game authoring runtime. The visual graph is checked in `scripts/rete_bridge.py` for legal reuse, typing, source IDs, DAG structure and reachable final states before it becomes an integration blueprint.

## Recast navigation adapter (v0.8)

`qdrant_bridge.py collect` adds a pinned, SHA-256 sourced `engine-adapter` document for the local `templates/rapier-world/src/navigation.js`, tagged `npc-ai` and `navmesh`. This is an original plugin adapter licensed for reuse and does not include external game code. The generated Rapier world records `navigation.engine`, `navigation.source`, `navigation.npc` and `navigation.hero_unchanged` so game authors can distinguish genuine NavMesh from the Rapier collider system. Imported candidate models are not used for NavMesh until collision geometry is explicitly approved.


## Postprocessing (v0.9)

`visual_direction` is optional in `meta-game-fusion.physics-world.v1`: `{engine:'postprocessing@6.39.6',default,by_node:{node_id:style},quality:'cinema',styles:[...],hero_identity_preserved:true,gameplay_state_untouched:true}`. Only `scene`/`mechanic` nodes can change mood. `qdrant_bridge.py collect` indexes authored local `templates/rapier-world/src/postfx.js` using its SHA-256, license `OWNED`, tags `postfx-glsl` and `world-scene`. Third-party `postprocessing` is installed separately from npm under Zlib.

## ScanCode rights evidence (v1.1)

`scancode-rights.json` is a local-only rights index with `schema=meta-game-fusion.scancode-rights.v1`; `games[game_id].files[relative_path]` has `source_sha256`, `status`, `license_expressions`, `copyright_holders` and optional source-hash-pinned `clearance`. This metadata augments Qdrant documents and Rete component entries; it does not copy source assets and cannot auto-grant rights. `license_scan_blocked` in Rete's catalog prevents unverified transfers and Rapier model packaging. Metadata is invalidated when Tree-sitter file hashes change.
