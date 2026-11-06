import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import {createIslandEnvironment} from '../island-environment.mjs';
const ref=fs.readFileSync(new URL('../../reference/island-canon/engine__50_env.js',import.meta.url),'utf8');
const mod=fs.readFileSync(new URL('../island-environment.mjs',import.meta.url),'utf8');
const a=ref.indexOf('function updatePost(dt) {'),z=ref.indexOf('// falling-leaf colours',a);
const canonical=ref.slice(a,z).trimEnd();
assert(mod.includes(canonical),'environment module must be original Island source verbatim');
const damp=(v,dt)=>1-Math.exp(-v*dt),clamp=(v,a,b)=>Math.max(a,Math.min(v,b)),lerp=(a,b,k)=>a+(b-a)*k;
function make(){
 const G={tod:.4,todT:.9,dawn:0,danger:.2,dangerT:.45,state:'play',endT:0,
  beatT:1,comboT:.1,hurt:0,blip:0,blipT:9,flash:0,blipT:9,
  desat:0,time:0,fade:0,bars:0,focus:0,bossCam:0};
 const FX={};
 for(const k of ['uTime','uAberr','uGlitch','uDanger','uVignette','uFlash','uDesat','uFade','uBars'])FX[k]={value:0};
 const pal={vig:.3,bloom:.7},camera={aspect:1.2},beacon={flare:.2},bloom={strength:0};
 const player={vis:{x:2,y:4,z:6}},world={beacon:{x:5,y:9,z:12}};
 const uniforms=()=>({uFocus:{value:0},uAmount:{value:0}});
 const dofH={uniforms:uniforms()},dofV={uniforms:uniforms()};
 const tmpE={x:0,y:0,z:0,set(x,y,z){this.x=x;this.y=y;this.z=z;return this},
  project(){this.y=Math.sin(this.x*.11+this.z*.05);return this}};
 const sky={top:0,horizon:0,fog:0,key:0},scene={fog:{density:0}};
 const sounds={amb:0,beat:0,beatPower:0};
 const deps={G,FX,REDUCED:false,beacon,pal,camera,player,world,tmpE,bloom,dofH,dofV,
  SFX:{ambience(t,d,m){sounds.amb=t+d+m},beat(d){sounds.beat++;sounds.beatPower=d}},
  ambienceMix:()=>.35,applyPalette(t,d){sky.top=.2+.4*t;sky.horizon=.3+d*.5;
   sky.fog=.06+.03*t;sky.key=t+d;scene.fog.density=sky.fog},
  rr:()=>8,damp,clamp,lerp};
 return {deps,sounds,sky,scene};
}
function values(s){const x=s.deps,d=x.dofH.uniforms,e=x.dofV.uniforms,g=x.G,f=x.FX;
 return [g.tod,g.dawn,g.danger,g.beatT,g.comboT,g.hurt,g.blip,g.blipT,g.flash,g.fade,g.bars,g.focus,
  x.bloom.strength,d.uFocus.value,d.uAmount.value,e.uFocus.value,e.uAmount.value,
  ...Object.values(f).map(v=>v.value),s.sky.top,s.sky.horizon,s.sky.fog,s.sky.key,s.scene.fog.density,
  s.sounds.amb,s.sounds.beat,s.sounds.beatPower];}
test('§21.8 Island lighting/sky/fog/post golden against independent 50_env source (600 frames <=1e-6)',()=>{
 const old=make(),now=make();
 const original=vm.runInNewContext(canonical+';({updatePost,updateEnvironment})',old.deps);
 const current=createIslandEnvironment({...now.deps,getWorld:()=>now.deps.world});
 let highest=0;
 for(let i=0;i<600;i++){
  for(const s of [old,now]){
   const g=s.deps.G;g.time=i/60;g.todT=i<300?.8:.25;
   g.dangerT=i%120<60?.7:.05;
   g.state=i>430&&i<500?'victory':'play';g.endT=i>430?(i-430)/30:0;
   g.bossCam=i>340&&i<400?.8:0;
   s.deps.camera.aspect=i<250?1.6:.6;
  }
  original.updateEnvironment(1/60);current.updateEnvironment(1/60);
  original.updatePost(1/60);current.updatePost(1/60);
  const v=values(old),w=values(now);assert.equal(v.length,w.length);
  for(let j=0;j<v.length;j++){const diff=Math.abs(v[j]-w[j]);
   assert(Number.isFinite(diff),'invalid env uniform '+j);
   highest=Math.max(highest,diff);
   assert(diff<=1e-6,'frame '+i+' uniform '+j+' reference '+v[j]+' got '+w[j]);}
 }
 assert(highest<=1e-6);
});
