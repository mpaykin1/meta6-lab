# Minecraft-W / Voxel Sandbox v9 MIT integration

Repository: https://github.com/Xollonox/Minecraft
Reviewed commit: `1ca40b195bf40b4c19336cdfeb22df6ad33a9c9e` (2026-11-21). Branch main.
Licence: MIT, Voxel Sandbox Contributors, 2026; copyright must be preserved with redistributed sources.

Native engine: Three.js v0.185.1 + Vite 7 + ES modules, no mandatory game server, Node >=22.17.0. Full main repository source is cloned at run time (not packed inside Plugin ZIP).

Original systems preserved:
- 45 biome/terrain/chunk worker generators with caves, ores, oceans, weather and 16-bit block IDs;
- 0–15 propagated lighting, 4 render layers and animated water, optional post;
- survival, combat, crafting, mobs, automation, persistent IndexedDB worlds, Nether/End/boss campaign;
- keyboard/arrow keys, touch joystick and gamepad.

New VGC bridge routes `--engine minecraft-w` via scripts/voxel_game.py to scripts/create_minecraft_w.py. Native Game.js gets ONLY new display hooks at player attach, frame update and world teardown. Ragnagrok RLE assets and GLB source assets are *visual decorative props* in Game.scene, not physical terrain. `getSurfaceY` ensures visual props are grounded near the original player's position. GLB original rig, textures and named idle clip maintained. glTF optimization is opt-in/auto safe and never replaces originals upon failure.

Optional `--vesper-atmosphere` uses original Vesper Street MIT shader particle source pinned at `fcc2f6eda84311194c0834de6cd7081c2965086f` (new MIT LICENSE packaged in target). Its rain shader is altitude-offset for Minecraft-W's nonzero height. Rain visibility/intensity follows the authoritative Minecraft-W weather system and roof exposure, so no automatic clear-weather rain or duplicate native rain draw. Mist layered planes follow player; native game renderer is the only WebGL context. This is a visual layer only, does not import Vesper's campaign, Wet Ground, Post or audio.

Generated game: npm ci && npm run build -> dist/ (static); npm run dev locally.
No runtime/system cross-synchronisation with other VGC modes. No claim of public game URL or successful engine build until verified.
