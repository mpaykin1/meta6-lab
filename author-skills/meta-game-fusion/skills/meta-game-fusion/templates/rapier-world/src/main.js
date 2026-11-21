import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {FusionPhysics} from './physics-world.js';
import {FusionStoryFlow} from './story-flow.js';
import {FusionNavigation} from './navigation.js';
import {FusionPostFX, FUSION_STYLES} from './postfx.js';
import {FusionLivingWorld} from './living-world.js';
import {FusionSpatialBVH} from './spatial-bvh.js';
import './style.css';

const $=id=>document.getElementById(id);
const renderer=new THREE.WebGLRenderer({canvas:$('world'),antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.28;
const scene=new THREE.Scene();
scene.background=new THREE.Color('#0d1423');
scene.fog=new THREE.FogExp2('#17202d',0.019);
const camera=new THREE.PerspectiveCamera(61,window.innerWidth/window.innerHeight,0.07,170);
camera.position.set(0,4.8,11.2);
scene.add(new THREE.HemisphereLight('#799ac1','#1e161c',2.0));
const key=new THREE.DirectionalLight('#d9c0a2',2.5);key.position.set(-8,16,-18);scene.add(key);
const rim=new THREE.PointLight('#ee996e',26,24);rim.position.set(6,4,-13);scene.add(rim);
const groundMat=new THREE.MeshStandardMaterial({color:'#252733',roughness:.94,metalness:.05});
const paverMat=new THREE.MeshStandardMaterial({color:'#34353c',roughness:1});
const railMat=new THREE.MeshStandardMaterial({color:'#343b47',roughness:.82,metalness:.55});
const pillarMat=new THREE.MeshStandardMaterial({color:'#252a30',roughness:1});
const gold=new THREE.MeshStandardMaterial({color:'#e5a26d',emissive:'#b84d31',emissiveIntensity:2.1,roughness:.31});
const geometry={box:new THREE.BoxGeometry(1,1,1)};
const clock=new THREE.Clock();
const markerObjects=new Map();
const crateMeshes=[];
let physics=null,flow=null,navigation=null,postFX=null,livingWorld=null,wait=false,storyOpen=false,activeMarker=null;

// Stable read-only runtime observability for accessibility, debugging and browser verification.
// This is not a cheat/control API: it cannot set position, bypass gates, select choices or change physics.
Object.defineProperty(window, '__MGF_STATE__', { configurable:false, enumerable:false, value: () => {
  const p=physics?.lastPos, g=physics?.guidePosition;
  return Object.freeze({
    schema:'meta-game-fusion.telemetry.v1',ready:Boolean(physics&&flow&&hero?.parent===scene),
    actorCount:hero?.parent===scene?1:0,
    player:p?Object.freeze({x:p.x,y:p.y,z:p.z,grounded:Boolean(physics.lastGrounded),verticalVelocity:physics.velocityY}):null,
    npc:g?Object.freeze({x:g.x,y:g.y,z:g.z}):null,
    nav: Object.freeze({ready:Boolean(navigation),status:navigation?.status||'unavailable',target:navigation?.targetID||null}),
    node:flow?.current||null,active:flow?.active??null,
    storyOpen, choiceCount:flow?.frame?.choices?.length||0,
    style:postFX?.style||null,quality:postFX?.mode||'off',
    phase:physics?.elapsed||0, livingScene:livingWorld?.active||null,
    spatial:Object.freeze({enabled:spatial?.enabled??false,meshes:spatial?.stats.meshes??0,trees:spatial?.stats.trees??0,visibleTarget:navigation?.targetVisible??null}),
  });
}});

postFX=new FusionPostFX({renderer,scene,camera,lights:{rim}});
let lastTouchE=false;
function box(x,y,z,sx,sy,sz,mat,parent=scene){const o=new THREE.Mesh(geometry.box,mat);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.userData.mgfStatic=true;parent.add(o);return o}
function groundVisual(){
  box(0,-.47,-16,89,.3,199,groundMat);
  for(let z=7;z>-73;z-=2){
    box(0,-.13,z,11.4,.14,1.83,paverMat);
    box(-3.9,.025,z,.10,.12,1.82,railMat);
    box(3.9,.025,z,.10,.12,1.82,railMat);
    if(Math.abs(z%6)<3.1){box(-2,.025,z,0.085,.19,1.6,railMat);box(2,.025,z,.085,.19,1.6,railMat)}
  }
  for(let z=4;z>-72;z-=13){
    box(-5.8,1,z,.8,2,11.4,pillarMat).userData.mgfOccluder=true;box(5.8,1,z,.8,2,11.4,pillarMat).userData.mgfOccluder=true;
    for(const x of[-5.85,5.85]){
      const top=new THREE.Mesh(new THREE.CylinderGeometry(.54,.65,4.5,8),pillarMat);
      top.position.set(x,3.1,z);scene.add(top);
      box(x,5.25,z,1.4,.25,1.2,paverMat);
    }
    if(z<-5){box(0,7.8,z,13,.6,.9,pillarMat).userData.mgfOccluder=true;}
  }
  const fixed=[[-2.8,.85,-13.5,1,.85,.75],[2.6,.95,-20.5,1.1,.95,.7],[0,.5,-31.5,1.65,.5,.4],[-3.3,.9,-43.5,.8,.9,1.4],[2.8,.8,-55.5,.8,.8,.7]];
  for(const [x,y,z,hx,hy,hz]of fixed)box(x,y,z,2*hx,2*hy,2*hz,pillarMat).userData.mgfOccluder=true;
  // Low-poly distant silhouettes, static atmospheric depth. Never paired with false physics blockers.
  const rockMat=new THREE.MeshStandardMaterial({color:'#151d29',roughness:1});
  for(let i=0;i<90;i++){
    const seed=(i*7919%997)/997;
    const x=(i%2?1:-1)*(13+seed*44);
    const z=7-(i*23.79%130);
    const h=2+((i*17)%15);
    const t=new THREE.Mesh(new THREE.ConeGeometry(1.6+seed*3,h,4),rockMat);
    t.position.set(x,h/2-.4,z);t.rotation.y=seed*2.3;scene.add(t);
  }
  const starGeo=new THREE.BufferGeometry();const stars=new Float32Array(650*3);
  for(let i=0;i<650;i++){const f=(i*167.31)%1;stars[i*3]=(Math.sin(i*22.11)*67);stars[i*3+1]=2+((i*1.23)%24);stars[i*3+2]=-70+(i*13.3%100)}
  starGeo.setAttribute('position',new THREE.BufferAttribute(stars,3));
  const points=new THREE.Points(starGeo,new THREE.PointsMaterial({color:'#b3bfd0',size:.12,transparent:true,opacity:.33,depthWrite:false}));points.userData.isDust=true;scene.add(points);
  return points;
}
const dust=groundVisual();
const spatial=new FusionSpatialBVH();
spatial.register(scene); // Shared box geometry receives one BVH; all static meshes use it.
const crateMaterial=new THREE.MeshStandardMaterial({color:'#775445',metalness:.19,roughness:.8});
const hero=new THREE.Group();scene.add(hero);
const cloth=new THREE.MeshStandardMaterial({color:'#8c5046',roughness:.89,metalness:.05,side:THREE.DoubleSide});
const leather=new THREE.MeshStandardMaterial({color:'#2d2734',roughness:1});
const skin=new THREE.MeshStandardMaterial({color:'#bd9881',roughness:1});
const cloak=new THREE.Mesh(new THREE.ConeGeometry(.51,1.5,7,1),cloth);cloak.rotation.y=Math.PI;cloak.position.y=-.10;hero.add(cloak);
const hood=new THREE.Mesh(new THREE.SphereGeometry(.35,10,8),leather);hood.position.set(0,.67,-.02);hero.add(hood);
const face=new THREE.Mesh(new THREE.SphereGeometry(.2,10,8),skin);face.position.set(0,.64,-.2);hero.add(face);
const staff=new THREE.Mesh(new THREE.CylinderGeometry(.035,.055,1.7,7),railMat);staff.position.set(.34,0,-.1);staff.rotation.z=-.09;hero.add(staff);
const ember=new THREE.Mesh(new THREE.IcosahedronGeometry(.09,1),gold);ember.position.set(.34,.85,-.12);hero.add(ember);
const heroLight=new THREE.PointLight('#ff9d63',2.7,5);heroLight.position.set(.3,.85,0);hero.add(heroLight);
function makeMarker(n,pos){
  const obj=new THREE.Group();obj.position.set(pos.x,pos.y,pos.z);scene.add(obj);
  const outer=new THREE.Mesh(new THREE.TorusGeometry(.73,.043,6,40),gold);outer.rotation.x=Math.PI/2;outer.position.y=-1.13;obj.add(outer);
  const peak=new THREE.Mesh(new THREE.OctahedronGeometry(.34),gold);obj.add(peak);
  const light=new THREE.PointLight('#f0a274',9,9);obj.add(light);markerObjects.set(n.id,{group:obj,outer,peak,light});
}
const inputs=new Set();
let jumpPressed=false,interactPressed=false;
const keys={arrowup:'w',arrowdown:'s',arrowleft:'a',arrowright:'d',' ':'space',spacebar:'space'};
function norm(k){return keys[k.toLowerCase()]||k.toLowerCase()}
addEventListener('keydown',e=>{
  const k=norm(e.key);if(k==='n'&&!e.repeat){e.preventDefault();if(navigation){$('message').textContent=navigation.toggleDebug()?'NavMesh: ON':'NavMesh: OFF';}return;}if(['w','a','s','d','e','space'].includes(k)){e.preventDefault();if(!e.repeat&&k==='space')jumpPressed=true;if(!e.repeat&&k==='e')interactPressed=true;inputs.add(k)}
});
addEventListener('keyup',e=>{inputs.delete(norm(e.key))});
addEventListener('blur',()=>inputs.clear());
for(const el of document.querySelectorAll('.touch [data-key]')){
  const key=el.dataset.key;
  el.addEventListener('pointerdown',e=>{e.preventDefault();el.setPointerCapture(e.pointerId);if(key==='e')interactPressed=true;if(key==='space')jumpPressed=true;inputs.add(key);el.classList.add('pressed')});
  for(const type of['pointerup','pointercancel','lostpointercapture'])el.addEventListener(type,()=>{inputs.delete(key);el.classList.remove('pressed')});
}
const loader=new GLTFLoader();loader.setMeshoptDecoder(MeshoptDecoder);
async function attachModels(config){
  for(const asset of config.assets||[]){
    const p=config.markers[asset.scene_id];if(!p)continue;
    try{
      const gltf=await loader.loadAsync(asset.src);
      // Never animate imported hero or replace the single controller. Models are scenery only.
      gltf.scene.position.set(p.x+2.9,0,p.z-2.6);
      gltf.scene.rotation.y=-Math.PI*.23;
      scene.add(gltf.scene);
      // ScanCode/hash-approved imported scenery only: animated or skinned rigs are never indexed.
      if(!gltf.animations?.length && !asset.animation_clips?.length){
        gltf.scene.userData.mgfStatic=true;
        spatial.register(gltf.scene,{occluder:true});
      }
    } catch(e){console.warn('Approved model unavailable',asset.src,e)}
  }
}
function showDialogue(payload){
  $('story').hidden=false;storyOpen=true;inputs.clear();
  $('storyTitle').textContent=payload.node.title;
  const lines=$('storyLines');lines.replaceChildren();
  for(const t of payload.frame?.lines||[]){const p=document.createElement('p');p.textContent=t;lines.append(p)}
  const choices=$('choices');choices.replaceChildren();
  for(const c of payload.frame?.choices||[]){
    const b=document.createElement('button');b.textContent=c.text;
    b.addEventListener('click',()=>{try{flow.choose(c.index)}catch(e){error(e)}});choices.append(b)
  }
  $('storyNext').hidden=!payload.frame?.complete;
}
function nextScene(node){
  $('chapter').textContent=node.title;
  livingWorld?.enter(node.id);
  const style=flow?.world?.visual_direction?.by_node?.[node.id] || node.visual_style;
  if(style && postFX?.setMood(style)) updateFxLabels();
  const name=node.type==='mechanic'?'Найди сигнал и используй механику':((flow?.world?.source==='user-authored-concept')?'Исследуй главу: '+node.title:'Исследуй руины и найди сигнальный огонь');
  $('objective').textContent=name;
  if(node.type==='mechanic')$('message').textContent='Ссылка на механику из библиотеки; исполняется только физический демонстратор.';
  if(navigation&&flow?.world?.markers?.[node.id]){const reached=navigation.setTarget(node.id,flow.world.markers[node.id]);$('navStatus').textContent=reached?'ПРОВОДНИК · ПУТЬ':'ПРОВОДНИК · НЕТ ПУТИ';}
}
function gameStatus(payload){
  if(payload.type==='dialogue'){showDialogue(payload);return}
  $('story').hidden=true;storyOpen=false;
  if(payload.type==='scene')nextScene(payload.node);
}
function error(e){$('message').textContent=String(e?.message||e);console.error(e)}
$('storyNext').addEventListener('click',async()=>{try{$('story').hidden=true;storyOpen=false;await flow.interact()}catch(e){error(e)}});
$('restart').addEventListener('click',()=>location.reload());
$('nav').addEventListener('click',()=>{if(navigation){$('message').textContent=navigation.toggleDebug()?'NavMesh: ON':'NavMesh: OFF';}});
function updateBVHLabel(){ $('spatial').textContent=`BVH: ${spatial.enabled?'ON':'OFF'} · ${spatial.stats.meshes}`; }
$('spatial').addEventListener('click',()=>{ spatial.enabled=!spatial.enabled;updateBVHLabel(); });
renderer.domElement.addEventListener('pointerdown',e=>{
  if(storyOpen || !physics || !flow?.active || !spatial.enabled) return;
  const hit=spatial.pick(e.clientX,e.clientY,camera,renderer.domElement);
  if(hit){ $('message').textContent=`BVH: ${hit.object.name||'поверхность'} · ${hit.distance.toFixed(1)} м`; }
});
updateBVHLabel();
function updateFxLabels(){
  $('quality').textContent='FX: '+(postFX?.mode||'off').toUpperCase();
  $('style').textContent='СТИЛЬ: '+(postFX?.styleLabel||'ОБЫЧНЫЙ');
}
$('quality').addEventListener('click',()=>{postFX?.cycleMode();updateFxLabels();});
$('style').addEventListener('click',()=>{postFX?.cycleMood();updateFxLabels();});
window.addEventListener('keydown',e=>{
  if(e.repeat||e.altKey||e.ctrlKey||e.metaKey)return;
  if(e.key.toLowerCase()==='p'){postFX?.cycleMode();updateFxLabels();}
  if(e.key.toLowerCase()==='v'){postFX?.cycleMood();updateFxLabels();}
});
$('save').addEventListener('click',()=>{try{const s={story:flow.save(),position:physics.lastPos};localStorage.setItem('mgf-world-save:'+flow.world.title,JSON.stringify(s));$('message').textContent='Прогресс сохранён'}catch(e){error(e)}});
$('load').addEventListener('click',async()=>{try{const s=JSON.parse(localStorage.getItem('mgf-world-save:'+flow.world.title)||'null');if(!s)throw new Error('Нет сохранения');await flow.restore(s.story);const p=s.position;if(p && Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.z)&&Math.max(Math.abs(p.x),Math.abs(p.z))<200){physics.player.setTranslation(p,true);physics.lastPos=p;physics.velocityY=0} $('message').textContent='Прогресс восстановлен'}catch(e){error(e)}});
let accumulator=0;let movePhase=0;
function renderLoop(){
  const dt=Math.min(clock.getDelta(),.075);accumulator=Math.min(accumulator+dt,.12);
  const paused=storyOpen||!flow?.active;
  while(accumulator>=1/60){
    if(physics){
      const vx=paused?0: (inputs.has('d')?1:0)-(inputs.has('a')?1:0);
      const vz=paused?0: (inputs.has('s')?1:0)-(inputs.has('w')?1:0);
      const guide=(!paused&&navigation)?navigation.command():{x:0,z:0};
      physics.step({x:vx,z:vz,jump:!paused&&(jumpPressed||inputs.has('space'))},guide);
      navigation?.afterStep(paused);
      if(!paused&&vx*vx+vz*vz>.01)movePhase+=1/60;
    }
    accumulator-=1/60;
  }
  jumpPressed=false;
  if(physics){
    const p=physics.lastPos;hero.position.set(p.x,p.y-.09,p.z);
    for(const entry of crateMeshes){entry.mesh.position.copy(entry.body.translation());entry.mesh.quaternion.copy(entry.body.rotation());}
    const moving=inputs.has('w')||inputs.has('s')||inputs.has('a')||inputs.has('d');
    if(!paused&&moving){hero.rotation.y=THREE.MathUtils.lerp(hero.rotation.y,Math.atan2((inputs.has('a')?1:0)-(inputs.has('d')?1:0),(inputs.has('w')?1:0)-(inputs.has('s')?1:0)),.15)}
    cloak.scale.x=1+(moving?.06*Math.sin(movePhase*12):0);
    const target=new THREE.Vector3(p.x,p.y+3.35,p.z+8.5);camera.position.lerp(target,.065);camera.lookAt(p.x,p.y+.1,p.z-4.3);
    const node=flow?.nodes?.get(flow.current);
    const physicalNode=(node?.type==='scene'||node?.type==='mechanic')?node.id:null;
    const near=physicalNode&&physics.nearSensor(physicalNode);
    $('prompt').hidden=!near||paused;
    if(interactPressed&&!paused){
      interactPressed=false;
      if(near)flow.interact().catch(error);
    }
  }
  const time=performance.now()*0.001;navigation?.animate(time,paused);
  livingWorld?.update(dt,time,postFX?.mode||'off');
  if(postFX?.mode!=='off'){dust.material.opacity=.26+.06*Math.sin(time*.41);for(const o of markerObjects.values()){o.peak.rotation.y=time*.6;o.peak.position.y=Math.sin(time*1.3)*.14}}
  if(postFX){postFX.render(dt);if($('quality').textContent!==`FX: ${postFX.mode.toUpperCase()}`)updateFxLabels();}
  else renderer.render(scene,camera);
  requestAnimationFrame(renderLoop);
}
async function boot(){
  try{
    const res=await fetch('/world.json',{cache:'no-store'});
    if(!res.ok)throw new Error('Не найден файл мира');
    const world=await res.json();if(world.schema!=='meta-game-fusion.physics-world.v1')throw new Error('Неизвестный формат мира');
    $('chapter').textContent=world.title;
    if(world.source==='user-authored-concept')$('endingNote').textContent='Путь завершён. Мир ждёт продолжения.';
    livingWorld=new FusionLivingWorld({scene,world,seed:world.scene_composer?.seed||0});
    postFX?.setMood(world.visual_direction?.default||'nocturne',true);
    postFX?.setMode(world.visual_direction?.quality||'cinema');
    updateFxLabels();
    physics=await FusionPhysics.create();
    // Navigation is optional; its absence never prevents the Rapier game from running.
    try{navigation=await FusionNavigation.create({physics,scene});
      navigation.setVisibilityProbe((from,to)=>spatial.lineOfSight(from,to));
      $('navStatus').textContent='ПРОВОДНИК · NAVMESH';}
    catch(e){console.warn('Recast unavailable:',e);$('navStatus').textContent='ПРОВОДНИК · НЕДОСТУПЕН';}
    for(const item of physics.dynamic){
      const mesh=new THREE.Mesh(geometry.box,crateMaterial);
      mesh.scale.setScalar(item.half*2);mesh.position.copy(item.body.translation());scene.add(mesh);
      const brace=new THREE.Mesh(new THREE.BoxGeometry(item.half*1.66,item.half*1.66,item.half*1.66),railMat);
      brace.position.y=item.half*.12;mesh.add(brace);
      crateMeshes.push({mesh,body:item.body});
    }
    for(const node of world.nodes){
      const p=world.markers[node.id];if(p){physics.addSensor(node.id,p.x,p.y,p.z,1.65);makeMarker(node,p)}
    }
    let manifest={stories:[]};
    try{const data=await fetch('/stories/manifest.json',{cache:'no-store'});if(data.ok)manifest=await data.json()}catch(e){console.warn('No story list',e)}
    flow=new FusionStoryFlow({world,manifest,onDisplay:gameStatus,onScene:nextScene,onFinish:r=>{
      $('story').hidden=true;storyOpen=false;$('ending').hidden=false;$('endingTitle').textContent=r.title;
      $('prompt').hidden=true;inputs.clear();
    }});
    await attachModels(world);
    updateBVHLabel();
    await flow.begin();
    $('veil').style.opacity='0';setTimeout(()=>$('veil').remove(),850);
    renderLoop();
  }catch(e){$('boot').textContent='Не удалось запустить мир: '+String(e?.message||e);console.error(e)}
}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();postFX ? postFX.resize(innerWidth,innerHeight) : renderer.setSize(innerWidth,innerHeight)});
boot();
