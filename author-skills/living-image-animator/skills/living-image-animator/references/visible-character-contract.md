# Visible character contract v0.4

## Exact failure that this release prevents

Earlier `smooth_delivery.py` checked `action` labels and rejected *large discontinuities*; it didn't ensure that limb poses actually changed noticeably. Consequently it could call an almost immobile person 'animated', while lights, weather and particles moved around that person. `visible_delivery.py` now compares **local RGBA character pixels**, calculated from the **same rig pose renderer used in export**, separately for every non-idle action. Background particles, day/night grading and camera movement cannot pass the character gate.

## Full acceptance thresholds

- All humans and animals indexed individually in `inventory.actors` and scene `actors`, same IDs, no missing roles.
- At least TWO distinct non-idle action names per actor; active action intervals total at least 45% of its own schedule.
- Per active action >=12% of source actor pixels visibly change (>=11% for animals) between sampled articulated action poses. Motion must arise **inside source character RGBA**, never through root position alone.
- At least two separately named anatomical parts must move far enough (>=max(2.5px,10% character height) at export scale), with action-appropriate parts. No false `blink` from a head rotation. A character below 15 px tall cannot be certified via a crude rigid rig.
- For walk, both left and right legs must make independent opposing strokes while arms counter-rotate; no table-bound seated silhouettes walking. For drink, a visible right arm plus head; for reading, arm and head; for grooming/stretch, cat paw/foreleg and head. These source part movements are an imperfect geometric proxy, NOT proof of logical hand-to-object contact.
- Seam and transition continuity enforced by the existing `compare_actor_temporal` after visible gate. Output 24fps+ / 40–60s / cycle-closed.
- All critical interactions verified by human review at native size. Real sprite frame/pose drawing is required whenever a rigid source cutout would look physically impossible. A released GIF must not swap identity, distort faces or change outfits.

## Animation authoring guidance

**People:** eating/drinking = arm lifts object, head approaches, arm returns; conversations = head direction, distinct arm gestures, not full-body jitter; sitting = torso stays anchored to seat; moving = foot contact, alternating legs, arm counter-swing and continuous ground position.

**Cats:** grooming = paw-to-face + head motion; stretch = front paws extend and body changes; tail = separate tail motion plus posture; sleeping = breathing, ears and tiny tail only, which alone does not satisfy full activity. A cat cannot suddenly stand and walk from a single sleeping silhouette without newly drawn identity-consistent poses.

**World:** register clean sky and paired plates. Moving plants/lamps/particles are additive layers and never substitute for character animation. Every prop claimed in `required_events` must be actually implemented in renderer, or reported as incomplete.

## Diagnostics

On a failure, `output/motion_gate.json` includes the failing actor ID, action, pixel-change fraction, visible anatomical part sweeps and reasons. Do not deliver the unfinished GIF as full animation. Reauthor exact masks and additional pose PNGs, then run final entrypoint again. Do NOT lower metrics to make a poor animation pass.
