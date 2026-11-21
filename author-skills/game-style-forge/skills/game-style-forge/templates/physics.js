/**
 * Game Style Forge -- Rapier 0.21.0 runtime integration.
 * Single source of truth for collision, gravity, movement and props.
 * Visuals stay in Three.js; procedural materials stay in Ashima GLSL;
 * screen treatment stays in pmndrs/postprocessing.
 */
import * as THREE from 'three';

const FIXED_STEP = 1 / 60;
const CAPSULE_HALF = .55;
const CAPSULE_RADIUS = .32;
const CAPSULE_CENTER = CAPSULE_HALF + CAPSULE_RADIUS + .03;

export async function createPhysics(scene, obstacles, rockMat, random) {
  const imported = await import('@dimforge/rapier3d-compat');
  const R = imported.default?.World ? imported.default : imported;
  await R.init();
  const world = new R.World({x:0, y:-18, z:0});
  world.timestep = FIXED_STEP;
  world.createCollider(R.ColliderDesc.cuboid(110, .14, 110).setTranslation(0, -.14, 0));
  // Physics colliders use the same exact positions/sizes as visible scene pillars.
  for (const [x, z, radius, height] of obstacles) {
    world.createCollider(R.ColliderDesc.cylinder(height / 2, radius).setTranslation(x, height / 2, z));
  }
  const player = world.createRigidBody(
    R.RigidBodyDesc.kinematicPositionBased().setTranslation(0, CAPSULE_CENTER, 0)
  );
  const capsule = world.createCollider(R.ColliderDesc.capsule(CAPSULE_HALF, CAPSULE_RADIUS), player);
  const controller = world.createCharacterController(.02);
  controller.enableAutostep(.31, .15, true);
  controller.enableSnapToGround(.16);
  controller.setApplyImpulsesToDynamicBodies(true);
  controller.setCharacterMass(70);

  // Actual rigid-body props; their meshes are rendered by Three.js.
  const props = [];
  for (let i=0; i<13; i++) {
    const x=(random()-.5)*18, z=(random()-.5)*18;
    const radius=.24 + random()*.11;
    const rigid = world.createRigidBody(
      R.RigidBodyDesc.dynamic().setTranslation(x, 4+random()*8, z)
        .setLinearDamping(.18).setAngularDamping(.25)
    );
    world.createCollider(R.ColliderDesc.ball(radius).setRestitution(.13).setFriction(.8), rigid);
    const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(radius, 0), rockMat);
    scene.add(mesh);
    props.push([rigid, mesh]);
  }

  let velocityY=0, grounded=true, accumulator=0;
  function jump() {
    // No spontaneous jumps: called only from the input handlers in main.js.
    if (grounded) { velocityY=7.3; grounded=false; return true; }
    return false;
  }
  function step(dt, direction, speed=5.3) {
    accumulator += Math.min(.05, dt);
    let iterations=0;
    while (accumulator >= FIXED_STEP && iterations++ < 3) {
      velocityY -= 18 * FIXED_STEP;
      controller.computeColliderMovement(capsule, {
        x:direction.x * speed * FIXED_STEP,
        y:velocityY * FIXED_STEP,
        z:direction.z * speed * FIXED_STEP
      });
      const movement=controller.computedMovement();
      const p=player.translation();
      player.setNextKinematicTranslation({x:p.x+movement.x, y:p.y+movement.y, z:p.z+movement.z});
      world.step();
      grounded=controller.computedGrounded();
      if (grounded && velocityY<0) velocityY=0;
      accumulator -= FIXED_STEP;
    }
    if (iterations>3) accumulator=0;
    for (const [rigid, mesh] of props) {
      const pos=rigid.translation(), rot=rigid.rotation();
      mesh.position.set(pos.x,pos.y,pos.z);
      mesh.quaternion.set(rot.x,rot.y,rot.z,rot.w);
    }
    const p=player.translation();
    return {x:p.x,y:p.y-CAPSULE_CENTER,z:p.z,grounded};
  }
  function registerStaticBox(center,size){
    // Never infer physics from pixels/mesh appearance. Only explicitly authored
    // model-space boxes are accepted and registered in Rapier.
    if(![...size,center.x,center.y,center.z].every(Number.isFinite) || size.some(x=>x<=0))
      throw new Error('Invalid manually authored collision bounds');
    return world.createCollider(R.ColliderDesc.cuboid(size[0]/2,size[1]/2,size[2]/2)
      .setTranslation(center.x,center.y,center.z));
  }
  const navigationNPCs=new Set();
  function registerNavNPC(start){
    // A Recast NPC is a kinematic collider in the SAME Rapier world as the hero.
    // Its path is a navigation suggestion; physics is never inferred from video/depth.
    const half=.45,radius=.22,centerY=half+radius+.02;
    const body=world.createRigidBody(R.RigidBodyDesc.kinematicPositionBased()
      .setTranslation(start.x,centerY+(start.y||0),start.z));
    world.createCollider(R.ColliderDesc.capsule(half,radius).setFriction(.7),body);
    navigationNPCs.add(body);
    return {
      setTarget(position){body.setNextKinematicTranslation({x:position.x,y:centerY+(position.y||0),z:position.z});},
      dispose(){if(navigationNPCs.delete(body))world.removeRigidBody(body);}
    };
  }
  function dispose(){world.free(); for(const [,mesh] of props){scene.remove(mesh);mesh.geometry.dispose();}}
  return {jump,step,dispose,world,registerStaticBox,registerNavNPC};
}
