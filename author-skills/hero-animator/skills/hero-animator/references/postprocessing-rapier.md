# Hero Animator + pmndrs/postprocessing — atmospheric WebGL without hero reskin

Official open-source source: https://github.com/pmndrs/postprocessing, package `postprocessing@6.39.6`, Zlib license © Raoul van Rüschen. Version is pinned in `examples/rapier-3d-game.package.json` with compatible `three@0.180.0`; the library must actually be installed and bundled into game JS before calling the game ready. No CDN or pretend shader implementation. Runtime `runtime/hero-postfx.mjs` uses genuine upstream `EffectComposer`, `RenderPass`, `EffectPass`, `SelectiveBloomEffect` and optionally `VignetteEffect` (not a hand-written fake). `runtime/hero-rapier-postfx-loop.mjs` links its rendering with existing Rapier controls and the approved multi-directional sprite actor.

## The unified pipeline

1. Original approved hero art (`hero_id`, SHA256) is never changed; optional `rembg`/`RIFE` outputs remain `UNAPPROVED` until visual review.
2. `directional_pack.py` -> real `MaxRectsPacker` produces compact shared PNG atlases; JSON maintains exact original artwork and 4/8-view identity.
3. `hero-hybrid.mjs` renders transparent RGBA frames on the 3D actor root. `rapier-world.mjs` plus `rapier-directional-controller.mjs` are the **single** authority for actor movement, jump/gravity, collision and hitboxes. Renderer never drives gameplay.
4. `hero-postfx.mjs` renders the same Three.js scene/camera once, with fog-enabled world geometry and **selective** glow from selected scenery emitters (fire/lamps/lightning). Never select `actor.root` or its descendants; never auto-create new hero views or substitute colored primitives.
5. `hero-rapier-postfx-loop.mjs` calls `controller.update(dt)` (including already existing actor animation), updates **environment** visuals only, then `fx.render(dt)` exactly once. **Do not** also call `actor.update`, `physics.step` or `renderer.render` on the same frame from a separate loop. All player actions remain explicit key/touch commands.
6. On sustained FPS below 30 for more than 2 s the FX compositor is bypassed and direct Three.js rendering is used; FX re-enables only after sustained FPS above 47 for more than 6 s. World fog remains, no gameplay speed change. `preset: 'off'` means FX off.

## Using the actual package

The skill automates setup via `node scripts/prepare_postfx_game.mjs PATH_TO_GAME`: copies the real Hero Animator runtime modules into `PATH_TO_GAME/src/hero-animator/` (so import resolution finds that game's npm packages), generates/merges a pinned game `package.json`, and refuses to silently overwrite modified modules or incompatible dependencies. The game builder runs it automatically when assembling a new game, not the user. In a new game based on `examples/rapier-3d-game.package.json` install pinned packages with `npm install --ignore-scripts` in the **game project**; `esbuild` then bundles imports of `postprocessing`, `three` and the official Rapier WASM compat package. The existing `scripts/rapier_bundle.mjs ENTRY ASSET_INLINE_HTML OUTPUT_HTML` must receive an HTML with real inline artwork/JSON and bundle this JS too. The postprocessing package is a game runtime dependency, **not** an asset-preparation dependency; do not force download on MaxRects packing alone. No postprocessing JS/WASM shipped inside this skill archive: runtime imports require the actual installed npm package, and a bare template is not an offline game.

```js
import * as THREE from 'three';
import {startHeroRapierPostFXLoop} from './src/hero-animator/hero-rapier-postfx-loop.mjs';

// game already constructed real scene, renderer, camera, approved actor,
// Rapier physics, controller and a glowing fire-mesh attached to scene:
const loop = startHeroRapierPostFXLoop({
  THREE, renderer, scene, camera, actor,
  controller, // createRapierDirectionalController; NOT legacy AABB controller
  emitters: [fireMesh],
  preset: 'balanced', fogColor: 0x152328,
  onEnvironmentFrame: (dt) => animateAuthoredFireOnly(dt)
});
// loop.fx.setPreset('mobile'|'balanced'|'cinematic'|'off');
// loop.stop() during teardown.
```

The variables `renderer/scene/camera/actor/controller/fireMesh/animateAuthoredFireOnly` above are created by the actual game. The snippet is NOT itself an executable, self-contained game; never distribute it as the game. For a ready game all required art, library code, Rapier WASM, textures/JSON and input/UI must be built and verified in one offline HTML or real hosted build.

## Visual ownership and performance

- Default `balanced`: environment-only bloom + world depth fog (`FogExp2`) with the artist's sprite kept out of the bloom selection; original `uAtlas` shader/art isn't modified. Vignette is **off** unless `preset:'cinematic'` **and** explicit `allowScreenEffects:true`. Vignette affects pixels on the final image, including the hero; require artistic approval before enabling it in a final build. Color grading, chromatic aberration, film grain, filmic tonemapping, full-screen blur and SMAA are intentionally not automatically inserted because they can recolor or distort the approved hero.
- Select emitter meshes actually placed in the visible Three.js scene. Real physical lights (PointLight, SpotLight) aren't themselves drawable bloom emitters; use the real visible flame/glow mesh instead. Existing physically lit scenery should be authored in its own depth layers; fog applies to participating scene materials and does not create geometry.
- Avoid selecting an ancestor of the hero or the hero itself; the adapter throws rather than blooming the hero. Camera render layers and depth selection are managed by the official library. Don't reuse the library's internal selection layer for unrelated objects.
- `createHeroPostFX` exposes `setPreset`, `render`, `resize`, `registerEmitter`, `unregisterEmitter` and `dispose`; `startHeroRapierPostFXLoop` provides one RAF driver and resize hook. Always dispose effects and restore original `scene.fog` on scene shutdown.
- Visual FX are not a substitute for authored smoke, weather, environmental silhouettes or actual gameplay. On low-end hardware they are deliberately reduced; adding more post effects can reduce FPS. Do not advertise improved FPS without a measured build.

**Boundary:** no new graphic assets were fabricated by this integration; postprocessing cannot fix incomplete 4/8-angle art, missing approved actions or an invalid offline build. No second version of the Hero Animator plugin.
