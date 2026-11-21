/**
 * Voxel Atmosphere Engine physics bridge: Rapier 0.21.x (Apache-2.0).
 * Our original adapter; source engine stays an optional external dependency.
 * Dynamic crates, capsule character, and collider boxes from authored GLB.
 * Never substitutes meshes, keyframes, materials, or character identity.
 */
const SOURCES = [
  new URL('./vendor/rapier.es.js',import.meta.url).href,
  'https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@0.21.0/+esm',
  'https://esm.sh/@dimforge/rapier3d-compat@0.21.0?bundle'
];

async function loadRapier() {
  let lastError;
  for (const url of SOURCES) {
    try {
      const mod = await import(/* @vite-ignore */ url);
      const R = mod.default?.World ? mod.default : mod;
      if (!R.World || !R.RigidBodyDesc || !R.ColliderDesc) throw new Error('Rapier API unavailable');
      if (typeof R.init === 'function') await R.init();
      return R;
    } catch (error) { lastError=error; console.warn('Rapier provider unavailable:', url, error); }
  }
  throw lastError ?? new Error('Rapier unavailable');
}

export async function createRapierPhysics(THREE, scene, hero, forestRoot) {
  const R = await loadRapier();
  const world = new R.World({x:0, y:-18, z:0});
  world.timestep=1/60;
  // Static ground runs exactly under the authored zero-height world surface.
  world.createCollider(R.ColliderDesc.cuboid(17.0, 0.25, 14.0).setTranslation(0,-0.26,0).setFriction(1));

  const sceneColliders=[];
  const bounds=new THREE.Box3();
  if (forestRoot) {
    forestRoot.updateWorldMatrix(true,true);
    forestRoot.traverse(object=>{
      if(!object.isMesh || !/(tree_trunk|mushroom_stem|lantern_post|rock_)/i.test(object.name))return;
      bounds.setFromObject(object);
      if(bounds.isEmpty())return;
      const size=bounds.getSize(new THREE.Vector3());
      if(size.x < .22 || size.z < .22 || size.y < .20)return;
      // Use broad but conservative AABBs; long/rotated decorative meshes are excluded.
      const half={x:Math.max(.09,size.x*.44),y:Math.max(.09,size.y*.45),z:Math.max(.09,size.z*.44)};
      const center=bounds.getCenter(new THREE.Vector3());
      if(half.x>3.2 || half.z>3.2 || half.y>5) return;
      const collider=world.createCollider(R.ColliderDesc.cuboid(half.x,half.y,half.z)
        .setTranslation(center.x,center.y,center.z).setFriction(.85));
      sceneColliders.push(collider);
    });
  }
  // The same hero rendered by Three.js is driven by a kinematic capsule;
  // there is NO new or alternative player model.
  const centerHeight=.72;
  const player=world.createCollider(R.ColliderDesc.capsule(.44,.27)
    .setTranslation(hero.position.x, hero.position.y+centerHeight,hero.position.z).setFriction(0));
  const controller=world.createCharacterController(.018);
  controller.enableSnapToGround(.2);
  controller.setMaxSlopeClimbAngle(Math.PI*.31);
  controller.setMinSlopeSlideAngle(Math.PI*.43);
  controller.setApplyImpulsesToDynamicBodies?.(true);

  const crates=[];
  const colors=[0x665448,0x82705d,0x5b695c,0x8d6d58];
  const material=colors.map(color=>new THREE.MeshStandardMaterial({color,flatShading:true,roughness:1,metalness:0}));
  const cubeGeo=new THREE.BoxGeometry(.55,.55,.55);
  // Tiny sculptural cyan inlays make the interactive crates fit the moon relic art.
  const runeGeo=new THREE.PlaneGeometry(.18,.18);
  const runeMat=new THREE.MeshBasicMaterial({color:0x88e1d3,transparent:true,opacity:.85,depthWrite:false,side:THREE.DoubleSide});
  for (let i=0;i<12;i++) {
    const a=i*2.39996, radius=1.9+(i%4)*.40;
    const x=2.4+Math.cos(a)*radius, z=4.4+Math.sin(a)*radius;
    const mesh=new THREE.Group();
    mesh.add(new THREE.Mesh(cubeGeo,material[i%material.length]));
    const frontRune=new THREE.Mesh(runeGeo,runeMat);
    frontRune.position.z=.279;
    frontRune.rotation.z=Math.PI*.25;
    mesh.add(frontRune);
    const sideRune=frontRune.clone();sideRune.position.set(.279,0,0);sideRune.rotation.set(0,Math.PI*.5,Math.PI*.25);
    mesh.add(sideRune);
    const body=world.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(x,3.2+i*.45,z)
      .setLinearDamping(.12).setAngularDamping(.9));
    world.createCollider(R.ColliderDesc.cuboid(.275,.275,.275).setRestitution(.12).setFriction(.9),body);
    mesh.castShadow=false;mesh.receiveShadow=false;mesh.position.set(x,3.2+i*.45,z);
    scene.add(mesh);crates.push({mesh,body});
  }
  function registerRelic(name, anchor) {
    // Proxy colliders from the true VOX→GLB dimensions. Keep the gate passage open.
    anchor.updateWorldMatrix(true,true);
    const gate=name.includes('gate');
    const parts=gate
      ? [{x:-2.65,y:2.1,z:0,hx:.53,hy:2.15,hz:.85}, {x:2.65,y:2.1,z:0,hx:.53,hy:2.15,hz:.85}]
      : [{x:0,y:1.1,z:0,hx:1.03,hy:1.1,hz:.83}];
    for(const part of parts){
      const v=anchor.localToWorld(new THREE.Vector3(part.x,part.y,part.z));
      const yaw=anchor.rotation.y;
      const q={x:0,y:Math.sin(yaw*.5),z:0,w:Math.cos(yaw*.5)};
      sceneColliders.push(world.createCollider(R.ColliderDesc.cuboid(part.hx,part.hy,part.hz)
        .setTranslation(v.x,v.y,v.z).setRotation(q).setFriction(.8)));
    }
  }
  let active=true, vy=0, grounded=true, accumulator=0, jumpHeld=false;
  const dtStep=1/60;
  let lastPos={x:hero.position.x, y:0, z:hero.position.z};
  function move(dt, speedX, speedZ, jumpDown) {
    if(!active)return null;
    accumulator=Math.min(accumulator+Math.min(dt,.08),dtStep*5);
    const jumpEdge=jumpDown&&!jumpHeld;
    jumpHeld=jumpDown;
    if(jumpEdge&&grounded){vy=6.2;grounded=false;}
    let steps=0;
    while(accumulator>=dtStep && steps<5){
      steps++;accumulator-=dtStep;
      vy=Math.max(-20,vy-18*dtStep);
      const wish={x:speedX*dtStep,y:vy*dtStep,z:speedZ*dtStep};
      controller.computeColliderMovement(player,wish);
      const c=controller.computedMovement();
      const p=player.translation();
      const nx=Math.max(-15.55,Math.min(15.55,p.x+c.x));
      const nz=Math.max(-12.55,Math.min(12.55,p.z+c.z));
      player.setTranslation({x:nx,y:p.y+c.y,z:nz});
      grounded=controller.computedGrounded();
      if(grounded && vy<0)vy=0;
      else if(vy>0 && c.y < wish.y-.004)vy=0;
      world.step();
    }
    for(const item of crates){
      const p=item.body.translation(),q=item.body.rotation();
      item.mesh.position.set(p.x,p.y,p.z);
      item.mesh.quaternion.set(q.x,q.y,q.z,q.w);
    }
    const p=player.translation();
    lastPos={x:p.x,y:Math.max(0,p.y-centerHeight),z:p.z};
    return lastPos;
  }
  function strike(origin, angle) {
    if(!active)return 0;
    let count=0;
    const forward={x:Math.sin(angle),z:Math.cos(angle)};
    for(const item of crates){
      const p=item.body.translation();
      const dx=p.x-origin.x,dz=p.z-origin.z;
      const dist=Math.hypot(dx,dz);
      if(dist>2.8 || (dx*forward.x+dz*forward.z)<-.7)continue;
      item.body.applyImpulse({x:forward.x*3.5+dx*.8,y:2.6,z:forward.z*3.5+dz*.8},true);
      count++;
    }
    return count;
  }
  function setEnabled(value) {
    active=!!value;
    if(active){
      vy=0;grounded=false;accumulator=0;jumpHeld=false;
      player.setTranslation({x:hero.position.x,y:centerHeight+Math.max(0,hero.position.y),z:hero.position.z});
    }
    return active;
  }
  function dispose(){
    for(const item of crates){scene.remove(item.mesh);world.removeRigidBody(item.body);}
    cubeGeo.dispose();runeGeo.dispose();runeMat.dispose();material.forEach(m=>m.dispose());
    controller.free?.();world.free?.();
  }
  return {move,strike,setEnabled,dispose,registerRelic,get enabled(){return active},get crateCount(){return crates.length},get environmentColliderCount(){return sceneColliders.length}};
}
