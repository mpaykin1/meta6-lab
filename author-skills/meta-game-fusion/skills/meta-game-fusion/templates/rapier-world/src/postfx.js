/** META GAME FUSION / Postprocessing 6.39.6 visual-style adapter.
 * FX changes only scene/environment/screen; never mutates player rig, animation,
 * user input, Rapier state, narrative variables, or imported source assets.
 * Preset changes are authored, deterministic, and never run gameplay actions.
 */
import * as THREE from 'three';
import {
  Effect, EffectComposer, EffectPass, RenderPass, BlendFunction,
  BloomEffect, NoiseEffect, VignetteEffect, PixelationEffect,
  ToneMappingEffect, ToneMappingMode
} from 'postprocessing';

export const STYLE_KEYS = Object.freeze(['nocturne', 'ink', 'ember', 'horror', 'dream', 'pixel']);
export const FUSION_STYLES = Object.freeze({
  nocturne: {name:'НОЧНОЙ ПУТЬ', background:'#0d1423', fog:'#17202d', fogDensity:.019, tint:'#c2d7f0', mix:.10, bloom:.40, grain:.07, vignette:.50, exposure:1.0, pixel:false, light:1.0},
  ink:      {name:'ЖИВАЯ ТУШЬ', background:'#18212b', fog:'#344154', fogDensity:.034, tint:'#cbd6c7', mix:.40, bloom:.15, grain:.15, vignette:.34, exposure:1.02, pixel:false, light:.86},
  ember:    {name:'ПЕПЕЛ И ОГОНЬ',background:'#24151b', fog:'#402b30', fogDensity:.032, tint:'#f8b18a', mix:.28, bloom:.94, grain:.10, vignette:.58, exposure:1.04, pixel:false, light:1.18},
  horror:   {name:'PS1 · УЖАС', background:'#080e14', fog:'#1b3440', fogDensity:.049, tint:'#a3c3d1', mix:.34, bloom:.13, grain:.22, vignette:.70, exposure:.78, pixel:false, light:.65},
  dream:    {name:'СОН · РАЗЛОМ', background:'#251c3b', fog:'#4b3756', fogDensity:.026, tint:'#d9baf2', mix:.30, bloom:.85, grain:.09, vignette:.41, exposure:1.14, pixel:false, light:1.16},
  pixel:    {name:'ПИКСЕЛЬНЫЙ МИР',background:'#151e25',fog:'#33424e',fogDensity:.027,tint:'#f0cdad',mix:.30,bloom:.13,grain:.08,vignette:.38,exposure:.95,pixel:true,light:.86}
});

const FRAGMENT = /* glsl */`
uniform float uFusionTime;
uniform float uFusionGrain;
uniform float uFusionTintMix;
uniform float uFusionVignette;
uniform float uFusionExposure;
uniform vec3 uFusionTint;
float fusionHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec3 rgb = inputColor.rgb;
  float luminosity = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
  vec3 toned = mix(rgb, vec3(luminosity) * uFusionTint, clamp(uFusionTintMix, 0.0, 0.8));
  float grain = fusionHash(floor(uv * vec2(1280.0, 720.0)) + floor(uFusionTime * 22.0));
  toned += (grain - 0.5) * clamp(uFusionGrain, 0.0, 0.3);
  float d = length((uv - vec2(0.5)) * vec2(1.0, 0.92));
  toned *= 1.0 - smoothstep(0.20, 0.73, d) * (0.26 * uFusionVignette);
  outputColor = vec4(max(toned * uFusionExposure, vec3(0.0)), inputColor.a);
}
`;

