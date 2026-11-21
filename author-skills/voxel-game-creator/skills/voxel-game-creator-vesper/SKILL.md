---
name: voxel-game-creator-vesper
description: "Vesper Street MIT Three.js voxel horror and shaders integrated into the SAME Voxel Game Creator: playable Vesper with Ragnagrok and Blockbench models, or GPU rain+fog in native Blockwild."
---

# Voxel Game Creator v0.11 — Vesper Street, the eleventh open-source component

Use this skill for atmospheric rainy voxel scenes and faithful dark Three.js games, especially when the user references **Vesper Street**, drenched streets, rain, night fog, eerie architecture or volumetric-looking light.

## Two real workflows using the SAME Voxel Game Creator plugin

1. **`--engine vesper`**: generate the authentic complete original MIT Vesper Street game and add authored VGC Ragnagrok/RLE voxel models and optional Blockbench .glb models as actual Three.js geometry, not billboards or Canvas placeholders. Keep original game sound, camera, mission logic, rain, flashlight, reflections, GLSL effects, post, controls and save system unchanged.
2. **`--engine blockwild --vesper-atmosphere`**: generate native MIT Blockwild as usual, then mount the original Vesper `makeRain` and `makeMist` GPU effects within Blockwild's own existing `THREE.Scene`, updating relative to the player's real position and disposing with the original React engine lifecycle. Never replace Blockwild's protagonist, controls, ecology or world. Visual overlay only; do not merge NPC AI or physics into Vesper.

Call `skills/voxel-game-creator/scripts/voxel_game.py` as the main executable:

```bash
python3 skills/voxel-game-creator/scripts/voxel_game.py \
  --engine blockwild --vesper-atmosphere \
  --spec skills/voxel-game-creator/examples/game-spec.json \
  --out /mnt/data/voxel-rain
```

Or run the original game with authored models:

```bash
python3 skills/voxel-game-creator/scripts/voxel_game.py \
  --engine vesper \
  --spec skills/voxel-game-creator/examples/game-spec.json \
  --out /mnt/data/vesper-game
```

Source: `https://github.com/winchxyz/vesper-street` pinned `fcc2f6eda84311194c0834de6cd7081c2965086f`, copyright winchxyz, MIT. Source cloned on game generation or provided with `--source-vesper`; there is no bundled full copy inside this skill archive. An unavailable network and absent local source are blockers; never pretend to produce a built game when Git checkout fails.

The existing **ten** OSS integrations — Blockwild, Lumenwild, Voxelize, Ragnagrok, Blockbench, Luanti, glTF-Transform, Meshoptimizer, three-mesh-bvh, Yuka — stay installed and unmodified. The new standalone generator uses the shared Ragnagrok + Blockbench asset interchange; Blockwild effects consume native Three.js and are adaptive. No second renderer; static models are visual only; player actions never occur on their own.

For asset placement: `--ragnagrok-project` takes an original editor Project JSON; `--blockbench-assets-dir` plus optional `--blockbench-manifest` takes embedded authored .glb. Vesper source snapshots are locked to a full 40-character commit; respect MIT attribution and distinguish shaders/effects from proprietary or unrelated asset rights. Do not run Vesper over `file://` URLs. Build and launch before providing a game link; don't claim the game is online until hosted.

Details: `../voxel-game-creator/references/vesper-street.md`, source script `../voxel-game-creator/scripts/create_vesper.py`.
