import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createIslandInput,createIslandHero} from '../hero-controls.mjs';
const inputSource=fs.readFileSync(new URL('../../reference/island-canon/engine__37_input.js',import.meta.url),'utf8');
const heroSource=fs.readFileSync(new URL('../../reference/island-canon/engine__40_hero.js',import.meta.url),'utf8');
const port=fs.readFileSync(new URL('../hero-controls.mjs',import.meta.url),'utf8');
function extract(text,start,end){const a=text.indexOf(start),b=text.indexOf(end,a);assert(a>=0&&b>a);return text.slice(a,b).trimEnd()}
const i1=extract(inputSource,'const input =','const SLOT_KEYS'),i2=extract(inputSource,'function orbitBy(','// mouse:');
const h1=extract(heroSource,'function updatePlayer(','function updateHeroMesh('),h2=extract(heroSource,'function updateHeroMesh(','function hurt(');
for(const s of [i1,i2,h1,h2])assert(port.includes(s),'canonical owner source not present verbatim');
const damp=(k,t)=>1-Math.exp(-k*t),clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),lerp=(a,b,t)=>a+(b-a)*t;
class V{constructor(x=0,y=0,z=0){this.set(x,y,z)}set(x,y,z){this.x=x;this.y=y;this.z=z;return this}copy(p){return this.set(p.x,p.y,p.z)}toArray(){return [this.x,this.y,this.z]}}
function setup(){
 const player={pos:new V(30,8,30),vis:new V(),vel:new V(),safe:new V(),look:new V(0,0,-1),onGround:true,
 coyote:0,jumpBuf:0,jumpHeld:false,jumpCut:false,facing:1,walk:0,frame:4,step:0,sq:0,sqV:0,lean:0,
 hp:10,invuln:0,safeT:0,inWater:false,respawn:0,splashT:0};
 const rig={yaw:0,pitchEff:.62,yawT:0,pitchT:.62},keys=new Set(),touch={vx:0,vy:0},pad={mx:0,my:0},drag={t:0,vy:0,vp:0},G={state:'play',idle:0,time:0,tod:.5,hurt:0};
 const combat={atk:null,charging:false,beam:{on:false},flail:{on:false,spin:0},dash:0,recoil:0};
 const hero={position:new V(),rotation:{x:0,y:0,z:0},scale:{set(x,y,z){this.x=x;this.y=y;this.z=z}}};
 const heroShadow={position:new V(),scale:{set(x,y,z){this.x=x;this.y=y;this.z=z}}},heroMat={emissiveIntensity:0};
 const shadowU={uA:{value:0}};
 const signals={step:0,jump:0,frames:0};
 const deps={G,player,rig,keys,touch,pad,drag,combat,hero,heroShadow,heroMat,shadowU,
 PL:{speed:4.7,accG:16,accA:5,jumpV:11.6},STATS:{speed:1,jump:1,swim:1},aim:{screen:0},
 clamp,damp,lerp,simDir:null,SEA:3.8,curWeapon:()=>({slow:.6}),groundGrip:()=>1,getSimDir:()=>null,
 physicsStep(dt){player.pos.x+=player.vel.x*dt;player.pos.z+=player.vel.z*dt;
  player.vel.y=Math.max(0,player.vel.y-30*dt);player.pos.y=8;player.onGround=true;return 0},
 respawnAtSafe(){player.pos.copy(player.safe)},SFX:{jump(){signals.jump++}},
 ripple(){},onLand(){},footstep(){signals.step++},engaged:()=>false,screenAngleOf:()=>0,drown(){},
 setHeroFrame(){signals.frames++},camera:{position:new V(35,15,42)},groundBelow:()=>7};
 return {deps,signals};
}
function snapshot(x){const p=x.deps.player,h=x.deps.hero,r=x.deps.rig;return [...p.pos.toArray(),...p.vel.toArray(),
 ...p.vis.toArray(),...p.look.toArray(),p.coyote,p.jumpBuf,+p.jumpHeld,+p.onGround,p.facing,p.walk,p.frame,
 p.sq,p.sqV,p.lean,r.yawT,r.pitchT,r.pitchEff,...h.position.toArray(),h.rotation.x,h.rotation.y,h.rotation.z,
 h.scale.x||0,h.scale.y||0,h.scale.z||0,x.deps.heroMat.emissiveIntensity,x.deps.shadowU.uA.value,
 x.signals.step,x.signals.jump,x.signals.frames]}
test('§21.8 independent input/orbit golden 600 steps',()=>{
 const a=setup(),b=setup(),ref=vm.runInNewContext(i1+'\n'+i2+'\n;({input,setAttack,releaseAll,onJumpPress,onJumpRelease,orbitBy})',a.deps);
 const live=createIslandInput({getG:()=>b.deps.G,getPlayer:()=>b.deps.player,getRig:()=>b.deps.rig,
 getDrag:()=>b.deps.drag,clamp,lerp});
 for(let t=0;t<600;t++){
  for(const [z,c] of [[a,ref],[b,live]]){
   if(t%50===0)c.setAttack('key',true);
   if(t%50===15)c.setAttack('key',false);
   if(t%77===0)c.onJumpPress();
   if(t%77===18)c.onJumpRelease();
   if(t%90===0){z.deps.drag.t=t*16;c.orbitBy(4,-3,.006,t*16+16)}
   if(t%139===0)c.releaseAll();
  }
  assert.equal(ref.input.atk,live.input.atk);assert.equal(ref.input.pressed,live.input.pressed);
  assert.equal(ref.input.released,live.input.released);
  assert.equal(a.deps.player.jumpBuf,b.deps.player.jumpBuf);
  assert.equal(a.deps.player.jumpHeld,b.deps.player.jumpHeld);
  assert(Math.abs(a.deps.rig.yawT-b.deps.rig.yawT)<=1e-6);
  assert(Math.abs(a.deps.rig.pitchT-b.deps.rig.pitchT)<=1e-6);
  ref.input.pressed=ref.input.released=false;live.input.pressed=live.input.released=false;
 }
});
test('§21.8 independent input-to-velocity, jump and animation golden 600 steps max error 1e-6',()=>{
 const a=setup(),b=setup();
 const ref=vm.runInNewContext(h1+'\n'+h2+'\n;({updatePlayer,updateHeroMesh})',a.deps);
 const live=createIslandHero(b.deps);
 let max=0;
 for(let t=0;t<600;t++){
  for(const v of [a,b]){
   const d=v.deps;d.G.time=t/60;d.keys.clear();
   if(t<100)d.keys.add('KeyW');else if(t<210)d.keys.add('KeyD');
   else if(t>=360&&t<460){d.keys.add('ArrowUp');d.keys.add('ArrowLeft')}
   d.touch.vx=t>=210&&t<320?.65:0;
   d.rig.yaw=.6*Math.sin(t/70);
   d.combat.charging=t>480&&t<530;
   if(t===160)d.player.jumpBuf=.13;
   d.player.jumpHeld=t>=160&&t<185;
  }
  ref.updatePlayer(1/60);live.updatePlayer(1/60);
  ref.updateHeroMesh(1/60);live.updateHeroMesh(1/60);
  const left=snapshot(a),right=snapshot(b);assert.equal(left.length,right.length);
  for(let j=0;j<left.length;j++){const diff=Math.abs(left[j]-right[j]);max=Math.max(max,diff);
   assert(diff<=1e-6,'frame '+t+' metric '+j+' expected '+left[j]+' actual '+right[j]);}
 }
 assert(max<=1e-6);
});
