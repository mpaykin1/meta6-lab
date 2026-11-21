---
name: smooth-pixel-animation
description: Mandatory Hero Animator skill for user-uploaded static picture or sketch → living 2D pixel-art GIF, 40–60 second seamless day/night cycle, per-character independent animation, smooth motion only, ZIP with all source/cutout assets. Activate on GIF animation, живой пиксельный мир, анимируй эскиз, оживи изображение, flicker, jerk, плавность.
---

# SMOOTH PIXEL WORLD — HERO ANIMATOR (SAME PLUGIN)

## Character No-Deformation Lock (NEW — overrides all prior cutout advice)

**ABSOLUTE BAN:** For every human, cat, animal, hero and NPC, NEVER animate by deforming, bending, distorting, moving partial cutouts (head/arm/tail), skeleton skinning, mesh warps, optical flow, RIFE, cv2.remap, repeated single-frame oscillation, or by generating whole-scene frames independently. Character movement uses ONLY independently illustrated **complete-body RGBA PNG frames** for every action and 4/8 view plus rigid displacement of a whole sprite. For missing action keyframes draw distinct approved sprites first; otherwise BLOCKED. RIFE remains available for NON-character effects only. Mandatory authoritative spec: `../frame-by-frame-characters/SKILL.md`, proof: `../hero-animator/scripts/character_frame_gate.py` with manual artistic inspection. Any old paragraph recommending cutout limb motion is superseded.


## Absolute release contract

Produce BOTH: a genuinely rendered, previewable looping `.gif` and `.zip` containing all source and extracted transparent layer assets, a reproducible renderer script, a semantic scene plan and the final GIF. **A grid of independent AI-generated images is NEVER a GIF** and is NOT a frame sequence. No fake files or fictional links. This skill adds a strict mandatory mode to the existing Hero Animator plugin; never fork, remove or override its RIFE, rembg, MaxRects, glTF-Transform, Rapier or postprocessing tools. Reference: `../hero-animator/references/smooth-motion-contract.md`.

## Anti-jerk lock — hard blockers

1. **Spatial lock:** exact architecture, camera, windows, people and layout of the *uploaded original* on each frame. Do not re-generate the entire frame for successive GIF frames: text-to-image changes the architecture and body identity and produces jerks. Extract semantic layers + masked original pixels; inpaint only small exposed areas. Distinct character identity/image hash locked.
2. **Motion as continuous curves:** positional trajectories and every object's rotation/scale/opacity/color parameters must be C2 smooth (position, velocity and acceleration continuous). Use `smooth_trajectory.py:ease5/envelope/cyclic_phase`, or equivalent Hermite/Slerp with spline continuity. No `round(sin(..))` used for object centers before composing at render resolution; only final raster coordinates quantized. No frame swaps between unapproved poses.
3. **No synchronized NPC cycles:** each inhabitant independently has `hero_id`, authored action clips (`idle, walk, eat, talk, read, pour, sleep, wake, window, wave` depending on visible context), independent phase, different event windows and reaction states; every cat/bird/insect likewise. Animate **individually authored complete-body PNG animation poses**, not only screen-wide bobbing or brightness flicker. **If only one flattened reference pose is provided, a complete walking/pouring sequence is not automatically available.** Obtain or generate additional action poses, then require visual source-style/identity confirmation; otherwise label the output as a partial preview rather than falsely claiming all actions.
4. **Never let a pet, lamp, cloud, room, weather or actor teleport:** no random reseeding per frame. Use deterministic particle IDs, wrap only where alpha is fully zero and lifetime transitions eased. Time-of-day colors and window lights ease gradually and asynchronously, full loop 40–60 sec. Weather/lightning are eased, not single-frame hard flashes. Physics and screen FX never replace independent character animation.
5. **Loop mathematics:** every continuous periodic oscillator must use an **integer number of cycles over the whole GIF**; action envelopes must vanish smoothly at loop boundaries; start/end image and motion derivatives match. Avoid free-running irrational frequencies on a 40-second loop. Motion is source-coordinate-based (not a fresh image at each step).
6. **Output:** portrait ratio 9:16; 40–60 seconds; **minimum 16 FPS, target 20 or 24 FPS** with no dropped frames; stable global palette across the whole GIF; palette-based pixel art with dithering disabled or stable temporal dithering. Single permanent GIF canvas, `loop=0`, no accumulating disposal artifacts. Restrict motion/acceleration of each local sprite (default <=2 output pixels/frame and <=1.3 pixels/frame² after compositing). Independent phases of NPC tracks must differ.
7. **Gate:** before sending run `python scripts/smooth_motion_gate.py final.gif --plan animation_plan.json` (inside `../hero-animator/scripts`), fail nonzero on any seam, jump, low frame count, low FPS, wrong aspect ratio or missing per-actor tracks. If no verified track set, output **PREVIEW ONLY** and clearly state that semantic/full-body motion is not validated. The gate cannot magically prove artistic resemblance: manually inspect frames at all 40-second time points, every visible character, and the GIF loop.

## Layer-by-layer animation planning

- Deep background: dawn/noon/sunset/night sky, gentle anchored cloud drift, stars, original moon asset, separate sun, smooth meteor streaks, distant skyline.
- Mid layer rooftop: cats grooming/stretching/chasing; telescope slowly rotating; flower stems, bulbs and fairy lights, weather and lanterns. Plant stems are rooted: only leaves/tips bend.
- Residential rooms: separately animated face/arms/legs and original garments; food, cups, books, window shutters, sleeping and waking cycles, soft independent lighting, curtains.
- Stairs/balconies: body/leg sprites moving up/down the stairs following actual geometry; door open-close authored sprite; walking out with a cup; vapour and A/C heat wavering; laundry and hanging vines.
- Street: cherry petals deterministic flow; cats/birds with actual movement frames and causality, bicycle riders, pedestrians, pavement lanterns, puddle reflections. Avoid meaningless global pixel shakes.
- Screen: restrained atmospheric haze/lightning/rain without obscuring the hand-painted pixel art.

## Two mandatory user files

**GIF** uses the uploaded original as architectural master and has continuous individual action tracks. **ZIP** contains `source_reference.png`, masked `characters/`, `props/`, `foliage/`, `sky/`, `lighting/`, `particles/`, `scene_plan.json`, `animation_manifest.json`, `render.py`, `final.gif`, plus audio if actually produced. No external CDN/model inference at runtime. Only package actually used assets; never claim nonexistent independent sprite animation frames.

Always link the two actual created files. Do not replace a requested GIF with a spritesheet, screenshot, static PNG, GIF made from alternating nonmatching full-scene regenerations, or generic light flicker.
