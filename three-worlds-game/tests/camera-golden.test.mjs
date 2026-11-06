import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createCameraRig} from '../camera-rig.mjs';
// Owner canon: reference source is executed independently, not a copied expected trace.
const ref=readFileSync(new URL('../../reference/island-camera/47_camera.js',import.meta.url),'utf8');
const helpers=readFileSync(new URL('../../reference/island-camera/helpers-and-rig.js',import.meta.url),'utf8');
const port=readFileSync(new URL('../camera-rig.mjs',import.meta.url),'utf8');
assert(port.includes(ref.slice(ref.indexOf('function updateCamera(dt) {')).trimEnd()),'camera must remain a literal, unmodified port');
class V3{
 constructor(x=0,y=0,z=0){this.set(x,y,z);}
 set(x,y,z){this.x=x;this.y=y;this.z=z;return this;}
 clone(){return new V3(this.x,this.y,this.z)}
 copy(v){return this.set(v.x,v.y,v.z);}
 lerp(v,k){return this.set(this.x+(v.x-this.x)*k,this.y+(v.y-this.y)*k,this.z+(v.z-this.z)*k);}
 addScaledVector(v,k){this.x+=v.x*k;this.y+=v.y*k;this.z+=v.z*k;return this;}
 normalize(){const n=Math.hypot(this.x,this.y,this.z)||1;return this.set(this.x/n,this.y/n,this.z/n);}
 toArray(){return [this.x,this.y,this.z];}
}
function makeWorld(){
 const camera={position:new V3(),target:new V3(),roll:0,
 matrixWorld:{elements:Array.from({length:16},(_,i)=>i%5===0?1:0)},
 lookAt(p){this.target.copy(p);},
 rotateZ(v){this.roll+=v;},
 updateMatrixWorld(){
  const p=this.position,a=this.target;const d=new V3(a.x-p.x,a.y-p.y,a.z-p.z).normalize();
  const right=new V3(d.z,0,-d.x).normalize();
  const up=new V3(-right.z*d.y,right.x*d.z-right.z*d.x,-right.x*d.y).normalize();
  const m=this.matrixWorld.elements;
  [m[0],m[1],m[2]]=[right.x,right.y,right.z];
  [m[4],m[5],m[6]]=[up.x,up.y,up.z];
 }};
 const rig={yaw:0,pitch:.62,dist:11,yawT:0,pitchT:.62,distT:11,spin:0,pspin:0,eff:11,pos:new V3(30,22,70),
   look:new V3(32,8,32),trauma:0,blend:1,vicA:0,lift:0,pitchEff:.62};
 const p={pos:new V3(31,7,31),vis:new V3(31,7,31),vel:new V3(),};
 const G={time:0,state:'play',idle:0,bossCam:0,warden:null,danger:0,sunAz:.7,endT:0};
 const sky={position:new V3()};
 const U={camRight:{value:new V3()},camUp:{value:new V3()},right:{value:new V3()}};
 const cutU={uCutOn:{value:0},uCutA:{value:new V3()},uCutB:{value:new V3()}};
 const clamp=(v,a,b)=>v<a?a:v>b?b:v;
 const damp=(k,dt)=>1-Math.exp(-k*dt);
 const lerp=(a,b,t)=>a+(b-a)*t;
 const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
 const angDiff=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
 const keys=new Set(),pad={cx:0,cy:0},drag={active:false},touch={camId:null};
 const world={beacon:{x:30,y:18,z:30}};
 // Actual owner rayFree code taken verbatim from helpers-and-rig.js.
 const raySrc=helpers.slice(helpers.indexOf('function rayFree(o, d, maxT) {'),helpers.indexOf('// engine/40_hero.js'));
 assert(raySrc.startsWith('function rayFree('));
 const blocks={BLK:[null,{leafy:false}],blockAt(x,y,z){return x>34&&x<38&&y>5&&y<24&&z>30&&z<52?1:0}};
 const ray=vm.runInNewContext(raySrc+';rayFree',{...blocks,Math});
 const env={G,keys,pad,rig,nearestGoal:()=>({x:13,z:28}),player:p,drag,touch,world,
  tmpA:new V3(),tmpB:new V3(),tmpD:new V3(),camera,U,sky,cutU,
  rayFree:ray,clamp,damp,lerp,smooth,angDiff,REDUCED:false,Math};
 return env;
}
function read(e){return [...e.camera.position.toArray(),...e.camera.target.toArray(),...e.rig.pos.toArray(),
 ...e.rig.look.toArray(),e.rig.pitch,e.rig.yaw,e.rig.dist,e.rig.eff,e.rig.lift,e.rig.trauma,
 e.cutU.uCutOn.value,e.camera.roll,...e.U.camRight.value.toArray(),...e.U.camUp.value.toArray(),
 ...e.U.right.value.toArray(),...e.cutU.uCutA.value.toArray(),...e.cutU.uCutB.value.toArray()];}
function scenario(e,i){
 const t=i/60,dt=1/60;e.G.time=t;
 e.G.state=i<50?'play':i<80?'title':i<100?'victory':i<550?'play':'dead';
 e.G.endT=i>=550?(i-550)/60:.3;
 e.player.vel.set(i<170?.8:i<340?2:i<460?0:-.4,0,i<260?.4:-.2);
 e.player.pos.x=31+Math.sin(t*1.3)*4;e.player.pos.z=31+Math.cos(t*.8)*3;
 e.player.vis.copy(e.player.pos);e.player.vis.y=7+Math.sin(t*2)*.1;
 e.G.idle=i>360&&i<460?12:0;e.G.danger=i>475&&i<540?.91:.12;
 e.pad.cx=i>=200&&i<260?.37:0;e.pad.cy=i>=200&&i<260?.27:0;
 e.keys.clear();if(i>300&&i<360)e.keys.add('KeyC');
 e.touch.camId=i>=170&&i<210?7:null;e.drag.active=i>=170&&i<210;
 if(i===210){e.rig.spin=2.4;e.rig.pspin=.52}
 e.G.bossCam=i>420&&i<450?.6:0;
 e.G.warden={segs:[new V3(24,9,29)]};
 if(i===480)e.rig.trauma=.7;
}
test('§21.7/21.8: exact owner 47_camera golden across 600 steps, error <=1e-6',()=>{
 const expected=makeWorld(),actual=makeWorld();
 const reference=vm.runInNewContext(ref+';updateCamera',expected);
 const update=createCameraRig(actual);
 let peak=0,at=-1;
 for(let i=0;i<600;i++){
  scenario(expected,i);scenario(actual,i);
  reference(1/60);update(1/60);
  const A=read(expected),B=read(actual);
  assert.equal(A.length,B.length);
  for(let j=0;j<A.length;j++){const diff=Math.abs(A[j]-B[j]);
   if(diff>peak){peak=diff;at=i}
   assert(diff<=1e-6,'camera mismatch: frame '+i+' element '+j+' ref='+A[j]+' got='+B[j]);
  }
 }
 assert(peak<=1e-6,'golden drift at frame '+at);
});
