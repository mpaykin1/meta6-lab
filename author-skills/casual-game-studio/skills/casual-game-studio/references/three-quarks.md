# Three.quarks — Particles and VFX (Casual Game Studio 0.6)

Official upstream: https://github.com/Alchemist0823/three.quarks
Package: `three.quarks@0.17.1` plus `quarks.core@0.17.1` (MIT). Both are third-party packages and remain distinct from the original game code.

The demo's `templates/pastel-blocks/particles.js` uses the **real upstream API**: `BatchedRenderer`, `ParticleSystem`, `IntervalValue`, `ConstantValue`, `ConstantColor`, `SphereEmitter`, `RenderMode.BillBoard`.

* One `BatchedRenderer` is attached to the existing Three.js scene. Its `update(dt)` runs exactly once from the existing Three render loop.
* `burst({x,y,z},kind)` creates a bounded, short-lived emission after a real game event. Batch handles sprite particles; Rapier handles solid debris. They are visually synchronized by using the same world position but NEVER share pose authority.
* `Tween.js` drives animated mesh/UI transforms and bloom intensity. Do not tween Quarks particles: Quarks owns individual particle lifetimes and velocities.
* The optional pmndrs/postprocessing `EffectComposer` receives the same scene, so glow and vignette affect the Quarks sprites as well.
* Mobile target: at most 15 sprites per event by default, up to 10 simultaneously active emitters; low-FPS mode emits 8. Non-mobile: 28 sprites per burst with at most 18 active emitters.
* If CDN/Quarks fails, the existing rings and real physical fragments continue. The UI says `PARTICLES · FALLBACK`; do not claim Quarks rendering in fallback mode.
* A `✿ VFX` button switches new Quarks emissions on/off independently from the `✦ FX` postprocessing toggle.

## Network and offline packaging

CDN fallback uses the exact versions via HTML importmap:

- `three.quarks` → `https://cdn.jsdelivr.net/npm/three.quarks@0.17.1/dist/three.quarks.esm.js`
- `quarks.core` → `https://cdn.jsdelivr.net/npm/quarks.core@0.17.1/dist/quarks.core.esm.js`

For offline games run `python scripts/vendor_engines.py --game <game-folder>` in an internet-connected environment. This uses npm registry metadata and verifies SHA-512 for all downloaded npm archives before writing `vendor/three.quarks.esm.js` and `vendor/quarks.core.esm.js` and patching import maps. Dependency sources are NOT bundled in the plugin archive until the vendor step succeeds. The original MIT license of Three.quarks is included in `references/QUARKS-MIT-LICENSE.txt`.

## Template trigger map

- Block destroyed: pastel cloud from the block's actual 3D coordinates + Rapier rigid debris + Tween bounce and bloom pulse.
- Gift destroyed: gold sparkle burst plus coin rewards.
- Bunny tapped: pink magical twinkles; the same bunny GLB remains visible and gets a Tween jump.

No new animation loop, renderer, model or gameplay state machine.
