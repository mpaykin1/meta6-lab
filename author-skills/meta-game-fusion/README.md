# META GAME FUSION v1.3.0

Three.js scene builder enhanced with three-mesh-bvh 0.9.18 spatial indexes for static scenery and rights-approved GLBs. Existing Tree-sitter, Assimp, glTF-Transform, Qdrant, Rete.js, inkjs, Rapier, Recast, Postprocessing, Playwright and ScanCode modules remain intact. Qdrant catalogs the source-hashed adapter, and the builder writes a verified spatial manifest for each generated world.

The new static geometry index speeds expensive raycasts and allows precise pointer selection and advisory NPC line-of-sight observations. It does not replace Rapier collision, Recast pathfinding or approved animations. All animated NPCs, responsive mobile portrait/landscape behavior and asset rights checks remain mandatory.

Generate with `python skills/meta-game-fusion/scripts/fusion_builder.py build --library LIB --concept 'Живой мир' --out NEW_DIR`. The generated project pins its npm runtime (`three-mesh-bvh@0.9.18`); npm installation/browser startup were unavailable here due to DNS, so playable runtime is not verified.

More: `skills/meta-game-fusion/references/bvh-integration.md`.
