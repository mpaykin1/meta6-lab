// engine/00_head.js
const damp = (k, dt) => 1 - Math.exp(-k * dt);          // frame-rate independent easing factor
const rr = (a, b) => a + (b - a) * Math.random();
// engine/00_head.js
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
// engine/00_head.js
const lerp = (a, b, t) => a + (b - a) * t;
// engine/00_head.js
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
// engine/00_head.js
const angDiff = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
// engine/30_state.js
function rayFree(o, d, maxT) {
  for (let t = 0.9; t < maxT; t += 0.2) {
    const b = blockAt(Math.floor(o.x + d.x * t), Math.floor(o.y + d.y * t), Math.floor(o.z + d.z * t));
    if (b && !BLK[b].leafy) return Math.max(2.6, t - 0.45);
  }
  return maxT;
}

// engine/40_hero.js
const rig = {
  yaw: 0, pitch: 0.62, dist: 11, yawT: 0, pitchT: 0.62, distT: 11, spin: 0, pspin: 0, eff: 11,
  pos: new THREE.Vector3(30, 22, 70), look: new THREE.Vector3(32, 8, 32), trauma: 0, blend: 1, vicA: 0, lift: 0, pitchEff: 0.62,
};