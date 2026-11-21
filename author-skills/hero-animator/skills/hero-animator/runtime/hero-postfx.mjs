/**
 * Hero Animator — genuine pmndrs/postprocessing 6.39.6 adapter for Three.js.
 *
 * World fog + bloom from SELECTED ENVIRONMENT EMITTERS only. The original hero
 * sprite textures, animation clocks, pivot, identity and Rapier physics are
 * never changed. Uses the existing game renderer, scene and camera; call render
 * ONCE after Rapier controller and sprite updates.
 *
 * Build dependency: postprocessing@6.39.6 + three@0.180.0.
 * The game bundler must inline this module, dependencies, Rapier WASM and art.
 * A bare import of this file is NOT a file://-ready game.
 */
import {
  EffectComposer, RenderPass, EffectPass, SelectiveBloomEffect, VignetteEffect
} from 'postprocessing';

export const HERO_POSTFX_VERSION = '0.12.0';
export const HERO_POSTFX_PRESETS = Object.freeze({
  off:       Object.freeze({intensity: 0,    radius: 0,    fogDensity: 0}),
  mobile:    Object.freeze({intensity: 0.18, radius: 0.23, fogDensity: 0.009}),
  balanced:  Object.freeze({intensity: 0.36, radius: 0.29, fogDensity: 0.016}),
  cinematic: Object.freeze({intensity: 0.52, radius: 0.36, fogDensity: 0.025})
});

const finite = (v) => typeof v === 'number' && Number.isFinite(v);
const mustPositive = (v, name) => {
  if (!finite(v) || v <= 0) throw new Error(`${name} must be finite and > 0`);
};
const inside = (object, ancestor) => {
  if (!object || !ancestor) return false;
  for (let node = object; node; node = node.parent) if (node === ancestor) return true;
  return false;
};
const toRoot = actor => actor?.root ?? (actor?.isObject3D ? actor : null);

/**
 * Create a SINGLE scene compositor. No extra RAF, controls or physics update.
 * @param {{THREE:object,renderer:object,scene:object,camera:object,hero?:object,
 *   emitters?:object[],preset?:string,fogColor?:number|string,
 *   allowScreenEffects?:boolean,vignetteDarkness?:number,
 *   adaptive?:boolean,minFPS?:number,recoverFPS?:number}} options
 */
