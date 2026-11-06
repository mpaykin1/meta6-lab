import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const CHUNK=24;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
function hash(x,z,s){let n=Math.imul(x|0,374761393)^Math.imul(z|0,668265263)^Math.imul(s|0,362437);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;}
function noise(x,z,s){const a=Math.floor(x),b=Math.floor(z),u=smooth(0,1,x-a),v=smooth(0,1,z-b);
 return (hash(a,b,s)*(1-u)+hash(a+1,b,s)*u)*(1-v)+(hash(a,b+1,s)*(1-u)+hash(a+1,b+1,s)*u)*v;}
const fbm=(x,z,s)=>noise(x,z,s)*.56+noise(x*2.03,z*2.03,s+9)*.3+noise(x*4.07,z*4.07,s+13)*.14;
export function seabedHeight(x,z,seed=1337){
 const off=Math.max(0,-x,x-64,-z,z-64),gx=Math.round((x-128)/220),gz=Math.round((z-128)/220);
 let y=1+(fbm(x*.10,z*.10,seed)-.5)*.7-smooth(0,30,off)*6.5;
 for(let iz=gz-1;iz<=gz+1;iz++)for(let ix=gx-1;ix<=gx+1;ix++){
  const cx=128+ix*220+(hash(ix,iz,seed)-.5)*60,cz=128+iz*220+(hash(ix,iz,seed+1)-.5)*60;
  y+=smooth(1.5,.05,Math.hypot((x-cx)/25,(z-cz)/25))*12*smooth(55,85,off);
 }
 return Math.max(-12,y);
}
const QUESTS=[
 ['bell','Голос колокола','Найди соборный колокол на морском дне и прикоснись к нему.',[[75,34]]],
 ['shard','Карта погибшего города','Собери три осколка карты в разных руинах.',[[81,34],[89,27],[96,42]]],
 ['lamp','Цепь фонарей','Зажги три фонаря у старой дороги.',[[80,37],[87,37],[94,37]]],
 ['coral','Коралловая роща','Верни жизнь двум кораллам.',[[80,42],[93,46]]],
 ['clock','Последний час','Верни ход часам затонувшего города.',[[101,31]]]
];
const within=(p,x,z,r=4)=>Math.hypot(p.x-x,p.z-z)<r;
export function createUnderwaterWorld(o) {
 const {THREE,scene,player,atlas,hero,SEA,seed,toast,getWeapon,getArsenal,getAmmo,getAim}=o;
 const loader=new GLTFLoader(),chunks=new Map(),models=new Map(),creatures=[],mixers=new Set();
 const inside=(x,z)=>x>=0&&x<64&&z>=0&&z<64;
 const floor=(x,z)=>inside(x,z)?o.terrainTop(x,z):seabedHeight(x,z,seed);
 let bathy=false,lastChunk='',time=0,qi=0,seen=new Set(),lastHint=-99;
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
   loader.load('./models/'+name+'.glb',g=>{
    const object=g.scene,bb=new THREE.Box3().setFromObject(object),dims=new THREE.Vector3();
    bb.getSize(dims);object.scale.multiplyScalar(2/Math.max(.1,dims.x,dims.y,dims.z));
    resolve({object,clips:g.animations||[]});
   },undefined,()=>resolve(null));
  }));
  return models.get(name);
 }
 function addModel(parent,name,scale=1,x=0,y=0,z=0,rotation=0){
  const ticket={live:true};
  model(name).then(proto=>{
   if(!ticket.live||!proto)return;
   const obj=proto.object.clone(true);obj.scale.multiplyScalar(scale);obj.position.set(x,y,z);
   if(proto.clips.length && mixers.size<24 && /bathyscaphe|glow_fish|manta|angler|seahorse|kelp/.test(name)){
    const mix=new THREE.AnimationMixer(obj);mix.clipAction(proto.clips[0]).play();mixers.add(mix);ticket.mixer=mix;
   }
   obj.rotation.y=rotation;parent.add(obj);
  });return ticket;
 }
 addModel(sub,'bathyscaphe',1.65);addModel(ghost,'diving_helmet',.55);
 // Fixed narrative landmarks: these are the real generated animated GLB models.
 const landmarks=[
  ['cathedral_bell',75,34,1.7],['cathedral_tower',77,38,3.1],
  ['treasure_chest',81,34,1],['treasure_chest',89,27,1],['treasure_chest',96,42,1],
  ['street_lamp',80,37,1.5],['street_lamp',87,37,1.5],['street_lamp',94,37,1.5],
  ['coral_branch_violet',80,42,1.5],['coral_branch_orange',93,46,1.5],
  ['submarine_wreck',101,31,2],['arch',73,43,2.6],
  ['angler',78,44,1.2]
 ];
 landmarks.forEach(([id,x,z,size])=>addModel(scene,id,size,x,seabedHeight(x,z,seed)+.4,z,hash(x,z,seed)*6.28));
 function chunk(cx,cz){
  const group=new THREE.Group(),pos=[],col=[],uv=[],faces=[],tickets=[];
  const corners=[[0,0],[1,0],[1,1],[0,1]];
  for(let z=cz*CHUNK;z<(cz+1)*CHUNK;z++)for(let x=cx*CHUNK;x<(cx+1)*CHUNK;x++){
   if(inside(x,z))continue;
   const h=seabedHeight(x+.5,z+.5,seed),n=fbm(x*.18,z*.18,seed+29);
   const k=h>4?0:h>-1?4:h>-5?(n>.67?2:4):(n>.4?11:2);
   const u0=(k%4)*.25+.002,u1=u0+.246,v0=1-(Math.floor(k/4)+1)/3+.002,v1=v0+.328;
   const coords=[[u0,v1],[u1,v1],[u1,v0],[u0,v0]],b=pos.length/3,light=clamp(.62+(h+10)*.016+n*.32,.48,.98);
   for(let i=0;i<4;i++){
    const px=x+corners[i][0],pz=z+corners[i][1];
    pos.push(px,seabedHeight(px,pz,seed),pz);uv.push(...coords[i]);col.push(light*.85,light*.99,light);
   }
   faces.push(b,b+2,b+1,b,b+3,b+2);
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  geo.setIndex(faces);geo.computeVertexNormals();
  group.add(new THREE.Mesh(geo,mat));
  for(let i=0;i<7;i++){
   const x=cx*CHUNK+2+Math.floor(hash(cx*97+i,cz*43+i,seed)*19);
   const z=cz*CHUNK+2+Math.floor(hash(cx*41+i,cz*79-i,seed)*19);
   if(inside(x,z))continue;
   const y=seabedHeight(x,z,seed);if(y>=SEA-.4)continue;
   const choices=y<-4?['kelp_tall','coral_branch_violet','arch','cathedral_tower','submarine_wreck']:['seagrass','kelp_tall','coral_branch_orange','street_lamp','arch','angel_statue'];
   const name=choices[Math.floor(hash(x,z,seed+5)*choices.length)];
   tickets.push(addModel(group,name,name==='cathedral_tower'?2.8:name==='arch'?1.8:1.1,x+.5,y,z+.5,hash(z,x,seed)*6.28));
  }
  for(let i=0;i<3;i++){
   const x=cx*CHUNK+3+hash(cx*13+i,cz*17-i,seed)*18,z=cz*CHUNK+3+hash(cx*29-i,cz*31+i,seed)*18;
   if(inside(x,z))continue;
   const fy=seabedHeight(x,z,seed);if(fy>=SEA-1.7)continue;
   const kind=['glow_fish_teal','glow_fish_violet','manta','seahorse','angler'][Math.floor(hash(x,z,seed+11)*5)];
   const holder=new THREE.Group();holder.position.set(x,Math.min(SEA-1,fy+2),z);group.add(holder);
   tickets.push(addModel(holder,kind,kind==='angler'?1:.65));
   creatures.push({holder,chunk:cx+','+cz,x,z,y:holder.position.y,kind,phase:hash(z,x,seed)*6.28,health:50});
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
 function isSubmerged(p=player.pos){return p.y<SEA-.18&&floor(p.x,p.z)<SEA-.45;}
 function physicsStep(h){
  const p=player.pos,v=player.vel,vy=player.jumpHeld?3.0:-1.0;
  v.y+=(vy-v.y)*clamp(h*3.6,0,1);p.x+=v.x*h;p.z+=v.z*h;
  const gy=floor(p.x,p.z);p.y=clamp(p.y+v.y*h,gy+.08,SEA+.55);
  player.onGround=p.y<=gy+.09;
  if(player.onGround)v.y=Math.max(0,v.y);
  if(p.y>=SEA+.5)v.y=Math.min(0,v.y);
  return 0;
 }
 function toggleBathyscaphe(){
  if(!isSubmerged()&&!bathy){toast('Батискаф доступен под водой',2300);return false;}
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
  time+=dt;const wet=isSubmerged();
  if(wet||player.pos.x<3||player.pos.z<3||player.pos.x>60||player.pos.z>60)ensure();
  o.water.position.set(player.pos.x,SEA,player.pos.z);
  if(!wet)bathy=false;
  sub.visible=bathy;sub.position.copy(player.pos);sub.position.y+=Math.sin(time*2.2)*.07;
  sub.rotation.y=Math.atan2(player.look.x,player.look.z);
  if(bathy)hero.visible=false;
  ghost.visible=player.pos.x>53&&player.pos.x<98&&Math.abs(player.pos.z-31)<64;
  ghost.position.set(69,seabedHeight(69,31,seed)+2+Math.sin(time)*.25,31);
  ghost.rotation.y+=dt*.18;hud.style.display=wet?'block':'none';
  minimap.style.display=wet?'block':'none';
  if(wet&&time-lastMap>.45){lastMap=time;drawMiniMap();}
  if(wet){
   const q=QUESTS[qi],hint=bathy?(canFire()?'Батискаф: оружие готово':'Батискаф: найди стрелковое оружие'):'Удерживай прыжок: вверх. Отпусти: вниз.';
   hud.textContent='◈ ГЛУБИНА '+(SEA-player.pos.y).toFixed(1)+'м\n'+(q?'Задание: '+q[1]:'Все задания выполнены')+'\n'+hint;
   scene.fog.color.set('#0c4258');
   o.skyU.uTop.value.set('#092c44');
   o.skyU.uHorizon.value.set('#1a6076');
   o.skyU.uBottom.value.set('#123044');
   o.skyU.uSunVis.value=.02;
   scene.fog.density=.025+Math.max(0,SEA-player.pos.y)*.004;
   if(within(player.pos,69,31,7)&&time-lastHint>18){lastHint=time;interact();}
  }
  for(const mixer of mixers)mixer.update(Math.min(dt,.05));
  for(const c of creatures)if(c.holder.visible){
   if(wet&&c.kind==='angler'&&within(player.pos,c.holder.position.x,c.holder.position.z,3.6)
      &&time-(c.lastAggro||-90)>50&&hash(Math.floor(time/19),Math.floor(c.x),seed)>.86){
       c.lastAggro=time;toast('Осторожно: удильщик защищает гнездо!',1800);
       o.onCreatureAttack?.(1,c.x,c.z);
   }
   c.phase+=dt*(c.kind==='manta'?.5:1.2);
   c.holder.position.set(c.x+Math.sin(c.phase)*1,c.y+Math.sin(c.phase*.8)*.24,c.z+Math.cos(c.phase*.9)*.7);
   c.holder.rotation.y=c.phase*.3;
  }
 }
 return {groundHeight:(x,z)=>seabedHeight(x,z,seed),isSubmerged,physicsStep,
  update,toggleBathyscaphe,canFire,onShot,interact,
  get inBathyscaphe(){return bathy;},get chunks(){return chunks.size;},
  get creatures(){return creatures.length;},get questIndex(){return qi;}};
}
