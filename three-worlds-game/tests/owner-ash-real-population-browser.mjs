// Owner §21.4 / A05 — inspect the real renderer's existing Ash foe/loot/NPC
// instances, not merely a disconnected content-planning function.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {ASH_ARCHIPELAGO} from '../ash-archipelago.mjs';
import {LAND_ARMORY_IDS} from '../living-population.mjs';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:900,height:640}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765/three-worlds-game/',{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>!!window.__isle?.worldLife?.plan&&!!window.__isle?.terrainTop,{timeout:30000});
 await page.evaluate(()=>{if(__isle.G.state==='title')__isle.startGame();__isle.killFoes()});
 const result=[];
 for(const island of ASH_ARCHIPELAGO){
  const site=await page.evaluate(async ({x,z})=>{
   const i=__isle,y=i.terrainTop(x,z),p=i.player;
   p.pos.set(x,y+.3,z);p.vis.copy(p.pos);p.vel.set(0,0,0);i.killFoes();
   // worldLife.update() runs in the renderer frame, NOT in test-only i.sim().
   await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);
   const plan=i.worldLife.plan,near=i.foes.filter(f=>f.hp>0&&
    Math.hypot(f.segs[0].x-x,f.segs[0].z-z)<45);
   const pickups=i.loot.filter(w=>w.alive&&Math.hypot(w.x-x,w.z-z)<45);
   return {x,z,y,sea:i.SEA,region:plan?.region,npc:i.worldLife.npcs,
    foes:near.map(f=>({type:f.type,hp:f.hp,parts:f.n,renderable:!!f.def})),
    weapons:pickups.map(w=>w.id),worldWeaponIds:plan?.weapons.map(w=>w.id)};
  },island);
  assert(site.y>site.sea+.2,'true island is not dry '+JSON.stringify(site));
  assert.equal(site.region,'ash');assert(site.npc>=2,'original NPC instances absent');
  assert(site.foes.filter(f=>f.type==='shade'&&f.renderable&&f.parts>0).length>=2,'live original shade enemies absent');
  for(const id of LAND_ARMORY_IDS)assert(site.weapons.includes(id),
    'original world pickup '+id+' missing on island '+site.x);
  assert.equal(new Set(site.worldWeaponIds).size,20);
  result.push(site);
 }
 assert.deepEqual(errors,[],'browser errors');
 console.log('ASH_THREE_ISLANDS_REAL_RUNTIME_PASS '+JSON.stringify(result.map(x=>({x:x.x,foes:x.foes.length,npcs:x.npc,weapons:new Set(x.weapons).size}))));
}finally{await browser.close()}
