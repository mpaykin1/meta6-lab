---
name: anti-jerk-animation
description: REQUIRED Hero Animator fail-closed anti-jerk gate for ANY GIF, animations, pictures-to-GIF, sketch animation and animated game; no jumping scenes, broken camera loops, pose identity swaps, jerkiness or flicker. Activates for user requests анимируй, GIF, плавность, дерганая анимация, движение героя, бег, живой мир.
---

# HERO ANIMATOR — NON-NEGOTIABLE ANTI-JERK RELEASE GATE

This skill applies **on every animation**, including generated GIFs, games and animation previews. It is part of the original Hero Animator plugin; it does not replace any existing skill. Existing no-character-deformation rules are stricter where they apply.

## Never release a jerky GIF

1. Do **not** assemble frames by independently regenerating the whole scene or swapping different rooms in place. Make static architecture an immobile, persistent world asset. Camera position is continuous with subpixel sampling; room boundaries are continuous architectural geometry or gradual cinematic transitions. Never use a hard cut disguised as movement.
2. Every human or animal is a single stable identity and uses exclusively separately authored **full-body RGBA pose frames** (at least 8 distinct frames per required action). NO mesh, deformation, cutout puppet or RIFE of characters. Inspect the first-to-last action pose transition at the same rigor as adjacent poses. Match size, head alignment, silhouette, shoes and foot contact; no transformed body parts.
3. Render at **25 FPS minimum** for new final GIFs. Minimum duration 40 s for the multi-room living scene. Frames may show different authored poses but camera/sprites must never teleport, flash, or snap. Use one fixed global grayscale/RGB palette and non-temporally-varying dithering; no per-frame paper redraw/noise.
4. For continuous camera/rigid motions, require a path for *every frame* with `max_frame_displacement_px<=2.5` at output resolution (scale with output size). Require continuous velocity (no sudden speed reversals), zero acceleration jumps and exact modular loop closure, including the last→first step. Circular worlds must be seamless across the world-tile boundary.
5. Independent environment effects use smooth periodic curves; no random frames. Mother and father require authored full-body action sequences to claim they are moving; blinking lightning or keyboard glyphs are not proof that a character moves. If not available, label a partial animated preview, never claim full character animation.
6. BEFORE a download link, run **both** `skills/hero-animator/scripts/character_frame_gate.py` and `skills/anti-jerk-animation/scripts/anti_jerk_gate.py`, then visually inspect sequential frames near ALL room changes and at the GIF seam. The script checks structural invariants; artist must still inspect motion semantics.
7. If any gate fails: **BLOCKED**. Repair the actual art or trajectory and re-render; never silence warnings by raising thresholds, dropping frames, declaring a failed check as PASS, generating a still mockup, or sending another jerky GIF.

## Fail-closed usage

```bash
python skills/hero-animator/scripts/character_frame_gate.py PACKAGE/animation_manifest.json --renderer PACKAGE/render.py --preview
python skills/anti-jerk-animation/scripts/anti_jerk_gate.py PACKAGE/final.gif --manifest PACKAGE/animation_manifest.json --scene PACKAGE/scene_plan.json
```

The `--preview` character gate is mandatory whenever the artwork has not been explicitly approved by the user; do not autoapprove new sketches. Carry `animation_manifest.json`, original assets, source sketch, authored full-body poses, scene plan, `render.py`, GIF, and testable anti-jerk outputs in ZIP. If an animation is a preview, mark it clearly; never misrepresent it as artistically approved.
