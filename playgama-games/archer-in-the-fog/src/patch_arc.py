import sys
p = '/home/claude/arc/work/game.js'
s = open(p, encoding='utf8').read()

def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, (a[:80], c)
    s = s.replace(a, b)

# ---------- captions: English by default, Russian when the platform says ru ----------
rep('''function caption(r) {
  ((capQ = r.split(" ")), (capT = 0), showWord());
}''', '''const CAP_EN = { "ОН СНОВА ЗДЕСЬ": "HE IS BACK", "СБЕЙ ОГОНЬ": "SHOOT THE FIRE", "СБЕЙ ВСЕ": "SHOOT THEM ALL", "ОН РАСПАДЁТСЯ": "IT WILL SPLIT",
  "ТАРАН ГОЛОВОЙ": "HEAD RAM", "УДАР ХВОСТОМ": "TAIL SWIPE", "ОТБИТ": "REPELLED", "ПАДЕНИЕ": "FALLING", "ЕЩЁ ЖИВ": "STILL ALIVE", "ЗАМОРОЖЕН": "FROZEN",
  "+ ЖИЗНЬ": "+ LIFE", "+3 ЛЕДЯНЫЕ": "+3 ICE", "СБИТ": "SHOT DOWN", "ПИКЕ": "PLUNGE", "ИЗ ТУМАНА": "FROM THE FOG", "ЩИТ": "SHIELD" };
const CAP_RU = { "DRAGON RETREATS": "ДРАКОН ОТСТУПАЕТ" };
function caption(r) {
  r = PG.language === "ru" ? CAP_RU[r] || r : CAP_EN[r] || r;
  ((capQ = r.split(" ")), (capT = 0), showWord());
}''')

# ---------- R5/R6: interstitial on Retry/Menu (not over the result), rewarded revive once per run ----------
rep('''function gameOver() {
  (pgInterstitial(),
    (G.phase = "over"),''', '''function gameOver() {
  (ARC2.onGameOver(),
    (G.phase = "over"),''')
rep('''$("bRetry").onclick = () => startGame();''', '''$("bRetry").onclick = () => (pgInterstitial(), startGame());''')
rep('''$("bOvMenu").onclick = () => {
  ($("over").classList.add("hide"),''', '''$("bOvMenu").onclick = () => {
  (pgInterstitial(), $("over").classList.add("hide"),''')

# ---------- R7: icons instead of emoji/text ----------
rep('''function renderRes() {
  (($("hearts").textContent = "♥".repeat(Math.max(0, G.lives || 0))),
    ($("coins").textContent = "● " + SAVE.coins),
    ($("bFreeze").textContent = "❄ " + (G.freezeAmmo || 0)),''', '''function renderRes() {
  (($("hearts").innerHTML = '<i class="ht"></i>'.repeat(Math.max(0, G.lives || 0))),
    ($("coins").innerHTML = '<i class="cn"></i>' + SAVE.coins),
    ($("bFreeze").innerHTML = ICON_ICE + "<b>" + (G.freezeAmmo || 0) + "</b>"),''')
rep('''function showRepel() {
  const r = $("hint");
  ((r.textContent = "REPEL THE ATTACK: " + Math.min(G.repelHits, G.repelNeed) + " / " + G.repelNeed), (r.style.opacity = 1));
}''', '''function showRepel() {
  const r = $("repel");
  r.innerHTML = Array.from({ length: G.repelNeed }, (e, t) => '<i class="' + (t < G.repelHits ? "on" : "") + '"></i>').join("");
  r.style.opacity = 1;
}''')

# ---------- new attacks join the repel list, the danger tint and the camera ----------
rep('''  ["windup", "dive", "tail", "spin"].includes(G.phase)
    ? ((G.repelHits += i * (r.freeze ? 2 : 1)), showRepel(), G.repelHits >= G.repelNeed && repel())''',
    '''  ["windup", "dive", "tail", "spin", "plunge", "ambush"].includes(G.phase)
    ? ((G.repelHits += i * (r.freeze ? 2 : 1)), showRepel(), G.repelHits >= G.repelNeed && repel())''')
