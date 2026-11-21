# Hero Animator Anti-Jerk Lock (v0.15.0)

**Applies to every image→living GIF and every scene animation.** Scope: the existing Hero Animator, not a new plugin. Anti-jerk and source-art protection take precedence over more dramatic motion.

## Single source of truth

User-approved drawing remains the background source. `rembg` segments moving source bodies/props into separate RGBA candidates; RIFE optionally interpolates *same actor, same view and same action only*, output requiring artistic approval. MaxRects packs the approved sprites, Three.js draws them, Rapier governs collisions in games; PostFX modifies only environmental effects. `glTF-Transform` touches 3D scene geometry, not 2D hero drawings. These tools **cannot themselves create genuine action poses from a single flattened sketch**; use original consistent art and human-reviewable additional poses when required.

## Animation requirements

- Every person/animal/prop tracked independently. Assign each a unique persistent identity, one source sprite layer and articulated sub-layers, own actions, timings, reactions and acceleration constraints.
- Paint empty backgrounds behind original residents before relocating sprites. Never slide a rectangular crop and expose a cloned character or staircase underneath.
- Continuous **C2 easing** for translation, rotation, breathing and all light fades. Never place isolated jump cuts or unrelated AI-generated keyframes side by side.
- Frame cadence **20 fps preferred**, **16 fps minimum** for 40–60 s. GIF frame duration integer multiple of 10ms; 20 fps = 50ms, 800–1200 frames. Full 9:16 composition. Maintain one **global palette** to avoid palette flicker.
- Seam = frame N to frame 0. Loop endpoints both position AND first derivative consistent. Use integer oscillator cycles over total T, fades for any particles exiting/reentering, and stable random seed and IDs. Parameterize paths as closed loops or smoothly step back to start; no cross-loop teleport.
- Static architecture must not move, blink, wobble, or be redrawn. Only semantic layers move. Appearance/hero_id fixed across all frames.
- Sky/cloud/sun/moon phase can progress but must return smoothly to same conditions. Lamps/window lights switch at independent phase offsets. NPCs must have truly different behavior programs and interruptible reactions.
- Physical world (if a playable game): hero actions still require input; autonomous activity is for NPCs and environment only.

## Required validation

`python skills/hero-animator/scripts/smooth_motion_gate.py GIF --plan PLAN` blocks releases where file is not 9:16, looping, at least 16 FPS, 40–60 seconds, or has a temporal seam or scene-wide cut. A complete plan must give every actor an independent identity SHA256 and per-frame motion center, so speed and acceleration are checked, including the last→first step. If using cropped pixels without genuine articulated artwork, mark the animation preview and state this limitation: *cropped body deformation is not evidence of walking, page turning, dancing, eating or stair climbing*.

## ZIP production

Include actual source image, all masked RGBA layers, all authored 4/8-view actions if relevant, `scene_plan.json`, `animation_manifest.json`, renderer code, global palette/atlas assets, final GIF. Preserve original PNG/GIF bytes and their SHA256. Provide two verified download links, no narrative report unless requested.
