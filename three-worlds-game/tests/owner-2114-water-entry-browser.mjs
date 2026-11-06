// Owner §21.14(A) real Chromium/SwiftShader shoreline → underwater → shore regression.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:900,height:640}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765/three-worlds-game/',{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>!!globalThis.__isle?.underwater?.isSubmerged&&!!globalThis.__isle?.terrainTop,{timeout:30000});
 const proof=await page.evaluate(()=>{
  const i=__isle;
  if(i.G.state==='title')i.startGame();
  i.killFoes();
  const x=52.5,z=32.5,h=i.terrainTop(x,z),p=i.player;
  p.pos.set(x,h+.08,z);p.vis.copy(p.pos);p.vel.set(0,0,0);p.onGround=true;
  i.clearInput();
  const terrainProfile=[];
  for(const zz of [16.5,24.5,32.5,40.5])for(const xx of [28.5,36.5,44.5,48.5,52.5,56.5,58.5,60.5,62.5,63.5,64.5,65.5,68.5,72.5,80.5]){
    const gy=i.terrainTop(xx,zz);
    terrainProfile.push({x:xx,z:zz,h:gy,dry:gy>=i.SEA});
  }
  const samples=[];let maxJump=0;
  function probe(label,n){
   samples.push({label,n,x:+p.pos.x.toFixed(3),y:+p.pos.y.toFixed(3),
    ground:+i.terrainTop(p.pos.x,p.pos.z).toFixed(3),
    depth:+(i.SEA-p.pos.y).toFixed(3),
    wet:i.underwater.isSubmerged(),immersion:+i.underwater.immersionAt().toFixed(3),
    chunks:i.underwater.chunks,pop:i.underwater.population().present.length});
  }
  probe('start',0);
  const initiallyDry=!i.underwater.isSubmerged();
  for(let n=0;n<120;n++){
   const lastY=p.pos.y;
   i.sim(1/30,1,0,false,false);i.underwater.update(1/30);
   maxJump=Math.max(maxJump,Math.abs(p.pos.y-lastY));
   if(n%10===9)probe('into',n+1);
  }
  const underwaterReached=i.underwater.isSubmerged(),entered=p.pos.x,deep=i.SEA-p.pos.y;
  for(let n=0;n<180;n++){
   const lastY=p.pos.y;
   i.sim(1/30,-1,0,false,false);i.underwater.update(1/30);
   maxJump=Math.max(maxJump,Math.abs(p.pos.y-lastY));
   if(n%10===9)probe('out',n+1);
  }
  return {terrainProfile,samples,initiallyDry,underwaterReached,entered,deep,exitX:p.pos.x,
   exitDry:!i.underwater.isSubmerged(),maxJump,sea:i.SEA};
 });
 console.log('WATER_ENTRY_DIAGNOSTIC '+JSON.stringify(proof));
 assert(proof.initiallyDry,'test must begin on original dry Island terrain');
 assert(proof.underwaterReached&&proof.deep>.05,'walking into water did not submerge hero');
 assert(proof.samples.some(s=>s.label==='into'&&s.wet&&s.chunks>0),'underwater chunk world missing after entering water');
 assert(proof.maxJump<=1.05,'unexpected one-frame water depth jump: '+proof.maxJump);
 for(const zz of [24.5,32.5,40.5]){
  const row=proof.terrainProfile.filter(s=>s.z===zz);
  const a=row.find(s=>s.x===63.5),b=row.find(s=>s.x===64.5);
  assert(Math.abs(a.h-b.h)<=1,'visible voxel seam at original Island/ocean boundary '+zz+' '+a.h+'→'+b.h);
 }
 assert(proof.exitDry,'hero could not reach dry shore after submerged return');
 // Owner §21.22 A01/A08: a real MID-DEPTH camera dive, distinct from shallow
 // terrain traversal. Force the player to a known physically deep sea cell;
 // the original rig is advanced via the real game code, not a fake formula.
 const immersionCamera=await page.evaluate(()=>{
  const i=__isle,p=i.player,sea=i.SEA;
  const x=80.5,z=16.5,floor=i.terrainTop(x,z);
  if(floor>sea-4)throw Error('midwater fixture is not deep: '+floor);
  p.pos.set(x,sea-2.35,z);p.vis.copy(p.pos);p.vel.set(0,0,0);p.onGround=false;
  i.clearInput();
  for(let n=0;n<120;n++)i.sim(1/60,0,0,false,true);
  const deep={floor,playerY:p.pos.y,cameraY:i.camera.position.y,sea,immersion:i.underwater.immersionAt()};
  const shoreX=69,shoreZ=32,shallows=i.terrainTop(shoreX,shoreZ);
  p.pos.set(shoreX,Math.max(shallows+.35,sea-.1),shoreZ);p.vis.copy(p.pos);p.vel.set(0,0,0);
  for(let n=0;n<120;n++)i.sim(1/60,0,0,false,true);
  const shallow={floor:shallows,playerY:p.pos.y,cameraY:i.camera.position.y,sea,immersion:i.underwater.immersionAt()};
  return {deep,shallow};
 });
 console.log('OWNER_2122_REAL_CAMERA_IMMERSION '+JSON.stringify(immersionCamera));
 assert(immersionCamera.deep.immersion>.65,'deep-fixture hero never submerged');
 assert(immersionCamera.deep.cameraY<immersionCamera.deep.sea-.12,
  'camera remained above surface at genuine mid-depth, owner regression §21.22 A01/A08');
 assert(immersionCamera.shallow.cameraY>immersionCamera.shallow.sea,
  'shallow-water acceptance regressed: camera dipped under water');
 assert.deepEqual(errors,[],'browser errors: '+errors.join(' | '));
 console.log('OWNER_2114_WATER_ENTRY_PASS');
}finally{await browser.close();}
