/* =============================================================================
   22b · Two worlds, one sea: the water is a door.
         Island (any surface biome, untouched) → wade out too deep → you dive into the Sunken City;
         Sunken City → swim up to the surface → you emerge in the shallows of the island you came from.
         Health, relics, weapons and ammo travel with the hero.
============================================================================= */
let portalBusy = false, portalMode = '', homeBiome = DEFAULT_BIOME;
const portalEl = document.createElement('div');
portalEl.id = 'portal';
document.body.appendChild(portalEl);
function travel(toId, mode) {
  if (portalBusy || G.state !== 'play') return;
  portalBusy = true; portalMode = mode;
  player.invuln = Math.max(player.invuln, 2.5);
  portalEl.style.background = mode === 'dive' ? '#0a4a6a' : '#cdeeff';
  portalEl.style.opacity = '1';
  if (mode === 'dive') { homeBiome = G.biome; SFX.splash(); ripple(player.pos.x, player.pos.z, 1.8); }
  setTimeout(() => {
    const keep = { hp: player.hp, arsenal: combat.arsenal.slice(), cur: combat.cur, ammo: { ...combat.ammo }, kills: G.kills, play: G.play, tod: G.tod, todT: G.todT, relics: relicsHeld.slice() };
    buildWorld(G.seed, toId);
    resetRun();
    relicsHeld.push(...keep.relics); recomputeStats(); hudRelics();
    player.hp = Math.min(keep.hp, player.maxHp); updateHearts(false);
    combat.arsenal = keep.arsenal; combat.ammo = keep.ammo; combat.cur = keep.cur; G.kills = keep.kills; hudWeapon();
    G.play = keep.play; G.tod = keep.tod; G.todT = keep.todT;
    for (const L of loot) if (combat.arsenal.includes(L.id)) L.alive = false;
    player.invuln = 2; player.vel.set(0, 0, 0);
    if (mode === 'surface') {
      // the shallows next to the beach, a few steps from dry land
      let best = null, bd = 1e9;
      for (let z = 1; z < D - 1; z++) for (let x = 1; x < W - 1; x++) {
        const i = x + z * W;
        if (world.hgt[i] !== 3 || world.kind[i] === 6) continue;
        if (!(world.hgt[i + 1] >= 4 || world.hgt[i - 1] >= 4 || world.hgt[i + W] >= 4 || world.hgt[i - W] >= 4)) continue;
        const d = Math.hypot(x - world.spawn.x, z - world.spawn.z);
        if (d < bd) { bd = d; best = [x, z]; }
      }
      const [bx, bz] = best || [Math.floor(world.spawn.x), Math.floor(world.spawn.z)];
      player.pos.set(bx + 0.5, SEA + 0.25, bz + 0.5); player.vis.copy(player.pos); player.safe.copy(world.spawn);
      player.vel.y = 2.5; player.onGround = false;
      player.look.set(world.beacon.x - bx, 0, world.beacon.z - bz).normalize();
      SFX.splash(); ripple(bx + 0.5, bz + 0.5, 2); ripple(bx + 0.5, bz + 0.5, 1.2);
      for (let k = 0; k < 26; k++) dust.emit(bx + 0.5 + rr(-0.3, 0.3), SEA + 0.1, bz + 0.5 + rr(-0.3, 0.3), rr(-2, 2), rr(3, 6), rr(-2, 2), rr(0.5, 0.9), 0.1, 0.06, C.spray, 0.9, 16, 0.4, 1);
      toast(REG.biomes.get(toId).name, 2600, false, 2);
    } else {
      const px = clamp(world.beacon.x + 4, 3, W - 3), pz = clamp(world.beacon.z + 12, 3, D - 3);
      player.pos.set(px, H - 8, pz); player.vis.copy(player.pos); player.safe.copy(player.pos);
      player.vel.y = -1.5; player.onGround = false;
      player.look.set(world.beacon.x - px, 0, world.beacon.z - pz).normalize();
      toast('Затонувший город. Держи прыжок, чтобы всплыть', 3600, false, 2);
    }
    rig.blend = 0; rig.yawT = rig.yaw = Math.atan2(world.spawn.x - world.beacon.x, world.spawn.z - world.beacon.z);
    rig.pitchT = rig.pitch = 0.62; rig.distT = rig.dist = rig.eff = 11;
    portalEl.style.opacity = '0';
    portalBusy = false; portalMode = '';
  }, 950);
}
