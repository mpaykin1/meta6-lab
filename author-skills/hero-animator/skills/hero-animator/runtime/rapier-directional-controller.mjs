/**
 * Hero Animator — input-only 4/8-way animated hero driven by actual Rapier 3D.
 * Reuses the EXISTING illustrated HybridActor, identity validation and atlas.
 * Supersedes only the kinematic AABB/floorAt section in directional-controller.
 */
import {validateDirectionalHero, REQUIRED_ACTIONS, FOUR_DIRECTIONS, EIGHT_DIRECTIONS} from './directional-controller.mjs';

const PI=Math.PI,TAU=PI*2;
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const MAP=Object.freeze({
 forward:['KeyW','ArrowUp'],backward:['KeyS','ArrowDown'],left:['KeyA','ArrowLeft'],right:['KeyD','ArrowRight'],
 sprint:['ShiftLeft','ShiftRight'],jump:['Space'],crouch:['KeyC','ControlLeft','ControlRight'],
 dodge:['KeyQ'],roll:['KeyF'],attack:['KeyJ'],grab:['KeyG'],interact:['KeyE'],restart:['KeyR']
});
const CODES=new Set(Object.values(MAP).flat());

export function createRapierDirectionalController({
 THREE, actor, camera, canvas, physics, directions=8, requiredActions=REQUIRED_ACTIONS,
 walkSpeed=2.7,runSpeed=4.8,dodgeSpeed=6,rollSpeed=5.5,
 cameraDistance=6.5,cameraHeight=2.6,cameraTargetHeight=1.25,
 onAttack=()=>{},onInteract=()=>{},onRestart=()=>{},onGrab=()=>null,onDeath=()=>{},
 maxHealth=100,walkStride=1.5,runStride=2.1,touchRoot=globalThis.document
}={}){
 if(!THREE?.Vector3||!actor?.root||typeof actor?.setAction!=='function'||typeof actor?.update!=='function'||!camera)
   throw new Error('THREE, approved HybridActor and camera are required');
 if(!physics?.move || !physics?.teleport || !physics?.overlapsBox)throw new Error('Real Rapier physics adapter required; no AABB fallback');
 const verified=validateDirectionalHero(actor.meta,{directions,requiredActions});
 if(!verified.actions.includes('idle'))throw new Error('Approved idle action required');
 if(!(maxHealth>0&&walkStride>0&&runStride>0))throw new Error('Invalid character config');
 const dirs=verified.directions;
 actor.billboard=true; actor.multiAngle=true;
 actor._resolve=(name,dir=actor._lastFacing)=>actor.meta.anims[`${name}_${dir}`]??null;
 const spawn=actor.root.position.clone(), keys=new Set(),just=new Set(),touch=new Map();
 let disposed=false,mode='idle',face='front',yaw=actor.root.rotation.y||0;
 let orbit=0,pitch=.28,zoom=cameraDistance,lockTime=0,health=maxHealth,hitOnce=false;
 let activePointer=null,lastPointerX=0,lastPointerY=0,grabbed=null,lastGroundY=actor.root.position.y;
 const releaseGrab=()=>{if(grabbed){const g=grabbed;grabbed=null;g.release();}};
 const held=name=>MAP[name].some(c=>keys.has(c)||[...touch.values()].includes(c));
 const tapped=name=>MAP[name].some(c=>just.has(c));
 const clearInputs=()=>{keys.clear();just.clear();touch.clear();releaseGrab();};
 const onKeyDown=e=>{
   if(disposed||!CODES.has(e.code)||e.target?.matches?.('input,textarea,select,[contenteditable]'))return;
   e.preventDefault();if(!keys.has(e.code)&&![...touch.values()].includes(e.code))just.add(e.code);keys.add(e.code);
 };
 const onKeyUp=e=>{if(CODES.has(e.code)){e.preventDefault();keys.delete(e.code);}};
 const onTouchDown=e=>{
   const b=e.target?.closest?.('[data-hero-key]');const code=MAP[b?.getAttribute('data-hero-key')]?.[0];
   if(!code)return;e.preventDefault();if(!keys.has(code)&&![...touch.values()].includes(code))just.add(code);
   touch.set(e.pointerId,code);b.setPointerCapture?.(e.pointerId);
 };
 const onTouchUp=e=>{touch.delete(e.pointerId);};
 const onPointerDown=e=>{if(e.target?.closest?.('[data-hero-key]'))return;
   if(e.pointerType==='mouse' && e.button!==0 && e.button!==2)return;
   activePointer=e.pointerId;lastPointerX=e.clientX;lastPointerY=e.clientY;
 };
 const onPointerMove=e=>{if(e.pointerId!==activePointer)return;
   orbit-=(e.clientX-lastPointerX)*.007;
   pitch=clamp(pitch+(e.clientY-lastPointerY)*.004,-.12,.7);
   lastPointerX=e.clientX;lastPointerY=e.clientY;
 };
 const onPointerEnd=e=>{if(e.pointerId===activePointer)activePointer=null;};
 const onWheel=e=>{if(e.cancelable)e.preventDefault();zoom=clamp(zoom+e.deltaY*.005,3,12);};
 const onContext=e=>e.preventDefault();
 const onVisibility=()=>{if(globalThis.document?.hidden)clearInputs();};
 const target=globalThis.window??globalThis;
 target.addEventListener?.('keydown',onKeyDown);target.addEventListener?.('keyup',onKeyUp);
 target.addEventListener?.('blur',clearInputs);globalThis.document?.addEventListener?.('visibilitychange',onVisibility);
 touchRoot?.addEventListener?.('pointerdown',onTouchDown);
 for(const e of ['pointerup','pointercancel','lostpointercapture'])touchRoot?.addEventListener?.(e,onTouchUp);
 canvas?.addEventListener?.('pointerdown',onPointerDown);canvas?.addEventListener?.('pointermove',onPointerMove);
 canvas?.addEventListener?.('pointerup',onPointerEnd);canvas?.addEventListener?.('pointercancel',onPointerEnd);
 canvas?.addEventListener?.('wheel',onWheel,{passive:false});canvas?.addEventListener?.('contextmenu',onContext);
 const camP=new THREE.Vector3(),here=new THREE.Vector3(),front=new THREE.Vector3(),side=new THREE.Vector3();
 function facing(){
   actor.root.updateWorldMatrix(true,false);
   camera.getWorldPosition(camP);actor.root.getWorldPosition(here);
   const forward=new THREE.Vector3(0,0,1).applyQuaternion(actor.root.getWorldQuaternion(new THREE.Quaternion()));
   const reference=Math.atan2(forward.x,forward.z);
   const angle=wrap(Math.atan2(camP.x-here.x,camP.z-here.z)-reference);
   const n=dirs.length;
   let index=((Math.round(angle/TAU*n)%n)+n)%n;
   const prev=dirs.indexOf(face);
   if(prev>=0){const prevAngle=(prev<=n/2?prev:prev-n)*TAU/n;
     if(Math.abs(wrap(angle-prevAngle))<PI/n+.085)index=prev;}
   return dirs[index];
 }
 actor._angleToFacing=()=>facing();actor._lastFacing=face;
 actor.setAction('idle');
 const duration=action=>{const clip=actor.meta.anims[`${action}_${face}`];return clip?.frames?.length/Math.max(1,Number(clip.fps)||12) || .4;};
 function setState(next){
   if(!verified.actions.includes(next))throw new Error('Missing approved action: '+next);
   if(mode===next)return;
   mode=next;hitOnce=false;actor._lastFacing=face;actor.setAction(next);
 }
 const isLocked=()=>['attack','dodge','roll','grab','hurt','death'].includes(mode);
 function positionCamera(){
   const p=actor.root.position;
   camera.position.set(p.x+Math.sin(orbit)*zoom*Math.cos(pitch),p.y+cameraHeight+Math.sin(pitch)*zoom*.5,p.z+Math.cos(orbit)*zoom*Math.cos(pitch));
   camera.lookAt(p.x,p.y+cameraTargetHeight,p.z);camera.updateMatrixWorld?.();
 }
 function syncArtFace(){
   face=facing();actor._lastFacing=face;
   const next=actor.meta.anims[`${mode}_${face}`];
   if(!next)throw new Error('Missing approved view '+mode+'_'+face);
   if(actor.current!==next){
     const previous=actor.current;
     if(previous?.frames?.length)actor.elapsed=(actor.elapsed||0)*Math.max(1,Number(previous.fps)||12)/previous.frames.length *next.frames.length/Math.max(1,Number(next.fps)||12);
     actor.current=next;actor.index=-1;
   }
 }
 function update(delta){
   if(disposed)return;
   const dt=clamp(Number(delta)||0,0,.05);if(!dt)return;
   positionCamera();face=facing();actor._lastFacing=face;
   let mx=Number(held('right'))-Number(held('left'));
   let mz=Number(held('forward'))-Number(held('backward'));
   const currentlyGrounded=physics.grounded;
   const crouchRequested=held('crouch')&&currentlyGrounded;
   if(crouchRequested){mx=0;mz=0;}
   const moving=mx!==0||mz!==0;
   const sprint=held('sprint')&&moving&&!crouchRequested;
   let jump=false,dx=0,dz=0;
   if(!isLocked()){
     if(tapped('roll')&&currentlyGrounded){lockTime=duration('roll');setState('roll');}
     else if(tapped('dodge')&&currentlyGrounded){lockTime=duration('dodge');setState('dodge');}
     else if(tapped('attack')&&currentlyGrounded){lockTime=duration('attack');setState('attack');}
     else if(tapped('grab')&&currentlyGrounded&&verified.actions.includes('grab')){
       const res=onGrab({actor,physics});
       if(res?.target && typeof res.release==='function'){grabbed=res;setState('grab');}
     }else if(tapped('jump')&&currentlyGrounded&&!crouchRequested){jump=true;setState('jump');}
   }
   if(mode==='grab'&&!held('grab')){releaseGrab();setState('idle');}
   if(tapped('interact')&&mode!=='death')onInteract({actor,physics});
   if(tapped('restart')){releaseGrab();health=maxHealth;lockTime=0;physics.teleport(spawn);
     setState('idle');onRestart({actor,physics});just.clear();positionCamera();syncArtFace();actor.update(0,camera);
     return {state:mode,facing:face,grounded:physics.grounded,position:actor.root.position};}
   if(mode==='roll'||mode==='dodge'){
     const heading=mode==='roll'?yaw:yaw+(mode==='dodge'?PI/2:0);
     const speed=mode==='roll'?rollSpeed:dodgeSpeed;
     dx=Math.sin(heading)*speed*dt;dz=Math.cos(heading)*speed*dt;
   }else if(!isLocked()&&moving){
     front.set(-Math.sin(orbit),0,-Math.cos(orbit));side.set(-front.z,0,front.x);
     here.copy(front).multiplyScalar(mz).addScaledVector(side,mx).normalize();
     const speed=sprint?runSpeed:walkSpeed;
     dx=here.x*speed*dt;dz=here.z*speed*dt;
     yaw=Math.atan2(here.x,here.z);
   }
   if(moving&&!isLocked()&&currentlyGrounded&&!crouchRequested)
     actor.root.rotation.y+=wrap(yaw-actor.root.rotation.y)*(1-Math.exp(-12*dt));
   const movement=physics.move({x:dx,z:dz,dt,jump,crouch:crouchRequested});
   if(physics.grounded)lastGroundY=actor.root.position.y;
   actor.setGroundHeight?.(lastGroundY);
   if(mode==='attack'||mode==='roll'||mode==='dodge'||mode==='hurt'){
     lockTime-=dt;if(lockTime<=0)setState('idle');
   }
   if(!isLocked()){
     if(!physics.grounded)setState('jump');
     else if(movement.crouched)setState('crouch');
     else if(Math.hypot(movement.displacement.x,movement.displacement.z)>.00001)setState(sprint?'run':'walk');
     else setState('idle');
   }
   if(actor.bodyCollider){actor.bodyCollider.scale.y=physics.colliderHeight/actor.bodyConfig.height;
     actor.bodyCollider.position.y=physics.colliderHeight/2;}
   positionCamera();syncArtFace();
   if(mode==='idle'){actor.elapsed=0;actor.update(0,camera);}
   else if(mode==='walk'||mode==='run'){
     const a=actor.meta.anims[`${mode}_${face}`],distance=Math.hypot(movement.displacement.x,movement.displacement.z);
     actor.elapsed=(actor.elapsed||0)+distance/(mode==='run'?runStride:walkStride)*a.frames.length/Math.max(1,Number(a.fps)||12);
     actor.update(0,camera);
   }else actor.update(dt,camera);
   if(mode==='attack'&&actor.hitActive&&!hitOnce){
     const hitbox=actor.getAttackAABB();const c=hitbox.getCenter(new THREE.Vector3()),s=hitbox.getSize(new THREE.Vector3());
     const targets=physics.overlapsBox({center:c,size:s,includeTags:['enemy']});
     onAttack({actor,physics,hitbox,targets});hitOnce=true;
   }
   just.clear();
   return {state:mode,facing:face,grounded:physics.grounded,position:actor.root.position,contacts:movement.contacts};
 }
 const api={update,clearInputs,
   get state(){return mode;},get facing(){return face;},get hero_id(){return verified.hero_id;},
   get health(){return health;},get physics(){return physics;},
   receiveDamage(amount){if(!(Number.isFinite(amount)&&amount>0))throw new Error('Damage must be positive finite');
     if(health<=0)return false;
     if(!verified.actions.includes('hurt')||!verified.actions.includes('death'))throw new Error('Approved hurt/death clips required');
     releaseGrab();health=Math.max(0,health-amount);
     if(health===0){setState('death');onDeath({actor,physics});}else{lockTime=duration('hurt');setState('hurt');}
     return true;
   },
   get cameraOrbit(){return {yaw:orbit,pitch,zoom};},
   set cameraOrbit(v){if(Number.isFinite(v?.yaw))orbit=v.yaw;if(Number.isFinite(v?.pitch))pitch=clamp(v.pitch,-.12,.7);if(Number.isFinite(v?.zoom))zoom=clamp(v.zoom,3,12);},
   dispose({disposePhysics=false}={}){if(disposed)return;disposed=true;clearInputs();
     target.removeEventListener?.('keydown',onKeyDown);target.removeEventListener?.('keyup',onKeyUp);target.removeEventListener?.('blur',clearInputs);
     globalThis.document?.removeEventListener?.('visibilitychange',onVisibility);
     touchRoot?.removeEventListener?.('pointerdown',onTouchDown);
     for(const e of ['pointerup','pointercancel','lostpointercapture'])touchRoot?.removeEventListener?.(e,onTouchUp);
     canvas?.removeEventListener?.('pointerdown',onPointerDown);canvas?.removeEventListener?.('pointermove',onPointerMove);
     canvas?.removeEventListener?.('pointerup',onPointerEnd);canvas?.removeEventListener?.('pointercancel',onPointerEnd);
     canvas?.removeEventListener?.('wheel',onWheel);canvas?.removeEventListener?.('contextmenu',onContext);
     if(disposePhysics)physics.dispose();
   }};
 return api;
}
