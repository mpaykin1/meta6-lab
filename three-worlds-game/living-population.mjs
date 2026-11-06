// Owner §21.4: genuine original equipment and AI in every inhabited ground sector.
// Original model: ash-assets.mjs scavenger; original AI: creature-brain.mjs.
// Original weapons and combat are provided by index.source.html. NO generated artwork.
import {createAshFactory} from './ash-assets.mjs';
import {createBrain,stepBrain} from './creature-brain.mjs';
import {hash} from './world-core.mjs';
import {landBiomeAt} from './living-land.mjs';
export const LAND_ARMORY_IDS=Object.freeze(['fists','dagger','sword','katana','axe','hammer','spear','scythe','flamesword','flail','sling','bow','xbow','pistol','shotgun','smg','saw','bomb','tesla','laser']);
export const REQUIRED_LIFE=Object.freeze({npcs:2,enemies:2,weapons:20});
export function lifeRegion(x,z,sea=3.8,height=()=>10,seed=1337){
 const gy=height(x,z);if(!Number.isFinite(gy)||gy<=sea+.12)return 'water';
 if((x>=48&&x<110)||(x>63&&Math.abs(z-32)<70&&Math.abs(gy-sea)<1.6))return 'shore';
 return landBiomeAt(x,z,seed);
}
export function lifePlan(x,z,seed,height,sea=3.8){
 const region=lifeRegion(x,z,sea,height,seed);
 if(region==='water')return {region,npcs:[],enemies:[],weapons:[]};
 const sites=[];
 // Fill local dry radius including islands with isolated steep shores.
 for(let radius=5;radius<=35;radius+=3)for(let i=0;i<24;i++){
  const theta=(i+(hash(seed,i,radius)-.5)*.35)*Math.PI/12;
  const px=x+Math.cos(theta)*radius,pz=z+Math.sin(theta)*radius,y=height(px,pz);
  if(Number.isFinite(y)&&y>sea+.2)sites.push({x:px,z:pz,y});
 }
 // The player itself is always a valid inland location.
 const fy=height(x,z);if(!sites.length&&Number.isFinite(fy)&&fy>sea+.12)sites.push({x,z,y:fy});
 const pick=(i)=>sites.length?sites[Math.floor(hash(i+3,seed^551,Math.floor(x)*11+Math.floor(z)*17)*sites.length)]:null;
 const place=(id,i)=>{const p=pick(i);return p?{...p,id,region}:null};
 return {region,
  npcs:[place('scavenger',410),place('companion',411)].filter(Boolean),
  enemies:[place(region==='ash'?'shade':'imp',510),place(region==='ash'?'shade':'imp',511)].filter(Boolean),
  weapons:LAND_ARMORY_IDS.map((id,i)=>place(id,i+700)).filter(Boolean)};
}
export function createLivingPopulation({THREE,scene,camera,heroTex,player,height,sea,seed,spawnEnemy,getEnemies,loot,weaponIds}){
 const catalog=typeof window!=='undefined'?window.ObserverNpcCatalog:null;
 if(!catalog?.ROLES?.companion)throw Error('Original Island companion role in npc-catalog.js is required');
 const factory=createAshFactory(THREE),def=factory.models.find(v=>v.id==='scavenger');
 if(!def)throw Error('Original scavenger absent');
 if(LAND_ARMORY_IDS.some(id=>!weaponIds.includes(id)))throw Error('Original 20 weapons missing');
 let active=[],current='',elapsed=0,plan=null,sectorEnemies=[];
 const harvested=new Set(),enemiesBySector=new Map();
 function clear(){for(const n of active){if(n.originalRole){catalog.dispose(n.entity,scene)}else{scene.remove(n.inst.root);n.inst.mat?.dispose()}}active=[];}
 function sector(p){return [Math.floor(p.x/42),Math.floor(p.z/42),lifeRegion(p.x,p.z,sea,height,seed)].join(':')}
 function enter(p){
  const key=sector(p);if(key===current)return;clear();
  for(let i=loot.length-1;i>=0;i--)if(loot[i].lifeTag)loot.splice(i,1);
  for(const f of sectorEnemies){f.hp=0;f.state='dissolve'}sectorEnemies=[];
  current=key;
  // Every 42m sector has a complete original armory; IDs survive revisits.
  plan=lifePlan(p.x,p.z,seed,height,sea);
  if(plan.region==='water')return;
  const stored=harvested;
  for(const w of plan.weapons){
   const tag=key+':'+w.id;if(stored.has(tag))continue;
   loot.push({id:w.id,x:w.x,y:w.y+1,z:w.z,gy:w.y,alive:true,phase:hash(w.id.length,w.x|0,w.z|0)*6.28,lifeTag:tag});
  }
  for(let i=0;i<plan.npcs.length;i++){
   const q=plan.npcs[i],brain=createBrain(q.id+'-'+key+'-'+i,{x:q.x,z:q.z},seed+i);
   if(q.id==='companion'&&plan.region!=='ash'){
    // The second role is directly the owner's original Island NPC catalog,
    // with the already accepted 6-frame hero sprite, not a new character.
    const visual=catalog.createMesh({THREE,heroTex},'companion',new THREE.Vector3(q.x,q.y,q.z));
    scene.add(visual.mesh,visual.ring);
    const entity={visual,role:'companion',relation:'neutral',motion:0,seed:seed+i,dead:false,
     state:'idle',facing:1,x:q.x,y:q.y,z:q.z};
    active.push({originalRole:true,entity,brain,pos:visual.mesh.position});
   }else{
    // Keep the owner's accepted companion ROLE and AI while on Ash use the
    // original Ash nomad body; Island companion texture remains canonical on Island.
    const modelId=q.id==='companion'?'nomad':q.id;
    const original=factory.models.find(model=>model.id===modelId);
    if(!original||typeof original.stats!=='function'||original.stats().voxels<100)
     throw Error('original Ash character asset missing '+modelId);
    const inst=factory.instance(original);inst.root.position.set(q.x,q.y,q.z);scene.add(inst.root);
    active.push({inst,brain,pos:inst.root.position});
   }
  }
  // Existing original foes are spawned by native combat path, never stand-ins.
  for(const w of plan.enemies){const f=spawnEnemy(w.id,w.x,w.y+1.2,w.z);if(f)sectorEnemies.push(f)}
 }
 function update(dt){
  elapsed+=dt;
  if(height(player.pos.x,player.pos.z)<=sea+.12){if(active.length)clear();current='';return}
  enter(player.pos);
  for(const n of active){
   stepBrain(n.brain,n.pos,dt,{player:player.pos,height,sea});
   if(n.originalRole){const e=n.entity;e.x=n.pos.x;e.y=n.pos.y;e.z=n.pos.z;
    e.motion=Math.hypot(n.brain.vx||0,n.brain.vz||0);e.state=n.brain.state||'idle';
    catalog.animate(e,elapsed,camera);
   }else factory.animate(n.inst,elapsed,{mode:n.brain.state==='idle'?'idle':'walk',sp:.7});
  }
  factory.uniforms.uTime.value=elapsed;
  // Actual original enemies move and attack via updateFoes().
  if(plan&&Math.floor(elapsed/8)!==Math.floor((elapsed-dt)/8)){
   const nearby=getEnemies().filter(f=>Math.hypot(f.segs[0].x-player.pos.x,f.segs[0].z-player.pos.z)<25);
   if(nearby.length<REQUIRED_LIFE.enemies)for(let i=0;i<REQUIRED_LIFE.enemies-nearby.length;i++){
    const q=plan.enemies[i%plan.enemies.length];if(q){const f=spawnEnemy(q.id,q.x,q.y+1.2,q.z);if(f)sectorEnemies.push(f);}
   }
  }
 }
 function pickup(item){if(item.lifeTag)harvested.add(item.lifeTag)}
 function dispose(){clear();factory.dispose()}
 return {update,dispose,pickup,get plan(){return plan},get npcs(){return active.length},get sector(){return current},
  get nearbyWeapons(){return loot.filter(w=>w.alive&&Math.hypot(w.x-player.pos.x,w.z-player.pos.z)<40).length}};
}
