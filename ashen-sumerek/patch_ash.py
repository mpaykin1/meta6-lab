import re
s=open(__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)),'base-artifact-b94ef394.html')).read()
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt,(s.count(old),old[:80])
    s=s.replace(old,new)
pack=open('pack_ash.js').read()
engine=open('ashen_core.js').read()+"\n"+open('ash_gpu.js').read()+"\n"+open('ash_engine.js').read()+"\n"+open('ash_world2.js').read()
# pack, right after the last pack
i=s.index("packEnd();\n\n/* -----------------------------------------------------------------------------\n   2 · World constants")
s=s[:i]+"packEnd();\n\n"+pack+s[i+len("packEnd();\n"):]
# dry biomes: no water
rep("const SEA = 3.8;                       // water surface height","let SEA = 3.8;                         // water surface height (far below the world in a dry biome)")
# terrain: a whole-map plain and a rim of cliffs
rep("hgt[ci(x, z)] = Math.max(1, Math.round(1 + mask * (TER.base + TER.hills * hills) * TER.height));",
    "const mk = Math.max(mask, TER.plain || 0), rim = TER.rim ? TER.rim * smooth(0.74, 1.0, Math.max(Math.abs(nx), Math.abs(nz))) : 0;\n    hgt[ci(x, z)] = Math.max(1, Math.round(1 + mk * (TER.base + TER.hills * hills) * TER.height + rim));")
rep("flyBase[i * 3 + 1] = rr(SEA + 1.5, 13);","flyBase[i * 3 + 1] = rr(Math.max(SEA + 1.5, 2), 13);")
# the dry world is bounded by its cliffs
# render hook
rep("function renderFoes() {\n  foeN = 0;","function renderFoes() {\n  foeN = 0;\n  if (DRY) ashFrame();")
# engine
marker="/* =============================================================================\n   31 · Destruction"
rep(marker, engine+"\n"+marker)
# buildWorld
rep("  const biome = REG.biomes.get(biomeId);\n  world = generateWorld(seed, biomeId);",
"""  const biome = REG.biomes.get(biomeId);
  setBiomeMode(!!biome.dry);
  world = generateWorld(seed, biomeId);""")
rep("  drawMinimapBase();\n  G.best = readBest();\n}","  drawMinimapBase();\n  G.best = readBest();\n  if (DRY) { ashRollRoster(); buildAsh(); } else clearAsh();\n}")
rep("function buildWorld(seed, biomeId = G.biome) {","""function setBiomeMode(dry) {
  DRY = dry; SEA = 3.8; waterU.uSea.value = SEA; water.visible = true; water.position.y = SEA;      // the Ashen island floats in the Island's own sea\n  for (const m of mists) m.visible = true;
}
function buildWorld(seed, biomeId = G.biome) {""")
rep("  get coins() { return coins; },","  get coins() { return coins; },\n  ASH, ashFoes, ashFx, scene, camera, ag, AG, agCatalog, EVT,\n  get ash() { return { DRY, roster: [...ashRoster.on], foeModels: ashFoes.size, pos: [...ashFoes.values()].map((m) => [+m.root.position.x.toFixed(1), +m.root.position.y.toFixed(1), +m.root.position.z.toFixed(1), +m.inst.root.scale.x.toFixed(2), m.root.visible]), props: ashGroup.children.length, structs: world.structures.length, anim: ashAnim.length, rover: !!ashFx.rover, fire: !!ashFx.fire }; },")
# title
rep("<title>Остров сумерек</title>","<title>Сумерки и пепел</title>")
# this game opens on the Ashen island (own storage key, so an earlier saved choice of the dusk island does not hide it)
rep("return localStorage.getItem('isle.biome') || DEFAULT_BIOME; } catch (e) { return DEFAULT_BIOME; }","return localStorage.getItem('ashisle.biome') || 'ashen'; } catch (e) { return 'ashen'; }")
rep("localStorage.setItem('isle.biome', id);","localStorage.setItem('ashisle.biome', id);")
# pixel icons instead of text on the action buttons
j=open('ico_jump.svg').read();a=open('ico_atk.svg').read()
rep('<button class="tbtn atk" id="btnAtk" aria-label="Удар">УДАР</button>','<button class="tbtn atk" id="btnAtk" aria-label="Удар">'+a+'</button>')
rep('<button class="tbtn jump" id="btnJump" aria-label="Прыжок">ПРЫЖОК</button>','<button class="tbtn jump" id="btnJump" aria-label="Прыжок">'+j+'</button>')
rep(".atk:active {",".tbtn svg { display: block; margin: auto; width: 56%; height: 56%; image-rendering: pixelated; pointer-events: none; filter: drop-shadow(0 2px 0 rgba(0,0,0,.35)); }\n.atk:active {")

