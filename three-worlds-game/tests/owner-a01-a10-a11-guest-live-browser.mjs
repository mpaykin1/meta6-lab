// §21.20 single Chromium session: actual A01 deep camera, A10 touch water,
// A11 combat aim when retreating, §21.25 in-world guest typewriter.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765/three-worlds-game/',{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>!!window.__isle?.rifts?.event&&!!window.__isle?.mobileCombo,{timeout:30000});
 const checks=await page.evaluate(()=>{
  const i=__isle,p=i.player,sea=i.SEA;
  if(i.G.state==='title')i.startGame();i.killFoes();i.clearInput();
  function at(x,z,y){p.pos.set(x,y,z);p.vis.copy(p.pos);p.vel.set(0,0,0);p.onGround=false}
  const deepX=80.5,deepZ=16.5,deepFloor=i.terrainTop(deepX,deepZ);
  if(!(deepFloor<sea-4))throw Error('fixture not deep');
  at(deepX,deepZ,sea-2.35);
  for(let n=0;n<120;n++)i.sim(1/60,0,0,false,true);
  const dive={eye:i.camera.position.y,sea,immersion:i.underwater.immersionAt()};
  at(deepX,deepZ,Math.max(deepFloor+.3,sea-2.5));
  i.mobileCombo(true);
  const pressed={attack:i.input.atk,jump:p.jumpHeld,wet:i.underwater.isSubmerged()};
  const initialY=p.pos.y;
  for(let n=0;n<60;n++)i.sim(1/60,0,0,true,true);
  const ascent=p.pos.y-initialY;
  i.mobileCombo(false);i.mobileRelease();
  const released={attack:i.input.atk,jump:p.jumpHeld};
  const shallowY=i.terrainTop(69,32)+.35;
  at(69,32,Math.max(shallowY,sea-.1));
  for(let n=0;n<120;n++)i.sim(1/60,0,0,false,true);
  const shallowEye=i.camera.position.y;
  // The source Island's accepted navigable test plaza, not the obstacle-heavy x=20.
  at(44.5,49.5,i.terrainTop(44.5,49.5)+.3);i.killFoes();i.clearInput();
  for(let n=0;n<100;n++)i.sim(1/60,0,0,false,true);
  i.giveAll();i.equip('pistol');
  // A11: target stays selected while movement is commanded in the opposite direction.
  // Real target must be INSIDE the current camera frustum; fixed world
  // offsets can point behind the camera and legitimately fail auto-targeting.
  const cameraForward=new i.THREE.Vector3();
  i.camera.getWorldDirection(cameraForward);cameraForward.y=0;cameraForward.normalize();
  const foe=i.foeNear('shade',cameraForward.x*3.8,cameraForward.z*3.8);
  i.aim.cursorT=0;
  const before={x:p.pos.x,z:p.pos.z};
  for(let n=0;n<26;n++)i.sim(1/60,0,-1,false,true);
  const aim={selected:i.aim.target===foe,travel:Math.hypot(p.pos.x-before.x,p.pos.z-before.z),
    facing:(()=>{const h=foe.segs[0],d=Math.hypot(h.x-p.pos.x,h.z-p.pos.z)||1;
      return (i.aim.dir.x*(h.x-p.pos.x)+i.aim.dir.z*(h.z-p.pos.z))/d})()};
  i.killFoes();i.clearInput();
  at(20,32,i.terrainTop(20,32)+.3);
  for(let n=0;n<180;n++)i.sim(1/60,0,0,false,true);
  return {dive,pressed,ascent,released,shallowEye,aim};
 });
 assert(checks.dive.immersion>.65&&checks.dive.eye<checks.dive.sea-.12,
  'A01 actual original camera did not dive');
 assert(checks.shallowEye>checks.dive.sea,'A01 accepted shallow camera regressed');
 assert(checks.pressed.wet&&checks.pressed.attack&&checks.pressed.jump&&checks.ascent>.03,
  'A10 original touch attack/swim jump failed underwater');
 assert(!checks.released.attack&&!checks.released.jump,'A10 button release stuck');
 assert(checks.aim.travel>.05&&checks.aim.selected&&checks.aim.facing>.9,
  'A11 original combat target/facing changed when walking backward: '+JSON.stringify(checks.aim));
 const story=await page.evaluate(()=>{
  const i=__isle,seen=[],ui=document.querySelector('#threeWorldsGuestChoice');
  for(let n=0;n<460&&i.rifts.event.phase!=='dialogue';n++)i.rifts.update(.2);
  if(i.rifts.event.phase!=='dialogue')throw Error('§21.25 first guest missing in 460 steps');
  const g=i.rifts.guest;
  if(!g||g.origin==='island'||g.originalId!=='strider_m')throw Error('first approved original Ash visitor changed');
  for(let n=0;n<4;n++){
   i.rifts.update(10);
   seen.push(ui.querySelector('#guestStoryText').textContent);
   const hidden=ui.querySelector('.npc-say-choices').hidden;
   if(n<3&& !hidden)throw Error('choices visible before fourth spoken line');
   if(n<3)document.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));
   if(n===3&&hidden)throw Error('choices still hidden after fourth spoken line');
  }
  return {phase:i.rifts.event.phase,origin:g.origin,className:ui.className,
    title:ui.querySelector('.npc-say-name').textContent,
    font:getComputedStyle(ui).fontFamily,seen,choices:[...ui.querySelectorAll('button')].map(b=>b.textContent)};
 });
 assert.equal(story.phase,'dialogue');
 assert(story.className.includes('npc-say')&&story.font.includes('Pixelify Sans'));
 assert.equal(new Set(story.seen).size,4);
 assert.deepEqual(story.choices,['Помочь','Отказаться']);
 assert.deepEqual(errors,[]);
 console.log('A01_A10_A11_GUEST_LIVE_INTEGRATED_PASS '+JSON.stringify({dive:checks.dive,swim:checks.ascent,aim:checks.aim,guest:story.origin,lines:story.seen.length}));
}finally{await browser.close()}
