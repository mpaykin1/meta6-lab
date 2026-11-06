// §21.14(B) genuine Playwright/browser check of the live original Island controls.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:[
 '--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'
]});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765/three-worlds-game/',{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>!!window.__isle?.mobileMove&&!!window.__isle?.stepKeyboard,{timeout:30000});
 await page.evaluate(()=>{if(__isle.G.state==='title')__isle.startGame()});
 await page.waitForFunction(()=>__isle.G.state==='play',{timeout:20000});
 const proof=await page.evaluate(()=>{
  const i=__isle;
  i.killFoes();i.clearInput();
  const x=i.world.spawn.x,z=i.world.spawn.z,y=i.terrainTop(x,z);
  i.player.pos.set(x,y+.08,z);
  i.player.vel.set(0,0,0);
  i.player.onGround=false;
  for(let k=0;k<40;k++)i.stepKeyboard(1/60); // settle on real original voxels
  const before=i.player.pos.clone(),dry=!i.underwater.isSubmerged(),initialLock=!!i.G.riftFrozen;
  i.mobileMove(.85,0);
  for(let k=0;k<90;k++)i.stepKeyboard(1/60);
  const movement=Math.hypot(i.player.pos.x-before.x,i.player.pos.z-before.z);
  i.mobileMove(0,0);
  // Return to accepted dry voxel floor and prime the original coyote/jump circuit.
  i.player.pos.set(x,i.terrainTop(x,z)+.08,z);
  i.player.vel.set(0,0,0);i.player.onGround=true;
  i.player.coyote=.11;
  i.mobileCombo(true);
  const pressed={jumpHeld:i.player.jumpHeld,attack:i.input.atk,source:i.input.src.touch};
  i.stepKeyboard(1/60);
  const jumped=i.player.vel.y>0&&i.player.pos.y>i.terrainTop(i.player.pos.x,i.player.pos.z);
  i.mobileCombo(false);i.mobileRelease();
  const after={attack:i.input.atk,jumpHeld:i.player.jumpHeld,vx:i.inputPointers.vx};
  return {state:i.G.state,x,z,initialLock,dry,movement,pressed,jumped,after,scroll:[scrollX,scrollY],canvas:document.querySelectorAll('#c').length,
    stickDisplay:getComputedStyle(document.querySelector('#stick')).display};
 });
 assert(proof.dry&&!proof.initialLock,'test must start in unfrozen dry original Island');
 assert(proof.movement>.25,'native mobile movement does not move real hero: '+JSON.stringify(proof));
 assert(proof.pressed.jumpHeld&&proof.pressed.attack&&proof.pressed.source,'native jump or attack press is not accepted');
 assert(proof.jumped,'live hero could not jump from original Island voxels');
 assert.equal(proof.after.attack,false,'touch attack stuck after release');
 assert.equal(proof.after.jumpHeld,false,'touch jump stuck after release');
 assert.equal(proof.after.vx,0,'touch movement stuck after release');
 assert.deepEqual(proof.scroll,[0,0]);
 assert.equal(proof.canvas,1);
 assert.equal(proof.stickDisplay,'none','original invisible mobile stick became visible');
 assert.deepEqual(errors,[],'browser errors '+errors.join(' | '));
 // Claude REVIEW 065: test the actual integration, not an index.source regex.
 const guard=await page.evaluate(()=>{
  const i=__isle,g=i.riftInputGuard;
  if(!g)throw Error('runtime guard not exposed');
  g.set(true);
  for(let j=0;j<1500;j++)g.tick(1/60);
  const unlocked=!i.G.riftFrozen&&g.expired;
  g.set(false);
  const before=i.player.pos.clone();
  i.mobileMove(.8,0);
  for(let j=0;j<60;j++)i.stepKeyboard(1/60);
  const moved=Math.hypot(i.player.pos.x-before.x,i.player.pos.z-before.z);
  i.mobileRelease();
  return {unlocked,moved};
 });
 assert(guard.unlocked,'runtime input did not unlock after 1500 steps / 25s');
 assert(guard.moved>.1,'touch movement ignored after actual runtime guard timeout: '+JSON.stringify(guard));
 console.log('OWNER_2114_INPUT_LIVE_PASS '+JSON.stringify({proof,guard}));
}finally{await browser.close();}
