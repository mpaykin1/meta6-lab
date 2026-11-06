import re
s=open('base-artifact-b94ef394.html').read()
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt,(s.count(old),old[:80])
    s=s.replace(old,new)
pack=open('pack.js').read()
engine=open('uw_models.js').read()+open('city.js').read()+open('portal.js').read()
# imports
rep("import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';","import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';\nimport { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';\nimport { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';")
# pack: right after the last pack, before packEnd of keeper? insert after 'packEnd();' that closes keeper
i=s.index("packEnd();\n\n/* -----------------------------------------------------------------------------\n   2 · World constants")
s=s[:i]+"packEnd();\n\n"+pack+s[i+len("packEnd();\n"):]
# sea level is a variable
rep("const SEA = 3.8;                       // water surface height","let SEA = 3.8;                         // water surface height (far below the world in an underwater biome)\nlet UW = false;                        // underwater biome: swim physics, 3D sea creatures")
# seabed relief
rep("hgt[ci(x, z)] = Math.max(1, Math.round(1 + mask * (TER.base + TER.hills * hills) * TER.height));",
    "hgt[ci(x, z)] = Math.max(1, Math.round(1 + mask * (TER.base + TER.hills * hills) * TER.height + (TER.seabed ? (1 - mask) * (0.25 + fbm(x * 0.085 + oz + 40, z * 0.085 + ox + 40, 3)) * TER.seabed : 0)));")
# fireflies
rep("flyBase[i * 3 + 1] = rr(SEA + 1.5, 13);","flyBase[i * 3 + 1] = rr(Math.max(SEA + 1.5, 2), 13);")
# physics
rep("  v.y = Math.max(-28, v.y - PL.grav * (v.y < 0 ? 1.3 : 1) * h);",
"""  if (UW) v.y += ((player.jumpHeld ? 4.6 : -2.4) - v.y) * Math.min(1, 2.8 * h);      // buoyancy: hold jump to rise, let go to sink slowly
  else v.y = Math.max(-28, v.y - PL.grav * (v.y < 0 ? 1.3 : 1) * h);""")
rep("const speed = PL.speed * STATS.speed * (player.inWater ? 0.62 * STATS.swim : 1) * mul;","const speed = PL.speed * STATS.speed * (UW ? 0.82 : player.inWater ? 0.62 * STATS.swim : 1) * mul;")
rep("const f = damp(player.onGround ? PL.accG * groundGrip() : PL.accA, dt);","const f = damp(UW ? (player.onGround ? 7 : 3.2) : player.onGround ? PL.accG * groundGrip() : PL.accA, dt);")
rep("  if (player.jumpBuf > 0 && player.coyote > 0) {","  if (!UW && player.jumpBuf > 0 && player.coyote > 0) {")
rep("  if (!player.jumpHeld && v.y > 2 && !player.jumpCut) {","  if (!UW && !player.jumpHeld && v.y > 2 && !player.jumpCut) {")
rep("  player.inWater = p.y < SEA - 0.05;",
"""  if (UW) {
    p.x = clamp(p.x, 1.3, W - 1.3); p.z = clamp(p.z, 1.3, D - 1.3);
    if (p.y > H - 7.5) travel(homeBiome, 'surface');
    if (p.y > H - 5) { p.y = H - 5; if (v.y > 0) v.y = 0; }
    if (Math.random() < dt * (3 + Math.hypot(v.x, v.z) * 1.5)) dust.emit(p.x + rr(-0.25, 0.25), p.y + rr(0.4, 1.3), p.z + rr(-0.25, 0.25), rr(-0.15, 0.15), rr(0.6, 1.2), rr(-0.15, 0.15), rr(1.2, 2.2), 0.05, 0.08, C.spray, 0.6, -0.2, 0.4, 1);
    if (Math.random() < dt * 14) dust.emit(p.x + rr(-9, 9), p.y + rr(-2, 7), p.z + rr(-9, 9), rr(-0.1, 0.1), rr(0.15, 0.5), rr(-0.1, 0.1), rr(2.5, 4), 0.04, 0.07, C.spray, 0.4, -0.2, 0.4, 1);
  }
  player.inWater = p.y < SEA - 0.05;""")
