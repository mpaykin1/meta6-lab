# Three.Quarks · project #10

Upstream: https://github.com/Alchemist0823/three.quarks
npm pinned: **three.quarks@0.17.1**, MIT; source repository main has unreleased 0.18.0.
API reference: https://docs.quarks.art/docs/getting-started
License: https://github.com/Alchemist0823/three.quarks/blob/master/LICENSE

**Integration:** optional `fx/quarks-vfx.js` shared Three.js 0.187.0 renderer.
- 5 independently batched emitters (campfire, rune portal, forest spores, crystals, smoke), using the actual Pixelorama palette and the original Pixelorama spritesheet texture
- Quarks native `ParticleSystem`, `BatchedRenderer`, `PointEmitter` / `SphereEmitter`;
  lifetime, velocity, size curves, color, transparent pixel VFX.
- Interactions: on manual attack and upon collecting relics only; character mesh never swaps.
- Key `V`: CINEMATIC / LITE / OFF. FPS degradation reduces cinematic to lite.
- Original 3 InstancedMesh groups remain on hand as a fallback. Rapier and
  asset loading are independent of Quarks. Pixelorama sprites remain visible.
- `scripts/vendor_quarks.py --game path/to/game` bundles pinned actual upstream
  source with `esbuild --external:three` and writes local fx/vendor/three.quarks.esm.js.
  If no internet is available, import is attempted through a pinned esm.sh CDN.
- `scripts/download_quarks.py --out /path/to/source` clones full upstream only
  where network access exists. This archive does not bundle the entire upstream repository.

Do not claim the Quarks renderer was GPU-verified unless a browser actually
loaded it. Quarks uses its own simulation; Rapier controls physics bodies only.
