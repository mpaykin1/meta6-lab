import re
s=open('base-artifact-b94ef394.html').read()
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt,(s.count(old),old[:80])
    s=s.replace(old,new)
pack=open('pack_ash.js').read()
engine=open('ashen_core.js').read()+"\n"+open('ash_engine.js').read()
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
rep("  player.inWater = p.y < SEA - 0.05;","  if (DRY) { p.x = clamp(p.x, 1.3, W - 1.3); p.z = clamp(p.z, 1.3, D - 1.3); }\n  player.inWater = p.y < SEA - 0.05;")
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
  DRY = dry; SEA = DRY ? -200 : 3.8; waterU.uSea.value = SEA; water.visible = !DRY; water.position.y = SEA;
  for (const m of mists) m.visible = !DRY;
}
function buildWorld(seed, biomeId = G.biome) {""")
rep("  get coins() { return coins; },","  get coins() { return coins; },\n  ASH, ashFoes, ashFx, scene, camera,\n  get ash() { return { DRY, roster: [...ashRoster.on], foeModels: ashFoes.size, pos: [...ashFoes.values()].map((m) => [+m.root.position.x.toFixed(1), +m.root.position.y.toFixed(1), +m.root.position.z.toFixed(1), +m.inst.root.scale.x.toFixed(2), m.root.visible]), props: ashGroup.children.length, structs: world.structures.length, anim: ashAnim.length, rover: !!ashFx.rover, fire: !!ashFx.fire }; },")
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
open('index.html','w').write(s)
print(len(s))
