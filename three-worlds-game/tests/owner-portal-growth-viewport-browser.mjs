import {chromium} from 'playwright';
import assert from 'node:assert/strict';
// §21.25 actual WebGL projected slit, not a fake 2D modal or static unit test.
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765/three-worlds-game/?guestDebug=1',{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>!!window.__isle?.rifts,{timeout:30000});
 const proof=await page.evaluate(()=>{
  const i=__isle,p=i.player;
  if(i.G.state==='title')i.startGame();
  i.killFoes();i.clearInput();
  p.pos.set(20,i.terrainTop(20,32)+.3,32);p.vis.copy(p.pos);p.vel.set(0,0,0);
  for(let j=0;j<100;j++)i.sim(1/60,0,0,false,true);
  const samples=[];
  for(let j=0;j<110;j++){
   i.sim(1/60,0,0,false,true);
   i.rifts.update(.2);
   const st=i.rifts.event,mesh=i.rifts.riftMesh;
   if(['warning','opening','emerging','dialogue'].includes(st.phase)){
    const v=mesh.position.clone().project(i.camera);
    samples.push({phase:st.phase,elapsed:st.elapsed,scale:mesh.scale.x,
      x:v.x,y:v.y,z:v.z});
   }
   if(st.phase==='dialogue'&&st.elapsed===0)break;
  }
  return {samples,phase:i.rifts.event.phase,guest:!!i.rifts.guest};
 });
 assert.equal(proof.phase,'dialogue','live guest never appeared within 110 steps');
 const warning=proof.samples.filter(x=>x.phase==='warning');
 const opening=proof.samples.filter(x=>x.phase==='opening');
 assert(warning.length>15&&opening.length>15,'5-second stages truncated');
 assert(warning.at(-1).scale>.45,'portal did not grow throughout warning');
 assert(opening[0].scale>.5,'opening restarted invisible instead of following warning');
 assert(opening.at(-1).scale>.91,'opening never reached full scale');
 for(const s of proof.samples.filter(x=>x.phase!=='warning'||x.elapsed>.9)){
  assert(Math.abs(s.x)<=.85&&Math.abs(s.y)<=.85,
   'actual portal outside safe phone camera: '+JSON.stringify(s));
 }
 assert(proof.guest,'real source model not spawned');
 assert.deepEqual(errors,[]);
 console.log('LIVE_RIFT_PHONE_SAFE_5S_GROWTH_PASS '+JSON.stringify({
  warning:[warning[0].scale,warning.at(-1).scale],opening:[opening[0].scale,opening.at(-1).scale],
  frameMax:Math.max(...proof.samples.map(x=>Math.abs(x.x)))}));
}finally{await browser.close()}