function approach(a, b, dt, speed=2.8) {
  return THREE.MathUtils.lerp(a,b,1-Math.exp(-dt*speed));
}
export class FusionPostFX {
  constructor({renderer,scene,camera,lights={}}){
    this.renderer=renderer;this.scene=scene;this.camera=camera;this.lights=lights;
    this.mode='cinema';this.style='nocturne';this.target=FUSION_STYLES.nocturne;
    this.tint=new THREE.Color(this.target.tint);this.bg=new THREE.Color(this.target.background);this.fogColor=new THREE.Color(this.target.fog);
    this.current={...this.target};this.current.fogDensity=this.target.fogDensity;
    this.wantBg=new THREE.Color(this.target.background);this.wantFog=new THREE.Color(this.target.fog);this.wantTint=new THREE.Color(this.target.tint);

    this.failed=false;this.composer=null;this.clock=0;this.frames=0;this.perfTime=0;this.lowRuns=0;
    this.renderTonemapping=renderer.toneMapping;
    this.renderExposure=renderer.toneMappingExposure;
    try{this.init();this.resize(window.innerWidth,window.innerHeight);}catch(e){
      console.warn('Postprocessing unavailable; using unmodified Three.js renderer.',e);
      this.failed=true;try{this.composer?.dispose()}catch{}this.composer=null;
      renderer.toneMapping=this.renderTonemapping;renderer.toneMappingExposure=this.renderExposure;
    }
  }
  init(){
    this.renderer.toneMapping=THREE.NoToneMapping;
    this.renderer.toneMappingExposure=1;
    this.composer=new EffectComposer(this.renderer,{frameBufferType:THREE.HalfFloatType});
    this.composer.addPass(new RenderPass(this.scene,this.camera));
    this.pixelPass=new EffectPass(this.camera,new PixelationEffect(5));this.pixelPass.enabled=false;
    this.composer.addPass(this.pixelPass);
    this.bloom=new BloomEffect({mipmapBlur:true,luminanceThreshold:.72,luminanceSmoothing:.24,intensity:.4});
    this.film=new Effect('FusionArtDirection',FRAGMENT,{
      blendFunction:BlendFunction.NORMAL,
      uniforms:new Map([
        ['uFusionTime',new THREE.Uniform(0)],
        ['uFusionGrain',new THREE.Uniform(.07)],
        ['uFusionTintMix',new THREE.Uniform(.10)],
        ['uFusionVignette',new THREE.Uniform(.5)],
        ['uFusionExposure',new THREE.Uniform(1)],
        ['uFusionTint',new THREE.Uniform(this.tint)]
      ])
    });
    this.noise=new NoiseEffect({premultiply:true});
    this.noise.blendMode.opacity.value=.025;
    this.vignette=new VignetteEffect({eskil:false,offset:.22,darkness:.35});
    this.tone=new ToneMappingEffect({mode:ToneMappingMode.ACES_FILMIC});
    this.effectPass=new EffectPass(this.camera,this.bloom,this.film,this.noise,this.vignette,this.tone);
    this.effectPass.renderToScreen=true;
    this.composer.addPass(this.effectPass);
  }
  setMood(key,instant=false){
    if(!Object.prototype.hasOwnProperty.call(FUSION_STYLES,key))return false;
    this.style=key;this.target=FUSION_STYLES[key];
    this.wantBg.set(this.target.background);this.wantFog.set(this.target.fog);this.wantTint.set(this.target.tint);
    this.wantBg.set(this.target.background);this.wantFog.set(this.target.fog);this.wantTint.set(this.target.tint);
    if(this.pixelPass)this.pixelPass.enabled=this.target.pixel && this.mode==='cinema';
    if(instant){
      this.current={...this.target};this.bg.set(this.target.background);
      this.fogColor.set(this.target.fog);this.tint.set(this.target.tint);
      this.scene.background.copy(this.bg);if(this.scene.fog){this.scene.fog.color.copy(this.fogColor);this.scene.fog.density=this.target.fogDensity;}
    }
    return true;
  }
  cycleMood(){let i=STYLE_KEYS.indexOf(this.style);this.setMood(STYLE_KEYS[(i+1)%STYLE_KEYS.length]);return this.style;}
  setMode(mode){
    if(!['cinema','eco','off'].includes(mode))return this.mode;
    this.mode=mode;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,mode==='cinema'?1.4:1));
    if(this.pixelPass)this.pixelPass.enabled=this.target.pixel&&mode==='cinema';
    if(this.composer){this.composer.setSize(window.innerWidth,window.innerHeight);}
    return this.mode;
  }
  cycleMode(){return this.setMode(this.mode==='cinema'?'eco':this.mode==='eco'?'off':'cinema');}
  resize(width,height){
    const w=Math.max(1,width),h=Math.max(1,height);
    this.renderer.setSize(w,h);
    this.composer?.setSize(w,h);
  }
  update(dt){
    const t=this.target,speed=2.7;dt=Math.max(0,Math.min(.12,dt));this.clock+=dt;
    this.bg.lerp(this.wantBg,1-Math.exp(-dt*speed));
    this.fogColor.lerp(this.wantFog,1-Math.exp(-dt*speed));
    this.tint.lerp(this.wantTint,1-Math.exp(-dt*speed));
    for(const prop of ['fogDensity','mix','bloom','grain','vignette','exposure','light']){
      this.current[prop]=approach(Number(this.current[prop]??t[prop]),Number(t[prop]),dt,speed);
    }
    this.scene.background.copy(this.bg);
    if(this.scene.fog){this.scene.fog.color.copy(this.fogColor);this.scene.fog.density=this.current.fogDensity;}
    if(this.lights.rim)this.lights.rim.intensity=26*this.current.light;
    if(this.composer){
      this.bloom.intensity=this.current.bloom;
      this.film.uniforms.get('uFusionTime').value=this.clock;
      this.film.uniforms.get('uFusionGrain').value=this.current.grain;
      this.film.uniforms.get('uFusionTintMix').value=this.current.mix;
      this.film.uniforms.get('uFusionVignette').value=this.current.vignette;
      this.film.uniforms.get('uFusionExposure').value=this.current.exposure;
      this.noise.blendMode.opacity.value=this.current.grain*.24;
    }
    this.frames++;this.perfTime+=dt;
    if(this.perfTime>=3){
      const fps=this.frames/Math.max(this.perfTime,.01);
      if(this.mode==='cinema'){this.lowRuns=fps<28?this.lowRuns+1:0;if(this.lowRuns>=2)this.setMode('eco');}
      this.frames=0;this.perfTime=0;
    }
  }
  render(dt){
    this.update(dt);
    if(this.composer&&!this.failed&&this.mode!=='off'){
      this.effectPass.enabled=true;
      this.bloom.intensity=this.mode==='eco'?0:this.current.bloom;
      this.pixelPass.enabled=this.mode==='cinema'&&this.target.pixel;
      try { this.composer.render(dt); }
      catch (err) {console.warn('FX renderer fell back to Three.js',err);this.failed=true;this.mode='off';this.renderer.toneMapping=this.renderTonemapping;this.renderer.toneMappingExposure=this.renderExposure;this.renderer.render(this.scene,this.camera);}
    }else{
      this.renderer.toneMapping=this.renderTonemapping;
      this.renderer.toneMappingExposure=this.renderExposure;
      this.renderer.render(this.scene,this.camera);
      if(this.composer)this.renderer.toneMapping=THREE.NoToneMapping;
    }
  }
  get styleLabel(){return FUSION_STYLES[this.style].name;}
  dispose(){this.composer?.dispose();this.renderer.toneMapping=this.renderTonemapping;this.renderer.toneMappingExposure=this.renderExposure;}
}
