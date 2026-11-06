import {usesSurfaceTerrain} from './world-core.mjs';
import {createBrain,stepBrain} from './creature-brain.mjs';
import {immersionAt,swimVertical,bubbleEmissions,ambientBubbleAnchors,namedAssetInventory,nextBubbleSlot} from './stage7-simulation.mjs';
import {seabedHeight} from './seabed.mjs';
import {voxelSample,buildGreedyVoxelChunk,oceanEastChunkHasTerrain,EAST_OCEAN_CLIP_X} from './voxel-terrain.mjs';
import {LANDMARKS,oceanPlacements,plannedOceanPopulation} from './ocean-placements.mjs';
import {createSunkenAtmosphere} from './sunken-atmosphere.mjs';
export {seabedHeight} from './seabed.mjs';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const CHUNK=24;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
function hash(x,z,s){let n=Math.imul(x|0,374761393)^Math.imul(z|0,668265263)^Math.imul(s|0,362437);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;}
function noise(x,z,s){const a=Math.floor(x),b=Math.floor(z),u=smooth(0,1,x-a),v=smooth(0,1,z-b);
 return (hash(a,b,s)*(1-u)+hash(a+1,b,s)*u)*(1-v)+(hash(a,b+1,s)*(1-u)+hash(a+1,b+1,s)*u)*v;}
