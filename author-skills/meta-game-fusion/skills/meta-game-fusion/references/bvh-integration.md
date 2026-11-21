# Three-Mesh-BVH 0.9.18 integration — static scene queries

Actual authored adapter: `templates/rapier-world/src/spatial-bvh.js`; Python metadata gate: `scripts/bvh_bridge.py`.

- `three-mesh-bvh@0.9.18` (MIT) is pinned in the **existing** Vite world template. Compatible with `three@0.186.1` (library peer `>=0.159.0`). No npm dependency files are bundled; install explicitly on a networked system.
- The authoring step remains Tree-sitter source index → Assimp import → glTF-Transform approval → ScanCode rights gate → Rete/Ink world blueprint → unified `fusion_builder.py` → Three.js scene.
- `fusion_builder.py` copies only reviewed/hash-matched GLBs then writes `public/bvh-manifest.json` from **actual existing output bytes** using `bvh_bridge.create_plan`. No model or scene source files are changed. An absent, symlinked, stale or incorrectly named GLB **fails the entire game build**. The metadata is not a baked mesh tree.
- At runtime, `FusionSpatialBVH.register` creates BVH structures in local GPU/CPU Three.js geometry for static scene meshes (and static, non-animated verified GLB scenery), reuses them across instances sharing one geometry, tracks ownership for cleanup, and patches only registered **mesh instances** with `acceleratedRaycast`; no global prototype change.
- Skinned meshes, morph-target meshes, animation-bearing imported GLBs and dynamic objects are **not** indexed. Imported original character identity, animation clips and materials are preserved. This module never drives hero actions.
- `pick` uses `Raycaster.firstHitOnly` to select real static model surfaces by pointer in canvas. `lineOfSight` reads *static visual occlusion* to inform the Recast NPC about whether a story marker is visible. Neither result moves NPCs or the hero. Rapier is sole authoritative collision solver and Recast/Detour remains sole pathfinder; BVH is observational and must never be used to shortcut paths or create phantom obstacles.
- `scripts/qdrant_bridge.py` adds the source-hashed authored BVH adapter to the local searchable library (`spatial-index` tag) without interpreting search relevance as license approval.
- Screen HUD `BVH: ON/OFF` toggles querying only. No physics/UI/story/asset mutation. `window.__MGF_STATE__().spatial` exposes read-only counters and optional NPC visibility for existing Playwright observation. Mobile portrait/landscape and all existing animation requirements remain binding.

**Do not claim acceleration benchmarks, fully functioning browser play, or public deployment without a real npm install and observed browser frames.** `npm view` and installation were unavailable in this environment due to DNS; upstream package metadata verified from GitHub instead.

Upstream: https://github.com/gkjohnson/three-mesh-bvh — release `v0.9.18` dated 2026-11-03. License copy in `vendor/three-mesh-bvh/LICENSE`.
