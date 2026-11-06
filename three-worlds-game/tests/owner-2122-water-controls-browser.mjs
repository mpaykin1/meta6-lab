// Owner §21.22 A10: direct original mobile input routing under shallow & deep
// water. This test fails on the accepted-main regression: mobileCombo suppressed
// attacks when UW.isSubmerged() (pure swimming tests could not catch the bug).
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:[
 '--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'
]});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765/three-worlds-game/',{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>!!globalThis.__isle?.mobileCombo&&!!globalThis.__isle?.sim,{timeout:30000});
 const checks=await page.evaluate(()=>{
  const i=__isle;if(i.G.state==='title')i.startGame();
  i.killFoes();i.clearInput();
  const out=[];
  for(const [label,x,z,y] of [['shallow',68.5,32.5,2.4],['deep',80.5,16.5,2.0]]){
   const floor=i.terrainTop(x,z),p=i.player;
   p.pos.set(x,Math.max(floor+.3,y),z);p.vis.copy(p.pos);p.vel.set(0,0,0);p.onGround=false;
   i.clearInput();i.mobileCombo(true);
   const pressed={attack:i.input.atk,jump:p.jumpHeld,wet:i.underwater.isSubmerged()};
   const initialY=p.pos.y;
   for(let n=0;n<90;n++)i.sim(1/60,0,0,true,true);
   const maxY=p.pos.y;
   i.mobileCombo(false);i.mobileRelease();
   out.push({label,x,z,floor,pressed,ascent:maxY-initialY,
    released:{attack:i.input.atk,jump:p.jumpHeld}});
  }
  return out;
 });
 for(const check of checks){
  assert(check.pressed.wet,check.label+' fixture is not underwater: '+JSON.stringify(check));
  assert(check.pressed.attack,check.label+' attack button lost its real game input');
  assert(check.pressed.jump,check.label+' jump button lost its held input');
  assert(check.ascent>.03,check.label+' underwater jump never ascended');
  assert(!check.released.attack&&!check.released.jump,check.label+' button remained stuck');
 }
 assert.deepEqual(errors,[]);
 console.log('OWNER_2122_WATER_CONTROLS_LIVE_PASS '+JSON.stringify(checks));
}finally{await browser.close();}
