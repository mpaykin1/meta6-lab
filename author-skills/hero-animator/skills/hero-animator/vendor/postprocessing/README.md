# postprocessing by pmndrs

Official project: https://github.com/pmndrs/postprocessing
Version: `postprocessing@6.39.6`; license: Zlib (see `LICENSE`).
Pinned game dependency: `three@0.180.0`, compatible with postprocessing's peer range `>=0.168.0 <0.188.0`.

The plugin includes its **operational adapter**, `runtime/hero-postfx.mjs`, which imports real upstream library classes. The npm package's generated JS is installed in the **game project** and bundled by `scripts/rapier_bundle.mjs`/esbuild; it is not included here, and a source import alone is not an offline game. See `references/postprocessing-rapier.md` for usage and guard rails.
