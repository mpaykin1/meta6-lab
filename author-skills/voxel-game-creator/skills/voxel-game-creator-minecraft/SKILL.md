---
name: voxel-game-creator-minecraft

description: "Minecraft-W original MIT Three.js v9; 45 biomes, survival/crafting/portal/boss campaign, original terrain/physics/saves, Ragnagrok voxels and Blockbench GLB, optional original Vesper shader rain/mist."
---

# Minecraft-W in Voxel Game Creator v0.12

Use when user wants a large Minecraft-like survival world with true 3D collisions, editable blocks, mobile/gamepad controls, cave/ore/climate generation, and campaign progression. Minecraft-W is the 12th independent open-source component, not a modification to Lumenwild or Blockwild. Preserve all earlier engines and features.

## Source

- Upstream: https://github.com/Xollonox/Minecraft
- License: MIT, © 2026 Voxel Sandbox Contributors, `references/MINECRAFT-W-LICENSE.txt`.
- Reviewed commit: `1ca40b195bf40b4c19336cdfeb22df6ad33a9c9e`; source is downloaded at game generation or supplied via exact checked-out `--source-minecraft`.
- Three.js v0.185.1; Vite v7; requires Node >=22.17.0 (or 24+). Original native Vite app, no server.

## Ready command

```bash
python3 skills/voxel-game-creator/scripts/voxel_game.py \
  --engine minecraft-w \
  --spec skills/voxel-game-creator/examples/game-spec.json \
  --out /mnt/data/minecraft-w-world \
  --vesper-atmosphere
```

In a network-restricted environment, omit `--vesper-atmosphere` and supply `--source-minecraft` pointing to the exact pinned local Git checkout, or also supply `--source-vesper` for the optional shader pass. The CLI supports `--ragnagrok-project path/to/export.json`, `--blockbench-assets-dir /path/to/glb`, `--blockbench-manifest /path/to/assets.json`, `--asset-optimizer auto|off|required`, `--geometry-compression meshopt|off`.

Generated game: `cd /mnt/data/minecraft-w-world && npm ci && npm run build` gives `dist/` for static hosting. `npm run dev` starts local gameplay. A game URL requires actual build and hosting; never invent one.

## Cross-system integration

1. Ragnagrok Project RLE colors and voxel grids are decoded by the existing validated `ragnagrok_assets` and `create_blockwild.colored_voxels` and rendered as instanced surface cubes *in the same Minecraft-W THREE.Scene*; no second engine, no second canvas.
2. Original user-authored Blockbench GLB and animations go through existing `blockbench_bridge` and optional `gltf_transform_bridge`/Meshoptimizer. The native Three.js GLTFLoader loads them, including `EXT_meshopt_compression` support. Only explicitly named idleClip can start automatically; the player avatar never changes.
3. Optional Vesper effects come from the pinned MIT `js/effects.js` and `js/util.js` and run in the existing Minecraft-W scene. Shader rain is positioned at the player's real world altitude, uses Minecraft-W's *own weatherSystem.visibleState/intensity and sky exposure*, hides duplicate native precipitation visuals when active, never rains in snow/clear biomes, and keeps native weather physics, saves, audio and inputs. GLSL mist follows the player. No postprocessing, audio or planar reflection replacement.
4. Source game already has its own procedural generation, crafting, portals, creatures, boss and save systems. Never merge those destructively with Voxelize/Luanti. Native gravity, voxel collisions, gameplay inventory, block placement and saves remain unchanged.
5. Authored imported decorations are **visual only**, not collidable blocks. They are placed relative to initial player spawn; changes are not written into native world block-save format. All added render resources are disposed when a world ends. Particle budgets automatically adjust to frame rates when Vesper is enabled.

Do not claim that new engine is compiled/tested/published until it actually is. No unsolicited reports; deliver game and playable URL when truly available.
