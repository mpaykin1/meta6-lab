# Goxel — verified independent upstream, second integrated tool

- Official source: https://github.com/guillaumechereau/goxel
- Project README verified: version 0.15.1, GNU GPL-3.0.
- Source inspected via the connected GitHub repository: `README.md`, `COPYING`, `src/formats/vox.c`.
- The C exporter writes VOX version 150 with `MAIN`, `SIZE`, `XYZI`, plus optional `RGBA` palette. It merges visible layers before export, and quantizes colors if needed. If there is no RGBA chunk, the built-in palette is used.
- Goxel is a separate **GPL-3.0 editor**. It is *not* linked into, bundled as code inside, or copied into this MIT pipeline. An opt-in source clone script `scripts/download_goxel.py` fetches it into a separate directory when internet access is available.
- In environments without outgoing DNS/network access, the full Goxel source cannot be cloned; do not state that the full upstream code is downloaded. The project can nevertheless operate with Goxel-compatible `.vox` files and the independent decoder/encoder.
- Models authored by you in Goxel are your authored work; consult the editor's license if distributing modified Goxel software itself.

## Integration workflow

1. Voxel-sculpt or edit a scene using the standalone Goxel editor. Use its export function and choose MagicaVoxel `.vox`.
2. Convert with `python scripts/goxel_bridge.py --input myasset.vox --out art`. A true GLB with indexed colors and only exterior faces is produced, along with an editable Generic Model `.bbmodel` with texture palette.
3. Open `.bbmodel` in Blockbench 5.x for edits to individual or merged colored cubes. Re-export the revised GLB from Blockbench if desired.
4. Add either resulting GLB to a Three.js world, lit by real world lights with pixelation, blue fog, fire and glow layers.
5. Never treat `Goxel → Blockbench → GLB` as lossless roundtrip for every unusual transform: the bridge supports single-model `VOX 150` geometry, 24-bit palette and square voxels, and rejects unsupported scene graphs or multi-model export with an explicit error rather than losing placements.

## Original Goxel-inspired assets included

- `examples/goxel-assets/moon_gate.vox` — crumbled moon gate, editable in Goxel.
- `examples/goxel-assets/moon_crystals.vox` — luminous crystal group.
- Each has both `.bbmodel` and `.glb`, created by the standalone bridge.

The source files are not bundled in this plugin. The content of `goxel_bridge.py` and `generate_relics.py` is independent implementation under the plugin's MIT license.