rep("  if (p.y < SEA - 1.25 && G.state === 'play') { drown(); return; }","  if (p.y < SEA - 1.25 && G.state === 'play') { if (!UW) { travel('sunken', 'dive'); return; } drown(); return; }")
rep("  const m = Math.hypot(ix, iz);\n  if (m > 1) { ix /= m; iz /= m; }","  if (portalBusy) { ix = iz = 0; player.jumpHeld = portalMode === 'surface'; }\n  const m = Math.hypot(ix, iz);\n  if (m > 1) { ix /= m; iz /= m; }")
# spawners
rep("if (d.spawn && (d.spawn.from === 'sea' || d.spawn.from === 'land')) SPAWNERS.push(d);","if (d.spawn && (d.spawn.from === 'sea' || d.spawn.from === 'land' || d.spawn.from === 'deep')) SPAWNERS.push(d);")
rep("function spawnFrom(def) {\n  const sp = def.spawn, dist = sp.dist || [12, 26];","function spawnFrom(def) {\n  if (def.spawn.from === 'deep') return spawnDeep(def);\n  const sp = def.spawn, dist = sp.dist || [12, 26];")
# render
rep("function renderFoes() {\n  foeN = 0;","function renderFoes() {\n  foeN = 0;\n  if (UW) { updateCity(); sweepFoeModels(); } else if (foeModels.size) clearFoeModels();")
# engine block before Destruction
marker="/* =============================================================================\n   31 · Destruction"
rep(marker, engine+"\n"+marker)
# sticky aim, underwater only
rep("""    let best = 1e9;
    for (const f of foes) {
      if (!foeAlive(f)) continue;
      const h = f.segs[0], dx = h.x - ox, dz = h.z - oz, d = Math.hypot(dx, dz);
      if (d > R + f.def.rad) continue;
      const cos = (dx * player.look.x + dz * player.look.z) / (d || 1);
      const score = d * (1.7 - cos);
      if (cos > -0.3 && score < best) { best = score; tgt = f; }
    }
    if (tgt) aim.dir.set(tgt.segs[0].x - ox, 0, tgt.segs[0].z - oz).normalize();
    else aim.dir.copy(player.look);""",
"""    if (!UW) {
    let best = 1e9;
    for (const f of foes) {
      if (!foeAlive(f)) continue;
      const h = f.segs[0], dx = h.x - ox, dz = h.z - oz, d = Math.hypot(dx, dz);
      if (d > R + f.def.rad) continue;
      const cos = (dx * player.look.x + dz * player.look.z) / (d || 1);
      const score = d * (1.7 - cos);
      if (cos > -0.3 && score < best) { best = score; tgt = f; }
    }
    if (tgt) aim.dir.set(tgt.segs[0].x - ox, 0, tgt.segs[0].z - oz).normalize();
    else aim.dir.copy(player.look);
    } else {
    // ported from three-worlds (combat-facing.mjs): keep the current live enemy, else the closest in weapon range (not filtered by walk direction);
    // the weapon turns toward it with angular inertia instead of snapping
    let bestD = 1e9;
    const cur = aim.target;
    if (cur && foeAlive(cur) && Math.hypot(cur.segs[0].x - ox, cur.segs[0].z - oz) <= R + cur.def.rad) tgt = cur;
    else for (const f of foes) {
      if (!foeAlive(f)) continue;
      const h = f.segs[0], d = Math.hypot(h.x - ox, h.z - oz);
      if (d <= R + f.def.rad && d < bestD) { bestD = d; tgt = f; }
    }
    if (tgt) {
      const from = Math.atan2(aim.dir.z, aim.dir.x), to = Math.atan2(tgt.segs[0].z - oz, tgt.segs[0].x - ox);
      const a = from + Math.atan2(Math.sin(to - from), Math.cos(to - from)) * (1 - Math.exp(-12 * Math.max(0, dt)));
      aim.dir.set(Math.cos(a), 0, Math.sin(a));
    } else aim.dir.copy(player.look);
    }""")
# buildWorld: biome mode first, city after
rep("  const biome = REG.biomes.get(biomeId);\n  world = generateWorld(seed, biomeId);",
"""  const biome = REG.biomes.get(biomeId);
  setBiomeMode(!!biome.underwater);
  world = generateWorld(seed, biomeId);""")
rep("  drawMinimapBase();\n  G.best = readBest();\n}","  drawMinimapBase();\n  G.best = readBest();\n  if (UW) buildCity(); else clearCity();\n}")
rep("function buildWorld(seed, biomeId = G.biome) {","""function setBiomeMode(uw) {
  UW = uw; SEA = UW ? -200 : 3.8; waterU.uSea.value = SEA; water.visible = !UW; water.position.y = SEA;
  for (const m of mists) m.visible = !UW;
  if (UW) preloadUW();
}
function buildWorld(seed, biomeId = G.biome) {""")
# portal overlay css + icons
rep('<div class="loading" id="loading">','<style>#portal{position:fixed;inset:0;z-index:8;pointer-events:none;opacity:0;transition:opacity .9s ease}</style>\n<div class="loading" id="loading">') if '<div class="loading" id="loading">' in s else None
# debug handle
rep("  get coins() { return coins; },","  get coins() { return coins; },\n  get uw() { return { UW, uwFail, models: foeModels.size, city: [CITY.mixers.length, CITY.movers.length, CITY.schools.length, CITY.group && CITY.group.children.length], cache: Object.keys(uwCache), SEA, homeBiome }; },\n  travel, spawnDeep,")
# pixel icons
j=open('ico_jump.svg').read();a=open('ico_atk.svg').read()
rep('<button class="tbtn atk" id="btnAtk" aria-label="Удар">УДАР</button>','<button class="tbtn atk" id="btnAtk" aria-label="Удар">'+a+'</button>')
rep('<button class="tbtn jump" id="btnJump" aria-label="Прыжок">ПРЫЖОК</button>','<button class="tbtn jump" id="btnJump" aria-label="Прыжок">'+j+'</button>')
rep(".atk:active {",".tbtn svg { display: block; margin: auto; width: 56%; height: 56%; image-rendering: pixelated; pointer-events: none; filter: drop-shadow(0 2px 0 rgba(0,0,0,.35)); }\n.atk:active {")

