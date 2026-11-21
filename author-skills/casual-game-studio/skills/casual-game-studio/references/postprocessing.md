# pmndrs/postprocessing v6.39.6 (Zlib)

Upstream: https://github.com/pmndrs/postprocessing/tree/v6.39.6
NPM: https://www.npmjs.com/package/postprocessing/v/6.39.6
Three.js peer: >=0.168.0 and <0.188.0; the fixed r187 is compatible.

Actual upstream ESM distribution: `postprocessing@6.39.6/build/index.js`.

This skill vendors verified upstream shader source files (`pmndrs-shaders/`), upstream license and an adapter to the full official ESM package. Full built distribution is loaded from a pinned CDN at runtime by default, or downloaded and checksum-verified from npm with `vendor_engines.py` for offline use. Do not claim the full package is included in the skill archive; it is not.

Integration design:
- Three.js: single renderer, geometry, materials and shadows.
- pmndrs/postprocessing: EffectComposer + RenderPass + EffectPass, BloomEffect + VignetteEffect.
- Tween.js: interactive 110ms impact glow then 480ms recovery via one Tween Group.
- Fallback: if postprocessing module fails, render clean Three.js; never blank the game.
- GPU budgeting: cap pixel ratio at <=2; no antialiasing in WebGL renderer when composer enabled; if FPS<30, prefer disabling FX or lowering composer pixel density.

Upstream files (the shader samples are unmodified):
- src/effects/glsl/vignette.frag SHA Git blob 6cd8c71299071ad7d4f2a820d0f244f96e65a5d2
- src/effects/glsl/bloom.frag SHA Git blob 71fdbfd935db26831a2d77493fd2ae8561bd8c16
- src/effects/glsl/brightness-contrast.frag SHA Git blob 70040af245647609c4f255ee51978aa8d1cb46e8