const fbm=(x,z,s)=>noise(x,z,s)*.56+noise(x*2.03,z*2.03,s+9)*.3+noise(x*4.07,z*4.07,s+13)*.14;
const QUESTS=[
 ['bell','Голос колокола','Найди соборный колокол на морском дне и прикоснись к нему.',[[75,34]]],
 ['shard','Карта погибшего города','Собери три осколка карты в разных руинах.',[[81,34],[89,27],[96,42]]],
 ['lamp','Цепь фонарей','Зажги три фонаря у старой дороги.',[[80,37],[87,37],[94,37]]],
 ['coral','Коралловая роща','Верни жизнь двум кораллам.',[[80,42],[93,46]]],
 ['clock','Последний час','Верни ход часам затонувшего города.',[[101,31]]]
];
const within=(p,x,z,r=4)=>Math.hypot(p.x-x,p.z-z)<r;
export function createUnderwaterWorld(o) {
 const {THREE,scene,player,atlas,hero,SEA,toast,getWeapon,getArsenal,getAmmo,getAim}=o;
 let seed=o.getSeed?.()??o.seed;
 const loader=new GLTFLoader(),chunks=new Map(),models=new Map(),creatures=[],mixers=new Set();
 const inside=(x,z)=>x>=0&&x<64&&z>=0&&z<64;
 const rawFloor=(x,z)=>o.surfaceHeight?o.surfaceHeight(x,z):(usesSurfaceTerrain(x,z)?o.terrainTop(x,z):seabedHeight(x,z,seed));
 const floor=(x,z)=>voxelSample(rawFloor,x,z);
 let bathy=false,repair=new Set(),lastChunk='',time=0,qi=0,seen=new Set(),lastHint=-99;
 let immersion=0,bubbleActive=0;const bubbleState={budget:0,cursor:0};
 const DEEP=new THREE.Color('#124c66'),bubbleCapacity=96;
 // Water-only volumetric fill: keep the approved dusk surface lighting untouched.
 const waterFill=new THREE.HemisphereLight(0x81ceea,0x10354a,0);
 const waterScatter=new THREE.PointLight(0x4fcaff,0,32,2);
 scene.add(waterFill,waterScatter);
 // Ported shader effects from owner's reference, sharing this game's scene/renderer.
 const atmosphere=createSunkenAtmosphere({THREE,scene,camera:o.camera,seed,SEA});
 const bubblePos=new Float32Array(bubbleCapacity*3),bubbleLife=new Float32Array(bubbleCapacity),bubbleVy=new Float32Array(bubbleCapacity);
 bubblePos.fill(-10000);
 const bubbleGeometry=new THREE.BufferGeometry();
 bubbleGeometry.setAttribute('position',new THREE.BufferAttribute(bubblePos,3).setUsage(THREE.DynamicDrawUsage));
 const bubbleMaterial=new THREE.PointsMaterial({color:0xa4efff,size:.17,transparent:true,opacity:.7,depthWrite:false,blending:THREE.AdditiveBlending});
 const bubblePoints=new THREE.Points(bubbleGeometry,bubbleMaterial);
 bubblePoints.frustumCulled=false;scene.add(bubblePoints);
 function emitBubble(x,y,z){const i=nextBubbleSlot(bubbleState,bubbleCapacity);const j=i*3;bubblePos[j]=x;bubblePos[j+1]=y;bubblePos[j+2]=z;bubbleVy[i]=.6+hash(i,bubbleState.cursor,seed)*.5;bubbleLife[i]=1.2+hash(bubbleState.cursor,i,seed)*1.2;}
 function updateBubbles(dt){let count=0;for(let i=0;i<bubbleCapacity;i++){if(bubbleLife[i]<=0)continue;bubbleLife[i]-=dt;if(bubbleLife[i]<=0){bubblePos[i*3+1]=-10000;continue;}bubblePos[i*3+1]+=bubbleVy[i]*dt;count++;}bubbleGeometry.attributes.position.needsUpdate=true;return count;}

 try{const s=JSON.parse(localStorage.getItem('sunken-quests-v2')||'null');if(s){qi=clamp(s.i|0,0,QUESTS.length);seen=new Set(s.visited||[]);}}catch{}
 const mat=new THREE.MeshLambertMaterial({map:atlas,vertexColors:true,side:THREE.DoubleSide,fog:true});
 const ghost=new THREE.Group(),sub=new THREE.Group();
 ghost.add(new THREE.PointLight(0x4cefff,4,9));sub.add(new THREE.PointLight(0x9aeaff,2.5,8));
 scene.add(ghost,sub);ghost.visible=false;sub.visible=false;
 const hud=document.createElement('aside');hud.id='sunkenHUD';document.body.append(hud);
 const minimap=document.createElement('canvas');minimap.id='sunkenMiniMap';
 minimap.width=minimap.height=128;document.body.append(minimap);
 const mini=minimap.getContext('2d',{alpha:false});
 let lastMap=-99;
 const style=document.createElement('style');
 style.textContent='html,body{position:fixed!important;inset:0!important;width:100%!important;height:100%!important;overflow:hidden!important;overscroll-behavior:none!important}canvas,#c{touch-action:none!important}'+
 '#sunkenHUD{position:fixed;top:160px;right:12px;z-index:4;max-width:min(250px,47vw);background:#001a2bd9;color:#d3ffff;padding:9px 11px;border-left:3px solid #4ae1e5;font:12px/1.4 monospace;text-shadow:0 1px #001;pointer-events:none;display:none;white-space:pre-line}'+
 '#sunkenMiniMap{position:fixed;top:14px;right:72px;width:132px;height:132px;border:3px solid #497989;image-rendering:pixelated;z-index:6;pointer-events:none;display:none}'+
 '@media(pointer:coarse){#sunkenHUD{top:160px;left:9px;right:auto;max-width:min(43vw,168px);padding:6px 8px;font-size:10px}#sunkenMiniMap{top:54px;right:9px;width:92px;height:92px}}';
 document.head.append(style);
 function model(name){
  if(!models.has(name))models.set(name,new Promise(resolve=>{
   const loaded=g=>{
    const object=g.scene,bb=new THREE.Box3().setFromObject(object),dims=new THREE.Vector3();
    bb.getSize(dims);object.scale.multiplyScalar(2/Math.max(.1,dims.x,dims.y,dims.z));
    resolve({object,clips:g.animations||[]});
   };
   const embedded=globalThis.__threeWorldsModels?.[name];
   if(embedded){const bytes=Uint8Array.from(atob(embedded),c=>c.charCodeAt(0));loader.parse(bytes.buffer,'',loaded,()=>resolve(null));}
   else loader.load('./models/'+name+'.glb',loaded,undefined,()=>resolve(null));
  }));
  return models.get(name);
 }
 function addModel(parent,name,scale=1,x=0,y=0,z=0,rotation=0){
  const ticket={live:true,name,x:parent.position.x+x,z:parent.position.z+z,loaded:false};
  model(name).then(proto=>{
   if(!ticket.live||!proto)return;
   const obj=proto.object.clone(true);obj.scale.multiplyScalar(scale);obj.position.set(x,y,z);
   if(proto.clips.length && mixers.size<24 && /bathyscaphe|glow_fish|manta|angler|seahorse|kelp|kraken_tentacle|jellyfish|eel|nautilus|siphonophore|lantern_fish/.test(name)){
    const mix=new THREE.AnimationMixer(obj);mix.clipAction(proto.clips[0]).play();mixers.add(mix);ticket.mixer=mix;
   }
   obj.rotation.y=rotation;parent.add(obj);ticket.loaded=true;
  });return ticket;
 }
 addModel(sub,'bathyscaphe',1.65);addModel(ghost,'diving_helmet',.55);
 // Fixed narrative landmarks: these are the real generated animated GLB models.
 const landmarks=LANDMARKS;
 const fixtures=[];
 landmarks.forEach(([id,x,z,size])=>{const holder=new THREE.Group();holder.position.set(x,0,z);scene.add(holder);addModel(holder,id,size,0,0,0,hash(x,z,seed)*6.28);fixtures.push({holder,x,z,id})});
 function chunk(cx,cz){
  const group=new THREE.Group(),tickets=[];
  if(oceanEastChunkHasTerrain(cx,CHUNK,EAST_OCEAN_CLIP_X)){
    const mesh=buildGreedyVoxelChunk(cx,cz,floor,{size:CHUNK,sea:SEA,clipX:EAST_OCEAN_CLIP_X,
      topTile:y=>y>SEA?0:y>-5?4:2,
      sideTile:y=>y>SEA?8:y>-5?4:11});
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(mesh.pos,3));
    geo.setAttribute('normal',new THREE.Float32BufferAttribute(mesh.normals,3));
    geo.setAttribute('uv',new THREE.Float32BufferAttribute(mesh.uv,2));
    geo.setAttribute('color',new THREE.Float32BufferAttribute(mesh.colors,3));
    geo.setIndex(mesh.indices);geo.computeBoundingSphere();
    geo.userData={voxel:true,visibleQuads:mesh.quads};
    group.add(new THREE.Mesh(geo,mat));
  }
  for(const p of oceanPlacements(cx,cz,seed,floor,(x,z)=>!usesSurfaceTerrain(x,z),SEA)){
   if(p.type==='structure'){
    tickets.push(addModel(group,p.name,p.scale,p.x,p.y,p.z,p.heading));
   }else{
    const holder=new THREE.Group();holder.position.set(p.x,p.y,p.z);group.add(holder);
    tickets.push(addModel(holder,p.name,p.scale));
    creatures.push({holder,chunk:cx+','+cz,x:p.x,z:p.z,y:p.y,kind:p.name,phase:p.phase,
      health:50,brain:createBrain(p.name+':'+cx+':'+cz+':'+p.i,{x:p.x,z:p.z},seed+p.i)});
   }
  }
  group.userData.tickets=tickets;scene.add(group);chunks.set(cx+','+cz,group);
 }
 function ensure(){
  const cx=Math.floor(player.pos.x/CHUNK),cz=Math.floor(player.pos.z/CHUNK),key=cx+','+cz;
  if(key===lastChunk)return;lastChunk=key;const keep=new Set();
  for(let z=-1;z<=1;z++)for(let x=-1;x<=1;x++){
   const k=(cx+x)+','+(cz+z);keep.add(k);if(!chunks.has(k))chunk(cx+x,cz+z);
  }
  for(const [k,g] of chunks)if(!keep.has(k)){
   g.userData.tickets.forEach(x=>{x.live=false;if(x.mixer)mixers.delete(x.mixer);});
   g.children.forEach(x=>x.geometry?.dispose());scene.remove(g);chunks.delete(k);
  }
  for(let i=creatures.length-1;i>=0;i--)if(!keep.has(creatures[i].chunk))creatures.splice(i,1);
 }
 function immersionAtPlayer(p=player.pos){return immersionAt(SEA,p.y,floor(p.x,p.z));}
 function isSubmerged(p=player.pos){return immersionAtPlayer(p)>.01;}
 function physicsStep(h){
  const p=player.pos,v=player.vel;
  p.x+=v.x*h;p.z+=v.z*h;
  swimVertical(player,h,floor(p.x,p.z),SEA);
  return 0;
 }
 function toggleBathyscaphe(){
  if(!isSubmerged()&&!bathy){toast('Батискаф доступен под водой',2300);return false;}
  if(!bathy&&repair.size<3){toast('Для ремонта найди детали у колокола, руин и затонувшего корабля ('+repair.size+'/3)',3300);return false;}
  bathy=!bathy;toast(bathy?'Батискаф: используй найденное стрелковое оружие':'Вы вышли из батискафа',2600);
  return bathy;
 }
 function canFire(){
  const w=getWeapon();return bathy&&isSubmerged()&&w?.kind==='ranged'
   &&getArsenal().includes(w.id)&&(!w.mag||(getAmmo()[w.id]??0)>0);
 }
 function onShot(w){
  if(!bathy||!isSubmerged()||w?.kind!=='ranged'||!getArsenal().includes(w.id))return;
  const dir=getAim().dir;
  const target=creatures.filter(c=>{
   const dx=c.holder.position.x-player.pos.x,dz=c.holder.position.z-player.pos.z,d=Math.hypot(dx,dz);
   return d<13&&dx*dir.x+dz*dir.z>Math.max(0,d*.93);
  }).sort((a,b)=>Math.hypot(a.x-player.pos.x,a.z-player.pos.z)-Math.hypot(b.x-player.pos.x,b.z-player.pos.z))[0];
  if(target){target.health-=(Array.isArray(w.dmg)?w.dmg[0]:w.dmg)||8;
   if(target.health<=0){target.holder.visible=false;creatures.splice(creatures.indexOf(target),1);}}
 }
 function questSave(){try{localStorage.setItem('sunken-quests-v2',JSON.stringify({i:qi,visited:[...seen]}));}catch{}}
 function interact(){
  if(!isSubmerged())return false;
  const q=QUESTS[qi];
  if(!q){toast('Хранитель: море помнит тебя. Мир открыт для исследований.',4200);return true;}
  for(let i=0;i<q[3].length;i++){
   const x=q[3][i][0],z=q[3][i][1],key=q[0]+':'+i;
   if(within(player.pos,x,z,5)&&!seen.has(key)){
    seen.add(key);
    if(q[3].every((_,j)=>seen.has(q[0]+':'+j))){toast('Миссия завершена: '+q[1],4300);qi++;}
    else toast('Открытие: '+q[1]+' ('+seen.size+'/'+q[3].length+')',2800);
    questSave();return true;
   }
  }
  if(within(player.pos,69,31,10)){toast('Хранитель Глубин: '+q[2],4900);return true;}
  return false;
 }
 function drawMiniMap(){
  mini.fillStyle='#061c32';mini.fillRect(0,0,128,128);
  for(let z=0;z<32;z++)for(let x=0;x<32;x++){
   const wx=player.pos.x+(x-16)*7,wz=player.pos.z+(z-16)*7,h=floor(wx,wz);
   mini.fillStyle=h>SEA?'#3f8651':h>0?'#2c796a':h>-5?'#174a70':'#0a2a56';
   mini.fillRect(x*4,z*4,4,4);
  }
  const marker=(x,z,color,size=5)=>{
   const px=(x-player.pos.x)/7*4+64,pz=(z-player.pos.z)/7*4+64;
   if(px<3||pz<3||px>125||pz>125)return;
   mini.fillStyle=color;mini.fillRect(px-size/2,pz-size/2,size,size);
  };
  marker(69,31,'#b5faff',7);
  const q=QUESTS[qi];if(q)for(const [x,z] of q[3])marker(x,z,'#f9d36a',4);
  mini.fillStyle='#ffffff';mini.fillRect(61,61,6,6);
  mini.strokeStyle='#081c23';mini.strokeRect(61,61,6,6);
 }
 function update(dt){
  const newSeed=o.getSeed?.()??seed;
  if(newSeed!==seed){seed=newSeed;lastChunk='';for(const [key,g] of chunks){g.userData.tickets.forEach(x=>{x.live=false;if(x.mixer)mixers.delete(x.mixer)});g.children.forEach(x=>x.geometry?.dispose());scene.remove(g)}chunks.clear();creatures.length=0;}
  time+=dt;const wet=isSubmerged();immersion+=(immersionAtPlayer()-immersion)*clamp(dt*3.5,0,1);
  const newBubbles=bubbleEmissions(bubbleState,dt,immersion,player.vel.y,bubbleCapacity);
  for(let i=0,n=newBubbles;i<n;i++){const jitter=hash(i,Math.floor(time*80),seed);emitBubble(player.pos.x+(jitter-.5)*.85,player.pos.y-.3,player.pos.z+(hash(i,Math.floor(time*90),seed)-.5)*.85);}
  // Ambient vents from existing wrecks and stone ruins use the same fixed-size pool.
  const ventTick=Math.floor(time/.4);
  if(ventTick!==Math.floor((time-dt)/.4))for(const a of ambientBubbleAnchors(fixtures.map(f=>({id:f.id,x:f.x,z:f.z,y:floor(f.x,f.z)+.4})),player.pos,seed,ventTick))emitBubble(a.x,a.y,a.z);
  bubbleActive=updateBubbles(dt);
  atmosphere.update(dt,immersion,player.pos);
  waterFill.intensity=1.25*immersion;
  waterScatter.intensity=1.8*immersion;
  waterScatter.position.set(player.pos.x,player.pos.y+5,player.pos.z+3);
  for(const f of fixtures)f.holder.position.y=floor(f.x,f.z)+.4;
  if(wet)for(const [id,x,z]of [['bell',75,34],['ruins',89,27],['wreck',101,31]])if(!repair.has(id)&&within(player.pos,x,z,4)){repair.add(id);toast('Деталь батискафа '+repair.size+'/3',2200)}
  if(wet||player.pos.x<3||player.pos.z<3||player.pos.x>60||player.pos.z>60)ensure();
  o.water.position.set(player.pos.x,SEA,player.pos.z);
  // Repaired bathyscaphe remains active when it surfaces and flies.
  sub.visible=bathy;sub.position.copy(player.pos);sub.position.y+=Math.sin(time*2.2)*.07;
  sub.rotation.y=Math.atan2(player.look.x,player.look.z);
  if(bathy)hero.visible=false;
  ghost.visible=player.pos.x>53&&player.pos.x<98&&Math.abs(player.pos.z-31)<64;
  ghost.position.set(69,floor(69,31)+2+Math.sin(time)*.25,31);
  ghost.rotation.y+=dt*.18;hud.style.display='none';
  minimap.style.display='none';
  if(wet&&time-lastMap>.45){lastMap=time;drawMiniMap();}
  if(wet){
   const q=QUESTS[qi],hint=bathy?(canFire()?'Батискаф: оружие готово':'Батискаф: найди стрелковое оружие'):'Удерживай прыжок: вверх. Отпусти: вниз.';
   hud.textContent='◈ ГЛУБИНА '+(SEA-player.pos.y).toFixed(1)+'м\n'+(q?'Задание: '+q[1]:'Все задания выполнены')+'\n'+hint;
   scene.fog.color.lerp(DEEP,Math.min(.2,immersion*.12));
   o.skyU.uTop.value.set('#092c44');
   o.skyU.uHorizon.value.set('#1a6076');
   o.skyU.uBottom.value.set('#123044');
   o.skyU.uSunVis.value=.02;
   scene.fog.density=.009+immersion*(.016+Math.max(0,SEA-player.pos.y)*.004);
   if(within(player.pos,69,31,7)&&time-lastHint>18){lastHint=time;interact();}
  }
  for(const mixer of mixers)mixer.update(Math.min(dt,.05));
  for(const c of creatures)if(c.holder.visible){
   if(wet&&c.kind==='angler'&&within(player.pos,c.holder.position.x,c.holder.position.z,3.6)
      &&time-(c.lastAggro||-90)>50&&hash(Math.floor(time/19),Math.floor(c.x),seed)>.86){
       c.lastAggro=time;toast('Осторожно: удильщик защищает гнездо!',1800);
       o.onCreatureAttack?.(1,c.x,c.z);
   }
   c.brain.hp=c.health;
   stepBrain(c.brain,c.holder.position,dt,{player:player.pos,height:floor,aquatic:true,sea:SEA});
   if(Number.isFinite(c.brain.heading))c.holder.rotation.y=c.brain.heading;
   c.phase=c.brain.phase;
  }
 }
 return {groundHeight:floor,isSubmerged,immersionAt:immersionAtPlayer,physicsStep,
  get bubbleCount(){return bubbleActive;},
  population(radius=40){const p=player.pos,near=(x,z)=>Math.hypot(x-p.x,z-p.z)<=radius;
   const visible=[];
   for(const f of fixtures)if(f.holder.children.length&&near(f.x,f.z))visible.push(f.id);
   for(const group of chunks.values())for(const t of group.userData.tickets)
    if(t.live&&t.loaded&&near(t.x,t.z))visible.push(t.name);
   return {...namedAssetInventory(visible),ruins:visible.filter(id=>/cathedral|arch|angel/.test(id)).length,
    wrecks:visible.filter(id=>/wreck|ship|galleon/.test(id)).length,
    fish:creatures.filter(c=>c.holder.visible&&c.holder.children.length>0&&near(c.holder.position.x,c.holder.position.z)).length,
    plants:visible.filter(id=>/coral|kelp|seagrass|anemone|sea_fan|sponge|moss/.test(id)).length};
  },
  populationPlan(radius=40){return plannedOceanPopulation(player.pos,seed,floor,(x,z)=>!usesSurfaceTerrain(x,z),radius);},
  get atmosphericEffects(){return atmosphere.counts;},
  update,toggleBathyscaphe,canFire,onShot,interact,
  get repairParts(){return repair.size;},get inBathyscaphe(){return bathy;},get chunks(){return chunks.size;},
  get creatures(){return creatures.length;},get questIndex(){return qi;}};
}
