// §21.8 — shared Island input + hero canon, using LITERAL functions from the
// owner's reference/island-canon/engine__37_input.js and engine__40_hero.js.
// Active on every dry world, including Ash and offshore land. Only §20 underwater
// movement and explicit rift freeze use the preserved adapter in index.source.html.
export function createIslandInput({getG,getPlayer,getRig,getDrag,clamp,lerp}) {
 const proxy=read=>new Proxy({},{
  get(_k,key){return read()[key]},set(_k,key,value){read()[key]=value;return true}
 });
 const G=proxy(getG),player=proxy(getPlayer),rig=proxy(getRig),drag=proxy(getDrag);
const input = { atk: false, pressed: false, released: false, src: { mouse: false, key: false, touch: false, pad: false } };
function setAttack(src, on) {
  if (input.src[src] === on) return;
  input.src[src] = on;
  const any = input.src.mouse || input.src.key || input.src.touch || input.src.pad;
  if (any && !input.atk) input.pressed = true;
  if (!any && input.atk) input.released = true;
  input.atk = any;
}
function releaseAll() {
  for (const k in input.src) input.src[k] = false;
  if (input.atk) input.released = true;
  input.atk = false;
}
function onJumpPress() { if (G.state === 'play') { player.jumpBuf = 0.13; player.jumpHeld = true; } }
function onJumpRelease() { player.jumpHeld = false; }
function orbitBy(dx, dy, sens, now) {
  const yv = -dx * sens, pv = dy * sens * 0.7;
  rig.yawT += yv;
  rig.pitchT = clamp(rig.pitchT + pv, 0.3, 1.15);
  const dt = Math.max(0.008, (now - drag.t) / 1000);
  drag.vy = lerp(drag.vy, yv / dt, 0.5); drag.vp = lerp(drag.vp, pv / dt, 0.5);
  drag.t = now;
}
 return {input,setAttack,releaseAll,onJumpPress,onJumpRelease,orbitBy};
}
export function createIslandHero({
 G,player,rig,keys,touch,pad,combat,curWeapon,PL,STATS,groundGrip,
 damp,lerp,clamp,physicsStep,respawnAtSafe,SFX,ripple,onLand,footstep,
 engaged,screenAngleOf,aim,drown,SEA,getSimDir,
 hero,setHeroFrame,camera,heroMat,groundBelow,heroShadow,shadowU
}) {
 let simDir=null;
function updatePlayer(dt) {
  const p = player.pos, v = player.vel;
  player.invuln = Math.max(0, player.invuln - dt);
  if (player.respawn > 0) {
    player.respawn -= dt;
    if (player.respawn <= 0 && G.state === 'play') respawnAtSafe();
    return;
  }
  let ix = 0, iz = 0;
  if (G.state === 'play') {
    if (keys.has('KeyD') || keys.has('ArrowRight')) ix += 1;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) ix -= 1;
    if (keys.has('KeyW') || keys.has('ArrowUp')) iz += 1;
    if (keys.has('KeyS') || keys.has('ArrowDown')) iz -= 1;
    ix += touch.vx + pad.mx; iz += -touch.vy - pad.my;
  }
  const m = Math.hypot(ix, iz);
  if (m > 1) { ix /= m; iz /= m; }
  G.idle = m > 0.1 ? 0 : G.idle + dt;
  const sy = Math.sin(rig.yaw), cy = Math.cos(rig.yaw);
  let dx = cy * ix - sy * iz, dz = -sy * ix - cy * iz;            // camera-relative
  if (simDir) { dx = simDir[0]; dz = simDir[1]; G.idle = 0; }
  const dm = Math.hypot(dx, dz);
  if (dm > 0.2) player.look.set(dx / dm, 0, dz / dm);
  // weapons weigh on the legs: heavy swings, a drawn bow or a firing beam slow the walk
  const w = curWeapon();
  let mul = 1;
  if (combat.atk) mul = w.slow ?? 0.6;
  else if (combat.charging) mul = 0.5;
  else if (combat.beam.on) mul = 0.6;
  else if (combat.flail.on) mul = lerp(1, w.slow, combat.flail.spin);
  const speed = PL.speed * STATS.speed * (player.inWater ? 0.62 * STATS.swim : 1) * mul;
  const f = damp(player.onGround ? PL.accG * groundGrip() : PL.accA, dt);      // ice (block.slip) lets the hero slide
  v.x += (dx * speed - v.x) * f;
  v.z += (dz * speed - v.z) * f;
  if (combat.dash > 0) { v.x = combat.dashDir.x * 15; v.z = combat.dashDir.z * 15; }
  player.jumpBuf = Math.max(0, player.jumpBuf - dt);
  player.coyote = player.onGround ? 0.11 : Math.max(0, player.coyote - dt);
  if (player.jumpBuf > 0 && player.coyote > 0) {
    v.y = PL.jumpV * STATS.jump;
    player.jumpBuf = 0; player.coyote = 0; player.onGround = false; player.jumpCut = false;
    player.sqV = 7; SFX.jump();
    if (player.inWater) ripple(p.x, p.z, 1);
  }
  if (!player.jumpHeld && v.y > 2 && !player.jumpCut) { v.y *= 0.55; player.jumpCut = true; }
  const steps = Math.max(1, Math.ceil(dt * 120)), h = dt / steps;
  const was = player.onGround;
  let landV = 0;
  for (let s = 0; s < steps; s++) landV = Math.max(landV, physicsStep(h));
  if (player.onGround && !was) onLand(landV);
  player.inWater = p.y < SEA - 0.05;
  if (player.onGround && !player.inWater) { player.safeT += dt; if (player.safeT > 0.3) { player.safe.copy(p); player.safeT = 0; } }
  if (p.y < SEA - 1.25 && G.state === 'play') { drown(); return; }
  if (player.inWater && Math.hypot(v.x, v.z) > 1) { player.splashT -= dt; if (player.splashT <= 0) { player.splashT = 0.28; ripple(p.x, p.z, 0.6); } }
  // animation: frames by distance walked, facing from screen-space motion
  const hs = Math.hypot(v.x, v.z);
  const sxv = v.x * cy - v.z * sy;
  if (sxv > 0.35) player.facing = 1; else if (sxv < -0.35) player.facing = -1;
  if (G.state === 'play' && engaged()) {          // in a fight the hero faces the aim, not the walk
    const ca = Math.cos(combat.atk ? screenAngleOf(combat.atk.dir) : aim.screen);
    if (ca > 0.12) player.facing = 1; else if (ca < -0.12) player.facing = -1;
  }
  let frame;
  if (!player.onGround) frame = 5;
  else if (hs > 0.45) { player.walk += hs * dt; frame = Math.floor(player.walk / 0.5) % 4; }
  else frame = 4;
  if (frame !== player.frame) {
    if (player.onGround && hs > 0.45 && (frame === 0 || frame === 2)) footstep();
    player.frame = frame;
  }
  // lean into the swing, rock back from the recoil (overlapping motion on top of the walk lean)
  let leanT = clamp(-sxv * 0.03, -0.12, 0.12);
  if (combat.atk) leanT -= Math.cos(screenAngleOf(combat.atk.dir)) * 0.16 * Math.sin(combat.atk.t * Math.PI);
  if (combat.recoil > 0) leanT += Math.cos(aim.screen) * 0.06 * combat.recoil;
  player.lean += (leanT - player.lean) * damp(combat.atk ? 14 : 8, dt);
}
function updateHeroMesh(dt) {
  player.sqV += (-player.sq * 170 - player.sqV * 13) * dt;
  player.sq = clamp(player.sq + player.sqV * dt, -0.35, 0.35);
  player.step *= Math.exp(-14 * dt);
  player.vis.set(player.pos.x, player.pos.y + player.step, player.pos.z);
  setHeroFrame(player.frame, player.facing);
  hero.position.copy(player.vis);
  hero.rotation.y = Math.atan2(camera.position.x - hero.position.x, camera.position.z - hero.position.z);
  hero.rotation.x = -rig.pitchEff * 0.45;
  hero.rotation.z = player.lean;
  const breathe = player.frame === 4 ? Math.sin(G.time * 2.2) * 0.018 : 0;
  hero.scale.set(1 - player.sq * 0.5, 1 + player.sq + breathe, 1);
  const blinkOff = player.invuln > 0 && Math.floor(G.time * 18) % 2 === 0;
  hero.visible = player.respawn <= 0 && !blinkOff && G.state !== 'loading';
  heroMat.emissiveIntensity = 0.1 + G.tod * 0.16 + G.hurt * 0.9;
  const gy = groundBelow(player.pos.x, player.pos.y + 0.2, player.pos.z);
  const above = player.pos.y - gy;
  heroShadow.visible = hero.visible;
  heroShadow.position.set(player.vis.x, gy + 0.02, player.vis.z);
  const sc = clamp(1 - above * 0.16, 0.45, 1) * 0.95;
  heroShadow.scale.set(sc, 1, sc * 0.8);
  shadowU.uA.value = 0.5 * clamp(1 - above * 0.2, 0.25, 1);
}
 const update=(dt)=>{simDir=getSimDir();updatePlayer(dt)};
 return {updatePlayer:update,updateHeroMesh};
}
export function createIslandGroundGrip({player,blockAt,BLK}) {
function groundGrip() {
  const b = blockAt(Math.floor(player.pos.x), Math.floor(player.pos.y - 0.05), Math.floor(player.pos.z));
  const sl = b ? BLK[b].slip || 0 : 0;
  return 1 - sl * 0.88;
}
 return groundGrip;
}