# ---- weapons atlas: three new 32x32 cells (side view of the original voxel guns, 1 voxel = 1 px) ----
import base64, io, json as _json
from PIL import Image
m = re.search(r'"weapons":"data:image/png;base64,([A-Za-z0-9+/=]+)"', s)
im = Image.open(io.BytesIO(base64.b64decode(m.group(1)))).convert('RGBA')
assert im.size == (256, 128), im.size
big = Image.new('RGBA', (256, 160), (0, 0, 0, 0)); big.paste(im, (0, 0))
spr = _json.load(open('wsprites.json'))
OUT = (0x1a, 0x13, 0x26, 255)
for k, wid in enumerate(['rifle', 'rocket', 'plasma']):
    cell = Image.new('RGBA', (32, 32), (0, 0, 0, 0)); px = cell.load(); data = spr[wid]
    for y in range(32):
        for x in range(32):
            c = data[y][x]
            if c:
                f = 2.1 if c[3] else 1.7
                px[x, y] = tuple(min(255, int(v * 255 * f)) for v in c[:3]) + (255,)
    for y in range(32):
        for x in range(32):
            if px[x, y][3] == 0 and any(0 <= x + dx < 32 and 0 <= y + dy < 32 and px[x + dx, y + dy][3] == 255 and px[x + dx, y + dy] != OUT for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                px[x, y] = OUT
    big.paste(cell, (k * 32, 128))
buf = io.BytesIO(); big.save(buf, 'PNG')
s = s[:m.start(1)] + base64.b64encode(buf.getvalue()).decode() + s[m.end(1):]
rep('"wmeta":{"size":[256,128]', '"wmeta":{"size":[256,160]')
old = '"boomerang":{"cell":[192,64,32,32],"grip":[8,18],"tip":[27,18],"muzzle":[17,11],"base":0}'
rep(old, old + ',"ash_rifle":{"cell":[0,128,32,32],"grip":[10,19],"tip":[30,16],"muzzle":[31,16],"base":0},"ash_rocket":{"cell":[32,128,32,32],"grip":[10,21],"tip":[30,17],"muzzle":[31,17.5],"base":0},"ash_plasma":{"cell":[64,128,32,32],"grip":[8,19],"tip":[30,16],"muzzle":[31,16],"base":0}')
# title logo and the pause catalogue
rep('<p class="eyebrow" id="eyebrow">', '<canvas id="ashLogo" hidden style="image-rendering:pixelated;height:34px;width:auto;margin-bottom:-6px"></canvas>\n  <p class="eyebrow" id="eyebrow">')
rep('<div class="arsenal" id="arsenal"></div>', '<div class="arsenal" id="arsenal"></div>\n  <details class="agcat" id="ashCat" hidden><summary>Каталог Пепельного пути</summary><div id="ashCatBody"></div></details>')
rep('.loading { position: fixed;', '.agcat { width: min(92vw, 1000px); text-align: left; }\n.agcat summary { cursor: pointer; font-size: 15px; letter-spacing: .2em; text-transform: uppercase; color: var(--paper-dim); padding: 8px 0; pointer-events: auto; }\n#ashCatBody { max-height: 36vh; overflow-y: auto; pointer-events: auto; }\n.agrow { display: flex; flex-wrap: wrap; gap: 10px; margin: 6px 0 12px; }\n.agrow figure { margin: 0; display: flex; flex-direction: column; gap: 4px; max-width: 360px; }\n.agrow canvas { image-rendering: pixelated; background: #1a1a22; max-width: 100%; }\n.agrow figcaption { font-size: 12px; color: var(--paper-dim); }\n.loading { position: fixed;')
rep("  for (const m of mists) m.visible = true;\n}", "  for (const m of mists) m.visible = !DRY;\n  const ac = document.getElementById('ashCat'); if (ac) ac.hidden = !DRY;\n}\ndocument.getElementById('ashCat').addEventListener('toggle', () => agCatalog());")

rep('uniform float uTime; uniform vec3 uCoreK[16]; uniform vec3 uRimK[16]; uniform vec4 uShapeK[16];','uniform float uTime; uniform vec3 uCoreK[24]; uniform vec3 uRimK[24]; uniform vec4 uShapeK[24];')
rep('uniform float uTime; uniform vec3 uAuraK[16]; uniform vec4 uShapeK[16];','uniform float uTime; uniform vec3 uAuraK[24]; uniform vec4 uShapeK[24];')
rep('const MAX_KINDS = 16;','const MAX_KINDS = 24;')

# Island weather and folk also visit the Ashen island: thunderstorm, starfall, the fisher, the storm glass
rep("  toast: 'Над островом собирается гроза',\n  biomes: ['dusk'],","  toast: 'Над островом собирается гроза',\n  biomes: ['dusk', 'ashen'],")
rep("    toast: 'Звездопад! Загадай желание',\n    biomes: ['dusk'],","    toast: 'Звездопад! Загадай желание',\n    biomes: ['dusk', 'ashen'],")
rep("name: 'Рыбак', art: 'fisher', biomes: ['dusk'],","name: 'Рыбак', art: 'fisher', biomes: ['dusk', 'ashen'],")
rep("biomes: ['dusk'],                       // storms only gather over the dusk island","biomes: ['dusk', 'ashen'],")


# the Island's shades, imps, lantern and rose jellies, the Morok fog, and the frost foes, blizzard and aurora also visit the Ashen island (the fog, blizzard and aurora about once a minute)
rep("  warn: true,\n  biomes: ['dusk'],\n  chance: 0.25, duration: [30, 45], cooldown: 80,","  warn: true,\n  biomes: ['dusk', 'ashen'],\n  chance: 0.25, duration: [30, 45], cooldown: 80, ashChance: 0.7, ashCool: 30,")
rep("  biomes: ['frost'],\n  chance: 0.35, duration: [35, 50], cooldown: 70,","  biomes: ['frost', 'ashen'],\n  chance: 0.35, duration: [35, 50], cooldown: 70, ashChance: 0.7, ashCool: 30,")
rep("  biomes: ['frost'],\n  chance: 0.3, duration: [30, 40], cooldown: 60,","  biomes: ['frost', 'ashen'],\n  chance: 0.3, duration: [30, 40], cooldown: 60, ashChance: 0.7, ashCool: 30,")
rep("icon: 'rime_charm', rar: 'epic', biomes: ['frost'] }","icon: 'rime_charm', rar: 'epic', biomes: ['frost', 'ashen'] }")
rep("spawn: Object.assign({}, IMP.spawn, { biomes: ['frost'] })","spawn: Object.assign({}, IMP.spawn, { biomes: ['frost', 'ashen'] })")
rep("spawn: { from: 'sea', priority: 4, every: 6, dist: [9, 20], biomes: ['dusk'],","spawn: { from: 'sea', priority: 4, every: 6, dist: [9, 20], biomes: ['dusk', 'ashen'],")
rep("Math.random() < (ev.chance ?? 0.2)","Math.random() < ((DRY && ev.ashChance) || (ev.chance ?? 0.2))")
rep("EVT.cool = ev.cooldown ?? 60;","EVT.cool = (DRY && ev.ashCool) || (ev.cooldown ?? 60);")

rep('  bloom.strength = pal.bloom + beacon.flare * 0.45 + G.hurt * 0.25;','  bloom.strength = (pal.bloom + beacon.flare * 0.45 + G.hurt * 0.25) * 0.12;')

# Owner-requested clean screen: reproducible overlay generated from this source, no hand edits to the playable HTML.
# The warning belongs to the module; never reach its lexical variables from a classic script.
rep("  agWarnEl.textContent = text || agWarnEl.textContent; agWarnEl.style.opacity = text ? '1' : '0';", "  window.__ashDangerText = text || '';\n  document.body.classList.toggle('ashDanger', Boolean(text));\n  agWarnEl.textContent = '';\n  agWarnEl.style.opacity = '0';\n  agWarnEl.style.display = 'none';")
ASH_CLEAN_SCREEN = r'''
<style id="ash-clean-screen">
/* The game keeps icons, life hearts, minimap, weapon-meter and 3D feedback; labels live in the pause menu. */
#hud #coinN, #hud #coinT, #hud #timer, #hud #wName, #hud #wStat, #hud #wAmmo,
#hud #toast, #hud #wNew, #hud #npcSay, #hud .boss > span,
#hud #hotbar .slot > span, #hud .dmg { display: none !important; }
#ashMenuButton { display: none; position: fixed; right: max(14px,env(safe-area-inset-right)); top: max(12px,env(safe-area-inset-top)); z-index: 999; width: 44px; height: 44px; border: 1px solid #c6a78099; border-radius: 9px; background: #14121ccc; color: #f7ddab; padding: 9px; cursor: pointer; place-items: center; backdrop-filter: blur(7px); }
body:has(#hud:not([hidden])) #ashMenuButton { display: grid; }
#ashMenuButton svg { width: 25px; height: 25px; pointer-events: none; }
#scrPause { max-height: 100dvh; overflow-y: auto; padding-top: max(40px,env(safe-area-inset-top)); padding-bottom: max(22px,env(safe-area-inset-bottom)); }
#scrPause #tools { position: static !important; display: flex !important; width: auto; margin: 12px auto; justify-content: center; gap: 12px; }
#ashMenuInfo { width: min(86vw,540px); margin: 10px auto 16px; border: 1px solid #bda56b55; padding: 12px 14px; background: #130f1dba; color: #e6dec8; text-align: left; font: 13px/1.7 system-ui, sans-serif; }
#ashMenuInfo h3 { margin: 0 0 8px; font-size: 15px; color: #f4d28f; }
#ashMenuInfo p { margin: 2px 0; }
#ashMenuInfo span { color: #ffebbd; }
body.ashDanger::after { content: ""; position: fixed; z-index: 6; inset: 0; box-shadow: inset 0 0 70px 12px #9b182843; pointer-events: none; animation: ashWarningPulse 1.3s ease-in-out infinite alternate; }
@keyframes ashWarningPulse { from { opacity: .28; } to { opacity: .84; } }
</style>
<button id="ashMenuButton" aria-label="Меню" title="Меню" type="button"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>
<script>
(function () {
  'use strict';
  const pause = document.getElementById('scrPause');
  const button = document.getElementById('ashMenuButton');
  const tools = document.getElementById('tools');
  if (!pause || !button) return;
  const info = document.createElement('section');
  info.id = 'ashMenuInfo';
  info.setAttribute('aria-label', 'Игровая информация');
  info.innerHTML = '<h3>Находки и состояние</h3><p>Монеты: <span id="ashInfoCoins"></span></p><p>Время: <span id="ashInfoTime"></span></p><p>Оружие: <span id="ashInfoWeapon"></span></p><p>Характеристики: <span id="ashInfoStats"></span></p><p>Патроны: <span id="ashInfoAmmo"></span></p><p>Событие: <span id="ashInfoEvent"></span></p>';
  const arsenal = document.getElementById('arsenal');
  pause.insertBefore(info, arsenal || null);
  if (tools) pause.appendChild(tools);
  const read = (id) => (document.getElementById(id)?.textContent || '').trim();
  function syncInfo() {
    document.getElementById('ashInfoCoins').textContent = read('coinN') + ' ' + read('coinT');
    document.getElementById('ashInfoTime').textContent = read('timer');
    document.getElementById('ashInfoWeapon').textContent = read('wName');
    document.getElementById('ashInfoStats').textContent = read('wStat');
    document.getElementById('ashInfoAmmo').textContent = read('wAmmo');
    document.getElementById('ashInfoEvent').textContent = window.__ashDangerText || read('toast') || read('npcSay') || '—';
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
s = s.replace('</body></html>', ASH_CLEAN_SCREEN + '</body></html>')
open('index.html','w').write(s)
print(len(s))
