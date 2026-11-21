/**
 * KTX-Software -> KTX2 -> Three.js shared texture pipeline.
 * A successful ALL-or-NOTHING swap keeps every tile's original material and UVs.
 * Absent/unsupported assets leave the original CanvasTexture maps completely intact.
 */
export async function upgradeToKtx2({THREE, renderer, materials, originalTextures, status}) {
  const report = s => { if (status) status(s); };
  report('TEXTURES · CANVAS');
  let manifest;
  try {
    const response = await fetch('./textures/ktx2-manifest.json',{cache:'no-store'});
    if (!response.ok) return false;
    manifest = await response.json();
  } catch { return false; }
  if (manifest?.format !== 'ktx2' || !manifest.files || !Object.keys(manifest.files).length) return false;
  const expected = Object.keys(materials);
  if (!expected.every(k=>typeof manifest.files[k] === 'string' && /^[a-z]+\.ktx2$/.test(manifest.files[k]))) return false;
  const loaded = new Map();
  let loader;
  try {
    const {KTX2Loader} = await import('three/addons/loaders/KTX2Loader.js');
    loader = new KTX2Loader().setTranscoderPath('./vendor/three-addons/libs/basis/').detectSupport(renderer);
    loader.setWorkerLimit((navigator.hardwareConcurrency||4)<=4 ? 1 : 2);
    for(const k of expected) {
      const url='./textures/ktx2/'+manifest.files[k];
      const texture = await loader.loadAsync(url);
      texture.colorSpace=THREE.SRGBColorSpace;
      texture.anisotropy=Math.min(4, renderer.capabilities.getMaxAnisotropy());
      loaded.set(k,texture);
    }
    // Commit only once all eight textures are decoded successfully.
    for(const [kind,texture] of loaded) {
      materials[kind].map=texture;
      materials[kind].needsUpdate=true;
    }
    for(const texture of Object.values(originalTextures)) texture.dispose();
    report('TEXTURES · GPU KTX2');
    return true;
  } catch(error) {
    for(const texture of loaded.values()) texture.dispose();
    report('TEXTURES · CANVAS');
    console.warn('KTX2 unavailable, retaining original procedural texture maps.',error);
    return false;
  } finally {
    loader?.dispose();
  }
}