# The loading transition must not reopen the title after startGame() has begun.
rep("    $('scrTitle').hidden = false;\n    renderMenu();", "    if (G.state === 'title') { $('scrTitle').hidden = false; renderMenu(); }")

# Clean screen is generated, not hand-edited into index.html.
UW_CLEAN_SCREEN = r'''
<style id="uw-clean-screen">
/* Keep health icons, 3D world, map, weapon icon and charge bar; move words into the menu. */
#hud #coinN, #hud #coinT, #hud #timer, #hud #wName, #hud #wStat, #hud #wAmmo,
#hud #toast, #hud #wNew, #hud #npcSay, #hud .boss > span,
#hud #hotbar .slot > span, #hud .dmg { display: none !important; }
#uwMenuButton { display: none; position: fixed; top: max(12px,env(safe-area-inset-top)); right: max(14px,env(safe-area-inset-right)); z-index: 999; width: 44px; height: 44px; padding: 9px; border: 1px solid #c6a78099; border-radius: 9px; background: #14121ccc; color: #f7ddab; cursor: pointer; place-items: center; backdrop-filter: blur(7px); }
body:has(#hud:not([hidden])) #uwMenuButton { display: grid; }
#uwMenuButton svg { width: 25px; height: 25px; pointer-events: none; }
#scrPause { max-height: 100dvh; overflow-y: auto; padding-top: max(40px,env(safe-area-inset-top)); padding-bottom: max(22px,env(safe-area-inset-bottom)); }
#scrPause #tools { position: static !important; display: flex !important; width: auto; margin: 12px auto; justify-content: center; gap: 12px; }
#uwMenuInfo { width: min(86vw,540px); margin: 10px auto 16px; border: 1px solid #bda56b55; padding: 12px 14px; background: #130f1dba; color: #e6dec8; text-align: left; font: 13px/1.7 system-ui, sans-serif; }
#uwMenuInfo h3 { margin: 0 0 8px; font-size: 15px; color: #f4d28f; }
#uwMenuInfo p { margin: 2px 0; }
#uwMenuInfo span { color: #ffebbd; }
</style>
<button id="uwMenuButton" aria-label="Меню" title="Меню" type="button"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>
<script>
(function () {
  'use strict';
  const pause = document.getElementById('scrPause');
  const button = document.getElementById('uwMenuButton');
  const tools = document.getElementById('tools');
  if (!pause || !button) return;
  const info = document.createElement('section');
  info.id = 'uwMenuInfo';
  info.setAttribute('aria-label', 'Игровая информация');
  info.innerHTML = '<h3>Находки и состояние</h3><p>Монеты: <span id="uwInfoCoins"></span></p><p>Время: <span id="uwInfoTime"></span></p><p>Оружие: <span id="uwInfoWeapon"></span></p><p>Характеристики: <span id="uwInfoStats"></span></p><p>Патроны: <span id="uwInfoAmmo"></span></p><p>Событие: <span id="uwInfoEvent"></span></p>';
  pause.insertBefore(info, document.getElementById('arsenal') || null);
  if (tools) pause.appendChild(tools);
  const read = (id) => (document.getElementById(id)?.textContent || '').trim();
  function syncInfo() {
    document.getElementById('uwInfoCoins').textContent = read('coinN') + ' ' + read('coinT');
    document.getElementById('uwInfoTime').textContent = read('timer');
    document.getElementById('uwInfoWeapon').textContent = read('wName');
    document.getElementById('uwInfoStats').textContent = read('wStat');
    document.getElementById('uwInfoAmmo').textContent = read('wAmmo');
    document.getElementById('uwInfoEvent').textContent = read('toast') || read('npcSay') || '—';
  }
  button.addEventListener('click', function () {
    const state = window.__isle?.G?.state;
    if (state === 'play') {
      syncInfo();
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', key: 'Escape', bubbles: true }));
      window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Escape', key: 'Escape', bubbles: true }));
    } else if (state === 'paused') {
      document.getElementById('btnResume')?.click();
    }
  });
  new MutationObserver(function () { if (!pause.hidden) syncInfo(); }).observe(pause, { attributes: true, attributeFilter: ['hidden'] });
})();
</script>
'''
assert s.count('</body></html>') == 1
s = s.replace('</body></html>', UW_CLEAN_SCREEN + '</body></html>')
open('index.html','w').write(s)
print(len(s))
