# Production pipeline: image to layered living scene

1. Parse user picture to scene graph; establish immutable actor roster, times and anchors, metadata. Locate semantic targets (characters, animals, foliage, sky, bulbs/lamps, lanterns, doors, devices, weather). Story arc: 0-25% dawn, 25-50% day, 50-75% sunset, 75-100% night; loop joins cyclically.
2. Grounding DINO -> SAM2 object masks (optional GPU). For small crowded pixel art, automatic masks may fuse adjacent people with tables; manually refine shape and reduce overlaps. Build objects with original PNG colors, alpha PNG and pose frame references.
3. Inpaint masked holes in background. Original source remains in pack. When a body is split into moving parts, rebuild precise shoulder/elbow/hip pivot masks; avoid treating a bounding rectangle as animated sprite.
4. Per-actor timing (unique phases, nonuniform cycle lengths). Actors have deliberate scripted actions: eat/drink, read, stand, turn, walk, gesture, groom, sleep, wake. Attach separate pose sprites for real actions; for every unsupported pose, never assert it happened.
5. Particle systems deterministic. Align first and last frames. For falling petals use wraparound continuous trajectories seeded from identity; for birds use closed paths. Stars visible by night, clouds track without teleportation, sun/moon matched to cycle. Individual lamp schedules independent, not all lights blinking together.
6. Separate layers and exact identity preserved; output `living_scene.gif` (loop=0), `living_scene_assets.zip` with RGBA sprites and JSON. Read `references/manifest.md` and use renderer.

## Working CLI

```bash
python -m pip install -r scripts/requirements.txt
python scripts/render_scene.py path/to/input.png --scene path/to/scene.json --out output --seconds 12 --fps 12
```

The renderer supports polygons/boxes for masks, texture-derived cutouts, controlled sub-layer motion and actual external sprite sequence frames. A human/animal animation with complex articulation requires individually drawn/AI-generated **pose assets**. The optional model segmentation script only extracts masks; it does not autonomously make correct full-body walk cycles from one image. Best-effort fallback is subtle idle breathing/blinking, not mislabelled gestures.
