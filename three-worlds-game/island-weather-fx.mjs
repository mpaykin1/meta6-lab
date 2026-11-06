// §21.8: single-scene original Island weather preset GPU particles.
// The original 86_events.js renderer is missing from reference/; this port
// uses the source-described wrapped THREE.Points cloud, with seven exact presets.
// No second WebGL renderer, canvas, HUD control or animation loop.
import {createIslandWeatherCatalog} from './island-weather.mjs';
import {worldWeatherAt} from './weather-cycle.mjs';
export function createIslandWeatherFX({THREE,scene,camera,count=320,getSfx=()=>null}){
 const catalog=createIslandWeatherCatalog(),geo=new THREE.BufferGeometry();
 const pos=new Float32Array(count*3),phase=new Float32Array(count*3);
 let seed=708014;
 const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)|0)>>>0)/4294967296;
 for(let i=0;i<count;i++){let k=i*3;pos[k]=rand();pos[k+1]=rand();pos[k+2]=rand();
  phase[k]=rand()*6.2831853;phase[k+1]=.65+rand()*.7;phase[k+2]=rand()}
 geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
 geo.setAttribute('aPhase',new THREE.BufferAttribute(phase,3));
 const uniforms={
  uTime:{value:0},uBox:{value:24},uFall:{value:0},uSway:{value:0},
  uSize:{value:0},uAlpha:{value:0},uShape:{value:0},uGlow:{value:0},
  uSnow:{value:0},uPixels:{value:400},uColor:{value:new THREE.Color('#ffffff')}
 };
 const vert=[
 'attribute vec3 aPhase;',
 'uniform float uTime,uBox,uFall,uSway,uSize,uPixels;',
 'varying float vSeed;',
 'void main(){',
 'vSeed=aPhase.z;',
 'float t=uTime;',
 'vec3 p=vec3(',
 'fract(position.x+sin(t*1.7+aPhase.x)*uSway/max(uBox,1.0))-.5,',
 'fract(position.y-t*uFall*aPhase.y/max(uBox,1.0))-.5,',
 'fract(position.z+sin(t*.9+aPhase.x)*uSway*.28/max(uBox,1.0))-.5',
 ')*uBox;',
 'vec4 view=modelViewMatrix*vec4(p,1.0);',
 'gl_Position=projectionMatrix*view;',
 'gl_PointSize=clamp(uSize*uPixels/max(1.0,-view.z),1.3,65.0);',
 '}'].join('\n');
 const frag=[
 'precision mediump float;',
 'uniform vec3 uColor;',
 'uniform float uAlpha,uShape,uSnow,uGlow;',
 'varying float vSeed;',
 'void main(){',
 'vec2 p=gl_PointCoord*2.0-1.0;',
 'float r=length(p),a=0.0;',
 'if(uShape>0.5&&uShape<1.5){',
 'float line=abs(p.x+.22*p.y);',
 'a=(1.0-smoothstep(.055,.19,line))*(1.0-smoothstep(.7,1.0,abs(p.y)));',
 '}else if(uShape>1.5){',
 'float edge=.6+.15*sin(atan(p.y,p.x)*6.0+vSeed*6.2831853);',
 'a=1.0-smoothstep(edge-.12,edge,r);',
 '}else if(uSnow>.5){',
 'float arm=min(abs(p.x),min(abs(.5*p.x+.8660254*p.y),abs(.5*p.x-.8660254*p.y)));',
 'a=(1.0-smoothstep(.055,.15,arm))*(1.0-smoothstep(.75,1.0,r));',
 '}else{a=1.0-smoothstep(.25,.95,r);}',
 'if(a<.035)discard;',
 'gl_FragColor=vec4(uColor*(1.0+.6*uGlow),a*uAlpha);',
 '}'].join('\n');
 const material=new THREE.ShaderMaterial({uniforms,vertexShader:vert,fragmentShader:frag,
  transparent:true,depthWrite:false,depthTest:true,blending:THREE.NormalBlending});
 const points=new THREE.Points(geo,material);
 points.name='island-canon-weather-gpu';points.frustumCulled=false;points.renderOrder=10;
 scene.add(points);
 let kind=null,override=null,lastRainAudio=-Infinity,wasRaining=false;
 function setKind(next){
  if(!catalog.has(next))throw Error('Unknown original Island weather: '+next);
  if(next===kind)return kind;
  const p=catalog.get(next);kind=next;
  uniforms.uBox.value=p.box??24;uniforms.uFall.value=p.fall;
  uniforms.uSway.value=p.sway;uniforms.uSize.value=p.size;uniforms.uAlpha.value=p.alpha;
  uniforms.uShape.value=p.shape;uniforms.uGlow.value=p.glow??0;
  uniforms.uSnow.value=next==='snow'?1:0;uniforms.uColor.value.set(p.color);
  material.blending=p.additive?THREE.AdditiveBlending:THREE.NormalBlending;
  material.needsUpdate=true;return kind;
 }
 function select(next){override=next===null?null:setKind(next);return override}
 function update(dt,worldId,submerged,time,pixelHeight=800){
  if(override===null)setKind(worldWeatherAt(worldId,submerged,time));
  const rain=!submerged&&kind==='rain';
  if(rain){
   // Weather changes the existing single world's sky/fog, never the frozen
   // original Island camera, geometry or second renderer.
   if(scene.fog){
    scene.fog.color.lerp(new THREE.Color('#48566b'),Math.min(.035,dt*.7));
    scene.fog.density=Math.max(scene.fog.density,.012);
   }
   // Reuse the game's native WebAudio noise generator after a user gesture.
   // No looping sources, background thread or extra audio engine.
   if(time-lastRainAudio>2.7){
    const sfx=getSfx();
    if(sfx?.ctx&&sfx?.noiseBuf&&!sfx.muted){
      sfx.hiss(2.65,920,.5,.055,'lowpass');
      if(!wasRaining)sfx.tone(75,1.5,'sine',.025,52);
      lastRainAudio=time;
    }
   }
  }
  wasRaining=rain;
  uniforms.uTime.value=time;
  uniforms.uPixels.value=pixelHeight/(2*Math.tan(camera.fov*Math.PI/360));
  points.position.copy(camera.position);
  points.visible=!submerged;
 }
 function snapshot(){
  const p=kind?catalog.get(kind):null;
  return {kind,visible:points.visible,particleCount:count,preset:p?{...p}:null,
   box:uniforms.uBox.value,fall:uniforms.uFall.value,sway:uniforms.uSway.value,
   size:uniforms.uSize.value,alpha:uniforms.uAlpha.value,
   shape:uniforms.uShape.value,glow:uniforms.uGlow.value,
   blending:material.blending,time:uniforms.uTime.value};
 }
 function dispose(){scene.remove(points);geo.dispose();material.dispose()}
 return {update,setKind,select,snapshot,dispose,points,catalog};
}