export function createHeroPostFX({
  THREE, renderer, scene, camera, hero=null, emitters=[], preset='balanced',
  fogColor=0x1c2832, allowScreenEffects=false, vignetteDarkness=0.14,
  adaptive=true, minFPS=30, recoverFPS=47
}={}) {
  if (!THREE?.FogExp2 || !renderer?.render || !renderer?.getSize ||
      !scene?.isScene || !camera?.isCamera)
    throw new Error('Real Three.js WebGLRenderer, Scene and Camera are required');
  if (!(preset in HERO_POSTFX_PRESETS)) throw new Error('Unknown Hero PostFX preset');
  mustPositive(minFPS, 'minFPS'); mustPositive(recoverFPS, 'recoverFPS');
  if (recoverFPS <= minFPS) throw new Error('recoverFPS must exceed minFPS');
  if (!finite(vignetteDarkness) || vignetteDarkness < 0 || vignetteDarkness > 1)
    throw new Error('vignetteDarkness must be 0..1');
  if (!Array.isArray(emitters)) throw new Error('emitters must be an array');

  // The author's sprite shader uses uAtlas and does not opt into scene fog;
  // THREE.FogExp2 affects fog-enabled world materials, not the original RGBA.
  const heroRoot = toRoot(hero);
  const priorFog = scene.fog;
  const originalAutoClear = renderer.autoClear;
  const ambientFog = new THREE.FogExp2(fogColor, HERO_POSTFX_PRESETS[preset].fogDensity || 0.000001);
  if (preset !== 'off') scene.fog = ambientFog;

  // pmndrs recommends a single composer and a RenderPass followed by effect passes.
  // Do not silently change renderer toneMapping or outputColorSpace: that would
  // shift the approved paint palette. A different toneMapping requires an explicit
  // change in the game's own color workflow.
  let composer, bloom, glowPass, vignettePass;
  try {
    composer = new EffectComposer(renderer, {
      frameBufferType: THREE.UnsignedByteType,
      multisampling: 0
    });
    composer.addPass(new RenderPass(scene, camera));
    bloom = new SelectiveBloomEffect(scene, camera, {
      intensity: HERO_POSTFX_PRESETS[preset].intensity,
      radius: HERO_POSTFX_PRESETS[preset].radius || 0.23,
      luminanceThreshold: 0.7,
      luminanceSmoothing: 0.09,
      mipmapBlur: true,
      levels: 5
    });
    bloom.ignoreBackground = true;
    glowPass = new EffectPass(camera, bloom);
    composer.addPass(glowPass);
    const vignette = new VignetteEffect({offset: 0.54, darkness: vignetteDarkness});
    vignettePass = new EffectPass(camera, vignette);
    composer.addPass(vignettePass);
  } catch (error) {
    if (composer) composer.dispose();
    renderer.autoClear = originalAutoClear;
    scene.fog = priorFog;
    throw error;
  }
  // SelectiveBloomEffect uses a dedicated Three.js render layer. No glow from
  // the actor itself or any ancestor group that contains the actor is allowed.
  const owned = new Set();
  let active = preset;
  let reduced = false;
  let disposed = false;
  let slowFor = 0;
  let fastFor = 0;
  let lastCanvasWidth = 0;
  let lastCanvasHeight = 0;
  function checkAlive(){ if(disposed) throw new Error('Hero PostFX has been disposed'); }
  function registerEmitter(object) {
    checkAlive();
    if (!object?.isObject3D || !object.layers ||
        !(object.isMesh || object.isPoints || object.isLine || object.isSprite))
      throw new Error('PostFX emitter must be a real world Mesh/Points/Line/Sprite');
    if (object === scene || !inside(object, scene))
      throw new Error('PostFX emitter must be attached to this scene');
    if (heroRoot && (inside(object, heroRoot) || inside(heroRoot, object)))
      throw new Error('Character Art Lock: never add hero sprites to bloom selection');
    if (!owned.has(object)) { bloom.selection.add(object); owned.add(object); }
    updateEnabled();
    return object;
  }
  function unregisterEmitter(object) {
    checkAlive();
    if (owned.delete(object)) bloom.selection.delete(object);
    updateEnabled();
  }
  function updateEnabled() {
    // Never use full-screen bloom; bloom is confined to authored environment
    // lights (fire, lightning, magic). Full-screen vignette is explicit opt-in.
    glowPass.enabled = active !== 'off' && !reduced && owned.size > 0;
    vignettePass.enabled = active === 'cinematic' && !reduced && Boolean(allowScreenEffects);
  }
  function setPreset(next) {
    checkAlive();
    if (!(next in HERO_POSTFX_PRESETS)) throw new Error('Unknown PostFX preset');
    active = next;
    const params = HERO_POSTFX_PRESETS[active];
    bloom.intensity = params.intensity;
    if (bloom.mipmapBlurPass) bloom.mipmapBlurPass.radius = params.radius || 0.23;
    if (active === 'off') {
      if (scene.fog === ambientFog) scene.fog = priorFog;
    } else {
      ambientFog.density = params.fogDensity;
      scene.fog = ambientFog;
    }
    updateEnabled();
  }
  function resize(width, height) {
    checkAlive();
    mustPositive(width, 'width'); mustPositive(height, 'height');
    // Call renderer.setSize(cssWidth,cssHeight,false) in the game first;
    // composer.setSize expects CSS pixels and honors renderer pixel ratio.
    composer.setSize(Math.ceil(width), Math.ceil(height));
    lastCanvasWidth = Math.ceil(width);
    lastCanvasHeight = Math.ceil(height);
  }
  function render(dt=1/60) {
    checkAlive();
    if (!finite(dt) || dt < 0) throw new Error('dt must be a non-negative number');
    if(adaptive && dt > 0) {
      const observed = 1 / dt;
      slowFor = observed < minFPS ? slowFor + dt : 0;
      fastFor = observed > recoverFPS ? fastFor + dt : 0;
      if(!reduced && slowFor > 2.0) { reduced = true; fastFor=0; updateEnabled(); }
      if(reduced && fastFor > 6.0) { reduced = false; slowFor=0; updateEnabled(); }
    }
    // A single render call. Direct renderer path drops extra screen passes on
    // mobile/low FPS while preserving the Rapier actor and painterly sprites.
    const effectsActive = glowPass.enabled || vignettePass.enabled;
    if (active === 'off' || reduced || !effectsActive) {
      const auto = renderer.autoClear;
      renderer.autoClear = true;
      try {renderer.render(scene, camera);} finally {renderer.autoClear = auto;}
      return;
    }
    composer.render(dt);
  }
  function dispose() {
    if(disposed)return;
    bloom.selection.clear(); owned.clear();
    composer.dispose();
    if(scene.fog === ambientFog) scene.fog = priorFog;
    renderer.autoClear = originalAutoClear;
    disposed = true;
  }
  for(const emitter of emitters){
    try {registerEmitter(emitter);} catch(err){dispose();throw err;}
  }
  updateEnabled();
  // Initial size is from the EXISTING canvas; never inject a second canvas.
  const s = renderer.getSize(new THREE.Vector2());
  resize(s.width, s.height);
  setPreset(preset);
  return {
    render, resize, setPreset, registerEmitter, unregisterEmitter, dispose,
    get preset(){return active;},
    get degraded(){return reduced;},
    get emitterCount(){return owned.size;},
    get size(){return {width:lastCanvasWidth,height:lastCanvasHeight};},
    get composer(){return composer;}
  };
}