rep('''        : ["windup", "dive", "tail", "spin"].includes(G.phase)''', '''        : ["windup", "dive", "tail", "spin", "plunge", "ambush"].includes(G.phase)''')
rep('''    const a = ["windup", "dive", "tail", "spin"].includes(G.phase) ? 1 : 0;''', '''    const a = ["windup", "dive", "tail", "spin", "plunge", "ambush"].includes(G.phase) ? 1 : 0;''')
rep('''    G.phase === "windup" || G.phase === "dive" || G.phase === "fall"''', '''    G.phase === "windup" || G.phase === "dive" || G.phase === "fall" || G.phase === "plunge"''')
rep('''        .addScaledVector(G.camDir, -7.6)
        .addScaledVector(h, -0.7)
        .add(new V3(0, 2.2, 0))),''', '''        .addScaledVector(G.camDir, -7.6 - 9 * ARC2.camK)
        .addScaledVector(h, -0.7 - 2 * ARC2.camK)
        .add(new V3(0, 2.2 + 2.6 * ARC2.camK, 0))),''')
rep('''(scene.fog.density = TH.dens)''', '''(scene.fog.density = TH.dens * (1 + (G.fogBoost || 0) * 1.6))''')

# ---------- tasks other than «hits» count their own progress ----------
rep('''    : (G.phase === "fight" || G.phase === "intro") &&
      ((G.hits = Math.min(G.need, G.hits + i)),''', '''    : (G.phase === "fight" || G.phase === "intro") &&
      (ARC2.onDragonHit(), G.task && G.task !== "hits" ? (G.hits = G.hits) : (G.hits = Math.min(G.need, G.hits + i)),''')

# ---------- shield: a crash is turned into a repel ----------
rep('''function crash(r) {
  ((G.lives''', '''function crash(r) {
  if (ARC2.absorb()) return;
  ((G.lives''')

# ---------- spark triggers ----------
rep('''            (G.shotDown = (G.shotDown || 0) + 1),''', '''            (G.shotDown = (G.shotDown || 0) + 1),
            ARC2.onShotDown(f),''')
rep('''function repel() {
  ((G.phase = "stagger"),''', '''function repel() {
  (ARC2.onRepel(),
    (G.phase = "stagger"),''')

# ---------- new special attacks: choose among all, never the same twice in a row ----------
rep('''    r.tail && Math.random() < 0.5
      ? ((G.phase = "tail"),''', '''    ARC2.pickSpecial(r) ||
    (r.tail && Math.random() < 0.5
      ? ((G.phase = "tail"),''')
rep('''      : ((G.phase = "windup"), caption("ТАРАН ГОЛОВОЙ")),
    showRepel());''', '''      : ((G.phase = "windup"), (G.lastSpecial = "windup"), caption("ТАРАН ГОЛОВОЙ"))),
    showRepel());''')
rep('''    case "over": {''', '''    case "plunge": {
      s = ARC2.plunge(r, e, i) ?? 1;
      break;
    }
    case "ambush": {
      s = ARC2.ambush(r, e, i, t) ?? 1;
      break;
    }
    case "over": {''')

# ---------- runs, rounds, game ready ----------
rep('''    (G.lives = 3),
    (G.dead = !1),''', '''    (G.lives = 3),
    (G.dead = !1),
    (G.revived = !1),''')
rep('''    (G.orbitDir = Math.random() < 0.5 ? 1 : -1));
}''', '''    (G.orbitDir = Math.random() < 0.5 ? 1 : -1),
    ARC2.onRound());
}''')
rep('''frame();
PG.ready && requestAnimationFrame(() => window.bridge.platform.sendMessage("game_ready"));''', '''frame();
PG.ready && requestAnimationFrame(() => window.bridge.platform.sendMessage("game_ready"));
ARC2.boot();''')

