// Permanent trap (OSHIBKI): the route must hand out the NEXT waypoint once the hero stands
// on the current one, finish on the real coin, and re-plan after the hero is knocked off.
// Node only (no npm): the adapter runs in a vm against a fake, read-only __isle world.
// Usage: node trap-waypoint-advance.mjs [adapter.js ...]  — exit 1 if any adapter fails.
import fs from 'node:fs';
import vm from 'node:vm';
const files = process.argv.slice(2).length ? process.argv.slice(2)
  : ['games/twilight-isle-classic/bot-adapter.js', 'games/twilight-isles/bot-adapter.js'];
const side = 16;
function world() {
  const reach = new Uint8Array(side * side), stand = new Int16Array(side * side).fill(1);
  for (let x = 1; x < 15; x++) for (let z = 6; z <= 8; z++) { reach[x + side * z] = 1; stand[x + side * z] = 5; }
  return { seed: 7, biome: 'isle', reach, stand, spawn: { x: 1.5, z: 7.5 }, beacon: { x: 14, z: 7 }, ring: { x: 14, z: 7 }, coins: [{ x: 12.5, z: 7.5 }] };
}
function load(file, hero) {
  const w = world(); const coin = { x: 12.5, y: 5, z: 7.5, alive: true };
  const player = { pos: hero, hp: 6 };
  const win = { __isle: { G: { state: 'play', all: false, collected: 0, kills: 0, wardenDown: false }, player, world: w, combat: { arsenal: [1] }, coins: [coin], foes: [] } };
  const sandbox = { window: win, document: { title: 'trap' }, Object, Math, Int32Array, Uint8Array, Number, Error, Infinity };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox);
  return { bot: win.__META_BOT__, hero };
}
const fails = [];
for (const file of files) {
  const { bot, hero } = load(file, { x: 2.5, y: 5, z: 7.5 });
  const say = m => fails.push(`${file}: ${m}`);
  // Walk the corridor the way a player does: step onto each goal slightly off-centre.
  let last = null, reached = false;
  for (let n = 0; n < 40 && !reached; n++) {
    const g = bot.state().goal;
    if (last && Math.abs(g.x - last.x) < 1e-6 && Math.abs(g.y - last.y) < 1e-6) { say(`goal did not advance after the hero stood on (${g.x}, ${g.y})`); break; }
    last = g; hero.x = g.x + 0.28; hero.z = g.y + 0.28; // just past the goal: |d| to the cell behind > 1.2
    reached = Math.abs(g.x - 12.5) < 1e-6 && Math.abs(g.y - 7.5) < 1e-6;
  }
  if (!reached) say('route never handed out the real coin position (12.5, 7.5)');
  // Knocked 3 cells off the corridor: the next goal must be re-planned, not 3+ away.
  const k = load(file, { x: 3.5, y: 5, z: 7.5 }); k.bot.state(); k.hero.x = 6.5; k.hero.z = 7.5;
  const g2 = k.bot.state().goal;
  if (Math.hypot(g2.x - 6.5, g2.y - 7.5) > 2.3) say(`after knockback goal stayed ${Math.hypot(g2.x - 6.5, g2.y - 7.5).toFixed(1)} away (no re-plan)`);
}
if (fails.length) { for (const f of fails) console.error('❌ ' + f); process.exit(1); }
console.log(`✅ waypoint trap: ${files.length} adapters advance, finish on the coin and re-plan`);
