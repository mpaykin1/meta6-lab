import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
import { mkdir } from 'node:fs/promises';
const base = process.env.TEST_BASE || 'http://127.0.0.1:8765/three-worlds-game/';
await mkdir('three-worlds-game/evidence',{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{}),args:['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-certificate-errors']});
async function boot(context,path,extra=''){
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push('PAGEERROR '+e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push('CONSOLE '+m.text());});
 await page.goto(base+'?'+extra,{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>window.__isle?.G?.state==='play',{timeout:60000});
 await page.waitForTimeout(5200);
 assert.equal(errors.length,0,'Browser errors: '+errors.join('\n'));
 const baseline=await page.evaluate(()=>({
   state:window.__isle.G.state,
   canvas:!!document.querySelector('canvas'),
   controls:!!document.querySelector('#v7MobileHud'),
   weaponCount:window.__isle.ARSENAL_ORDER.length,
   uw:!!window.__isle.underwater,
   webgl:!!(document.querySelector('canvas').getContext('webgl2')||document.querySelector('canvas').getContext('webgl'))
 }));
 assert(baseline.webgl,'WebGL renderer should initialize');
 assert(baseline.uw,'Underwater runtime should exist');
 await page.evaluate(()=>{window.__isle.G.fade=1;window.__isle.G.todT=window.__isle.G.tod=.1;});
 await page.waitForTimeout(750);
 await page.screenshot({path:'three-worlds-game/evidence/'+path+'.png'});
 return {page,baseline,errors};
}
const pc=await browser.newContext({viewport:{width:1440,height:900}});
const d=await boot(pc,'desktop','');
assert.equal(await d.page.locator('#v7MobileHud').isVisible(),false,'Desktop should hide phone buttons');
const start=await d.page.evaluate(()=>[window.__isle.player.pos.x,window.__isle.player.pos.z]);
await d.page.keyboard.down('KeyW');
const pos=await d.page.evaluate(()=>{
 const i=window.__isle;for(let n=0;n<75;n++)i.stepKeyboard(.016);
 return [i.player.pos.x,i.player.pos.z];
});
await d.page.keyboard.up('KeyW');
const debug=await d.page.evaluate(()=>({state:window.__isle.G.state,timeScale:window.__isle.G.timeScale,fade:window.__isle.G.fade,respawn:window.__isle.player.respawn,hitstop:window.__isle.G.hitstop}));
console.log('WASD_EVIDENCE',JSON.stringify({start,pos,debug}));
assert(Math.hypot(pos[0]-start[0],pos[1]-start[1])>.12,'WASD must move player');
await d.page.keyboard.down('ArrowRight');
const posArrow=await d.page.evaluate(()=>{const i=window.__isle;for(let n=0;n<65;n++)i.stepKeyboard(.016);return [i.player.pos.x,i.player.pos.z]});
await d.page.keyboard.up('ArrowRight');
assert(Math.hypot(posArrow[0]-pos[0],posArrow[1]-pos[1])>.08,'Arrow keys must move hero');
const submerged=await d.page.evaluate(()=>{
 const i=window.__isle;i.player.pos.set(70,2.1,31);i.player.vel.set(0,0,0);
 return {y:i.player.pos.y,underwater:i.underwater.isSubmerged()};
});
assert(submerged.underwater,'Teleport into water should activate diving');
await d.page.waitForTimeout(450);
const y0=await d.page.evaluate(()=>window.__isle.player.pos.y);
await d.page.keyboard.down('Space');
const y1=await d.page.evaluate(()=>{
 const i=window.__isle;
 if(!i.player.jumpHeld)throw Error('Space down did not set jumpHeld');
 for(let n=0;n<85;n++)i.underwater.physicsStep(.016);
 return i.player.pos.y;
});
await d.page.keyboard.up('Space');
const y2=await d.page.evaluate(()=>{
 const i=window.__isle;
 if(i.player.jumpHeld)throw Error('Space up did not clear jumpHeld');
 for(let n=0;n<180;n++)i.underwater.physicsStep(.016);
 return i.player.pos.y;
});
assert(y1>y0+.12,'Hold Space should rise: '+[y0,y1,y2]);
assert(y2<y1-.08,'Release Space should descend: '+[y0,y1,y2]);
await d.page.evaluate(()=>{const i=window.__isle;for(const [x,z]of [[75,34],[89,27],[101,31]]){i.player.pos.set(x,i.terrainTop(x,z)+.1,z);i.underwater.update(.016)}i.player.pos.set(70,2.1,31);i.player.vel.set(0,0,0)});
await d.page.keyboard.press('KeyB');
const bathy=await d.page.evaluate(()=>({
 entered:window.__isle.underwater.inBathyscaphe,
 unarmed:window.__isle.underwater.canFire()
}));
assert(bathy.entered,'B should enter bathyscaphe');
assert.equal(bathy.unarmed,false,'Without picked ranged weapon no firing');
await d.page.evaluate(()=>{const i=window.__isle;i.giveAll();i.equip('pistol');i.combat.ammo.pistol=6});
await d.page.waitForTimeout(200);
assert(await d.page.evaluate(()=>window.__isle.underwater.canFire()),'picked pistol with ammo should fire');
await d.page.evaluate(()=>{window.__isle.G.fade=1;window.__isle.G.todT=window.__isle.G.tod=.1;});
await d.page.waitForTimeout(900);
// Surface-to-ocean round trip and deterministic unbounded ocean chunks.
const chunkEvidence=await d.page.evaluate(()=>{
 const i=window.__isle,report=[];
 for(const [x,z] of [[96,42],[-90,42],[190,-85],[-140,-140],[70,31]]){
  i.player.pos.set(x,i.underwater.groundHeight(x,z)+.25,z);i.player.vel.set(0,0,0);
  i.underwater.update(.016);
  report.push({x,z,chunks:i.underwater.chunks,creatures:i.underwater.creatures});
 }
 const b=i.world.beacon;i.player.pos.set(b.x,Math.max(i.__sea||4.8,b.y+1.5),b.z);i.underwater.update(.016);
 return {report,surfaced:!i.underwater.isSubmerged(),bathyAfterSurface:i.underwater.inBathyscaphe};
});
assert(chunkEvidence.report.every(c=>c.chunks>=1&&c.chunks<=9),'Ocean chunks must stream with bounded memory');
assert(chunkEvidence.surfaced,'Land must restore surface mode');
assert(chunkEvidence.bathyAfterSurface,'Repaired bathyscaphe must remain active above water for flight');
console.log('CHUNKS_PASS',JSON.stringify(chunkEvidence));
await d.page.evaluate(()=>{const i=window.__isle;i.player.pos.set(70,2.1,31);i.player.vel.set(0,0,0);});
await d.page.waitForTimeout(850);
await d.page.screenshot({path:'three-worlds-game/evidence/diving-desktop.png'});
console.log('DESKTOP_PASS',JSON.stringify({baseline:d.baseline,y0,y1,y2,bathy,armed:true}));
await pc.close();
const phone=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
const m=await boot(phone,'mobile','v7test=1');
assert.equal(await m.page.locator('#v7MobileHud').isVisible(),true,'Phone HUD should render');
const data=await m.page.evaluate(()=>({
 overflow:getComputedStyle(document.body).overflow,
 hudButtons:['v7Swap','v7Build','v7Action','v7Stick'].every(id=>!!document.getElementById(id)),
 scroll:[scrollX,scrollY]
}));
assert(data.hudButtons,'All phone controls must be present');
assert.equal(data.overflow,'hidden','Viewport should be fixed');
await m.page.evaluate(()=>{const i=window.__isle;i.player.pos.set(70,2.1,31);i.player.vel.set(0,0,0)});
await m.page.waitForTimeout(550);
await m.page.evaluate(()=>{const i=window.__isle;for(const [x,z]of [[75,34],[89,27],[101,31]]){i.player.pos.set(x,i.terrainTop(x,z)+.1,z);i.underwater.update(.016)}i.player.pos.set(70,2.1,31);i.player.vel.set(0,0,0)});
await m.page.locator('#v7Swap').dispatchEvent('pointerdown',{pointerId:501,buttons:1,clientX:336,clientY:650,pointerType:'touch'});
assert(await m.page.evaluate(()=>window.__isle.underwater.inBathyscaphe),'Phone weapon button should enter bathyscaphe underwater');
await m.page.evaluate(()=>{const i=window.__isle;i.giveAll();i.equip('pistol');i.combat.ammo.pistol=7;});
await m.page.locator('#v7Action').dispatchEvent('pointerdown',{pointerId:601,buttons:1,clientX:690,clientY:1150,pointerType:'touch'});
const ascend=await m.page.evaluate(()=>({up:window.__isle.player.jumpHeld,shooting:window.__isle.input.atk}));
assert(ascend.up,'Phone lower control rises when held');
assert.equal(ascend.shooting,false,'Phone ascent must not simultaneously shoot');
await m.page.locator('#v7Action').dispatchEvent('pointerup',{pointerId:601,buttons:0,pointerType:'touch'});
// Explicitly dive back down after testing ascent, as the jump may have surfaced the hero.
await m.page.evaluate(()=>{const i=window.__isle;i.player.pos.set(70,2.1,31);i.player.vel.set(0,0,0);});
const firePrereqs=await m.page.evaluate(()=>{const i=window.__isle;return {underwater:i.underwater.isSubmerged(),bathyscaphe:i.underwater.inBathyscaphe,weapon:i.combat.cur,ammo:i.combat.ammo.pistol,canFire:i.underwater.canFire()}});
console.log('PHONE_FIRE_PREREQS',JSON.stringify(firePrereqs));
assert(firePrereqs.underwater&&firePrereqs.bathyscaphe&&firePrereqs.canFire,'Prepare phone firing with underwater armed bathyscaphe');
// Playwright DOM-synthesized pointer events can instantly lose capture.
const buildRect=await m.page.locator('#v7Build').boundingBox();
await m.page.evaluate(()=>{
 const build=document.getElementById('v7Build');
 window.__phoneBuildProbe={down:false,target:'',stateAfterHandler:null};
 build.addEventListener('pointerdown',e=>{
  const p=window.__phoneBuildProbe;
  p.down=true;p.target=e.target.id;p.pointerType=e.pointerType;
  p.stateAfterHandler={attacking:window.__isle.input.atk,canFire:window.__isle.underwater.canFire()};
 });
});
const cdp=await m.page.context().newCDPSession(m.page);
await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:602,x:buildRect.x+buildRect.width/2,y:buildRect.y+buildRect.height/2}]});
const fireActual=await m.page.evaluate(()=>{const i=window.__isle;return {attacking:i.input.atk,touchSource:i.input.src.touch,canFire:i.underwater.canFire(),y:i.player.pos.y}});
console.log('PHONE_FIRE_ACTUAL',JSON.stringify(fireActual));
console.log('PHONE_BUILD_PROBE',JSON.stringify(await m.page.evaluate(()=>({probe:window.__phoneBuildProbe,atPoint:document.elementFromPoint(...[document.getElementById('v7Build').getBoundingClientRect().left+30,document.getElementById('v7Build').getBoundingClientRect().top+30])?.id}))));
console.log('PHONE_TRACE',JSON.stringify(await m.page.evaluate(()=>window.__uwButtonTrace)));

