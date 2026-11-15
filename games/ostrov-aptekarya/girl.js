import * as T from 'three';

// Ива — девочка с механическим слухом. Модель = принятый «Путник» из эталона INK (REUSE),
// перекрашенный, без фонаря, с отдельной головой (чтобы поворачивать) и имплантом за ухом.
const lerpAngle = (a, b, k) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * k;
const damp = (k, dt) => 1 - Math.exp(-k * dt);

export function createGirl({makers, paint}) {
  const g = makers.traveller();
  g.name = 'Ива';
  const lamp = g.children.find(c => c.name === 'Фонарь'); if (lamp) g.remove(lamp);
  const recolor = {b25d51: '#5d7d99', '414f50': '#38434c', '8c8060': '#a48a62', c99b67: '#d9c6a3'};
  g.traverse(o => {
    if (!o.isMesh || !o.material?.color) return;
    const hex = o.material.color.getHexString();
    const hair = o.geometry?.type === 'SphereGeometry' && o.position.y > 1.25;
    if (hair) { o.material = o.material.clone(); o.material.color.set('#3e3330'); return; }
    if (recolor[hex]) { o.material = o.material.clone(); o.material.color.set(recolor[hex]); }
  });
  // Голова на отдельном шарнире: смотрит на лес, на великана, на аптекаря.
  const head = new T.Group(); head.position.set(0, 1.21, 0); g.add(head);
  for (const o of [...g.children]) {
    if (o.isMesh && o.geometry?.type === 'SphereGeometry' && o.position.y > 1.1) head.attach(o);
  }
  const plain = (geo, color, pos) => {
    const m = new T.Mesh(geo, new T.MeshBasicMaterial({color}));
    m.position.set(...pos); m.userData.watercolorOutline = false; m.userData.watercolorSkipWash = true;
    head.add(m); return m;
  };
  const implant = plain(new T.SphereGeometry(.062, 10, 8), '#86d9c9', [.245, .02, -.02]);
  const eyes = [-.085, .085].map(x => plain(new T.SphereGeometry(.026, 8, 6), '#2b2f33', [x, .03, .232]));
  const glowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, '#ffffffff'); gr.addColorStop(.4, '#ffffff66'); gr.addColorStop(1, '#ffffff00');
    x.fillStyle = gr; x.fillRect(0, 0, 64, 64); return new T.CanvasTexture(c);
  })();
  const halo = new T.Sprite(new T.SpriteMaterial({map: glowTex, color: '#86d9c9', transparent: true,
    opacity: .5, depthWrite: false, blending: T.AdditiveBlending}));
  halo.scale.setScalar(.55); implant.add(halo);
  g.scale.setScalar(.66);
  paint.apply(g, {seed: 'iva-girl'});

  const calm = new T.Color('#86d9c9'), ember = new T.Color('#ff6a2c'), dark = new T.Color('#2b2f33');
  const s = {
    mode: 'follow', t: 0, dur: 0, vel: new T.Vector3(), lunge: 0, lungeCd: 1.5, speed: 3.0,
    lie: 0, headYaw: 0, signal: 0, chaseTime: 0, walkPhase: 0
  };
  function set(mode, dur = 0) { s.mode = mode; s.t = 0; s.dur = dur; if (mode === 'lunge') s.lunge = .32; }
  function move(dx, dz, canWalk) {
    const nx = g.position.x + dx, nz = g.position.z + dz;
    if (canWalk(nx, g.position.z)) g.position.x = nx;
    if (canWalk(g.position.x, nz)) g.position.z = nz;
  }
  // ctx: {hero, heroVel, heroDir, canWalk, robot, home, time, dusk}
  function update(dt, ctx) {
    s.t += dt;
    const P = ctx.hero.position, toHero = new T.Vector3(P.x - g.position.x, 0, P.z - g.position.z);
    const dist = toHero.length();
    let want = new T.Vector3(), maxSpeed = 3.6, lookAt = null;
    if (s.mode === 'follow') {
      // Идёт чуть позади и сбоку, мягко «плывёт» — не повторяет шаги аптекаря.
      const side = new T.Vector3(-ctx.heroDir.z, 0, ctx.heroDir.x).multiplyScalar(.7 * Math.sin(ctx.time * .31));
      const target = P.clone().addScaledVector(ctx.heroDir, -1.5).add(side);
      want.subVectors(target, g.position).setY(0);
      const d = want.length(); want.setLength(Math.min(maxSpeed, Math.max(0, d - .35) * 1.8));
      lookAt = d < 1.2 ? null : target;
    } else if (s.mode === 'listen' || s.mode === 'tell') {
      lookAt = ctx.robot; maxSpeed = 0;
      if (s.mode === 'tell' && s.t > s.dur * .65) lookAt = P;
    } else if (s.mode === 'chase' || s.mode === 'lunge') {
      s.chaseTime += dt;
      // Далеко — неестественно быстрый «программный» бег; близко — чуть медленнее врача, но с бросками.
      s.speed = dist > 5 ? 4.6 : Math.min(3.55, 3.2 + s.chaseTime * .008);
      if (s.mode === 'lunge') {
        s.lunge -= dt; want.copy(toHero).setLength(6.1);
        if (s.lunge <= 0) { set('chase'); s.lungeCd = 1.25; }
      } else {
        // Программа «доставки»: встать между врачом и домом и прижать его к лесу, к великану.
        const lead = P.clone().addScaledVector(ctx.heroVel, .45);
        const toHome = new T.Vector3(ctx.home.x - P.x, 0, ctx.home.z - P.z).setLength(1.35);
        const target = dist < 3 ? lead : lead.add(toHome);
        want.subVectors(target, g.position).setY(0).setLength(s.speed);
        s.lungeCd -= dt;
        if (dist < 2.5 && s.lungeCd <= 0) set('lunge');
      }
      lookAt = P;
    } else if (s.mode === 'stun') {
      want.copy(toHero).setLength(-1.6 * Math.max(0, 1 - s.t)); lookAt = P;
      if (s.t > s.dur) set('chase');
    } else if (s.mode === 'sleep') {
      if (s.t > s.dur) set('rise', 1.1);
    } else if (s.mode === 'rise') {
      if (s.t > s.dur) set('chase');
    } else if (s.mode === 'grab' || s.mode === 'faint' || s.mode === 'idle') {
      lookAt = s.mode === 'grab' ? ctx.robot : null;
    }
    s.vel.lerp(want, damp(s.mode === 'lunge' ? 14 : 6, dt));
    if (s.mode !== 'grab') move(s.vel.x * dt, s.vel.z * dt, ctx.canWalk);
    const speed = Math.hypot(s.vel.x, s.vel.z);
    // Поворот тела следует за скоростью с инерцией; голова догоняет цель отдельно.
    if (speed > .2) g.rotation.y = lerpAngle(g.rotation.y, Math.atan2(s.vel.x, s.vel.z), damp(7, dt));
    else if (lookAt) g.rotation.y = lerpAngle(g.rotation.y, Math.atan2(lookAt.x - g.position.x, lookAt.z - g.position.z), damp(1.6, dt));
    let headTarget = Math.sin(ctx.time * .5) * .25;
    if (lookAt) headTarget = Math.atan2(Math.sin(Math.atan2(lookAt.x - g.position.x, lookAt.z - g.position.z) - g.rotation.y),
      Math.cos(Math.atan2(lookAt.x - g.position.x, lookAt.z - g.position.z) - g.rotation.y));
    s.headYaw += (T.MathUtils.clamp(headTarget, -1.25, 1.25) - s.headYaw) * damp(s.mode === 'tell' ? 9 : 4, dt);
    head.rotation.y = s.headYaw;
    head.rotation.x = s.mode === 'tell' || s.mode === 'listen' ? -.12 + Math.sin(ctx.time * 31) * .015 * s.signal : 0;
    // Лёжа (сон/обморок) — плавно опускается, а не падает кадром.
    const lieTarget = s.mode === 'sleep' || s.mode === 'faint' ? 1 : 0;
    s.lie += (lieTarget - s.lie) * damp(lieTarget ? 3.2 : 2.2, dt);
    g.rotation.x = -1.32 * s.lie;
    s.walkPhase += dt * (4 + speed * 2.4);
    g.position.y = s.lie * .1 + (speed > .3 ? Math.abs(Math.sin(s.walkPhase)) * .04 : Math.sin(ctx.time * 2.1) * .01);
    g.userData.legs.forEach((leg, i) => {
      leg.rotation.x = speed > .3 && s.lie < .3 ? Math.sin(s.walkPhase + i * Math.PI) * Math.min(.6, speed * .16) : 0;
    });
    g.userData.scarf.rotation.z = Math.sin(ctx.time * 2.6 + 1) * .1;
    // Сигнал великана — огонёк импланта: бирюзовый → тлеющий оранжевый, пульс ускоряется к ночи.
    const wantSignal = {tell: 1, chase: .75, lunge: 1, grab: 1, listen: .7, stun: .5, rise: .6, sleep: .15}[s.mode] ?? ctx.dusk * .35;
    s.signal += (wantSignal - s.signal) * damp(2.5, dt);
    const rate = 1.2 + ctx.dusk * 3 + s.signal * 7;
    const pulse = .55 + .45 * Math.sin(ctx.time * rate);
    implant.material.color.copy(calm).lerp(ember, Math.min(1, s.signal * 1.15));
    halo.material.color.copy(implant.material.color);
    halo.material.opacity = .25 + pulse * (.25 + s.signal * .6);
    halo.scale.setScalar(.45 + pulse * .25 + s.signal * .5);
    eyes.forEach(e => e.material.color.copy(dark).lerp(ember, Math.max(0, s.signal - .55) * 2.2));
    return dist;
  }
  return {group: g, head, state: s, set, update};
}
