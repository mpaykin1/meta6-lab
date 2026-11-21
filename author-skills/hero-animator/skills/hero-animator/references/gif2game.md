# GIF → 2.5D/3D Game: one-step builder

## Usage

```bash
python scripts/gif2game.py --from-dir /mnt/data/gifs --out /mnt/data/game --title "Пепельный странник"
```

Role detection for typical input file names:
- `ruins`, `руины`, `фон`, `background` or opaque wide: distant panoramic background
- `portal`, `портал`: transparent animated portal plane + 3D entry trigger
- `idle`, `ожидание`, `странствующего воина`: stationary hero sequence
- `walk`, `шаг`, `ход`: moving hero sequence
- a second walk clip: run sequence
- `attack`, `удар`: attack sequence
- unknown alpha GIFs: additional animated image planes

To override classification write roles.json, selecting exact filenames:
```json
{
  "background": "ruins.gif",
  "portal": "portal.gif",
  "idle": "hero_idle.gif",
  "walk": "hero_walk.gif",
  "run": "hero_run.gif",
  "attack": "hero_attack.gif",
  "extras": []
}
```
Use `--roles roles.json` and include each referenced GIF in the positional argument list.

## Runtime

- Three.js pinned to 0.160.1 via CDN import map (requires internet to load JS unless vendored separately).
- GPU texture sheets of original RGB/RGBA pixels; atlas UV animation with exact GIF delay values.
- 3D x/y/z position, invisible THREE.BoxGeometry body, attack volume, gravity and AABB proximity. No claim of advanced rigid-body physics.
- Touch controls and PC keyboard: arrows/WASD; Up/W jump; Space attack; E enter portal; Shift sprint when second walk clip exists.
- Background parallax; GLSL embers separate from source art, toggle via FX; progressive device pixel ratio to help low-end devices.
- GIF is not magically converted to rotatable 3D art; 3D physics and 2.5D render planes are decoupled.

## Pixel/size invariants

- GIF frame n decoded and RGBA-compared with packed atlas tile n.
- PNG is fallback, lossless WebP is chosen only if smaller AND exact per-pixel compare succeeds.
- No AI art generation, color grading, background cutting, auto-alpha, retiming, crop, or resolution changes.
- Duplicated GIF content skipped by SHA256.
- The input GIF originals remain untouched. `--keep-gifs` copies them to a preview subfolder if explicitly needed; otherwise app ZIP does not carry unused duplicate files.
- Display output will differ from a pixel-for-pixel 1:1 GIF on different screen sizes due to sampling, camera and translucent overlays; source graphics themselves remain bit-exact after decoding.
- Final `index.html` loads `assets/game.json`; launch via HTTP(S), not direct file URL.
- `--webm` copies an explicitly supplied WebM atmosphere clip without transcoding; playback muted and looping, subject to autoplay policies.
