// META BOT handle for «Wild train: Prologue» — read-only (scripts/meta-bot/CONTRACT.md, version 1).
// One round = 4 levels, in the game's own order: 0 five hits (bottles) · 1 four bandits · 2 shoot a glowing letter → top view · 3 clear the first wave from above.
// hero/goal are SCREEN pixels: the player aims by touching the screen, so the goal is where to tap.
(function () {
  const d = () => window.__dbg, r = () => window.__RET;
  const W = () => innerWidth, H = () => innerHeight;
  function scr(p) { const s = d().screenOf({ x: p.x, y: p.y, z: p.z }); return { x: s.front ? s.x : W() - s.x, y: s.front ? s.y : H() - s.y }; }
  // the level only moves forward one step at a time, when its own goal is met (a stray hit on a letter does not skip levels)
  let shown = 0, shownAt = performance.now(), wave0 = -1;
  function met(lv) {
    const g = d(), k = g.kills;
    if (lv === 0) return k.bottle + k.bandit + k.vulture + k.raven >= 5;   // five hits (bottles first; a stray letter early still counts its fights)
    if (lv === 1) return k.bandit >= 4;
    if (lv === 2) return g.mode === 2;
    if (g.mode === 2 && wave0 < 0) wave0 = g.wave;
    return g.mode === 2 && wave0 >= 0 && g.wave > wave0;
  }
  // targets move fast past the rider: aim where each one will be when the finger lands.
  // The delay is counted in frames (a touch takes about six to reach the game, a click about two), so it holds at any FPS.
  let frameDt = 1 / 60, lastF = 0, touchInput = false;
  (function tick(t) { if (lastF) frameDt = frameDt * 0.9 + Math.min(0.5, (t - lastF) / 1000) * 0.1; lastF = t; requestAnimationFrame(tick); })(0);
  addEventListener('pointerup', (e) => { touchInput = e.pointerType === 'touch'; }, { capture: true, passive: true });
  const seen = new WeakMap();
  function ahead(obj, p, far) {
    const now = performance.now() / 1000, m = seen.get(obj);
    let vx = 0, vy = 0, vz = 0;
    if (m && now - m.t > 0.02 && now - m.t < 1.5) { vx = (p.x - m.x) / (now - m.t); vy = (p.y - m.y) / (now - m.t); vz = (p.z - m.z) / (now - m.t); }
    if (!m || now - m.t > 0.08) seen.set(obj, { x: p.x, y: p.y, z: p.z, t: now });
    const slow = frameDt / Math.min(frameDt, 0.05);                      // game time runs slower than real time when frames are long
    const LEAD = (touchInput ? 6.4 : 2) * frameDt + (far ? Math.hypot(p.x, p.z) / 55 * slow : 0);   // + a far letter: the bullet's flight (55 m/s)
    return { x: p.x + vx * LEAD, y: p.y + vy * LEAD, z: p.z + vz * LEAD };
  }
  // off screen: a point to the side the camera has to turn, as far from the centre as the turn is big
  // (a 6 px drag turns the view by about 0.0087 rad — so the bot's drag of (x - W/2)/6 turns it just enough)
  function turnPoint(f) {
    const want = Math.atan2(-f.x, -f.z) + 0.25, e = Math.atan2(Math.sin(want - d().camAz), Math.cos(want - d().camAz));
    return { x: W() / 2 + 6 * e / 0.0087, y: H() / 2 };
  }
  function onScreen(q) { return q.x > 8 && q.x < W() - 8 && q.y > 8 && q.y < H() - 8; }
  function target(lv) {
    const g = d(); let best = null, bd = 1e9, off = null, od = 1e9;
    const consider = (obj, p, far) => { const f = ahead(obj, p, far), q = scr(f), dist = Math.hypot(f.x, f.z);
      if (onScreen(q)) { if (dist < bd) { bd = dist; best = q; } } else if (dist < od) { od = dist; off = turnPoint(f); } };
    if (g.mode === 2) return null;                                       // from above the cowboy fires on his own
    if (lv >= 2) {                                                      // a letter beats everything else: watch it come, shoot it near
      let L0 = null; for (const L of g.letters) if (!L.dead && !L.grounded && (!L0 || Math.hypot(L.p.x, L.p.z) < Math.hypot(L0.p.x, L0.p.z))) L0 = L;
      if (L0) { const f = ahead(L0, L0.g.position, true), q = scr(f);
        if (!onScreen(q)) return turnPoint(f);
        return Math.hypot(f.x, f.z) <= 12 ? q : null; }
    }
    if (lv >= 1) for (const b of g.bandits) if (!b.dead) consider(b, { x: b.p.x, y: b.root.position.y + 1.15, z: b.p.z });
    if (lv !== 1) for (const t of g.targets) if (t.userData.alive && t.visible && t.position.x > -3 && t.position.x < 22) consider(t, { x: t.position.x, y: 1.1, z: t.position.z });
    if (best && lv < 2) for (const L of g.letters) if (!L.dead) { const q = scr(L.g.position); if (Math.hypot(q.x - best.x, q.y - best.y) < 140) return null; }  // a letter next to it would be hit instead
    if (lv >= 2 && !best) { const tp = turnPoint({ x: 12, y: 1.5, z: 0.8 }); return Math.abs(tp.x - W() / 2) > 100 ? tp : null; }  // letters come from ahead: keep looking that way
    return best || (lv >= 1 ? off : null);                              // bottles come by themselves; riders and letters must be looked for
  }
  const hashes = {};
  function hash(lv) {
    if (hashes[lv]) return hashes[lv];
    const g = d(); const parts = g.targets.map(t => Math.round(t.position.z * 10) + ':' + Math.round(t.position.x * 10)).join(',');
    let h = 2166136261; for (const c of lv + '|' + parts) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
    return (hashes[lv] = h.toString(16));
  }
  window.__META_BOT__ = Object.freeze({
    version: 1,
    info() { return { name: 'Wild train: Prologue', levels: 4 }; },
    state() {
      const g = d(), R = r();
      if (!g || !R) return { started: false, level: 0, levelDone: false, gameDone: false, alive: true, hero: { x: 0, y: 0 }, goal: null, enemies: 0, weapons: 1, layoutHash: '', menuOpen: false, progress: 0 };
      if (shown < 4 && performance.now() - shownAt > 4000 && met(shown)) { shown++; shownAt = performance.now(); }   // every level is seen before the next
      const cur = Math.min(shown, 3), k = g.kills;
      return {
        started: true, level: cur, levelDone: shown > cur, gameDone: shown >= 4, alive: !R.halted,
        hero: scr({ x: 0, y: 1.4, z: 0 }), goal: target(cur),
        enemies: g.bandits.filter(b => !b.dead).length,
        weapons: 1, layoutHash: hash(cur), menuOpen: g.menuOpen,
        progress: k.bottle + k.bandit + k.vulture + k.raven + (g.mode === 2 ? 100 + g.wave : 0)
      };
    }
  });
})();