const directFireDiagnostic=await m.page.evaluate(()=>{const i=window.__isle;const before={gameState:i.G.state,hp:i.player.hp,canFire:i.underwater.canFire(),batyscaphe:i.underwater.inBathyscaphe,input:i.input.atk};const called=i.mobileShoot();return {before,called,after:i.input.atk}});
console.log('PHONE_DIRECT_FIRE_DIAG',JSON.stringify(directFireDiagnostic));
assert(fireActual.attacking,'Middle button shoots only with picked ranged weapon: '+JSON.stringify({firePrereqs,fireActual}));
await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
assert.equal(await m.page.evaluate(()=>window.__isle.input.atk),false,'Touch release must stop gunfire');
await m.page.locator('#v7Stick').dispatchEvent('pointerdown',{pointerId:603,buttons:1,clientX:100,clientY:650,pointerType:'touch'});
await m.page.locator('#v7Stick').dispatchEvent('pointermove',{pointerId:603,buttons:1,clientX:150,clientY:620,pointerType:'touch'});
const scrollCheck=await m.page.evaluate(()=>({x:scrollX,y:scrollY,overflow:getComputedStyle(document.body).overflow}));
assert.deepEqual([scrollCheck.x,scrollCheck.y],[0,0],'Joystick must not scroll page');
await m.page.locator('#v7Stick').dispatchEvent('pointerup',{pointerId:603,buttons:0,pointerType:'touch'});
await m.page.waitForTimeout(450);
console.log('MOBILE_INPUT_PASS',JSON.stringify({ascend,scrollCheck}));
await m.page.screenshot({path:'three-worlds-game/evidence/diving-mobile.png'});
console.log('MOBILE_PASS',JSON.stringify({baseline:m.baseline,...data}));
assert.equal(m.errors.length,0,'Phone browser errors: '+m.errors.join('\n'));
await phone.close();await browser.close();
