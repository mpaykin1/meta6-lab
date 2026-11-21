// Game Style Forge integration: postprocessing@6.39.6 + pinned Ashima 2D simplex GLSL.
// PostFX is a separate screen layer. It never controls hero identity or physics.
import * as THREE from 'three';
import { EffectComposer, RenderPass, EffectPass, Effect, BloomEffect,
  VignetteEffect, BrightnessContrastEffect, HueSaturationEffect, NoiseEffect,
  BlendFunction } from 'postprocessing';

export function createPostFX(renderer, scene, camera, noise2D, cvStyle = {}, measuredVideo = false) {
  const mobile = window.matchMedia('(max-width: 720px), (pointer: coarse)').matches;
  const edge = THREE.MathUtils.clamp(Number(cvStyle.edge_fraction)||.1,0,.35);
  const sat = THREE.MathUtils.clamp(Number(cvStyle.mean_saturation)||.35,0,1);
  const measuredHaze = measuredVideo?THREE.MathUtils.clamp(.105 + (.15-edge)*.32,.06,.19):.13;
  const uniforms = new Map([
    ['uTime', new THREE.Uniform(0)],
    ['uStrength', new THREE.Uniform(mobile ? measuredHaze*.64 : measuredHaze)]
  ]);
  // Reuse *exact same pinned noise2D.glsl* that paints procedural ground:
  // this makes the rolling atmospheric layer and underlying terrain coherent.
  const haze = new Effect('AshimaAtmosphere', `
    ${noise2D}
    uniform float uTime;
    uniform float uStrength;
    void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
      vec2 wind = vec2(uTime * 0.012, -uTime * 0.006);
      float a = snoise(uv * 3.2 + wind);
      float b = snoise(uv * 7.6 - wind * 0.62);
      float low = 1.0 - smoothstep(0.27, 0.93, uv.y);
      float veil = clamp((a * 0.55 + b * 0.20 + 0.48) * low, 0.0, 1.0);
      float amount = veil * uStrength;
      vec3 fogColor = vec3(0.44, 0.55, 0.59);
      outputColor = vec4(mix(inputColor.rgb, fogColor, amount), inputColor.a);
    }
  `, {blendFunction: BlendFunction.NORMAL, uniforms});
  const bloom = new BloomEffect({intensity: mobile ? .48 : .73,
    luminanceThreshold: .63, luminanceSmoothing: .2, mipmapBlur: true});
  const grade = new HueSaturationEffect({saturation:measuredVideo?THREE.MathUtils.clamp((sat-.48)*.12,-.09,.07):-.10});
  const contrast = new BrightnessContrastEffect({brightness: .006, contrast: .045});
  const vignette = new VignetteEffect({offset:.18, darkness:.42});
  const grain = new NoiseEffect({blendFunction: BlendFunction.SOFT_LIGHT, premultiply:true});
  grain.blendMode.opacity.value = mobile ? .025 : .05;
  const composer = new EffectComposer(renderer, {frameBufferType: THREE.HalfFloatType,
    multisampling:0});
  composer.addPass(new RenderPass(scene,camera));
  composer.addPass(new EffectPass(camera, haze, bloom, grade, contrast, vignette, grain));
  return {
    composer,
    update(elapsed) { uniforms.get('uTime').value = elapsed; },
    setSize(w,h) { composer.setSize(w,h); },
    dispose() { composer.dispose(); },
  };
}