# ---------- the module ----------
mod = open('/home/claude/arc/work/arc2_module.js', encoding='utf8').read()
anchor = '''initWorld();
const clock = new Clock();'''
assert s.count(anchor) == 1
s = s.replace(anchor, mod + '\n' + anchor)
open(p, 'w', encoding='utf8').write(s)
print('patched')

s = open(p, encoding='utf8').read()
def rep2(a, b, n=1):
    global s
    c = s.count(a); assert c == n, (a[:80], c); s = s.replace(a, b)
rep2('''    if (G.mode === "play") updateGame(t, e);''', '''    if (G.mode === "play") (updateGame(t, e), ARC2.tick(r, t, e));''')
rep2('''(G.orbitA += r * (0.42 + G.level * 0.035) * G.orbitDir)''', '''(G.orbitA += r * (0.42 + G.level * 0.035) * G.orbitDir * (G.orbitBoost || 1))''')
rep2('''    (G.revived = !1),''', '''    (G.revived = !1),
    ARC2.onStart(),''')
# СОСТАВ: new sections + a new history line (baseline set after the first run)
rep2('''    extra: [
      ["игрок не видит счётчик", () => !document.querySelector("[data-inv]")],''', '''    extra: [
      ["R1 мгновенный старт для новичка", () => t(ARC2.boot, "SAVE.played")],
      ["R5 воскрешение за рекламу", () => !!$("bRevive")],
      ["R6 реклама на «Снова», не на экране поражения", () => t(gameOver, "onGameOver") && !t(gameOver, "pgInterstitial")],
      ["R7 кнопки-значки, без эмодзи", () => !$("bFreeze").textContent.includes("❄") && !!$("bShop").querySelector("svg")],
      ["внешних загрузок нет (Bridge и шрифт локально)", () => ![...document.scripts].some((x) => x.src && new URL(x.src).host !== location.host) && !document.querySelector('link[href*="googleapis"]')],
      ["игрок не видит счётчик", () => !document.querySelector("[data-inv]")],''')
rep2('''      "Уровни и погода": {''', '''      "Удержание и универсальные улучшения (2.0)": {
        fn: ["ARC2"].length ? ["caption", "showRepel", "renderRes", "gameOver", "startSpecial", "crash"] : [],
        data: [
          ["цвета искр", () => Object.keys(ARC2.SP.lantern).length, 4],
          ["пипсы щита", () => $("shield").children.length, 3],
          ["столбики фонаря", () => $("lantern").children.length, 4],
          ["задания башен", () => new Set([1, 2, 3, 4, 5, 6, 7, 8].map((d) => ARC2.dice(d).task)).size, 4],
          ["характеры дракона", () => new Set([1, 2, 3, 4, 5, 6, 7, 8].map((d) => ARC2.dice(d).temp)).size, 4],
          ["соседние башни не повторяются", () => ([2, 3, 4, 5, 6, 7, 8].every((d) => ARC2.dice(d).task !== ARC2.dice(d + 1).task) ? 1 : 0), 1],
          ["новые атаки (пике, из тумана)", () => ["plunge", "ambush"].filter((c) => t(updateGame, "case '" + c + "'")).length, 2],
          ["тень пике и глаза в тумане", () => (t(ARC2.plunge, "uRim") && t(ARC2.ambush, "setEyes") ? 2 : 0), 2],
          ["туман при падении", () => ($("fogveil") ? 1 : 0), 1],
          ["щит превращает таран в отбив", () => (t(crash, "absorb") ? 1 : 0), 1],
          ["подписи EN/RU", () => Object.keys(CAP_EN).length, 16],
        ],
      },
      "Уровни и погода": {''')
rep2('''        22450,
      ],
    ],''', '''        22450,
      ],
      ["+ 2.0: R1–R11, искры (4 цвета, щит, фонарь), генератор башен, пике в замедлении, атака из тумана, туман при падении, ежедневный подарок, воскрешение", 22498],
    ],''')
open(p, 'w', encoding='utf8').write(s)
print('patched 2')
