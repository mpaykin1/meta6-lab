# Living Image Animator — no-jerk and completeness contract v0.3

**This is a release-blocking contract, not an optional best practice.**

## Always provide TWO real artifacts

1. `living_scene.gif`: an actual animated GIF, infinite loop, no static sheet.
2. `living_scene_assets.zip`: includes `source.png`, registration-preserving cleaned background, `scene.json`, exact input masks and alternate plates (`project/inputs/`), per-actor transparent PNG components (`layers/`), pose PNGs (`poses/`), and exported action metadata.

Never link a non-existing path. A directory of loose assets is optional in addition to the ZIP, not a substitute for it. If a mandatory event is unimplemented, label result incomplete rather than claiming the full deliverable.

## Hard rules

- For fully animated living worlds: **40–60 seconds**, **at least 24 fps**, 9:16 when source is vertical, pixel-art integrity kept. Frame count limited to 1500; choose 48 s × 24 fps to fit. The no-jerk wrapper runs at true final cadence.
- A character must have independent, source-faithful articulated components, multiple explicit events, and distinct, non-synchronous behavioral cadence. Every visible actor must be in `inventory.actors`, and each must be represented by a rigged `actors` entry. No bobbing or moving a rigid still crop as a substitute for walking/eating/playing. No identity drift.
- Never use a storyboard grid as a pose animation.
- Physically verify each action at beginning, middle, end, and on loop closure. If a seated person needs standing/walking without visible legs, generate **identity-locked explicit pose PNGs first** (then add a sprite timeline supporting them). Do not claim those actions are possible from a generic upper-body rigid-part rig.
- Do not use smooth crossfades between unrelated whole-scene generated panels: that appears as morphing/ghosting, not controlled animation.
- Use smooth continuous parameter curves and contact-aware locomotion; no coordinate teleportation. Temporal discontinuity above allowable alpha/translation motion thresholds is an automatic fail.
- Physics and interactions must be semantic: cup reaches mouth before drink; hand opens door only at close range; cat reacts to bird position; eye/head orientation consistent. Every dynamic element has z-depth, local timing and a stationary anchor where appropriate.
- The `required_events` array lists every animation promised to the user. `smooth_delivery.py` refuses release if event implementation is absent. Each tag uses `actor:<id>:<action>`, `particle:<type>`, `light:<id>`, or `sky:registered-day-night`. Other types are not implemented in v0.3. In particular, **do not claim** automatic clouds, turning telescope, standing up, coherent bike riding, opening doors, lightning, meteors, puddle reflections, and full crowd walk just because these are mentioned in a requested inventory: they need new animation primitives and asset authoring, not a scene JSON tag.
- A real visual check of every important character and the seam remains necessary. The numeric gate is conservative and cannot independently certify artistic realism.

## Required execution

```bash
python scripts/smooth_delivery.py source.png --scene approved_scene.json --out exported --seconds 48 --fps 24
```

Do not bypass with `render_scene.py` or `render_rigged_scene.py` for a final all-actors-animated delivery. Use `--allow-partial` **only** for explicitly labelled technical previews; it must never be represented as a complete result. Return the two filenames in the same answer, with the exact verified artifact paths.
