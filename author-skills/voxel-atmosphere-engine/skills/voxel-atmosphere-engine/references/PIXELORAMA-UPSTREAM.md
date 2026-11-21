# Pixelorama 1.2.5-dev upstream (Pixelorama is **not bundled**)

Upstream: https://github.com/Orama-Interactive/Pixelorama
License: MIT (2019-present Orama Interactive and contributors)
Source snippets checked against default GitHub branch on 2026-11-21:
- `README.md`: sprite sheets, pixel-perfect animation, CLI, tilemaps; Pixelorama runs on Godot; native editor retains artist-authored images.
- `src/Main.gd`: supports `--export`, `--spritesheet`, `--output`, `--scale`, `--frames`, `--tag`; usage says `SYSTEM OPTIONS -- USER OPTIONS FILES...`; Godot provides `--headless` and `--quit`.
- `src/Autoload/Export.gd`: sprite-sheet and PNG export profiles; default uses `Image.INTERPOLATE_NEAREST`.
- `LICENSE`: MIT; derivative original bridges in this skill remain independent MIT programs.

## Workflow

1. Use the actual Pixelorama program to author PNG pixel art / transparent sprites, texture tiles, or an animated timeline.
2. Export 32×32 spritesheet PNG, eight frames per row. Keep row identity fixed: ember / rune / lantern / wisp. Use the JSON manifest as a separate stable engine contract (Pixelorama does not generate this custom manifest).
3. `python scripts/pixelorama_bridge.py --input art.png --out assets/pixelorama --frame-width 32 --frame-height 32 --columns 8 --clips assets/pixelorama/sprite_sheet.json` verifies, rearranges and writes an engine-compatible sprite atlas. For an authored `.pxo` project, install Pixelorama (or run Godot with local source) and call the same bridge with `--input art.pxo --pixelorama /path/to/pixelorama`. `--pixelorama-source /path/to/Pixelorama` tells the bridge to run Godot with `--path`.
4. Pixelorama's palette shared through `palette.json` is passed to `pixel_palette_vox.py` to recolor actual Goxel voxels **without altering positions or occupancy**, then `goxel_bridge` regenerates editable Blockbench `.bbmodel` and glTF `.glb` preserving voxel geometry. Blender appends motion, `AnimationMixer` drives this original animated mesh, `pixelorama.js` renders Pixelorama sprites as 3D-positioned billboards, and postprocessing blooms both GLB and sprites.
5. Pixel art uses nearest sampling, no linear blur/mipmaps, no automatic rescale; edge pixels remain sharp even when Three.js output uses lower resolution. Animated billboards are environment effects only: they never replace the player identity.

## Source checkout

`python scripts/download_pixelorama.py --out /tmp/Pixelorama`

Clone is optional and needs internet; if unavailable, the original pipeline works with authored PNG exports and included templates. Never claim that a full upstream repository has been fetched or Pixelorama itself runs if no executable is present. Never incorporate Godot/Pixelorama editor internals into a Three.js game unnecessarily.

License URL: https://github.com/Orama-Interactive/Pixelorama/blob/master/LICENSE
