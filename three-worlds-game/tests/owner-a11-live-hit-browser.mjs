import assert from 'node:assert/strict';
import {chromium} from 'playwright';
// A11: a real original enemy takes projectile damage via updateCombat +
// updateProjectiles while hero moves opposite attack direction.
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:900,height:640}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765/three-worlds-game/',{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>!!window.__isle?.foeNear&&!!window.__isle?.sim,{timeout:30000});
 const proof=await page.evaluate(()=>{
  const i=__isle,p=i.player;
  if(i.G.state==='title')i.startGame();
  i.killFoes();i.clearInput();
  p.pos.set(44.5,i.terrainTop(44.5,49.5)+.3,49.5);
  p.vis.copy(p.pos);p.vel.set(0,0,0);
  for(let n=0;n<90;n++)i.sim(1/60,0,0,false,true);
  i.giveAll();i.equip('pistol');
  const fwd=new i.THREE.Vector3();i.camera.getWorldDirection(fwd);fwd.y=0;fwd.normalize();
  const right=new i.THREE.Vector3().crossVectors(fwd,new i.THREE.Vector3(0,1,0)).normalize();
  const dx=fwd.x*4+right.x*1.2,dz=fwd.z*4+right.z*1.2;
  const foe=i.foeNear('shade',dx,dz,true);
  i.aim.cursorT=0;
  const initial={x:p.pos.x,z:p.pos.z,hp:foe.hp},trace=[];
  i.attack(true);
  for(let n=0;n<65;n++){
   i.sim(1/60,0,-1,false,true);
   if(n%8===0)trace.push({n,hp:foe.hp,x:p.pos.x,z:p.pos.z,
     selected:i.aim.target===foe,shots:i.combat.shots});
  }
  i.attack(false);
  return {hpBefore:initial.hp,hpAfter:foe.hp,shots:i.combat.shots,
   moved:Math.hypot(p.pos.x-initial.x,p.pos.z-initial.z),trace,
   selectedAtLeastOnce:trace.some(x=>x.selected),facing:i.aim.dir.toArray()};
 });
 assert(proof.moved>.15,'hero did not retreat');
 assert(proof.selectedAtLeastOnce,'enemy never selected while retreating');
 assert(proof.shots>0,'real weapon did not shoot');
 assert(proof.hpAfter<proof.hpBefore,'real projectile never damaged enemy: '+JSON.stringify(proof));
 assert.deepEqual(errors,[]);
 console.log('A11_LIVE_BACKWARD_SHOT_HITS_PASS '+JSON.stringify({moved:proof.moved,hp:[proof.hpBefore,proof.hpAfter],shots:proof.shots}));
}finally{await browser.close()}
