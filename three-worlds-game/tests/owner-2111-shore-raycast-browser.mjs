// §21.11 / AUDIT 057: real game scene raycasts over the accepted Island→ocean seam.
// This is a code-only Playwright proof (not a screenshot or a made-up scene).
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:[
 '--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'
]});
try{
 const page=await browser.newPage({viewport:{width:900,height:600}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765/three-worlds-game/',{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>!!__isle?.underwater?.update&&!!__isle?.terrainTop,{timeout:30000});
 await page.evaluate(()=>{
  const i=__isle;
  if(i.G.state==='title')i.startGame();
  i.killFoes();
  const x=68.5,z=32;
  i.player.pos.set(x,i.terrainTop(x,z)+.4,z);
  i.player.vis.copy(i.player.pos);i.player.vel.set(0,0,0);
 });
 await page.evaluate(async()=>{
  const i=__isle;
  for(let n=0;n<4;n++){i.underwater.update(1/60);await new Promise(requestAnimationFrame);}
 });
 const proof=await page.evaluate(()=>{
  const i=__isle,T=i.THREE,orig=i.terrainMeshes.filter(m=>m.isMesh);
  const ocean=[];i.scene.traverse(m=>{
   if(m.isMesh&&m.geometry?.userData?.voxel&&!i.terrainMeshes.includes(m))ocean.push(m);
  });
  if(!ocean.length)throw Error('real underwater scene has no chunk mesh');
  const seaVerts=[];
  for(const m of ocean){
   m.updateMatrixWorld(true);
   const p=m.geometry.attributes.position;
   if(p){for(let k=0;k<p.count;k++)seaVerts.push(p.getX(k));}
  }
  const ray=new T.Raycaster(),down=new T.Vector3(0,-1,0),samples=[];
  for(const x of [63.5,64.5,68.5,71.5,72.5]){
   ray.set(new T.Vector3(x,128,32.5),down);ray.near=0;ray.far=256;
   const actual=ray.intersectObjects([...orig,...ocean],false)
    .filter(h=>h.face?.normal?.y>.5);
   const h=i.terrainTop(x,32.5),t=actual.find(hit=>Math.abs(hit.point.y-h)<=1e-6);
   samples.push({x,expected:h,hits:actual.length,matching:!!t,
    matchHeight:t?.point.y??null,fromOcean:t?ocean.includes(t.object):null});
  }
  return {samples,marineMeshes:ocean.length,marineVertexMinX:Math.min(...seaVerts),
    scroll:[scrollX,scrollY],canvas:document.querySelectorAll('#c').length};
 });
 assert(proof.marineMeshes>0,'missing runtime ocean chunks');
 assert(proof.marineVertexMinX>=64,'ocean mesh leaked into original Island coordinates');
 for(const s of proof.samples){
  assert(s.matching,'actual downward THREE.Raycaster missed terrainTop at x='+s.x+': '+JSON.stringify(s));
  assert.equal(s.fromOcean,s.x>=64,'wrong renderer owns shore cell at '+s.x);
 }
 assert.deepEqual(proof.scroll,[0,0]);
 assert.equal(proof.canvas,1);
 assert.deepEqual(errors,[],'real game browser errors: '+errors.join(' | '));
 console.log('REAL_ISLAND_OCEAN_63_72_RAYCAST_PASS '+JSON.stringify(proof));
}finally{await browser.close();}
