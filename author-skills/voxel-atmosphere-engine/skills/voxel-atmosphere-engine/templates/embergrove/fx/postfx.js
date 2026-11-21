/** Voxel Atmosphere Engine: pmndrs/postprocessing 6.39.6 integration (Zlib)
 * Runs on Three.js 0.187.0. Imported lazily to preserve the game when CDN fails.
 * The integration is original code; library is loaded separately via import map.
 */
import * as THREE from 'three';
import {EffectComposer, RenderPass, EffectPass, BloomEffect, VignetteEffect, NoiseEffect, HueSaturationEffect, ToneMappingEffect, ToneMappingMode} from 'postprocessing';

export function createAtmosphereFX(renderer, scene, camera) {
  const composer = new EffectComposer(renderer, {
    frameBufferType: THREE.HalfFloatType, depthBuffer: true, multisampling: 0
  });
  const bloom = new BloomEffect({
    mipmapBlur: true, intensity: 1.18, luminanceThreshold: 0.65,
    luminanceSmoothing: 0.22, radius: 0.76, levels: 5
  });
  const color = new HueSaturationEffect({hue: 0.006, saturation: 0.09});
  const vignette = new VignetteEffect({offset: 0.29, darkness: 0.45});
  const noise = new NoiseEffect({premultiply: true});
  noise.blendMode.opacity.value = 0.055;
  const tone = new ToneMappingEffect({mode: ToneMappingMode.ACES_FILMIC});
  const pass = new EffectPass(camera, bloom, color, vignette, noise, tone);
  pass.dithering = true;
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(pass);

  let mode = 'cinematic';
  function setMode(next) {
    mode = next;
    if (next === 'balanced') {
      bloom.intensity = 0.60;
      vignette.uniforms.get('darkness').value = 0.32;
      noise.blendMode.opacity.value = 0.022;
      color.uniforms.get('saturation').value = 0.045;
    } else {
      bloom.intensity = 1.18;
      vignette.uniforms.get('darkness').value = 0.45;
      noise.blendMode.opacity.value = 0.055;
      color.uniforms.get('saturation').value = 0.09;
    }
  }
  return {
    get mode() {return mode;},
    setMode,
    render(dt) { composer.render(dt); },
    resize(width, height) { composer.setSize(width, height); },
    dispose() { composer.dispose(); }
  };
}
