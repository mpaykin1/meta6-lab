/**
 * Hero Animator — camera-relative 3D locomotion + authored 4/8-way sprite atlas.
 * Intentional: geometry and collision are 3D; the visual hero is never procedurally redrawn.
 * Use with loadHybridActor from hero-hybrid.mjs, with billboard:true, multiAngle:true.
 * Does NOT generate missing front/back/diagonal views or substitute unrelated art.
 */
export const FOUR_DIRECTIONS=Object.freeze(['front','right','back','left']);
export const EIGHT_DIRECTIONS=Object.freeze([
  'front','front_right','right','back_right','back','back_left','left','front_left'
]);
export const LEGACY_ACTIONS=Object.freeze(['idle','walk','run','jump','crouch','dodge','roll','attack']);
export const REQUIRED_ACTIONS=Object.freeze([...LEGACY_ACTIONS,'grab','hurt','death']);
const MAP=Object.freeze({
  forward:['KeyW','ArrowUp'], backward:['KeyS','ArrowDown'],
  left:['KeyA','ArrowLeft'],right:['KeyD','ArrowRight'],
  sprint:['ShiftLeft','ShiftRight'], jump:['Space'],
  crouch:['KeyC','ControlLeft','ControlRight'],
  dodge:['KeyQ'], roll:['KeyF'],attack:['KeyJ'],
  interact:['KeyE'],restart:['KeyR'],grab:['KeyG']
});
const CODES=new Set(Object.values(MAP).flat());
const P=Math.PI, TAU=P*2;
const wrap=(r)=>Math.atan2(Math.sin(r),Math.cos(r));
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const isHex=x=>typeof x==='string' && /^[0-9a-f]{64}$/i.test(x);

/** Fail closed at build/launch time. One immutable identity for every camera view and action. */
export function validateDirectionalHero(meta,{directions=8,requiredActions=REQUIRED_ACTIONS}={}){
  const dirs=directions===8?EIGHT_DIRECTIONS:directions===4?FOUR_DIRECTIONS:null;
  if(!dirs)throw Error('directional art must be 4-way or 8-way');
  const identity=meta?.identity;
  if(!identity || identity.approved!==true || !identity.hero_id || !isHex(identity.reference_sha256))
    throw Error('Character Identity Lock: missing approved hero_id/reference_sha256');
  const missing=[],wrong=[];
  for(const action of requiredActions){
    for(const dir of dirs){
      const name=`${action}_${dir}`,a=meta.anims?.[name],proof=identity.actions?.[name];
      if(!a||!a.sheet||!Array.isArray(a.frames)||a.frames.length===0){missing.push(name);continue;}
      if(!proof || proof.hero_id!==identity.hero_id || !isHex(proof.sha256) ||
         !isHex(a.source_sha256) || proof.sha256.toLowerCase()!==a.source_sha256.toLowerCase())wrong.push(name);
    }
  }
  if(missing.length || wrong.length){
    const parts=[];
    if(missing.length)parts.push('missing original illustrated clips: '+missing.join(', '));
    if(wrong.length)parts.push('unapproved/mismatched hero art: '+wrong.join(', '));
    throw Error('Directional Character Identity Lock: '+parts.join(' | '));
  }
  return {hero_id:identity.hero_id,directions:dirs,actions:requiredActions};
}

/**
 * Inputs come only from real key/touch events. Background VFX may animate independently.
 * Global directions use actor forward = +Z, and camera orbit angles are in world XZ.
 */
