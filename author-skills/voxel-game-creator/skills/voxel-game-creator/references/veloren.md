# Veloren — GPL-safe VOX bridge

Upstream: https://github.com/veloren/veloren (GitLab origin `https://gitlab.com/veloren/veloren`), pinned 2026-11-21 mirror SHA `131d1193387861d35c74655662148f303c22c5b4`.
Code: GPL-3.0-or-later (main `LICENSE`). Voxel art: GPLv3 by default unless `assets/credits.ron` assigns different conditions; includes assets under CC-BY-NC-SA with restrictions, which must never be auto-included. Veloren itself is a desktop Rust game and NOT a browser Three.js implementation.

Integration boundary:
1. Read actual MagicaVoxel `.vox` geometry (VOX 150/200 chunks SIZE, XYZI, RGBA); require source palette. Transform coordinates `(x,y,z_up)` to Ragnagrok `(x,y_up=z,z=y)`. Preserve each color as 0xRRGGBB, with transparent `0` index reserved. Serialize Ragnagrok varint RLE via the existing engine adapter.
2. A Ragnagrok Project JSON with a scene and model is consumable by `ragnagrok_assets.assets_from_editor()`; subsequent `--ragnagrok-project` works in Lumenwild, Voxelize, Blockwild, Vesper, Minecraft-W, and Voxelcraft through their established code paths.
3. Export a validated Ragnagrok model to a standard MagicaVoxel VOX file with color palette and inverse axis mapping; user-authored assets can be edited for Veloren without touching its GPL Rust code.
4. Optional `--veloren-vox ... --veloren-rights own` in the unified launcher converts an owned VOX into a temp project and delegates unchanged to prior engine code. A provenance file is written in output.

Do not imply reuse of Veloren world generator, enemies, physics, skeleton or systems inside MIT engines. Do not import GPL assets into MIT games automatically. No asserted source/download/build success without invoking the corresponding CLI. `fetch` downloads a **single** selected voxel from a pinned commit, plus upstream copyright/credits, and explicitly rejects known restricted third-party paths; the downloader cannot automatically prove every asset's legal suitability for commercial publication. Full-model scene graph transforms and alpha transparency are not silently dropped: multi-model selection explicit; nonopaque voxels rejected.
