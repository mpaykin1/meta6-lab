---
name: voxel-game-creator-veloren
version: 0.16.0
description: Bridge real MagicaVoxel VOX assets from Veloren or user's own models to the Ragnagrok project format used by Voxel Game Creator, and export back to VOX, with GPL rights isolation.
---

# Veloren asset bridge — Voxel Game Creator 0.16.0

Veloren is a GPL-3.0-or-later Rust desktop voxel RPG. The upstream [GitHub mirror](https://github.com/veloren/veloren) is pinned at `131d1193387861d35c74655662148f303c22c5b4`; source of truth is `https://gitlab.com/veloren/veloren`. This **does not** replace any MIT browser engine, port Rust to Three.js, or grant use of non-commercial/restricted textures, music, or models. The integration is a real, deterministic `.vox` **model interchange**, not an engine port.

## What is integrated

- `scripts/veloren_bridge.py`: parse authentic MagicaVoxel VOX 150/200 `SIZE`/`XYZI`/`RGBA`, map Z-up to Y-up, preserve exact indexed colors, convert to authentic Ragnagrok `Project` JSON and `models[].data` base64 RLE.
- Inverse export: any validated Ragnagrok `Project` model back to a real MagicaVoxel `.vox` for re-editing in Veloren-compatible voxel tooling. Geometry/palette round trip; rig/animation/scene graph/exported game AI are **not** transferred.
- `scripts/voxel_game.py --engine veloren-assets`: standalone import/export/fetch; does not alter other modes. Direct source downloads are opt-in and pinned to the reviewed upstream SHA.
- For verified **user-owned** art only: `--veloren-vox ... --veloren-rights own` can attach the newly converted model to `--engine browser|server|both|all|blockwild|vesper|minecraft-w|voxelcraft`. This calls each engine's existing Ragnagrok adapter; no duplicate scene, no alterations to native hero, controls or world physics. Visual props are decorative, not collidable or animated NPCs.
- Veloren original art must not be automatically embedded into MIT game outputs. Export to an isolated JSON package and check rights before any distribution. Do not mislabel Veloren GPL assets as your own.

## Commands

```bash
# Convert a downloaded Veloren .vox model to an isolated Ragnagrok project.
python3 skills/voxel-game-creator/scripts/voxel_game.py --engine veloren-assets import \
  --vox /path/to/veloren_model.vox --rights gpl --author 'Veloren contributors' \
  --model-id veloren_model --out /mnt/data/veloren-model-project.json

# Export an original model to MagicaVoxel .vox (artist editing workflow).
python3 skills/voxel-game-creator/scripts/voxel_game.py --engine veloren-assets export \
  --project /path/to/original-ragnagrok-project.json --model-id original_tree \
  --out /mnt/data/original-tree.vox

# Download a single pin-verified Veloren .vox + GPL LICENSE + credits; no full Rust checkout.
python3 skills/voxel-game-creator/scripts/voxel_game.py --engine veloren-assets fetch \
  --asset-path assets/common/voxel/submarine/prop.vox \
  --out /mnt/data/veloren-submarine-prop.vox --accept-gpl

# User-OWNED model in any supported Three.js game engine, using the existing art pipeline.
python3 skills/voxel-game-creator/scripts/voxel_game.py --engine voxelcraft \
  --spec skills/voxel-game-creator/examples/game-spec.json \
  --veloren-vox /path/to/your-own-model.vox --veloren-rights own \
  --out /mnt/data/new-voxelcraft-game
```

## Guardrails

VOX files must contain a real RGBA palette, use ≤64 voxels per axis and ≤22000 occupied voxels, ≤20 MiB. Multiple-model file conversion requires selecting `--model-index`; scene graph transforms are not applied, and no animations/hitboxes are fabricated. Off-site downloads include original `LICENSE` and `assets/credits.ron`. Selected third-party non-commercial assets (such as Vroom glider, mineral ingots and wood log) are blocked from automatic fetch. GPL/other model obligations remain with the original artist and derivative output; never claim an MIT license for copies of those models. Preserve independent code and licenses of all previous OSS integrations. For game creation, continue applying `skills/animated-world-guard/SKILL.md` and `references/living-world-enforcement.md` — no static NPCs, full mobile portrait and landscape support, no unsolicited hero action, and no phantom deployed game links.
