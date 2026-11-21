# Postprocessing 6.39.6 — style-aware Three.js visual pipeline (v0.9)

`templates/rapier-world/src/postfx.js` implements the original `FusionPostFX` module, with npm runtime `postprocessing@6.39.6` and Three.js `0.186.1`. The dependency is **declared, not bundled or installed**. A Zlib license notice is preserved under `vendor/postprocessing/LICENSE.md`.

Four layers: distant silhouettes and fog (`scene.background` / FogExp2); midground light and bloom (EffectComposer with RenderPass, EffectPass, BloomEffect); near-ground dust is rendered as existing authored particles; screen layer GLSL colour cast, tiny animated grain, vignette, optional PixelationEffect and film NoiseEffect. `ToneMappingEffect` handles ACES filmic in the compositor; direct Three.js fallbacks restore the original renderer tonemapping.

- Modes: `cinema`, `eco`, `off`. `P`/FX button cycles. Pixel ratio capped; `eco` disables bloom and high-cost pixel effect; `off` renders via bare Three.js. After two consecutive 3-second samples <28 FPS, `cinema` drops to `eco` without automatic upswing. No movement or animation modifications.
- Presets: `nocturne`, `ink`, `ember`, `horror`, `dream`, `pixel`. `V`/STYLE button cycles. Fog/background/tint/exposure/bloom are interpolated between authored presets. No distortion of hero identity, physics, navigation, dialogue choices or input state.
- `rapier_bridge.py prepare --visual-style ink` sets world default, generates `visual_direction.by_node` for each playable scene. Per-node `visual_style` may be provided on validated scene/mechanic nodes and is limited to the above keys. `postfx_bridge.py set --world /generated/public/world.json --default nocturne --scene s1=ember` edits **only** a generated project after schema and dependency verification; source games are never touched.
- `qdrant_bridge.py collect` indexes the actual authored adapter with SHA-256 and owner metadata (no external source bytes). Rete still owns gameplay wiring; a discovered postprocessing resource does not execute mechanics.
- No automatic installation, asset replacement, shader rewrites, remote uploads or claims of graphics fidelity. Renderer success and mobile performance require running the npm-installed game on real hardware. Strong style changes occur on story scenes or user commands, not unsolicited game actions.

Requires a fresh generated demo:

```sh
python skills/meta-game-fusion/scripts/rapier_bridge.py prepare --library /path/to/fusion-library --out /path/to/new-world --visual-style ink
cd /path/to/new-world && npm install --ignore-scripts && npm run dev
```
