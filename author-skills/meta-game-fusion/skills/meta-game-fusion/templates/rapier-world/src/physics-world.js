/** One authoritative Rapier simulation for a Three.js game scene.
 * Visual meshes follow rigid bodies; they never drive physics. Input is the only
 * source of player actions. No gameplay code from imported games is eval'd.
 */
import RAPIER from '@dimforge/rapier3d-compat';

const STEP = 1 / 60;
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
export class FusionPhysics {
  static async create() {
    await RAPIER.init();
    return new FusionPhysics();
  }
  constructor() {
    this.world = new RAPIER.World({ x:0, y:-19.62, z:0 });
    this.world.integrationParameters.dt = STEP;
    this.dynamic = [];
    this.sensors = new Map();
    // Recast input is derived from the exact static Rapier obstacles, not from decorative geometry.
    this.navFixedObstacles = [];
    this.guide = null;
    this.guidePosition = null;
    this.elapsed = 0;
    this.lastGrounded = false;
    this.velocityY = 0;
    this.jumpHeld = false;
    this.lastPos = {x:0,y:2,z:3};
    this.player = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0,2.25,3.4)
    );
    // Capsule total height = 2*halfHeight + 2*radius = 1.72 m.
    this.playerCollider = this.world.createCollider(
      RAPIER.ColliderDesc.capsule(0.54,0.32)
        .setFriction(0.2)
        .setActiveCollisionTypes(RAPIER.ActiveCollisionTypes.DEFAULT | RAPIER.ActiveCollisionTypes.KINEMATIC_FIXED),
      this.player
    );
    this.controller = this.world.createCharacterController(0.025);
    this.controller.setMaxSlopeClimbAngle(Math.PI/3.3);
    this.controller.enableAutostep(0.4, 0.21, false);
    this.controller.enableSnapToGround(0.26);
    this.controller.setApplyImpulsesToDynamicBodies(true);
    this.ground(0,-0.34,-16,45,0.32,100);
    // Bridge rail segments and fixed stone arches, no phantom floating colliders.
    for(let z=4;z>-72;z-=13) {
      this.solid(-5.8,1.0,z,0.4,1.0,5.7);
      this.solid(5.8,1.0,z,0.4,1.0,5.7);
    }
    for (const [x,y,z,hx,hy,hz] of [
      [-2.8,.85,-13.5,1.0,.85,.75], [2.6,.95,-20.5,1.1,.95,.7],
      [0,.5,-31.5,1.65,.5,.4],[-3.3,.9,-43.5,.8,.9,1.4],
      [2.8,.8,-55.5,.8,.8,.7]
    ]) {
      this.solid(x,y,z,hx,hy,hz);
      this.navFixedObstacles.push({x,z,hx,hz});
    }
    this.crate(0,3.6,-13.3,0.51);
    this.crate(-1.35,4.2,-14.5,0.4);
    this.crate(2.45,4.6,-19.2,0.5);
  }
  ground(x,y,z,hx,hy,hz) {
    return this.solid(x,y,z,hx,hy,hz);
  }
  solid(x,y,z,hx,hy,hz) {
    const body=this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(x,y,z));
    this.world.createCollider(RAPIER.ColliderDesc.cuboid(hx,hy,hz).setFriction(0.95),body);
    return body;
  }
  crate(x,y,z,half) {
    const body=this.world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic().setTranslation(x,y,z).setCanSleep(true)
    );
    this.world.createCollider(RAPIER.ColliderDesc.cuboid(half,half,half).setDensity(1.6).setFriction(0.8),body);
    this.dynamic.push({body, half});
    return body;
  }
  addSensor(id,x,y,z,radius=1.7) {
    if(!/^[A-Za-z0-9_:.@-]{1,128}$/.test(id) || this.sensors.has(id))
      throw new Error('Duplicate/unsafe sensor ID');
    const body=this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(x,y,z));
    const collider=this.world.createCollider(
      RAPIER.ColliderDesc.ball(radius).setSensor(true)
        .setActiveCollisionTypes(RAPIER.ActiveCollisionTypes.DEFAULT | RAPIER.ActiveCollisionTypes.KINEMATIC_FIXED),
      body
    );
    this.sensors.set(id,{collider,radius,position:{x,y,z}});
  }
  /** Independent NPC capsule. Player identity and inputs remain entirely unchanged. */
  createGuideAgent(x=2.4,z=3.5) {
    if (this.guide) return this.guide;
    const body=this.world.createRigidBody(
      RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(x,1.25,z)
    );
    const collider=this.world.createCollider(
      RAPIER.ColliderDesc.capsule(0.42,0.25).setFriction(0.8)
        .setActiveCollisionTypes(RAPIER.ActiveCollisionTypes.DEFAULT | RAPIER.ActiveCollisionTypes.KINEMATIC_FIXED),
      body
    );
    const controller=this.world.createCharacterController(0.025);
    controller.enableSnapToGround(0.28);
    controller.enableAutostep(0.3,0.17,false);
    controller.setApplyImpulsesToDynamicBodies(false);
    this.guide={body,collider,controller};
    this.guidePosition=body.translation();
    return this.guide;
  }
  /** Velocity is a navmesh waypoint direction; Rapier remains authoritative for collision. */
  advanceGuide(input={}) {
    if(!this.guide) return;
    const x=clamp(Number(input.x)||0,-1,1);
    const z=clamp(Number(input.z)||0,-1,1);
    const speed=2.9;
    this.guide.controller.computeColliderMovement(
      this.guide.collider,{x:x*speed*STEP,y:-0.045,z:z*speed*STEP},
      RAPIER.QueryFilterFlags.EXCLUDE_SENSORS
    );
    const move=this.guide.controller.computedMovement();
    const p=this.guide.body.translation();
    this.guide.body.setNextKinematicTranslation({x:p.x+move.x,y:p.y+move.y,z:p.z+move.z});
  }
  /** input: x/z of [-1,1], jump edge; exactly one call per fixed timestep. */
  step(input={}, guideInput={}) {
    const x=clamp(Number(input.x)||0,-1,1);
    const z=clamp(Number(input.z)||0,-1,1);
    const m=Math.max(1,Math.hypot(x,z));
    const nowJump = Boolean(input.jump);
    if(nowJump && !this.jumpHeld && this.lastGrounded) {
      this.velocityY=7.45;
      this.lastGrounded=false;
    }
    this.jumpHeld=nowJump;
    this.velocityY=clamp(this.velocityY-19.62*STEP,-22,10);
    const speed=4.6;
    const desired={x:x/m*speed*STEP,y:this.velocityY*STEP,z:z/m*speed*STEP};
    this.controller.computeColliderMovement(
      this.playerCollider,desired,RAPIER.QueryFilterFlags.EXCLUDE_SENSORS
    );
    const move=this.controller.computedMovement();
    const p=this.player.translation();
    this.player.setNextKinematicTranslation({x:p.x+move.x,y:p.y+move.y,z:p.z+move.z});
    this.advanceGuide(guideInput);
    this.world.step();
    if(this.guide)this.guidePosition=this.guide.body.translation();
    this.lastGrounded=Boolean(this.controller.computedGrounded());
    if(this.lastGrounded && this.velocityY<0)this.velocityY=0;
    this.lastPos=this.player.translation();
    this.elapsed+=STEP;
    return this.lastPos;
  }
  nearSensor(id) {
    const obj=this.sensors.get(id);
    if(!obj)return false;
    // Sensor geometry is authored in Rapier. Use both Rapier's intersection-pair
    // result and a tight broad-phase sphere fallback for kinematic/fixed queries.
    try {
      if(this.world.intersectionPair(obj.collider,this.playerCollider))return true;
    } catch(e) { /* old bindings may lack the pair query; geometry fallback below */ }
    const p=this.lastPos,s=obj.position;
    const dx=p.x-s.x,dy=p.y-s.y,dz=p.z-s.z;
    return dx*dx+dy*dy+dz*dz<=(obj.radius+.36)**2;
  }
  sensorDistance(id) {
    const s=this.sensors.get(id)?.position,p=this.lastPos;
    return s?Math.hypot(s.x-p.x,s.z-p.z):Infinity;
  }
  destroy() {
    this.world.removeCharacterController(this.controller);
    if(this.guide)this.world.removeCharacterController(this.guide.controller);
    this.world.free();
  }
}
