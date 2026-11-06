# Claude handoff — Observer World V5 on the ORIGINAL Island of Twilight renderer

**Repo:** https://github.com/mpaykin1/meta6
**Live V5:** https://mpaykin1.github.io/meta6/observer-world-en-v5/
**Original full game runtime:** [index.html](./index.html)
**Separate history/editor:** [editor.js](./editor.js)
**Music:** [audio.js](./audio.js)
**Full original input:** [../observer-world-en-v4/reference/ostrov-sumerek-expanded-original.html](../observer-world-en-v4/reference/ostrov-sumerek-expanded-original.html)
**Earlier simplified edition:** [../observer-world-en-v4/index.html](../observer-world-en-v4/index.html)
**Source catalog across all chats:** [../SOURCE_INDEX.md](../SOURCE_INDEX.md)

## Product intent

The owner supplied a specific screenshot and exact HTML reference. **Preserve the literal image style, viewing angle, perspective, terrain, water, animated pixel art, light and visual effects from the provided original. Do not replace the original Three.js scene with a made-up Canvas 2D approximation.**

The owner requests that *only island graphics*, plus a **bottom row of construction symbols** and one collapsible **☰ menu**, appear onscreen by default. The original HUD and its controls are kept intact in the DOM/code but hidden, not deleted. In the menu: music and original SFX independently, original weapons, fullscreen, pause, journal and optional original HUD.

Preserve Observer World causality (Well → Settlement → Council, Market → Guild → Tax, etc), the single shared 3D scene, new 3D objects, swords and animation, and save state.

## Working system

**index.html** is the entire original 280,123-byte user-provided HTML with only:
1. V5 additive styles/menu/dock/reader injected;
2. original `startGame()` called after original engine boot to skip original title card;
3. read-only pointers to the original in-module `scene`, `camera`, `terrainMeshes`, `atlasTex`, `THREE`, `terrainTop`, `SFX`, `spawnFoe` etc exported via `window.__isle`;
4. one `observer-v5-ready` DOM event to mount the editor.

Original 64×64×26 voxel world, PerspectiveCamera(46), Three.js meshes, indexed atlas terrain, light rigs, mist, water shaders, bloom, glitch, complete 21-weapon physics, controls, audio, foes and game loop remain original. The exact `updateCamera(dt)` function is automatically compared against the reference in CI.

**editor.js** mounts 3D cube geometries UV-mapped to the **original terrain atlas texture** into the exact original `scene`. 120-object safety cap; raycast against real terrain chunk meshes; source-ground height, water rejection; persistent browser save in `observer-v5-original-island-builder-state`. The journal and NEXT causal chain are separate from original island game state. Original Imp / Shade / Warden spawn from the actual 3D source. The editor intercepts canvas left-click only in builder mode; right-button orbit retains native code. No second game engine or game loop.

**audio.js** is the prior V4 12-track Krieger-style WebAudio score with independent music volume/transport, retaining the original complete game SFX in `index.html`. Music needs a real user tap to unlock WebAudio on browsers; don't report audible success without actual listening/user confirmation.

## Verification

[Observer V5 CI](https://github.com/mpaykin1/meta6/actions/workflows/observer-v5-gate.yml) must pass on each change, including:
- byte-for-byte original camera source retained;
- JS syntax;
- deployed V5 URL serves exact release marker;
- headless Chrome loads original WebGL `PerspectiveCamera`, original voxels and 21-weapon runtime, and **creates an actual Three.js 3D building**.

Manual viewport/screenshot comparison against user's provided original screenshot and iPhone 11 audio/performance checks are **PENDING OWNER PASS**.

For local test: open `?v5test=1` for hidden smoke evidence in `#v5SelfTest`. `window.__OBSERVER_WORLD_V5__` is provided for debugging; `window.__isle` is the original Three.js runtime.

## Outstanding work (do not mark finished)

- Exact screenshot matching under equivalent scene seed/camera/player position, including on iPhone 11; screen captures still need owner evaluation.
- Finish historical mechanics: complex NPC social groups, economy/factions, AI-driven narrative consequences, lore, robust save across game restarts.
- The exact old live-AI endpoint is still in older Observer V4; it has **not yet been fully connected to the native V5 editor**. Do not claim otherwise.
- Building collision/world effects need deeper integration with the original voxel physics; current structures are real 3D overlays in the same scene, not new terrain voxels.
- Verify WebAudio sound/music on the user's device. Do not rely solely on audio-context test.
- Respect environment: no paid keys/models, do not print tokens, never change previous accepted V2/V3/V4, do not touch World_server/master for this work without approved review.
- **User controls PASS/FAIL** for aesthetics, gameplay, music; technical CI pass != owner pass.

## Next high-value work

1. Screenshot compare current V5 vs user-provided original with same camera pose; refine default framing WITHOUT replacing `updateCamera`.
2. Manual press bottom icon and ground click, confirm all intended structures visible and sized plausibly in original scene.
3. Fix missing effects/story interactions and add reversible tests.
4. Use source-based optimizations and evidence; avoid a new unrelated engine or generic prompt-only deliverables.