export function createDirectionalController({
  THREE,actor,camera,canvas,
  directions=8, requiredActions=REQUIRED_ACTIONS,
  walkSpeed=2.7, runSpeed=4.8, jumpSpeed=5.9, gravity=16,
  dodgeSpeed=6, rollSpeed=5.5,
  floorAt=()=>0, blocks=[],
  cameraDistance=6.5, cameraHeight=2.6, cameraTargetHeight=1.25,
  onAttack=()=>{},onInteract=()=>{},onRestart=()=>{},onGrab=()=>null,onDeath=()=>{},
  maxHealth=100,walkStride=1.5,runStride=2.1,
  touchRoot=globalThis.document
}={}){
  if(!THREE||!actor||!camera)throw Error('THREE, actor and camera are required');
  if(!actor.root||typeof actor.setAction!=='function'||typeof actor.update!=='function')
    throw Error('loadHybridActor actor required');
  const verified=validateDirectionalHero(actor.meta,{directions,requiredActions});
  if(!verified.actions.includes('idle'))throw Error('idle action required');
  const dirs=verified.directions;
  actor.billboard=true;actor.multiAngle=true;
  actor._resolve=(name,dir=actor._lastFacing)=>actor.meta.anims[`${name}_${dir}`]??null; // NEVER fallback to other view.
  const own=new Set(),just=new Set(),touch=new Map();
  let disposed=false,grounded=true,verticalSpeed=0,mode='idle',lockTime=0;
  let stateAge=0,face='front',yaw=0,orbit=0,pitch=0.28,zoom=cameraDistance;
  let hitOnce=false,dodgeHeading=0;
  if(!(maxHealth>0)||!Number.isFinite(maxHealth)||!(walkStride>0)||!(runStride>0))throw Error('health and strides must be positive finite values');
  let health=maxHealth,grabbed=null;
  const spawn=actor.root.position.clone();
  const releaseGrab=()=>{if(grabbed){const old=grabbed;grabbed=null;old.release();}};
  let activePointer=null,dragX=0,dragY=0;
  const tmp=new THREE.Vector3(),stepVec=new THREE.Vector3(),camForward=new THREE.Vector3(),camRight=new THREE.Vector3();
  let currentFloor=Number(floorAt(actor.root.position.x,actor.root.position.z))||0;
  actor.root.position.y=Math.max(actor.root.position.y,currentFloor);
  const duration=(name)=>{
    const a=actor.meta.anims[`${name}_${face}`];
    if(!a)return .4;
    return a.frames.length/Math.max(1,Number(a.fps)||12);
  };
  const held=(k)=>MAP[k].some(c=>own.has(c)||[...touch.values()].includes(c));
  const press=(code)=>{if(!CODES.has(code))return;
    if(!own.has(code)&&![...touch.values()].includes(code))just.add(code);
    own.add(code);
  };
  const released=code=>own.delete(code);
  const tap=(k)=>MAP[k].some(c=>just.has(c));
  const stopInputs=()=>{own.clear();just.clear();touch.clear();releaseGrab();};
  function keydown(e){if(disposed||!CODES.has(e.code))return;
    if(e.target?.matches?.('input,textarea,select,[contenteditable]'))return;
    e.preventDefault();press(e.code);
  }
  function keyup(e){if(CODES.has(e.code)){e.preventDefault();released(e.code);}}
  function buttonDown(e){const b=e.target.closest?.('[data-hero-key]');if(!b)return;
    const name=b.getAttribute('data-hero-key');const code=MAP[name]?.[0];if(!code)return;
    e.preventDefault();if(!held(name))just.add(code);
    touch.set(e.pointerId,code);b.setPointerCapture?.(e.pointerId);
  }
  function buttonUp(e){if(touch.has(e.pointerId))touch.delete(e.pointerId);}
  function orbitStart(e){if(e.target.closest?.('[data-hero-key]'))return;
    if(e.pointerType==='mouse' && e.button!==2 && e.button!==0)return;
    activePointer=e.pointerId;dragX=e.clientX;dragY=e.clientY;
  }
  function orbitMove(e){if(e.pointerId!==activePointer)return;
    orbit-= (e.clientX-dragX)*.007;
    pitch=clamp(pitch+(e.clientY-dragY)*.004,-.12,.70);
    dragX=e.clientX;dragY=e.clientY;
  }
  function orbitEnd(e){if(e.pointerId===activePointer)activePointer=null;}
  function wheel(e){if(e.cancelable)e.preventDefault();zoom=clamp(zoom+e.deltaY*.005,3,12);}
  const target=globalThis.window||globalThis;
  target.addEventListener?.('keydown',keydown);target.addEventListener?.('keyup',keyup);
  target.addEventListener?.('blur',stopInputs);
  const visibility=()=>{if(globalThis.document?.hidden)stopInputs();};
  globalThis.document?.addEventListener?.('visibilitychange',visibility);
  touchRoot?.addEventListener?.('pointerdown',buttonDown);
  for(const event of ['pointerup','pointercancel','lostpointercapture'])touchRoot?.addEventListener?.(event,buttonUp);
  canvas?.addEventListener?.('pointerdown',orbitStart);
  canvas?.addEventListener?.('pointermove',orbitMove);
  canvas?.addEventListener?.('pointerup',orbitEnd);
  canvas?.addEventListener?.('pointercancel',orbitEnd);
  canvas?.addEventListener?.('wheel',wheel,{passive:false});
  canvas?.addEventListener?.('contextmenu',e=>e.preventDefault());
  const worldFace=()=>{
    // A facing side is selected from the actor-to-camera direction, NOT from a static sprite flip.
    actor.root.updateWorldMatrix(true,false);
    const q=actor.root.getWorldQuaternion(new THREE.Quaternion());
    const fwd=new THREE.Vector3(0,0,1).applyQuaternion(q);
    const base=Math.atan2(fwd.x,fwd.z);
    camera.getWorldPosition(tmp);
    const v=tmp.clone().sub(actor.root.getWorldPosition(new THREE.Vector3()));
    const rel=wrap(Math.atan2(v.x,v.z)-base);
    const sectors=dirs.length;
    const hysteresis=.085;
    let idx=((Math.round(rel/TAU*sectors)%sectors)+sectors)%sectors;
    const previous=dirs.indexOf(face);
    if(previous>=0){
      const prevA=(previous<=sectors/2?previous:previous-sectors)*TAU/sectors;
      if(Math.abs(wrap(rel-prevA))<P/sectors+hysteresis)idx=previous;
    }
    // Indices are ordered clockwise starting with the viewed front of the hero.
    return dirs[idx];
  };
  actor._angleToFacing=()=>worldFace();
  actor._lastFacing=face;actor.setAction('idle');
  const setState=(next)=>{
    if(!verified.actions.includes(next))throw Error(`Missing approved action: ${next}`);
    if(mode===next)return;
    mode=next;stateAge=0;hitOnce=false;
    actor._lastFacing=face;
    actor.setAction(next);
  };
  function update(dt){
    if(disposed)return;
    dt=clamp(Number(dt)||0,0,.05);if(!dt)return;
    // Position camera before selecting directional frames.
    const pos=actor.root.position;
    camera.position.set(pos.x+Math.sin(orbit)*zoom*Math.cos(pitch),pos.y+cameraHeight+Math.sin(pitch)*zoom*.5,pos.z+Math.cos(orbit)*zoom*Math.cos(pitch));
    camera.lookAt(pos.x,pos.y+cameraTargetHeight,pos.z);
    camera.updateMatrixWorld?.();
    face=worldFace();actor._lastFacing=face;
    let mx=Number(held('right'))-Number(held('left'));
    let mz=Number(held('forward'))-Number(held('backward'));
    const crouched=held('crouch')&&grounded;
    const sprint=held('sprint') && (mx!==0||mz!==0);
    if(crouched){mx=0;mz=0;}
    const moving=mx!==0||mz!==0;
    const locked=()=>['attack','dodge','roll','grab','hurt','death'].includes(mode);
    const shouldBeLocked=locked();
    if(!shouldBeLocked){
      if(tap('roll')&&grounded){yaw=actor.root.rotation.y;lockTime=duration('roll');setState('roll');}
      else if(tap('dodge')&&grounded){dodgeHeading=actor.root.rotation.y+(held('left')?-P/2:P/2);lockTime=duration('dodge');setState('dodge');}
      else if(tap('attack')&&grounded){lockTime=duration('attack');setState('attack');}
      else if(tap('grab')&&grounded&&verified.actions.includes('grab')){
        const result=onGrab({actor});
        // The game must select a real in-range target, test occlusion, and provide release.
        if(result?.target&&typeof result.release==='function'){grabbed=result;setState('grab');}
      }
      else if(tap('jump')&&grounded&&!crouched){verticalSpeed=jumpSpeed;grounded=false;setState('jump');}
    }
    if(mode==='grab'&&!held('grab')){releaseGrab();setState('idle');}
    if(tap('interact')&&mode!=='death')onInteract({actor});
    if(tap('restart')){releaseGrab();health=maxHealth;verticalSpeed=0;grounded=true;
      actor.root.position.copy(spawn);setState('idle');onRestart({actor});just.clear();}
    let dx=0,dz=0;
    if(locked()){
      if(mode==='roll'||mode==='dodge'){
        const sp=mode==='roll'?rollSpeed:dodgeSpeed;
        // Root displacement along already established heading; GIF pose never drives physics.
        const heading=mode==='dodge'?dodgeHeading:yaw;
        dx=Math.sin(heading)*sp*dt;dz=Math.cos(heading)*sp*dt;
      }
    }else if(moving){
      camForward.set(-Math.sin(orbit),0,-Math.cos(orbit));
      camRight.set(-camForward.z,0,camForward.x);
      stepVec.copy(camForward).multiplyScalar(mz).addScaledVector(camRight,mx).normalize();
      dx=stepVec.x*(sprint?runSpeed:walkSpeed)*dt;
      dz=stepVec.z*(sprint?runSpeed:walkSpeed)*dt;
      yaw=Math.atan2(stepVec.x,stepVec.z);
    }
    if(moving && !locked() && grounded && !crouched){
      const targetYaw=yaw;
      actor.root.rotation.y+=wrap(targetYaw-actor.root.rotation.y)*(1-Math.exp(-12*dt));
    }
    // Conservative AABB blocker slide; collisions use 3D body, never painting pixels.
    const oldX=pos.x,oldZ=pos.z;
    function hits(){
      const bb=actor.getBodyAABB();
      return blocks.some(b=>bb.intersectsBox(b));
    }
    if(dx){pos.x+=dx;if(hits())pos.x=oldX;}
    if(dz){pos.z+=dz;if(hits())pos.z=oldZ;}
    currentFloor=Number(floorAt(pos.x,pos.z))||0;
    actor.setGroundHeight?.(currentFloor);
    if(!grounded){verticalSpeed-=gravity*dt;pos.y+=verticalSpeed*dt;
      if(pos.y<=currentFloor){pos.y=currentFloor;verticalSpeed=0;grounded=true;}}
    else pos.y=currentFloor;
    if(mode==='attack'||mode==='dodge'||mode==='roll'||mode==='hurt'){
      lockTime-=dt;
      if(lockTime<=0)setState('idle');
    }
    if(!locked()){
      if(!grounded)setState('jump');
      else if(crouched)setState('crouch');
      else if(Math.hypot(pos.x-oldX,pos.z-oldZ)>.00001)setState(sprint?'run':'walk');
      else setState('idle');
    }
    actor.bodyCollider.scale.y=mode==='crouch'?.57:1;
    actor.bodyCollider.position.y=actor.bodyConfig.height*actor.bodyCollider.scale.y*.5;
    // Avatar sprite is always camera-facing but the frame is view-dependent.
    // Recompute view after root rotation, and advance locomotion by actual collision-limited distance.
    face=worldFace();actor._lastFacing=face;
    const displayed=actor.meta.anims[`${mode}_${face}`];
    if(actor.current!==displayed){
      const previous=actor.current;
      if(previous?.frames?.length)actor.elapsed=actor.elapsed*Math.max(1,Number(previous.fps)||12)/previous.frames.length*displayed.frames.length/Math.max(1,Number(displayed.fps)||12);
      actor.current=displayed;actor.index=-1;
    }
    if(mode==='walk'||mode==='run'){
      const clip=actor.meta.anims[`${mode}_${face}`];
      actor.elapsed+=Math.hypot(pos.x-oldX,pos.z-oldZ)/(mode==='run'?runStride:walkStride)*clip.frames.length/Math.max(1,Number(clip.fps)||12);
      actor.update(0,camera);
    }else if(mode==='idle'){actor.elapsed=0;actor.update(0,camera);}
    else actor.update(dt,camera);
    if(mode==='attack' && actor.hitActive && !hitOnce){onAttack({actor,hitbox:actor.getAttackAABB()});hitOnce=true;}
    stateAge+=dt;just.clear();
    return {state:mode,facing:face,grounded,position:actor.root.position};
  }
  const api={update,clearInputs:stopInputs,get state(){return mode;},get facing(){return face;},get hero_id(){return verified.hero_id;},get health(){return health;},
    receiveDamage(amount){
      if(!Number.isFinite(amount)||amount<=0)throw Error('damage must be positive finite');
      if(health<=0)return false;
      if(!verified.actions.includes('hurt')||!verified.actions.includes('death'))throw Error('approved hurt/death clips required');
      releaseGrab();health=Math.max(0,health-amount);
      if(health===0){setState('death');onDeath({actor});}else{lockTime=duration('hurt');setState('hurt');}
      return true;
    },
    get cameraOrbit(){return {yaw:orbit,pitch,zoom};},
    set cameraOrbit(v){if(Number.isFinite(v?.yaw))orbit=v.yaw;if(Number.isFinite(v?.pitch))pitch=clamp(v.pitch,-.12,.70);if(Number.isFinite(v?.zoom))zoom=clamp(v.zoom,3,12);},
    dispose(){disposed=true;stopInputs();target.removeEventListener?.('keydown',keydown);target.removeEventListener?.('keyup',keyup);
      target.removeEventListener?.('blur',stopInputs);globalThis.document?.removeEventListener?.('visibilitychange',visibility);
      touchRoot?.removeEventListener?.('pointerdown',buttonDown);
      for(const event of ['pointerup','pointercancel','lostpointercapture'])touchRoot?.removeEventListener?.(event,buttonUp);
      canvas?.removeEventListener?.('pointerdown',orbitStart);canvas?.removeEventListener?.('pointermove',orbitMove);
      canvas?.removeEventListener?.('pointerup',orbitEnd);canvas?.removeEventListener?.('pointercancel',orbitEnd);canvas?.removeEventListener?.('wheel',wheel);
    }};
  return api;
}

