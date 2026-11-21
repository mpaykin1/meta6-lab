/** Hero Animator — actual Rapier 3D kinematic physics. Art is never recreated. */
export const RAPIER_PACKAGE = '@dimforge/rapier3d-compat';
export const RAPIER_VERSION = '0.21.0';

export async function loadRapier3D(importer = () => import('@dimforge/rapier3d-compat')) {
  let module;
  try { module = await importer(); }
  catch (e) { throw new Error('Rapier 3D is not installed in the GAME bundle. Bundle @dimforge/rapier3d-compat@0.21.0; never use CDN or a fake physics fallback.', {cause:e}); }
  const RAPIER = module.default ?? module;
  if (typeof RAPIER.init === 'function') await RAPIER.init();
  if (!RAPIER.World || !RAPIER.ColliderDesc || !RAPIER.RigidBodyDesc)
    throw new Error('Incompatible Rapier module: expected @dimforge/rapier3d-compat@0.21.0');
  return RAPIER;
}

const vec = v => ({x:v.x,y:v.y,z:v.z});
const finite = (v,n) => {if(!Number.isFinite(v))throw new Error(`${n} must be finite`);return v;};
const positive = (v,n) => {if(!(finite(v,n)>0))throw new Error(`${n} must be positive`);return v;};

/**
 * A real position-based kinematic capsule with collision sweeps, autostep, slope
 * and ground snapping. The THREE actor root is always foot-anchored; it is not
 * itself a Rapier collider. Returns foot position each simulation update.
 *
 * Supply a pre-loaded Rapier namespace and real static geometry; no invisible
 * arbitrary floor is silently created. Call addStaticBox for real world meshes.
 */
