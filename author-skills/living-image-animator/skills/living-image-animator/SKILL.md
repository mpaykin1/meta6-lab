---
name: living-image-animator
description: Animate all visible characters and environmental elements from user-supplied illustrations into smooth looping GIF with transparent source-locked assets ZIP. Reject any still, barely moving, identity-changing, jerky or semantically incoherent character.
---

# Living Image Animator v0.4 — ALL CHARACTERS MUST MOVE VISIBLY

## New release-blocking rule: no more nearly static residents

A glowing window, camera zoom, swaying scene, blinking particles, color grading, breathing, whole-crop translations or a one-pixel head nod **NEVER** make an unanimated person count as animated. A standing human must perform clearly distinguishable articulated behaviors. A seated human must have clear arm-hand-head interactions (pour, lift cup to mouth, read and turn pages, talk and gesture); no fake walking by translating a sitting silhouette. An animal needs its own recognizable head, foreleg, body and tail behavior; do not label a whole-crop wobble as grooming or stretching.

**Every visible person/animal** must have a stable inventory ID; 100% of them must be animated. Each person/animal must perform at least **two DISTINCT active actions**, at least **45% of its own event loop** must contain active behavior. Action-local visual change must affect at least **11–12% of original character pixels**, with **two anatomically separate parts moving visibly** and sufficiently wide joint excursions, not just an animation flag. Source-accurate rig masks are mandatory. 10% of a source figure's height or at least 2.5 output pixels of moving part sweep establishes the minimum candidate visibility; the operator must additionally inspect whether the motion is perceptually clear at normal viewing scale. Small figures below 15 output pixels in height require dedicated larger/pose sprites, *not* bogus motion claims.

A correct action also needs meaningful contacts and sequencing: arm approaches cup, hand holds cup as it moves to mouth, arm comes back, then returns to idle; hands and pages follow the book; a cat alternates paw, face and tail while grooming. **Do not infer detailed unseen actions from a single source bitmap.** If authentic motion cannot be built from source-separated pixels, author pose-specific identity-locked transparent PNGs matching clothing, face, orientation, and position. If this cannot be achieved, block final output and say exactly what was not possible, rather than reporting a fake successful animation.

## Required pipeline

1. Read `references/nonjerky-contract.md`, `references/visible-character-contract.md`, `references/rig-actions.md`, and `references/quality.md`. Visually inventory EVERY resident including small figures behind windows, cats on roof/sofa/street, birds, plants, clouds, lamps and props. No inventory omissions.
2. Extract source-derived RGBA masks and anatomical parts. Use `scripts/segment_optional.py` for optional SAM2+GroundingDINO and `scripts/auto_build_rigs.py` **only as a proposal**. Verify actual body/arm/leg pixels, rotation pivots, front/back occlusion, and clean background beneath moving parts. Missing poses must be newly authored from source, not guessed as whole-frame regenerated art. Preserve identity in all frames.
3. Author each actor's **own** schedule of coherent visible activities, action events and phase, with 2+ distinct visible actions and >=45% active duration, independent periods (no synchronized whole-crowd loop). Movements must move appropriate anatomical parts. Source-pixel rigs should be visibly articulated with at least two independent parts, not an oscillating single flat crop. Where rigid limbs cannot describe realistic gestures, draw intermediate poses and use frame interpolation rather than claiming they exist.
4. Provide continuous ease-in/ease-out curves and proper motion contacts for people and animals; full 24fps animation, 40–60 sec seamless loop. Do not jerk at action changes or loop seam, switch identities, clone actors or create visible holes. Animate distant clouds, star twinkle, drifting petals, lamps, plants and scene decorations independently. Don't claim a prop animated unless it is actually driven in rendered frames.
5. **Use the NEW mandatory final entrypoint** (not old `smooth_delivery.py`, `render_scene.py` or `render_rigged_scene.py`):

   `python scripts/visible_delivery.py source.png --scene approved_scene.json --out output --seconds 48 --fps 24`

   This invokes existing structural/smoothness checks AND a new anatomical per-actor movement gate BEFORE rendering. It checks actual source-pixel silhouettes inside EACH action, not overall scene differences. If an actor moves too little, release fails with actor/action-specific reason, no faux PASS. Enhanced visible action driver uses smoothly enveloped independent limb curves.
6. Inspect all actors at normal GIF playback and inspect transitions and seam visually. Renderer validates geometric visible movement, **not** psychological meaning or perfect anatomy; human visual review is compulsory. If the current image cannot supply true intermediate poses, do not claim completed all-character animation.
7. In one response return actual verified `living_scene.gif` AND `living_scene_assets.zip`. ZIP includes exact source, clean background, RGBA masks, transparent parts, authentic PNG pose frames, original input plates, `scene.json`, `actions_actual.json`, and `motion_gate.json`. No missing/imaginary paths.

## Technology retained

- `scripts/segment_optional.py` — GroundingDINO/SAM2 optional segmentation.
- `scripts/auto_build_rigs.py` — anatomical proposals; never trust without pixel review.
- `scripts/render_rigged_scene.py` — source-identity RGBA cutout rig and pose frames.
- `scripts/render_scene.py` — atmospheric independent effects.
- `scripts/streamed_animator.py` — disk-streamed 24fps RGB frames, ffmpeg GIF.
- `scripts/smooth_delivery.py` — existing completeness/seam structural validation; preserved.
- `scripts/visible_delivery.py` — v0.4 **MANDATORY** visible per-character movement check and enhanced joint-action curves.

**Non-negotiable**: actual visible action of every resident and animal, not just global movement. If validation fails, fix the rig/sprite assets and rerender; never weaken the test or silently skip a resident.
