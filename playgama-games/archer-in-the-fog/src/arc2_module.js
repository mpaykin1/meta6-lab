
/* =============================================================================
   ARCHER 2.0 · universal upgrades (meta6 docs/UNIVERSAL_UPGRADES.md) — additive layer
   U1 sparks for mastery · U2 tower dice generator · U3 A1 plunge in slow motion · A2 ambush from the fog
   U4 fog veil while falling · U5 lasting progress + daily gift · R1 instant start · R5 rewarded revive · R8 telemetry
============================================================================= */
const ICON_ICE = '<svg viewBox="0 0 11 11" fill="currentColor" aria-hidden="true"><rect x="5" y="0" width="1" height="11"/><rect x="0" y="5" width="11" height="1"/><rect x="2" y="2" width="1" height="1"/><rect x="8" y="2" width="1" height="1"/><rect x="2" y="8" width="1" height="1"/><rect x="8" y="8" width="1" height="1"/><rect x="3" y="3" width="1" height="1"/><rect x="7" y="3" width="1" height="1"/><rect x="3" y="7" width="1" height="1"/><rect x="7" y="7" width="1" height="1"/><rect x="4" y="1" width="3" height="1"/><rect x="4" y="9" width="3" height="1"/><rect x="1" y="4" width="1" height="3"/><rect x="9" y="4" width="1" height="3"/></svg>';
const GAME_VERSION = "2.0.0";
const ARC2 = (() => {
  const pg = (n, d) => { try { PG.ready && window.bridge.analytics && window.bridge.analytics.send(n, d); } catch (e) {} };
  const ru = () => PG.language === "ru";
  /* ---------- U1 sparks ---------- */
  const COLS = ["harvest", "precision", "element", "agility"];
  const HEX = { harvest: "#c27bff", precision: "#58c4ff", element: "#ff8a3d", agility: "#6ee68a" };
  const TC = { harvest: new Color(1.5, 0.7, 2.4), precision: new Color(0.6, 1.6, 2.6), element: new Color(2.6, 1.1, 0.3), agility: new Color(0.8, 2.4, 1.0) };
  const SP = { lantern: { harvest: 0, precision: 0, element: 0, agility: 0 }, shield: 0, fly: [], chainT: -9, chain: 0, earned: 0 };
  function spark(c, from, n = 1) {
    for (let k = 0; k < n; k++) SP.fly.push({ c, p: from.clone(), t: -k * 0.12 });
  }
  function land(c) {
    if ((G.lives || 0) < 3) { G.lives = (G.lives || 0) + 1; G.dead = !1; AU.heal(); renderRes(); }
    else if (SP.shield < 3) { SP.shield++; AU.ice(); }
    else SP.lantern[c] = Math.min(9, SP.lantern[c] + 1);
    SP.earned++;
    if (G.task === "sparks" && c === G.taskCol && G.phase !== "fall" && G.phase !== "over") bumpTask(1);
    pg("spark", { color: c });
  }
  function flyTick(dt) {
    const hand = archer.root.position;
    for (let i = SP.fly.length - 1; i >= 0; i--) {
      const f = SP.fly[i]; f.t += dt; if (f.t < 0) continue;
      const k = Math.min(1, f.t / 0.45), e = 1 - Math.pow(1 - k, 3);
      const x = f.p.x + (hand.x - f.p.x) * e, y = f.p.y + (hand.y + 1.4 - f.p.y) * e + Math.sin(k * Math.PI) * 2, z = f.p.z + (hand.z - f.p.z) * e;
      sparks.spawn(_sv.set(x, y, z), _sw.set((Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 1.2), 0.16, 0.4, TC[f.c], 0, 4);
      if (k >= 1) { SP.fly.splice(i, 1); land(f.c); for (let j = 0; j < 10; j++) sparks.spawn(_sv.set(hand.x, hand.y + 1.3, hand.z), _sw.set((Math.random() - 0.5) * 5, Math.random() * 4, (Math.random() - 0.5) * 5), 0.14, 0.5, TC[f.c], 0, 5); }
    }
  }
  const _sv = new V3(), _sw = new V3();
  function absorb() {                                  // a shield turns a crash into a repel: the tower holds
    if (SP.shield <= 0 || G.forceCrash) return !1;
    SP.shield--; flashScreen(0.35); G.shake = Math.max(G.shake, 0.8); caption("ЩИТ");
    const p = archer.root.position.clone().add(new V3(0, 1.4, 0));
    for (let k = 0; k < 30; k++) sparks.spawn(p, new V3((Math.random() - 0.5) * 12, Math.random() * 8, (Math.random() - 0.5) * 12), 0.2, 0.7, TC.precision, 0, 6);
    if (G.phase !== "fall" && G.phase !== "over") repel();
    pg("shield_used", { depth: G.depth });
    return !0;
  }

  /* ---------- U2 tower dice: task · temperament · place · name ---------- */
  const TASKS = ["hits", "fire", "sparks", "hold"];
  const TEMPS = ["steady", "swift", "fiery", "trickster"];
  const NAME = {
    hits: ["Last Arrow", "Последней Стрелы"], fire: ["Falling Fire", "Падающего Огня"], sparks: ["Living Light", "Живого Света"], hold: ["Long Night", "Долгой Ночи"],
  };
  const TEMP_ADJ = { steady: ["Quiet", "Тихая"], swift: ["Swift", "Быстрая"], fiery: ["Burning", "Пылающая"], trickster: ["Misty", "Туманная"] };
  const mod = (a, n) => ((a % n) + n) % n;
  function dice(depth) {
    const k = depth - 1;
    const task = k === 0 ? "hits" : TASKS[mod(k, 4)];                        // neighbours never repeat
    const temp = k === 0 ? "steady" : TEMPS[mod(k * 3 + 1, 4)];
    const col = COLS[mod(k * 2 + 1, 4)];
    const budget = 1 + Math.floor(k / 2);
    const n = task === "fire" ? Math.min(2 + budget, 8) : task === "sparks" ? Math.min(2 + budget, 7) : task === "hold" ? 0 : null;
    const T = task === "hold" ? Math.min(20 + budget * 5, 50) : 0;
    const name = ru() ? `${TEMP_ADJ[temp][1]} башня ${NAME[task][1]}` : `${TEMP_ADJ[temp][0]} Tower of the ${NAME[task][0]}`;
    return { task, temp, col, n, T, name, budget };
  }
  let D0 = dice(1), holdT = 0, base0 = 0;
  function bumpTask(n) {
    if (G.task === "hits" || G.phase !== "fight") return;
    G.hits = Math.min(G.need, G.hits + n); renderHP();
    if (G.hits >= G.need) retreat();
  }
  function retreat() {
    G.phase = "retreat"; G.pt = 0; dragon.jawOpen = 1; AU.roar(); caption("DRAGON RETREATS"); G.glitch = 0.6; flashScreen(0.25);
    dropLoot(dragon.root.position.clone(), "coin", 4 + G.level); spark("harvest", dragon.root.position);
    pg("progression_completed", { step_id: "tower_" + G.task, step_index: G.depth, level: G.level, version: GAME_VERSION });
  }
  function onRound() {
    D0 = dice(G.depth);
    G.task = D0.task; G.taskCol = D0.col; G.temp = D0.temp; holdT = 0;
    if (D0.task === "fire") { G.need = D0.n; base0 = G.shotDown || 0; }
    else if (D0.task === "sparks") G.need = D0.n;
    else if (D0.task === "hold") G.need = 10;
    G.hits = 0; renderHP();
    $("hp").style.setProperty("--pc", D0.task === "sparks" ? HEX[D0.col] : D0.task === "fire" ? "#ff8a3d" : D0.task === "hold" ? "#cfe0ff" : "");
    if (D0.temp === "fiery") G.spitT *= 0.6;
    if (D0.temp === "swift") G.orbitBoost = 1.3; else G.orbitBoost = 1;
    if (G.depth > 1) showLvl(D0.name);
    $("repel").style.opacity = 0;
  }
  function onShotDown(f) { spark("precision", f); if (G.task === "fire") bumpTask(1); }
  function onRepel() { spark("harvest", dragon.root.position, 2); $("repel").style.opacity = 0; pg("attack_repelled", { attack: G.phase, depth: G.depth }); }
  function onDragonHit() {
    const now = performance.now() / 1000;
    SP.chain = now - SP.chainT < 1.5 ? SP.chain + 1 : 1; SP.chainT = now;
    if (SP.chain >= 3) { SP.chain = 0; spark("agility", dragon.root.position); }
    if (G.freezeOn || dragon.frozen > 2.7) spark("element", dragon.root.position);
  }

  /* ---------- U3 / A1 plunge in slow motion, A2 ambush from the fog ---------- */
  const shadowMat = new ShaderMaterial({
    uniforms: { uA: { value: 0 }, uRim: { value: 0 }, uT: { value: 0 } }, transparent: !0, depthWrite: !1,
    vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform float uA,uRim,uT;varying vec2 vUv;void main(){vec2 q=(floor(vUv*28.)+.5)/28.*2.-1.;float d=length(q);float fill=1.-smoothstep(.55,1.,d);float rim=smoothstep(.84,.94,d)*(1.-smoothstep(.94,1.02,d));float pulse=.55+.45*sin(uT*9.-d*6.);vec3 c=mix(vec3(.02,.03,.08),vec3(1.7,.4,.25),rim*uRim);float a=max(fill*uA*.7,rim*uRim*pulse);if(a<.01)discard;gl_FragColor=vec4(c,a);}",
  });
  const shadow = new Mesh(new PlaneGeometry(1, 1).rotateX(-Math.PI / 2), shadowMat);
  shadow.renderOrder = 6; shadow.visible = !1; scene.add(shadow);
  const eyeMat = (c) => new SpriteMaterial({ map: glowTex, color: c, blending: AdditiveBlending, depthWrite: !1, transparent: !0, opacity: 0, fog: !1 });
  const eyes = [eyeMat(16736352), eyeMat(16736352)].map((m) => { const sp = new Sprite(m); sp.scale.setScalar(1.6); sp.visible = !1; scene.add(sp); return sp; });
  let camK = 0, prevSpecial = "";
  const hideBody = (h) => { dragon.root.visible = !h; dragon.tail.forEach((t) => (t.visible = !h)); };
  function pickSpecial(r) {
    const pool = ["windup", "plunge", "ambush"].concat(r.tail ? ["tail"] : []);
    if (G.temp === "trickster") pool.push("ambush");
    const opts = pool.filter((x) => x !== prevSpecial);
    const pick = opts[Math.floor(Math.random() * opts.length)];
    prevSpecial = pick;
    if (pick === "plunge") { G.phase = "plunge"; G.plLock = !1; G.repelNeed = Math.max(2, r.repel - 1); caption("ПИКЕ"); pg("special_attack", { attack: "plunge", depth: G.depth }); return !0; }
    if (pick === "ambush") { G.phase = "ambush"; G.amStage = 0; G.repelNeed = Math.max(2, r.repel - 1); caption("ИЗ ТУМАНА"); pg("special_attack", { attack: "ambush", depth: G.depth }); return !0; }
    pg("special_attack", { attack: pick, depth: G.depth });
    return !1;                                     // the classic head ram / tail swipe take over
  }
  function plunge(r, e, i) {
    const top = _sv.copy(i).addScaledVector(G.diveDir, 10); top.y = i.y + 20;
    shadow.visible = !0; shadow.position.set(i.x, i.y + 0.05, i.z);
    const grow = Math.min(1, G.pt / 1.3);
    shadow.scale.setScalar(2 + grow * 4); shadowMat.uniforms.uA.value = grow; shadowMat.uniforms.uT.value = e;
    if (G.pt < 1.3) {                                    // rise high above the tower, the shadow grows
      dragon.steer(top, 32, 2, r); dragon.fold = damp(dragon.fold, 0, 3, r); dragon.jawOpen = damp(dragon.jawOpen, 0.6, 3, r);
      return 1;
    }
    if (!G.plLock) { G.plLock = !0; AU.roar(); G.glitch = Math.max(G.glitch, 0.6); }
    shadowMat.uniforms.uRim.value = 1;                   // red rim: locked on
    const d = _sw.copy(i).add(new V3(0, 0.6, 0));
    dragon.steer(d, 15 + G.level * 0.8, 3, r);           // slow motion: the dragon at a third of its speed, the archer at full speed
    dragon.fold = damp(dragon.fold, 0.7, 3, r); dragon.claw = damp(dragon.claw, 1, 3, r); dragon.jawOpen = damp(dragon.jawOpen, 1, 4, r);
    G.shake = Math.max(G.shake, 0.08);
    if (dragon.root.position.distanceTo(d) < 4.5) { shadow.visible = !1; crash(); }
    return 1;
  }
  function ambush(r, e, i, t) {
    const P = dragon.root.position;
    if (G.amStage === 0) {                               // vanish into the fog
      const far = _sv.copy(P).sub(i); far.y = 0; far.normalize().multiplyScalar(42).add(i); far.y = i.y + 4;
      dragon.steer(far, 30, 1.4, r);
      G.fogBoost = Math.min(1, (G.fogBoost || 0) + r * 0.8);
      if (G.pt > 1.4) { G.amStage = 1; G.pt = 0; hideBody(!0); G.amOrb = Math.atan2(P.z - t.z, P.x - t.x); }
      return 0.6;
    }
    if (G.amStage === 1) {                               // lurk: only two eyes circle in the haze
      G.amOrb += r * 0.9;
      dragon.steer(_sv.set(t.x + Math.cos(G.amOrb) * 22, i.y + 3 + Math.sin(e * 1.3) * 2, t.z + Math.sin(G.amOrb) * 22), 22, 1.6, r);
      setEyes(0.35 + 0.15 * Math.sin(e * 3));
      if (G.pt > 3.2) { G.amStage = 2; G.pt = 0; AU.roar(); }
      return 0.5;
    }
    if (G.amStage === 2) {                               // glare: the eyes flare — the only moment to shoot them
      dragon.steer(_sv.copy(P), 2, 2, r);
      setEyes(0.6 + G.pt * 0.6, 1 + G.pt * 1.2);
      if (G.pt > 0.9) { G.amStage = 3; G.pt = 0; hideBody(!1); setEyes(0); flashScreen(0.3); G.glitch = 0.9; }
      return 1;
    }
    const d = _sw.copy(i).add(new V3(0, 0.6, 0));        // burst out and ram
    dragon.steer(d, 58 + G.level * 2, 3.4, r);
    dragon.jawOpen = damp(dragon.jawOpen, 1, 6, r); dragon.claw = damp(dragon.claw, 1, 4, r);
    G.fogBoost = Math.max(0, (G.fogBoost || 0) - r * 1.5);
    if (P.distanceTo(d) < 4.5) crash();
    return 1;
  }
  function setEyes(op, sc = 1) {
    const h = dragon.head || dragon.root;
    h.getWorldPosition(_sv);
    eyes.forEach((s, k) => {
      s.visible = op > 0.01; s.material.opacity = Math.min(1, op * 1.6); s.scale.setScalar(3.4 * sc);
      s.position.set(_sv.x + (k ? 0.9 : -0.9), _sv.y + 0.4, _sv.z);
    });
  }

  /* ---------- per frame ---------- */
  const veil = $("fogveil");
  let perf = { f: [], act: 0, start: performance.now() };
  function tick(raw, t, e) {
    const sp = G.phase === "plunge" || G.phase === "ambush";
    camK = damp(camK, sp ? 1 : 0, 2.2, raw);
    if (G.phase !== "plunge") { shadow.visible = !1; shadowMat.uniforms.uRim.value = 0; }
    if (G.phase !== "ambush") { if (!dragon.root.visible && G.mode === "play") hideBody(!1); setEyes(0); G.fogBoost = Math.max(0, (G.fogBoost || 0) - raw * 1.2); }
    flyTick(t);
    if (G.task === "hold" && G.phase === "fight") {      // survive: the progress fills by itself
      holdT += t; const k = Math.min(10, Math.floor(holdT / (D0.T / 10)));
      if (k !== G.hits) { G.hits = k; renderHP(); if (k >= 10) retreat(); }
    }
    // U4: a fog veil swallows the fall between towers
    veil.style.opacity = G.phase === "fall" ? (Math.sin(Math.PI * Math.min(1, G.fallT / G.fallDur)) * 0.85).toFixed(3) : 0;
    hudTick();
    if (G.mode === "play" && G.phase !== "over" && !G.paused && !document.hidden) {     // performance_sample
      const ms = raw * 1000; perf.f.push(ms); perf.act += ms;
      if (perf.act >= 30000) {
        const f = perf.f.slice().sort((a, b) => a - b), n = f.length, q = (x) => f[Math.min(n - 1, Math.floor(x * n))], o = (x) => f.filter((v) => v > x).length;
        pg("performance_sample", { target_fps: 60, window_ms: Math.round(performance.now() - perf.start), active_ms: Math.round(perf.act), frame_count: n, fps_avg: +(n * 1000 / perf.act).toFixed(1), fps_p10: +(1000 / q(0.9)).toFixed(1),
          frame_time_p50_ms: +q(0.5).toFixed(2), frame_time_p95_ms: +q(0.95).toFixed(2), frame_time_p99_ms: +q(0.99).toFixed(2), frame_time_max_ms: +f[n - 1].toFixed(1),
          frames_over_50ms: o(50), frames_over_100ms: o(100), frames_over_250ms: o(250), frames_over_500ms: o(500), frames_over_1000ms: o(1000), game_version: GAME_VERSION });
        perf = { f: [], act: 0, start: performance.now() };
      }
    }
  }
  const lbars = COLS.map((c) => { const b = document.createElement("i"); b.style.setProperty("--c", HEX[c]); b.innerHTML = "<b></b>"; $("lantern").append(b); return b; });
  function hudTick() {
    COLS.forEach((c, k) => { lbars[k].firstChild.style.height = (SP.lantern[c] / 9 * 100).toFixed(0) + "%"; lbars[k].classList.toggle("need", G.task === "sparks" && c === G.taskCol); });
    $("shield").dataset.n = SP.shield;
    $("arcHud").style.opacity = G.mode === "play" && G.phase !== "over" ? 1 : 0;
  }

  /* ---------- R5 revive, R6 ads, U5 progress & daily gift, R1 instant start ---------- */
  const rewOK = () => { try { return PG.ready && window.bridge.advertisement.isRewardedSupported; } catch (e) { return !1; } };
  function onGameOver() {
    const b = $("bRevive");
    b.hidden = !(rewOK() && !G.revived); b.disabled = !1;
    if (!b.hidden) pg("revive_offered", { depth: G.depth });
    pg("progression_failed", { step_id: "tower", step_index: G.depth, level: G.level, version: GAME_VERSION });
  }
  $("bRevive").onclick = () => {
    const b = $("bRevive"); if (b.disabled) return; b.disabled = !0;
    let got = !1, done = !1;
    const fin = (ok) => {
      if (done) return; done = !0; b.hidden = !0;
      if (!ok || G.phase !== "over") return;
      G.revived = !0; G.lives = 1; G.dead = !1; renderRes();
      $("over").classList.add("hide"); hud(!0); startRound(); caption("ЕЩЁ ЖИВ");
      pg("revive_used", { depth: G.depth });
    };
    try {
      window.bridge.advertisement.on(window.bridge.EVENT_NAME.REWARDED_STATE_CHANGED, (st) => {
        if (st === "rewarded") got = !0;
        if (st === "closed" || st === "failed") fin(got);
      });
      window.bridge.advertisement.showRewarded("revive");
    } catch (e) { fin(!1); }
    setTimeout(() => fin(got), 90000);
  };
  const today = () => { const d = new Date(); return d.getFullYear() * 1e4 + (d.getMonth() + 1) * 100 + d.getDate(); };
  const _startGame = startGame;
  function onStart() {
    const d = today();
    if (SAVE.giftDay !== d) {
      SAVE.streak = SAVE.lastDay === d - 1 ? (SAVE.streak || 0) + 1 : 1; SAVE.giftDay = d;
      dropLoot(archer.root.position.clone().add(new V3(0, 2.5, 0)), "ice"); SP.shield = Math.min(3, SP.shield + 1);
      pg("daily_gift", { streak: SAVE.streak });
    }
    SAVE.lastDay = d; SAVE.played = 1; save();
    pg("progression_started", { step_id: "run", step_index: 1, version: GAME_VERSION });
  }
  function boot() {
    if (PG.language === "ru") { $("bRevive").lastChild.textContent = "Ожить: смотреть рекламу"; }
    if (!SAVE.played) setTimeout(() => { if (G.mode === "menu") $("bPlay").onclick(); }, 600);       // first visit: straight into the fight
  }
  return { get camK() { return camK; }, SP, dice, absorb, onRound, onShotDown, onRepel, onDragonHit, pickSpecial, plunge, ambush, tick, onGameOver, onStart, boot, spark, retreat };
})();
window.__arc2 = ARC2;
window.__A = { G, SAVE, startSpecial, crash, repel, startRound, gameOver, get dragon() { return dragon; }, get archer() { return archer; } };
