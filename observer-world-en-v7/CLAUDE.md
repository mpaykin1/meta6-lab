# Observer World V7 — Smartphone Edition / Claude and Codex

**Public game:** https://mpaykin1.github.io/meta6/observer-world-en-v7/

**Graphical baseline:** user-approved V5 Island of Twilight original. V6 supplied gameplay, NPCs, 36 unique voxel buildings, consequences/journal, `新` and combat relationships. V7 forks V6 **without changing `updateCamera(dt)` or replacing the original Three.js WebGL renderer**. Previous V5/V6 untouched. **V7 is also accepted by the owner (2026-10-16)**; further changes should target V8 or a separately reviewed branch.

## Source map

- `index.html` — original 3D world, water, shaders, original six-frame sprites, all 21 weapons, combat and physics. V7 additionally exposes safe original game methods `mobileMove`, `mobileCombo`, `mobileSwap`, `mobileRelease`, `clearConstructionTrees`, `buildGround` through `window.__isle`.
- `editor.js` — historical builder, native Three.js structures, first-person camera ground-ray target, save state, NPC integration and mobile build button callback. `window.__OBSERVER_WORLD_V7__` for test/debug.
- `mobile-controls.js` — one touch overlay, no second engine and no extra animation loop, three pixel SVG right controls, touch joystick. Only active when `(pointer:coarse) and (max-width:900px)`. On desktop, previous keyboard and mouse remain.
- `mobile-controls.css` — owner-approved 9:16 phone layout: joystick left, three translucent right buttons (opacity 0.75), scrollable historical symbols bottom, health & minimap top. Audio/fullscreen in ☰, **not** extra right buttons.
- `building-assets.js` — 36 different native voxel structures, using actual original materials.
- `npc-catalog.js`, `combat-relations.js`, `story-system.js` — previous V6 NPC, New companion/rebirth, attack/retaliation and literary history.
- `audio.js` — procedural musical score; original game SFX remain in `index.html`.
- `.github/workflows/observer-v7-gate.yml` — syntax, exact original camera comparison, live publication and real Chrome interaction smoke.

## Owner-approved mobile input behavior

1. On smartphone, horizontal-scroll the **bottom glyph toolbar** and tap a glyph.
2. **Tap the terrain near the character**; the green ring previews where to build. The target is clamped to within 7.5 world units of the character.
3. Tap the **pixel hammer button** (right middle) to construct once. Without manually tapping terrain, it selects a spot in front of the character.
4. When a tree covers the spot, call the original `fellTree` logic; it uses real bark/leaf voxel removal, particles and dirty chunk rebuild. Felled trees are persisted in V7's browser save for replay after reload. Surface variations are bridged using original-atlas stone support pillars/plinth, avoiding remeshing the entire landscape.
5. If the target overlaps any existing placed building or the original beacon tower, building is rejected. Maintain clearance around the player.
6. The **single largest button** (bottom right) triggers both original `onJumpPress` and `setAttack('touch', true)`; release stops continuous attack and ends jump hold. This is intentionally combined jump + melee attack / firing.
7. **Top right pixel arrows/weapon icon** cycles the actual original 21-weapon inventory.
8. **Bottom left joystick** controls native `touch.vx/touch.vy` with spring-back, one pointer per control and release on blur/visibility. Native left/right camera drag on canvas remains accessible outside build targeting.
9. PC retains **right mouse building / left mouse attack / keyboard WASD**. Do not display mobile overlay on desktop.

## Test and acceptance

CI evidence: https://github.com/mpaykin1/meta6/actions/workflows/observer-v7-gate.yml

`?v7test=1` forces the mobile overlay in headless Chrome and reports an actual WebGL/interaction test via `data-v7-selftest` and `#v7SelfTest`. Tests check exactly three right buttons, joystick input, combined jump + attack, button release, build via hammer, nearby placement, original tree destruction, foundations, no overlapping buildings, 21 weapons and original camera.

`?v7test=1` is a **test-only simulation**, not evidence that the physical phone's hardware input or audio has been manually tested. The owner separately granted **PASS on 2026-10-16** after receiving V7. This is an explicit owner verdict, NOT proof of a particular physical-device benchmark. [Canonical success record](../docs/SUCCESS_OBSERVER_WORLD_V7_MOBILE_2026-10-16.md). Future changes require another PASS.

All sources are publicly readable from any chat. GitHub write actions require a connected authorized account; no secrets or paid API providers.

## Rules for future changes

Do not change the graphical PASS baseline (V5) or earlier V6. Work in V7 or a new version. Preserve the original perspective, 3D lighting, water, bloom, shaders and native weapons. No new renderer or duplicated game loop. Use code evidence before claiming a fix.
