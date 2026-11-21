/* Casual Game Studio — real Rapier 3D 0.21.0 adapter.
 * Physics alone owns dynamic translation and rotation. Tween.js owns only
 * cosmetic pulses and HUD; the existing board stays kinematic for crisp play.
 */
export async function createRapierPhysics({THREE, scene, blocks, onImpact}) {
  const module = await import('@dimforge/rapier3d-compat');
  const R = module.default ?? module;
  await R.init();
  const timestep = 1 / 60;
  const world = new R.World({x: 0, y: -9.81, z: 0});
  world.timestep = timestep;
  const queue = new R.EventQueue(true);
  const bodies = new Map();
  const tileColliders = new Map();
  const projectiles = new Map();
  const fragments = [];
  let accumulator = 0;

  // Board tiles are animation-driven kinematic collision targets.
  for (const mesh of blocks) {
    const p = mesh.position;
    const body = world.createRigidBody(R.RigidBodyDesc.kinematicPositionBased().setTranslation(p.x,p.y,p.z));
    const collider = world.createCollider(R.ColliderDesc.cuboid(.40,.40,.24).setFriction(.7),body);
    bodies.set(mesh,{body,collider});
    tileColliders.set(collider.handle,mesh);
  }
  // Collisions with a real platform, not a decorative CSS floor.
  const floorBody = world.createRigidBody(R.RigidBodyDesc.fixed().setTranslation(0,-.22,.05));
  world.createCollider(R.ColliderDesc.cuboid(4.0,.14,1.2).setFriction(.8).setRestitution(.12),floorBody);

  function removeBlock(mesh) {
    const hit = bodies.get(mesh);
    if (!hit) return;
    tileColliders.delete(hit.collider.handle);
    world.removeRigidBody(hit.body);
    bodies.delete(mesh);
  }
  function removeProjectile(item) {
    if (item.gone) return;
    item.gone=true;
    projectiles.delete(item.collider.handle);
    world.removeRigidBody(item.body);
  }
  function launch(mesh, pos, targetMesh, onMiss) {
    const body=world.createRigidBody(
      R.RigidBodyDesc.dynamic().setTranslation(pos.x,pos.y,pos.z)
       .setLinvel(0,-16,0).setCcdEnabled(true).setLinearDamping(.04)
    );
    const collider=world.createCollider(
      R.ColliderDesc.ball(.30).setRestitution(.08)
        .setActiveEvents(R.ActiveEvents.COLLISION_EVENTS),body
    );
    const item={mesh,body,collider,targetMesh,onMiss,gone:false,age:0};
    projectiles.set(collider.handle,item);
    mesh.position.set(pos.x,pos.y,pos.z);
    return item;
  }
  function emitDebris(position,color,random=Math.random) {
    // Real rigid bodies: gravity, spin, inter-particle and platform contacts.
    while(fragments.length > 65) removeFragment(fragments[0]);
    for(let i=0;i<9;i++) {
      const size=.09+random()*.09;
      const mesh=new THREE.Mesh(
        new THREE.BoxGeometry(size,size,size),
        new THREE.MeshStandardMaterial({color:new THREE.Color(color).multiplyScalar(.82+random()*.35),roughness:.68,transparent:true,opacity:1})
      );
      const x=position.x+(random()-.5)*.27,y=position.y+(random()-.5)*.20,z=position.z+.31+random()*.10;
      mesh.position.set(x,y,z);mesh.castShadow=true;scene.add(mesh);
      const body=world.createRigidBody(R.RigidBodyDesc.dynamic()
        .setTranslation(x,y,z).setLinvel((random()-.5)*4.5,1.4+random()*3.2,(random()-.4)*2)
        .setAngvel(random()*8-4,random()*8-4,random()*8-4).setCcdEnabled(true));
      world.createCollider(R.ColliderDesc.cuboid(size*.50,size*.50,size*.50)
        .setRestitution(.38).setFriction(.67),body);
      fragments.push({body,mesh,age:0});
    }
  }
  function removeFragment(part) {
    const i=fragments.indexOf(part);
    if(i>=0)fragments.splice(i,1);
    world.removeRigidBody(part.body);
    scene.remove(part.mesh);
    part.mesh.geometry.dispose();part.mesh.material.dispose();
  }
  function update(dt) {
    const stepDt=Math.min(Math.max(dt,0),.065);
    accumulator=Math.min(accumulator+stepDt,.1);
    while(accumulator>=timestep) {
      for(const [mesh,entry] of bodies) {
        const p=mesh.position;
        entry.body.setNextKinematicTranslation({x:p.x,y:p.y,z:p.z});
      }
      world.step(queue);
      const impacts=[];
      queue.drainCollisionEvents((h1,h2,started)=>{
        if(!started)return;
        const shot=projectiles.get(h1)||projectiles.get(h2);
        const tile=tileColliders.get(h1)||tileColliders.get(h2);
        if(shot && tile && !shot.gone && tile.userData.live && shot.targetMesh===tile) impacts.push({shot,tile});
      });
      for(const {shot,tile} of impacts) {
        if(shot.gone)continue;
        removeProjectile(shot);
        onImpact(tile,shot.mesh);
      }
      accumulator-=timestep;
    }
    for(const shot of [...projectiles.values()]) {
      shot.age+=stepDt;
      if(shot.age>2.1 || shot.body.translation().y<-.5) {
        removeProjectile(shot);
        shot.onMiss?.();
      } else {
        const p=shot.body.translation(),q=shot.body.rotation();
        shot.mesh.position.set(p.x,p.y,p.z);
        shot.mesh.quaternion.set(q.x,q.y,q.z,q.w);
      }
    }
    for(const part of [...fragments]) {
      part.age+=stepDt;
      if(part.age>2.5 || part.body.translation().y< -2.3) {removeFragment(part);continue;}
      const p=part.body.translation(),q=part.body.rotation();
      part.mesh.position.set(p.x,p.y,p.z);
      part.mesh.quaternion.set(q.x,q.y,q.z,q.w);
      if(part.age>1.8)part.mesh.material.opacity=Math.max(0,(2.5-part.age)/.7);
    }
  }
  function dispose() {
    for(const part of [...fragments])removeFragment(part);
    projectiles.clear();tileColliders.clear();bodies.clear();
    queue.free();world.free();
  }
  return { launch,emitDebris,removeBlock,update,dispose,world };
}
