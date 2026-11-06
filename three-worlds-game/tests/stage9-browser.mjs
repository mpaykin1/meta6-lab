// Owner 041: fast LIVE Three.js assertions, 60 virtual seconds / 1800 steps.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile,mkdir} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:960,height:640}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
const result={worlds:[],guest:null,errors:[],ownerPass:'UNKNOWN'};
try{
 await page.goto('http://127.0.0.1:8765/three-worlds-game/',{waitUntil:'domcontentloaded',timeout:20000});
 await page.waitForFunction(()=>!!window.__isle?.livingLand,{timeout:18000});
 await page.evaluate(()=>{if(__isle.G.state==='title')__isle.startGame()});
 // Each actual, surfaced positive-ocean shelf must have content, not just a collider.
 for(const x of [145,365,-92]){
  const info=await page.evaluate(async x=>{
   const i=__isle,z=x===-92?32:32;
   i.player.pos.set(x,i.terrainTop(x,z)+.34,z);
   i.player.vis.copy(i.player.pos);i.player.vel.set(0,0,0);
   for(let j=0;j<4;j++){i.underwater.update(1/60);await new Promise(requestAnimationFrame);}
   const plan=i.livingLand.plan(x,z);
   const biome=i.livingLand.biome(x,z);
   const treeNodes=i.scene.children.filter(o=>o.isInstancedMesh&&o.userData.acceptedIslandAssets).reduce((n,o)=>n+o.count,0);
   return {x,z,height:i.terrainTop(x,z),plan,biome,treeNodes,ashPopulation:i.livingLand.ashPopulation,ashChunks:i.livingLand.ashChunks,islandChunks:i.livingLand.islandChunks};
  },x);
  assert(info.height>3.92,'expected reachable land: '+x+' height '+info.height);
  assert(info.plan.objects.length>=4,'empty world chunk at x='+x);
  if(info.biome==='island')assert(info.treeNodes>=4&&info.islandChunks>0,'accepted Island trees failed to render at x='+x);
  if(info.biome==='ash')assert(info.ashPopulation>=4&&info.ashChunks>0,'owner Ash prefab world empty at x='+x);
  result.worlds.push({x,biome:info.biome,dry:info.plan.dry,objects:info.plan.objects.length,treeNodes:info.treeNodes,ashPopulation:info.ashPopulation});
 }
 // Real runtime clock, renderable instance and visible opening (no synthetic fake guest).
 result.guest=await page.evaluate(()=>{
  const i=__isle;
  i.player.pos.set(145,i.terrainTop(145,32)+.4,32);
  i.player.vis.copy(i.player.pos);i.player.vel.set(0,0,0);
  let first=null;
  for(let j=0;j<1800;j++){
   i.rifts.update(1/30);
   if(i.rifts.guest){first=(j+1)/30;break;}
  }
  const g=i.rifts.guest;
  return {first,visible:!!g&&i.scene.children.includes(g.mesh),sourceParts:g?.mesh.children.length||0,
   home:g?.home,world:i.livingLand.biome(145,32)};
 });
 assert(result.guest.visible,'guest not in live scene within 60 simulated seconds');
 assert(result.guest.first<=60&&result.guest.first>=49,'idle spawn outside 50-60s');
 assert(result.guest.sourceParts>0,'not an actual original animated source model');
 assert.notEqual(result.guest.home,result.guest.world,'guest not from a different world');
 assert.deepEqual(errors,[],errors.join('\n'));
 result.errors=errors;result.pass='TECHNICAL_ASSERTIONS_PASS (owner verdict pending)';
 await mkdir('three-worlds-game/evidence',{recursive:true});
 await writeFile('three-worlds-game/evidence/stage9-owner041.json',JSON.stringify(result,null,2));
 console.log('STAGE9_OWNER041_PASS '+JSON.stringify(result));
}finally{await browser.close();}
