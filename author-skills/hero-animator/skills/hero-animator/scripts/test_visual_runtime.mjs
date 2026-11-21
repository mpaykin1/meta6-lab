// Run: node scripts/test_visual_runtime.mjs /absolute/path/to/three.module.js
// Synthetic metadata tests controller mechanics only; never approves game artwork.
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import '../runtime/visual-quality.js';
import {HybridActor} from '../runtime/hero-hybrid.mjs';
import {createDirectionalController,REQUIRED_ACTIONS,FOUR_DIRECTIONS,EIGHT_DIRECTIONS} from '../runtime/directional-controller.mjs';
const THREE=await import(pathToFileURL(process.argv[2]).href);
const target=new EventTarget();globalThis.window=target;
const doc=new EventTarget();doc.hidden=false;globalThis.document=doc;
const event=(type,code,repeat=false)=>{const e=new Event(type,{cancelable:true});Object.defineProperties(e,{code:{value:code},repeat:{value:repeat}});target.dispatchEvent(e);};
const q=globalThis.HeroVisualQuality;
assert.equal(q.selectView(0,0,4),'front');assert.equal(q.selectView(Math.PI,0,4),'back');
assert.equal(q.matrixReport({},4).missing.length,44);
const gait=q.createLocomotion({frames:9,stride:3});assert.equal(gait.advance(0),0);assert.equal(gait.advance(1),3);assert.equal(gait.advance(0),3);
assert(q.contactShadow(1).opacity<q.contactShadow(0).opacity);
assert(q.contactShadow(1).radius>q.contactShadow(0).radius);
const input=q.createInput({target,buttons:doc});
event('keydown','KeyW');assert(input.held('up'));assert(input.pressed('up'));input.endFrame();event('keydown','KeyW',true);assert(!input.pressed('up'));event('keyup','KeyW');assert(!input.held('up'));
event('keydown','ShiftLeft');target.dispatchEvent(new Event('blur'));assert(!input.held('run'));
doc.closest=()=>({dataset:{heroKey:'up'},setPointerCapture(){}});
const pointer=(type,id)=>{const e=new Event(type,{cancelable:true});Object.defineProperty(e,'pointerId',{value:id});doc.dispatchEvent(e);};
pointer('pointerdown',1);pointer('pointerdown',2);pointer('pointerup',1);assert(input.held('up'));pointer('pointercancel',2);assert(!input.held('up'));delete doc.closest;input.dispose();

function fixture({blocks=[],onGrab=()=>null,directions=4}={}){
 const anims={},proofs={},hash='a'.repeat(64);
 for(const a of REQUIRED_ACTIONS)for(const d of directions===8?EIGHT_DIRECTIONS:FOUR_DIRECTIONS){const k=a+'_'+d;anims[k]={sheet:'synthetic',frames:[[0,0,8,8,-4,-8],[8,0,8,8,-4,-8],[0,8,8,8,-4,-8]],fps:10,loop:['walk','run'].includes(a),source_sha256:hash};proofs[k]={hero_id:'UNIT_TEST_ONLY',sha256:hash};if(a==='attack'){anims[k].hitStart=.05;anims[k].hitEnd=.2;}}
 const actor=new HybridActor({THREE,meta:{id:'UNIT_TEST_ONLY',anims,identity:{hero_id:'UNIT_TEST_ONLY',approved:true,reference_sha256:hash,actions:proofs}},sheets:{synthetic:new THREE.Texture({width:16,height:16})},multiAngle:true});
 const camera=new THREE.PerspectiveCamera();let attacks=0,deaths=0;
 const controller=createDirectionalController({THREE,actor,camera,directions,blocks,touchRoot:doc,onAttack:()=>attacks++,onDeath:()=>deaths++,onGrab});
 return {actor,controller,get attacks(){return attacks;},get deaths(){return deaths;},tick(n=1){for(let i=0;i<n;i++)controller.update(.05);},close(){controller.dispose();actor.dispose();}};
}
let eight=fixture({directions:8});
for(let i=0;i<8;i++){eight.controller.cameraOrbit={yaw:i*Math.PI/4};eight.tick();assert.equal(eight.controller.state,'idle');assert.equal(eight.controller.facing,EIGHT_DIRECTIONS[i]);assert.equal(eight.actor.current,eight.actor.meta.anims['idle_'+EIGHT_DIRECTIONS[i]]);}
eight.close();
let f=fixture();event('keydown','KeyW');f.tick(30);assert(f.actor.root.position.z<0);assert.equal(f.controller.facing,'back');assert.equal(f.actor.current,f.actor.meta.anims.walk_back);event('keyup','KeyW');f.tick();assert.equal(f.controller.state,'idle');assert.equal(f.actor.index,0);
// Attack locks translation immediately on its first frame and hits only once.
event('keydown','KeyW');event('keydown','KeyJ');const z=f.actor.root.position.z;f.tick();assert.equal(f.actor.root.position.z,z);assert.equal(f.controller.state,'attack');assert(f.actor.getAttackAABB());f.tick(3);assert.equal(f.attacks,1);event('keyup','KeyW');event('keyup','KeyJ');f.tick(10);
event('keydown','Space');f.tick();assert(f.actor.root.position.y>0);event('keyup','Space');f.tick(30);assert.equal(f.actor.root.position.y,0);
f.controller.receiveDamage(20);assert.equal(f.controller.state,'hurt');assert.equal(f.controller.health,80);f.tick(10);f.controller.receiveDamage(100);assert.equal(f.controller.state,'death');assert.equal(f.deaths,1);assert.equal(f.controller.receiveDamage(1),false);f.tick(20);assert.equal(f.controller.state,'death');event('keydown','KeyR');f.tick();event('keyup','KeyR');assert.equal(f.controller.state,'idle');assert.equal(f.controller.health,100);f.close();
f=fixture({blocks:[new THREE.Box3(new THREE.Vector3(-10,-10,-10),new THREE.Vector3(10,10,10))]});event('keydown','KeyW');f.tick(10);assert.equal(f.actor.root.position.z,0);assert.equal(f.controller.state,'idle');event('keyup','KeyW');f.close();
let released=0;f=fixture({onGrab:()=>({target:{id:'SYNTHETIC_TARGET'},release:()=>released++})});event('keydown','KeyG');f.tick();assert.equal(f.controller.state,'grab');event('keyup','KeyG');f.tick();assert.equal(f.controller.state,'idle');assert.equal(released,1);f.close();
console.log('PASS: real Three.js transforms/AABB, camera-dependent clips, distance gait, immediate attack lock/single hit, jump, hurt/death/restart, blocked locomotion, grab/release, input/shadow helpers. Synthetic art only.');