export function createRapierHeroPhysics({RAPIER,root,world,
  standHeight=1.72,crouchHeight=1.00,radius=.26,
  gravity=16,jumpSpeed=5.9,stepHeight=.26,
  maxSlopeAngle=Math.PI/4,snapDistance=.22,
  maxSubstep=1/60}={}) {
  if(!RAPIER?.World || !RAPIER?.ColliderDesc || !RAPIER?.RigidBodyDesc)throw new Error('Rapier must be initialized first');
  if(!root?.position)throw new Error('THREE root required for physics sync');
  for(const [v,n] of [[standHeight,'standHeight'],[crouchHeight,'crouchHeight'],[radius,'radius'],[gravity,'gravity'],[jumpSpeed,'jumpSpeed'],[maxSubstep,'maxSubstep']])positive(v,n);
  if(crouchHeight>=standHeight || crouchHeight<=2*radius || standHeight<=2*radius)throw new Error('Invalid capsule heights and radius');
  const ownsWorld=!world;
  world ??= new RAPIER.World({x:0,y:-gravity,z:0});
  const things=new Map(), ownedBodies=[];
  let height=standHeight, crouched=false, grounded=false, velocityY=0, disposed=false;
  const foot={x:finite(root.position.x,'x'),y:finite(root.position.y,'y'),z:finite(root.position.z,'z')};
  const playerBody=world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(foot.x,foot.y+height/2,foot.z));
  const capsule=h=>RAPIER.ColliderDesc.capsule(h/2-radius,radius).setFriction(0);
  let collider=world.createCollider(capsule(height),playerBody);
  const controller=world.createCharacterController(.012);
  controller.setUp({x:0,y:1,z:0});
  controller.setSlideEnabled(true);
  controller.setMaxSlopeClimbAngle(maxSlopeAngle);
  controller.setMinSlopeSlideAngle(Math.max(maxSlopeAngle,.80));
  controller.enableAutostep(stepHeight,.12,false);
  controller.enableSnapToGround(snapDistance);
  controller.setApplyImpulsesToDynamicBodies(false);

  const alive=()=>{if(disposed)throw new Error('Rapier physics already disposed')};
  const centerFor=(h,position=foot)=>({x:position.x,y:position.y+h/2,z:position.z});
  function canStand(){
    if(!crouched)return true;
    const rise=standHeight-crouchHeight, center={x:foot.x,y:foot.y+crouchHeight+rise/2,z:foot.z};
    const probe=new RAPIER.Cuboid(radius*.92,rise/2-.005,radius*.92);
    let blocked=false;
    world.intersectionsWithShape(center,{x:0,y:0,z:0,w:1},probe,(hit)=>{
      if(hit.handle !== collider.handle && !hit.isSensor()){blocked=true;return false;}return true;
    },undefined,undefined,collider,playerBody);
    return !blocked;
  }
  function shapeForCrouch(value){
    if(value===crouched)return crouched;
    if(!value&&!canStand())return true; // no standing through ceilings
    const nextH=value?crouchHeight:standHeight;
    world.removeCollider(collider,true);
    collider=world.createCollider(capsule(nextH),playerBody);
    playerBody.setTranslation(centerFor(nextH),true);
    height=nextH;crouched=value;
    return crouched;
  }
  function addStaticBox({center,size,tag='obstacle',data=null,sensor=false}={}){
    alive();if(!center||!size)throw new Error('Static box requires center and full size');
    const c=vec(center),s=vec(size);Object.values(c).forEach((v,i)=>finite(v,`center${i}`));Object.values(s).forEach((v,i)=>positive(v,`size${i}`));
    const body=world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(c.x,c.y,c.z));
    const desc=RAPIER.ColliderDesc.cuboid(s.x/2,s.y/2,s.z/2).setSensor(Boolean(sensor));
    const hit=world.createCollider(desc,body);
    ownedBodies.push(body);
    things.set(hit.handle,{tag,data,collider:hit,body});
    return hit;
  }
  function addStaticTrimesh({vertices,indices,position={x:0,y:0,z:0},tag='terrain',data=null}={}){
    alive();if(!vertices||!indices || vertices.length<9 || indices.length<3)throw new Error('Trimesh needs vertex and index buffers');
    const body=world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(position.x,position.y,position.z));
    const hit=world.createCollider(RAPIER.ColliderDesc.trimesh(vertices,indices),body);
    ownedBodies.push(body);things.set(hit.handle,{tag,data,collider:hit,body});return hit;
  }
  function overlapsBox({center,size,includeTags=['enemy','interactable']}={}){
    alive();if(!center||!size)throw new Error('query box requires center and full size');
    const shape=new RAPIER.Cuboid(size.x/2,size.y/2,size.z/2), found=[];
    world.intersectionsWithShape(center,{x:0,y:0,z:0,w:1},shape,hit=>{
      const obj=things.get(hit.handle);
      if(obj&&includeTags.includes(obj.tag))found.push(obj);
      return true;
    },undefined,undefined,collider,playerBody);
    return found;
  }
  function move({x=0,z=0,dt,jump=false,crouch=false}={}){
    alive();finite(x,'motion x');finite(z,'motion z');positive(dt,'dt');
    if(dt>.1)throw new Error('Physics dt too large; clamp frame delta first');
    shapeForCrouch(Boolean(crouch));
    if(jump && grounded && !crouched){velocityY=jumpSpeed;grounded=false;}
    const steps=Math.max(1,Math.ceil(dt/maxSubstep)),stepDt=dt/steps;
    let contacts=0, displacement={x:0,y:0,z:0};
    for(let i=0;i<steps;i++){
      velocityY-=gravity*stepDt;
      const before=playerBody.translation();
      // KCC performs sweep/slide against actual 3D geometry, not old AABB blocks.
      controller.computeColliderMovement(collider,{x:x/steps,y:velocityY*stepDt,z:z/steps});
      const corrected=controller.computedMovement();
      const onGround=controller.computedGrounded();
      contacts+=controller.numComputedCollisions();
      playerBody.setNextKinematicTranslation({x:before.x+corrected.x,y:before.y+corrected.y,z:before.z+corrected.z});
      world.timestep=stepDt;
      world.step();
      const after=playerBody.translation();
      displacement.x+=after.x-before.x;displacement.y+=after.y-before.y;displacement.z+=after.z-before.z;
      grounded=onGround && velocityY<=0;
      if(grounded)velocityY=0;
      else if(velocityY>0 && corrected.y<velocityY*stepDt-1e-3)velocityY=0; // ceiling impact
    }
    const p=playerBody.translation();foot.x=p.x;foot.y=p.y-height/2;foot.z=p.z;
    root.position.set(foot.x,foot.y,foot.z);
    return {position:{...foot},grounded,crouched,velocityY,contacts,displacement};
  }
  function teleport(position){
    alive();for(const axis of ['x','y','z'])finite(position[axis],axis);
    foot.x=position.x;foot.y=position.y;foot.z=position.z;
    velocityY=0;grounded=false;
    playerBody.setTranslation(centerFor(height),true);
    playerBody.setNextKinematicTranslation(centerFor(height));
    root.position.set(foot.x,foot.y,foot.z);
    return {...foot};
  }
  function dispose(){if(disposed)return;disposed=true;
    try{world.removeRigidBody(playerBody);}catch{}
    for(const b of ownedBodies)try{world.removeRigidBody(b);}catch{}
    things.clear();controller.free();if(ownsWorld)world.free();
  }
  return {world,playerBody,addStaticBox,addStaticTrimesh,overlapsBox,move,teleport,dispose,
    get collider(){return collider;},get grounded(){return grounded;},get crouched(){return crouched;},get position(){return {...foot};},
    get velocityY(){return velocityY;},get colliderHeight(){return height;}};
}
