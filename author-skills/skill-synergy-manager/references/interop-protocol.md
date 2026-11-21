# Skill Nexus Exchange v1

## Scope

All seven plugins can *handoff* immutable files and declarative intent through this format, without pretending their independent runtime engines are already connected. `scripts/nexus_exchange.py` creates portable, checksum-verified bundles. The receiving skill must explicitly consume an approved bundle and adapt its *real* input format; a bundle alone is **not** full runtime integration.

## Artifact package

```
exchange/
  nexus-handoff.json  # source/target ids, 1 out of 42 routes, license and identity lock
  payload/            # exact original bytes, filenames and SHA256
```

Each bundle records route id, declared kind, allowed file extensions, source attribution, owner permission, global `game_id`, stable `hero_id` if a hero is touched, a single physics and FX authority. Files are copied, never interpolated, recoloured, simplified or executed.

## Protocol operations

- `python scripts/nexus_exchange.py routes` — show all 42 directed contracts.
- `python scripts/nexus_exchange.py prepare --source hero-animator --target meta-game-fusion --input path/to/approved/hero.json --out /tmp/bundle --game-id game001 --hero-id hero001 --licensed` — create a checksum-preserving handoff.
- `python scripts/nexus_exchange.py verify --bundle /tmp/bundle` — verify hashes, traversal and identity fields, no runtime acceptance claim.
- `python scripts/nexus_exchange.py compose --out /tmp/game-plan.json /tmp/bundleA /tmp/bundleB` — compose typed plan while detecting mismatched game/hero IDs and conflicting physics/postfx authority.
- `python scripts/nexus_exchange.py coverage` — exact route counts: declared contracts vs separately recorded runtime proof. Do not infer success from merely existing manifests.

## Strict ownership

- Style Forge chooses reference palette and scene composition only.
- Voxel Game Creator owns voxel worlds and GLB model authoring.
- Blender Enhancer owns mesh/rig *processing* when invoked explicitly.
- Hero Animator owns approved hero artwork, movement clips and action mapping.
- Atmosphere Engine owns ambient effect design and exports it as a preset.
- Casual Game Studio contributes optional mini-game mechanics and widgets.
- Meta Game Fusion integrates world, runtime, single physical authority, story, render loop and FX composer.

Never add a second player character, second physics engine, or second EffectComposer by importing another skill's runtime whole. Prefer data extraction, one adapter, and a controlling runtime. Do not claim plug-and-play compatibility until an independently assembled end-to-end game has run and rendered with that handoff.

## Strong connection paths

1. Video -> Game Style Forge palette/shot constraints -> Voxels/Atmosphere.
2. Voxel Game Creator GLB -> Blender Enhancer rig-safe GLB -> Fusion.
3. Approved GIF/PNG -> Hero Animator atlas and action-state mapping -> Fusion single hero.
4. Atmosphere fog/GLSL preset -> Fusion one EffectComposer (do not install a second renderer).
5. Casual mechanics events -> Fusion gameplay graph; single physics authority.
6. Fusion renders -> Forge style check -> adjusted lighting/palette specifications; never generate a new hero.

## Status definitions

- `declared_contract`: contract mapped to output/input roles, no automatic integration assumed.
- `handoff_verified`: source bundle hashes and structural rules verified with Nexus CLI only.
- `runtime_verified`: receiving plugin truly consumes the bundle in an actual playable scene with verified character/input/render/physics. The Nexus CLI does not grant this status automatically.
