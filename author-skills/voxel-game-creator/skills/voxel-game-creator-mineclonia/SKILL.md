---
name: voxel-game-creator-mineclonia
description: "Use the real GPLv3 Mineclonia game on Luanti, with authored Ragnagrok voxel sculptures and own MagicaVoxel/Veloren-compatible VOX converted into native Lua blocks, luminous particle motion and an optional offline mod-only pack. Preserves prior Voxel Game Creator engines and separates GPL art from MIT runtimes."
---

# Voxel Game Creator — Mineclonia native integration (2026-11-21)

Trigger for Mineclonia, Luanti native gameplay and user-authored colored voxel sculpture import. Use the existing plugin **Voxel Game Creator**: this is an additional engine route, not a new plugin. Source: https://codeberg.org/mineclonia/mineclonia, current reviewed commit `a40455bd5e227976b4e70c02d17ce1ab07bc904b`; pinned GitHub mirror https://github.com/mineclonia-mirror/mineclonia . Game code GPLv3-or-later. Mixed artwork licenses — preserve original `LEGAL.md`, credits, texture/sound licenses. Do not copy Mineclonia game code/assets into MIT Three.js builds, nor confuse original native Lua engine with WebGL.

## Full original game

```bash
python3 skills/voxel-game-creator/scripts/voxel_game.py \
 --engine mineclonia \
 --spec skills/voxel-game-creator/examples/game-spec.json \
 --out /mnt/data/voxel-mineclonia
```

Requires network or `--source-mineclonia /path/to/pinned/git-checkout`. Code verifies pinned Git SHA (from the verified mirror), `game.conf`, `mods/CORE/mcl_core`, `LEGAL.md` and GPL license before adding `mods/vgc_bridge/` to the **same** original Mineclonia game. No clone is claimed until actually fetched. Luanti >=5.10 must be installed separately. Put the generated game folder under Luanti `games/`, select Mineclonia, launch. Unlike an HTML/WebGL game, it cannot run as standalone HTML or in a ChatGPT canvas.

## Offline playable-mod export (no Mineclonia clone)

```bash
python3 skills/voxel-game-creator/scripts/voxel_game.py \
 --engine mineclonia --mod-only \
 --spec skills/voxel-game-creator/examples/game-spec.json \
 --out /mnt/data/voxel-mineclonia-mod
```

Copy the resulting `vgc_bridge/` to an existing Luanti Mineclonia world `worldmods/` or another supported mod folder. Registering native colored cubic nodes yields actual in-world blocks (persist to the Mineclonia world's native save). Player uses `/vgc_list`, then `/vgc_build vgc_lantern`, or another listed model. Builder prechecks loaded terrain, protection and empty space; refuses overwrite. Props are art, not characters/NPCs. The Mineclonia game handles its own mobs, animation, combat, day/night, fluids, weather, survival and multiplayer. VGC adds independent slow glowing particles only to authored emissive blocks, not a second world or custom player controller.

## Cross-project interchange

Original Ragnagrok models, or `--ragnagrok-project /path/to/export.json` -> existing `ragnagrok_assets.py` decoder -> original VGC `create_luanti.py` generator -> `vgc_bridge/` Lua and PNG -> native Mineclonia world. Same art source can also target existing Lumenwild / Voxelize / Minecraft-W / Blockwild / Vesper / Voxelcraft modes as their bridge supports.

For **owned** MagicaVoxel `.vox` input, feed `--veloren-vox /path/to/model.vox --veloren-rights own` to `voxel_game.py --engine mineclonia`. Existing `veloren_bridge.make_project` converts VOX -> Ragnagrok Project JSON -> native Lua nodes and retains provenance in VGC_VOX_PROVENANCE.json. Authoring rights must be known; this does not grant rights to Veloren GPL3 artwork or custom-licensed third-party assets. For Veloren native art use its independent GPL asset workflow and check notices first. Models imported through this route are **not** skeletal actors and have no idle/walk/attack clips. Do not replace a user-approved hero with a different placeholder.

Native Luanti API cannot execute Vesper's GLSL, WebGL pmndrs FX or Three.js GLTFLoader: do not claim these effects are literally shared between runtime engines. The shared values are authentic voxel geometry, palette, author permissions and original generated media. Original gameplay must remain unchanged. Scene release checks for mobile/full-screen and animated NPCs are still mandatory when delivering an actual game, not merely this skill.

Flags: `--source-mineclonia`, `--ragnagrok-project`, `--mod-only`, `--no-emissive-particles`. Existing VGC flags `--veloren-vox`, `--veloren-rights own`, `--veloren-model-id`, `--veloren-model-index`, `--veloren-voxel-scale` remain supported by unified router. Full game needs installed Luanti; mod-only needs an existing Mineclonia installation. Neither mode silently downloads external resource packs or copies GPL assets into an MIT project.
