// Original Pod i Nad palette interpolation and event overlay, extracted from
// applyPalette / mixInto / eventPalette in approved source.
// Source SHA256: 91642018b3e589173171340298f72320f747d3b401021a939030f6f922ede5e5
import {createOriginalPaletteColors} from './original-palettes.mjs';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const lerp=(a,b,t)=>a+(b-a)*t;
function mixInto(out,a,b,t){
 for(const k in out){
  const v=out[k];
  if(v&&v.isColor)v.copy(a[k]).lerp(b[k],t);
  else if(Array.isArray(v))for(let i=0;i<v.length;i++)v[i]=lerp(a[k][i],b[k][i],t);
  else out[k]=lerp(a[k],b[k],t);
 }
}
export function createOriginalPaletteCycle(THREE,{biomePalette=null}={}){
 if(!THREE?.Color)throw new Error('Three.js Color required');
 const phases={};
 for(const name of ['dusk','twi','night','dawn']){
  const base=createOriginalPaletteColors(THREE,name);
  const overrides=biomePalette?.[name]||{};
  for(const [key,value] of Object.entries(overrides)){
   if(!(key in base))continue;
   base[key]=base[key]?.isColor?new THREE.Color(value):Array.isArray(value)?value.slice():value;
  }
  phases[name]=base;
 }
 const pal=createOriginalPaletteColors(THREE,'dusk');
 const tmpCol=new THREE.Color();
 function sample({tod=0,dawn=0,event=null,eventStrength=0}={}){
  if(!Number.isFinite(tod)||!Number.isFinite(dawn))throw Error('Invalid original palette phase');
  if(tod<0.5)mixInto(pal,phases.dusk,phases.twi,smooth(0,1,tod/0.5));
  else mixInto(pal,phases.twi,phases.night,smooth(0,1,(tod-0.5)/0.5));
  if(event?.palette&&eventStrength>0){
   const k=eventStrength*(event.paletteMix??0.85);
   for(const key in event.palette){
    const v=pal[key],t=event.palette[key];
    if(v===undefined)continue;
    if(v&&v.isColor)v.lerp(tmpCol.set(t),k);
    else if(Array.isArray(v))for(let i=0;i<v.length;i++)v[i]=lerp(v[i],t[i],k);
    else pal[key]=lerp(v,t,k);
   }
  }
  if(dawn>0.001)mixInto(pal,pal,phases.dawn,dawn);
  return pal;
 }
 return {phases,palette:pal,sample};
}
export function applyOriginalAtmosphere(palette,{sky,water,mist,scene,keyLight,hemisphereLight,renderer,sunAzimuth=0,moonDirection}={}){
 const p=palette;
 if(!p?.skyTop?.isColor)throw Error('Sampled original palette required');
 // Direction and lighting use original source equations; require Three.Vector3 via existing sky uniform.
 if(sky){
  const u=sky.uniforms;
  const direction=u.uSunDir.value;
  direction.set(Math.cos(p.sunEl)*Math.cos(sunAzimuth),Math.sin(p.sunEl),Math.cos(p.sunEl)*Math.sin(sunAzimuth));
  u.uTop.value.copy(p.skyTop);u.uHorizon.value.copy(p.skyHor);u.uBottom.value.copy(p.fog);
  u.uSunCol.value.copy(p.keyCol);u.uSunVis.value=p.sunVis;
  u.uNight.value=p.stars;u.uAurora.value=p.aurora;
  u.uAuroraA.value.copy(p.auroraA);u.uAuroraB.value.copy(p.auroraB);
  if(moonDirection)u.uMoonDir.value.copy(moonDirection);
 }
 if(scene?.fog){scene.fog.color.copy(p.fog);scene.fog.density=p.fogD}
 if(water){
  const u=water.uniforms;
  u.uDeep.value.copy(p.deep);u.uShallow.value.copy(p.shallow);u.uFoam.value.copy(p.foam);
  u.uSky.value.copy(p.wSky);u.uSunCol.value.copy(p.keyCol);
  if(sky){
   u.uSunDir.value.copy(sky.uniforms.uSunDir.value);
   if(moonDirection)u.uSunDir.value.lerp(moonDirection,p.moonMix).normalize();
  }
 }
 if(mist){
  const layers=mist.layers||[mist];
  for(const layer of layers){
   layer.uniforms.uColor.value.copy(p.mistCol);
   layer.uniforms.uAlpha.value=p.mist;
  }
 }
 if(keyLight){
  keyLight.color.copy(p.keyCol);keyLight.intensity=p.keyI;
  if(sky&&keyLight.target){
   keyLight.position.copy(keyLight.target.position).addScaledVector(
    moonDirection?sky.uniforms.uSunDir.value.clone().lerp(moonDirection,p.moonMix).normalize():sky.uniforms.uSunDir.value,60);
  }
 }
 if(hemisphereLight){
  hemisphereLight.color.copy(p.hemiSky);
  hemisphereLight.groundColor.copy(p.hemiGnd);
  hemisphereLight.intensity=p.hemiI;
 }
 if(renderer)renderer.toneMappingExposure=p.exposure;
 return p;
}
