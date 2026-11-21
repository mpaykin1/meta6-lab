# VGC native Luanti mod

Copy the `vgc_bridge` folder into a Luanti world/game `mods/` directory, enable it in Luanti, and launch that world. The Luanti application and a compatible game are required.

`/vgc_list` lists the objects; `/vgc_build vgc_tree` or another listed ID places the colored structure in empty, loaded, unprotected space in front of the player. The `interact` privilege is required. Placement refuses to overwrite existing nodes or protected land.

**Scale:** one Ragnagrok source voxel becomes one Luanti block (native Luanti units); do not expect source meter scale or animated rigs. GLB files are not imported. Single-player terrain, game servers and saved worlds are not synchronized with Lumenwild or Voxelize.

This mod contains newly generated Lua code and original solid-color PNG textures. Luanti engine source is a separate LGPL-2.1-or-later project: https://github.com/luanti-org/luanti .
