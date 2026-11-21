# Luanti adapter (Voxel Game Creator v0.5)

Official C++/Lua runtime: https://github.com/luanti-org/luanti (formerly Minetest).
Verified source commit: `8bb14e85d21a09d37961ed97548f6a9f71349422`.
Lua modding reference: https://github.com/luanti-org/luanti/blob/master/doc/lua_api.md .
Engine license: LGPL-2.1-or-later (source copying requires preserving applicable notices). Media: separate licenses; do not bundle Luanti artwork.

`create_luanti.py` generates a standalone mod with: `mod.conf`, `init.lua`, `models.lua`, `colors.lua`, `textures/*.png`, model source metadata and MIT license. Original code only; no upstream Luanti C++ files. Coordinates preserve voxel topology and color; cell size changes (Ragnagrok source cell in meters -> native Luanti full block).

`/vgc_list`: lists all available model IDs. `/vgc_build <id>`: builds ahead of player if full model volume lies in loaded air and outside protected areas. `interact` privilege required. Unlike Three.js imports, Luanti nodes are collidable, collectible and placeable.

`--engine luanti` works offline without cloning Luanti; install/run a compatible Luanti engine and game separately. `--engine all` additionally exports Luanti mod into `luanti/vgc_bridge/` alongside browser/server/studio. Optional `--with-luanti-source` invokes `download_luanti.py`, whose Git fetch needs internet and disk space.

**Not supported:** server ↔ browser save synchronization, Ragnagrok rigs/animations in Luanti, Blockbench GLB in Luanti, full binary game build, automatic install on a user's machine.
