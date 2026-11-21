# pmndrs/postprocessing — integrated v0.3

- Repository: https://github.com/pmndrs/postprocessing
- Public package inspected via GitHub connector: `postprocessing` **6.39.6** (`package.json` SHA `2116c6a6735fb02b492dbb2fd1d2a769b23d7ce3`).
- License: **Zlib**, original upstream copyright Raoul van Rüschen. See `POSTPROCESSING-LICENSE.txt`.
- Exact peer dependency range from package: Three.js `>=0.168.0 <0.188.0`. Our pinned Three.js `0.187.0` is supported.
- Upstream source inspected: `src/core/EffectComposer.js`, `src/effects/BloomEffect.js`, `src/effects/VignetteEffect.js`, `src/effects/PixelationEffect.js`, `src/effects/ToneMappingEffect.js`, `src/enums/ToneMappingMode.js`.
- Runtime in template: dynamically loaded `postprocessing@6.39.6/build/index.js` via import map. If unavailable, game continues with Three.js native renderer.
- Author's integration source: `templates/embergrove/fx/postfx.js`. It adds Bloom + Hue/Saturation + Vignette + Noise + ACES Filmic tone mapping. Supports cinematic/balanced/off and FPS-based quality reduction.
- For a fully offline build, run `scripts/vendor_postprocessing.py --game GAME_FOLDER` when npm access exists. It packages exact Three.js and postprocessing versions in the output.
- For a full upstream checkout, run `scripts/download_postprocessing.py --out PATH` when network is available. This sandbox cannot clone due to DNS restrictions; do not claim a full checkout was performed here.
- The postprocessing package is third-party Zlib software, not claimed as custom code. The package is linked from CDN or bundled only with npm access.

**Original links:** https://pmndrs.github.io/postprocessing/public/docs/ and https://github.com/pmndrs/postprocessing/blob/main/LICENSE.md
