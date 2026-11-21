# Mineclonia + Luanti bridge

Official upstream: https://codeberg.org/mineclonia/mineclonia
Pinned mirror: https://github.com/mineclonia-mirror/mineclonia/tree/a40455bd5e227976b4e70c02d17ce1ab07bc904b
Mirror SHA: `a40455bd5e227976b4e70c02d17ce1ab07bc904b` (2026-11-21).

License: source GPLv3-or-later, media individually credited in `LEGAL.md`, mostly CC BY-SA 4.0 with other licenses. The optional generated `vgc_bridge` mod itself is VGC-original MIT code and generated colors; source VGC models are user-owned or generated from VGC. Preserve Mineclonia's license, credits and full mod sources on distribution. Never transfer arbitrary Mineclonia textures into MIT Three.js exports or automatically include Veloren GPL art.

Pipeline: Ragnagrok RLE -> validated VGC voxel pack -> `create_luanti.write_mod()` -> Mineclonia native Lua `register_node()` + protected-space `/vgc_build`. User-owned `.vox` -> `veloren_bridge.make_project()` -> exactly same native Luanti exporter. Optional emissive native particle ABM (3-second interval, chance 4); no additional renderer/game loop or self-animated player actions.

Two generation modes: full original Mineclonia game checkout at exact SHA with installed mod; or `--mod-only` no network, producing an installable folder for the existing Mineclonia game. Version requirement Luanti >= 5.10; game requires native Luanti, not HTML. No server/GUI gameplay screenshots are implied by the generator.

`--engine mineclonia` is an additional existing plugin mode; no previous mode or renderer is changed. It cannot combine distinct engines' save data, physics, sky, GLB skeletal rigs or shaders. Sculptures placed in Mineclonia become real blocks; Ragnagrok-to-Three exports elsewhere remain visual decorations unless expressly upgraded.
