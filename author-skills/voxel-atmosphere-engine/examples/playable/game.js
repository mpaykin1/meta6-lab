import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {configureAssetLoader} from './fx/asset-loader.js';

const host=document.getElementById('game');
const loading=document.getElementById('loading');
const subtitle=document.getElementById('subtitle');
const quest=document.getElementById('quest');
const physicsButton=document.getElementById('physics-mode');
const villagersButton=document.getElementById('villagers-mode');
let livingForest=null;
villagersButton?.addEventListener('click',()=>{
 const visible=livingForest?.togglePaths();
 if(visible!=null)villagersButton.title=visible?'Маршруты NPC видимы':'Маршруты NPC скрыты';
});
window.addEventListener('keydown',e=>{if(e.code==='KeyN'&&!e.repeat)villagersButton?.click()});
let physics=null;
const relicColliderQueue=[];
physicsButton?.addEventListener('click',()=>{
 if(!physics)return;
 physics.setEnabled(!physics.enabled);
 physicsButton.textContent=physics.enabled?'⬡ RAPIER ON':'⬢ PHYSICS OFF';
});
window.addEventListener('keydown',e=>{if(e.code==='KeyH'&&!e.repeat)physicsButton?.click()});
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x131b29);
scene.fog=new THREE.FogExp2(0x1c2937, 0.031);
// Layer 1: deep blue moon fog. Layer 2: Goxel sculpted ruins and crystal clusters.

const camera=new THREE.PerspectiveCamera(44, 16/9, .08, 155);
const renderer=new THREE.WebGLRenderer({antialias:false,alpha:false,powerPreference:'high-performance'});
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.52;
renderer.shadowMap.enabled=false;
host.appendChild(renderer.domElement);
// pmndrs postprocessing is optional: if unavailable, the same playable game
// continues using the original Three.js renderer, never a blank screen.
const fxButton = document.getElementById('fx-mode');
// Pixelorama authored spritesheet is layered over (not swapped for) original 3D GLB props.
const pixelButton = document.getElementById('pixel-mode');
let pixelArt = null;
let pixelEnabled = true;
pixelButton?.addEventListener('click', () => {
  pixelEnabled=!pixelEnabled;
  pixelArt?.setVisible(pixelEnabled);
  pixelButton.textContent=pixelEnabled?'✧ PIXEL ART':'✕ ART OFF';
});
window.addEventListener('keydown',e=>{
  if(e.code==='KeyP'&&!e.repeat)pixelButton?.click();
});
import('./fx/pixelorama.js').then(mod => mod.createPixeloramaArt(THREE, scene, camera))
 .then(layer=>{pixelArt=layer;pixelArt.setVisible(pixelEnabled)})
 .catch(err=>console.warn('Optional Pixelorama sprite art missing; GLB game remains intact',err));
let fxPipeline = null;
let fxMode = (matchMedia('(pointer:coarse)').matches ? 'balanced' : 'cinematic');
const fxNames = {cinematic:'✦ CINEMA', balanced:'✧ LIGHT', off:'✕ FX OFF'};
function applyFXMode(mode) {
  fxMode = mode;
  if (fxPipeline && mode !== 'off') fxPipeline.setMode(mode);
  renderer.toneMapping = (fxPipeline && mode !== 'off') ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping;
  fxButton.textContent = fxNames[mode] || 'FX';
  fxButton.setAttribute('aria-label', 'Качество эффектов: '+mode);
  document.querySelector('.vignette')?.classList.toggle('gpu-fx', !!fxPipeline && mode !== 'off');
  document.querySelector('.noise')?.classList.toggle('gpu-fx', !!fxPipeline && mode !== 'off');
}
fxButton.addEventListener('click', ()=>{
  const order=['cinematic','balanced','off'];
  applyFXMode(order[(order.indexOf(fxMode)+1)%order.length]);
});
window.addEventListener('keydown', e=>{
  if(e.code==='KeyB' && !e.repeat)fxButton.click();
});
applyFXMode(fxMode);
// Dynamic import is crucial: any missing CDN resource is nonfatal.
import('./fx/postfx.js').then(mod=>{
  fxPipeline = mod.createAtmosphereFX(renderer,scene,camera);
  fxPipeline.resize(renderer.domElement.width, renderer.domElement.height);
  applyFXMode(fxMode);
}).catch(error=>{
  console.warn('Optional postprocessing unavailable: keeping native rendering',error);
  fxPipeline=null;applyFXMode('off');
});
let lowFpsSeconds=0;
const totalSize={w:0,h:0};
function resize(){
  const w=host.clientWidth,h=host.clientHeight;
  if(w===totalSize.w && h===totalSize.h)return;
  totalSize.w=w;totalSize.h=h;
  const targetWidth=(w<700?380:560);
  const pixelW=Math.min(targetWidth,Math.max(260,Math.round(w*.72)));
  const pixelH=Math.round(pixelW*h/w);
  renderer.setSize(pixelW,pixelH,false);
  fxPipeline?.resize(pixelW,pixelH);
  camera.aspect=w/h;camera.updateProjectionMatrix();
}
resize();window.addEventListener('resize',resize);
scene.add(new THREE.HemisphereLight(0x93a8d6,0x262e25,1.55));
const moon=new THREE.DirectionalLight(0x8faacb,1.22);moon.position.set(-8,20,-10);scene.add(moon);
const fireLight=new THREE.PointLight(0xff7630,64,14,1.55);fireLight.position.set(0,2,0);scene.add(fireLight);
const mistGlow=new THREE.PointLight(0x587e9e,18,32,1.8);mistGlow.position.set(-8,7,-13);scene.add(mistGlow);
const portalLight = new THREE.PointLight(0x72ecea, 25, 10, 1.55);
portalLight.position.set(-2.5, 3.7, -8.2); scene.add(portalLight);
const crystalLight = new THREE.PointLight(0x47e0c9, 16, 8, 1.65);
crystalLight.position.set(6.4, 2.0, -1.5); scene.add(crystalLight);
// GPU instancing preserves individual glowing particles but cuts draw calls.
// Supported by meshoptimizer's GPU-locality philosophy; independent of gltfpack availability.
const particleDummy = new THREE.Object3D();
const particlePosition = new THREE.Vector3();
const portalMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(.055,.055,.055),
  new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.72,depthWrite:false}),32);
portalMesh.frustumCulled=false;
scene.add(portalMesh);
const portalEmbers = [];
for (let i=0;i<32;i++) {
  const angle=i*2.399, r=1.3+(i%5)*.25;
  const base=new THREE.Vector3(-2.5+Math.sin(angle)*r,2.5+(i%7)*.42,-8.25+Math.cos(angle)*.8);
  portalMesh.setColorAt(i,new THREE.Color(i%3?0x97ece4:0xe4ffcf));
  portalEmbers.push({base,phase:i*.61});
}
const lanterns=[[-3.5,2.1,2.6],[4,2.1,-3.4],[7,2.1,3],[-9,2.1,-3.5]];
for(let [x,y,z] of lanterns){let l=new THREE.PointLight(0xffaa5c,6,5.0,1.8);l.position.set(x,y,z);scene.add(l)}
const wood=new THREE.MeshStandardMaterial({color:0x473c39,flatShading:true});
const fireColors=[0xffba49,0xff6b21,0xffe786,0xffdf2e];
const flames=[];
for(let i=0;i<13;i++){
  const mesh=new THREE.Mesh(new THREE.ConeGeometry(.16+Math.random()*.23,1.1+Math.random()*.8,4),new THREE.MeshBasicMaterial({color:fireColors[i%fireColors.length],transparent:true,opacity:.88}));
  mesh.position.set((Math.random()-.5)*.85,.8,(Math.random()-.5)*.76);scene.add(mesh);
  flames.push({mesh,phase:Math.random()*6.28,base:mesh.position.y});
}
const sparkMesh=new THREE.InstancedMesh(new THREE.BoxGeometry(.035,.06,.035),
  new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.7,depthWrite:false}),46);
scene.add(sparkMesh);sparkMesh.frustumCulled=false;
const sparks=[];
for(let i=0;i<46;i++){
  sparkMesh.setColorAt(i,new THREE.Color(i%3?0xffa74a:0xffe3a2));
  sparks.push({pos:new THREE.Vector3((Math.random()-.5)*2,Math.random()*5,(Math.random()-.5)*2),
    spd:.2+Math.random()*.8,seed:Math.random()*Math.PI*2});
}
const fireflyMesh=new THREE.InstancedMesh(new THREE.BoxGeometry(.05,.05,.05),
  new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.7,depthWrite:false}),28);
scene.add(fireflyMesh);fireflyMesh.frustumCulled=false;
const fireflies=[];
for(let i=0;i<28;i++){
  const base=new THREE.Vector3((Math.random()-.5)*29,.3+Math.random()*3,(Math.random()-.5)*25);
  fireflyMesh.setColorAt(i,new THREE.Color(i%3===0?0xd1ef91:0x91cfc0));
  fireflies.push({base,phase:Math.random()*6.28});
}
function writeInstance(mesh,i,position,scale=1){
  particleDummy.position.copy(position);
  particleDummy.scale.setScalar(scale);
  particleDummy.rotation.set(0,0,0);
  particleDummy.updateMatrix();mesh.setMatrixAt(i,particleDummy.matrix);
}
// Assign initial transforms before first render.
portalEmbers.forEach((p,i)=>writeInstance(portalMesh,i,p.base));portalMesh.instanceMatrix.needsUpdate=true;
sparks.forEach((p,i)=>writeInstance(sparkMesh,i,p.pos));sparkMesh.instanceMatrix.needsUpdate=true;
fireflies.forEach((p,i)=>writeInstance(fireflyMesh,i,p.base));fireflyMesh.instanceMatrix.needsUpdate=true;
// Quarks is an OPTIONAL real particle engine, layered over the exact same world assets.
// On load/network errors we retain the existing Three.js InstancedMesh particles.
const quarksButton=document.getElementById('quarks-mode');
const fallbackParticles=[portalMesh,sparkMesh,fireflyMesh];
let quarks=null;
let quarksMode=matchMedia('(pointer:coarse)').matches?'balanced':'cinematic';
const quarksLabels={cinematic:'✦ QUARKS ON',balanced:'✧ QUARKS LITE',off:'✕ QUARKS OFF'};
function setQuarksMode(mode){
  quarksMode=mode;
  if(quarks){
    quarks.setMode(mode);
    // Original particles are never deleted; they remain an always-ready fallback.
    for(const mesh of fallbackParticles)mesh.visible=mode==='off';
  }else{
    for(const mesh of fallbackParticles)mesh.visible=true;
  }
  quarksButton.textContent=quarks?quarksLabels[mode]:'✧ QUARKS…';
}
quarksButton?.addEventListener('click',()=>{
  if(!quarks)return;
  const choices=['cinematic','balanced','off'];
  setQuarksMode(choices[(choices.indexOf(quarksMode)+1)%choices.length]);
});
window.addEventListener('keydown', e=>{if(e.code==='KeyV'&&!e.repeat)quarksButton?.click();});
import('./fx/quarks-vfx.js').then(m=>m.createQuarksVFX(THREE,scene))
  .then(instance=>{quarks=instance;setQuarksMode(quarksMode);})
  .catch(error=>{
    console.warn('Quarks unavailable, preserving original animated particle layers',error);
    if(quarksButton){quarksButton.textContent='✕ QUARKS OFF';quarksButton.title='CDN недоступен: оригинальные частицы сохранены';}
    for(const mesh of fallbackParticles)mesh.visible=true;
  });

// Fully persistent player identity: actions deform one rig, never spawn alternate characters.
const hero=new THREE.Group(); scene.add(hero);
hero.position.set(0,0,5);
const colors={coat:0x8b8173,skin:0xc7af8d,boots:0x433e40,scarf:0x9f593d,face:0xbab5a7};
function meshBox(w,h,d,color,x,y,z,group=hero){
 let m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:1,flatShading:true}));m.position.set(x,y,z);group.add(m);return m;
}
const torso=meshBox(.57,.7,.34,colors.coat,0,1.05,0);
const head=meshBox(.38,.44,.36,colors.face,0,1.68,0);
const hair=meshBox(.4,.18,.40,colors.boots,0,1.94,0);
const scarf=meshBox(.59,.16,.42,colors.scarf,0,1.45,0);
const leftArm=meshBox(.18,.61,.24,colors.coat,-.44,1.05,0);
const rightArm=meshBox(.18,.61,.24,colors.coat,.44,1.05,0);
const leftLeg=meshBox(.22,.64,.29,colors.boots,-.18,.36,0);
const rightLeg=meshBox(.22,.64,.29,colors.boots,.18,.36,0);
const eyes=meshBox(.21,.035,.026,0xe0b976,0,1.68,.195);
// Hero uses single coherent meshes and keeps features in every action.
const keys=new Set();
function codeKey(e){return e.code||e.key}
window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(codeKey(e)))e.preventDefault();keys.add(codeKey(e));});
window.addEventListener('keyup',e=>keys.delete(codeKey(e)));
window.addEventListener('blur',()=>keys.clear());
for(const button of document.querySelectorAll('[data-key]')){
 const key=button.dataset.key;
 const press=e=>{e.preventDefault();button.setPointerCapture?.(e.pointerId);keys.add(key)};
 const release=e=>{e.preventDefault();keys.delete(key)};
 button.addEventListener('pointerdown',press);
 button.addEventListener('pointerup',release);
 button.addEventListener('pointercancel',release);
 button.addEventListener('lostpointercapture',release);
}
const pickables=[];
for(let i=0;i<6;i++){
 const a=i/6*Math.PI*2+.2;
 const x=Math.cos(a)* (3.8+(i%2)*2.0), z=Math.sin(a)* (3.2+(i%3));
 const m=new THREE.Mesh(new THREE.OctahedronGeometry(.17,0),new THREE.MeshBasicMaterial({color:0xffd27b}));
 m.position.set(x,1,z);scene.add(m);pickables.push({m,got:false});
 const glow=new THREE.PointLight(0xffd37d,1.7,2);glow.position.copy(m.position);scene.add(glow);
}
let count=0,elapsed=0,last=performance.now(), jumpV=0,altitude=0,attackT=0,rollT=0;
let lockActions={jump:false,attack:false,roll:false};
const obstacles=[[-5,-.5,1.45],[-7.2,2.3,1.06],[0,0,1.05],[-5.35,-8.2,0.7],[0.2,-8.2,0.7],[6.4,-1.5,1.25]];
function hit(x,z){if(Math.abs(x)>15.5||Math.abs(z)>12.5)return true;return obstacles.some(([cx,cz,r])=>(x-cx)**2+(z-cz)**2<r*r)}
const target=new THREE.Vector3();
// Blender/glTF authored timeline clips: environment animates autonomously;
// the hero mesh and all player-triggered actions remain completely unchanged.
const relicMixers=[];
function animate(now){requestAnimationFrame(animate);resize();let dt=Math.min((now-last)/1000,.05);last=now;elapsed+=dt;
 // Adaptive GPU path: preserve game and model identity on slow devices.
 lowFpsSeconds = dt > 0.032 ? lowFpsSeconds + dt : Math.max(0,lowFpsSeconds-dt*.4);
 if(lowFpsSeconds>3.5){
   if(quarksMode==='cinematic'&&quarks)setQuarksMode('balanced');
   if(fxMode==='cinematic')applyFXMode('balanced');
   else if(fxMode==='balanced')applyFXMode('off');
   lowFpsSeconds=0;
 }
 const movement=new THREE.Vector3((keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0),0,(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0));
 const moving=movement.lengthSq()>.01; const crouch=keys.has('KeyC');const running=keys.has('ShiftLeft')||keys.has('ShiftRight');
 const moveSpeed=(crouch?1.1:running?4.0:2.35);
 if(moving){movement.normalize();
  let angle=Math.atan2(movement.x,movement.z);let delta=((angle-hero.rotation.y+Math.PI*3)%(2*Math.PI))-Math.PI;hero.rotation.y+=delta*Math.min(1,dt*9);
 }
 // Rapier is optional: preserve the old playable keyboard/touch path if CDN/WASM fails.
 let physical=null;
 if(physics){
  try {physical=physics.move(dt,movement.x*moveSpeed,movement.z*moveSpeed,keys.has('Space'));}
  catch(error){console.warn('Rapier physics failed; native controls restored',error);
   try{physics.dispose()}catch(_){}
   physics=null;if(physicsButton)physicsButton.textContent='⬢ PHYSICS OFF';}
 }
 if(physical){
  hero.position.x=physical.x;hero.position.z=physical.z;altitude=physical.y;
 }else{
  if(moving){const v=moveSpeed*dt;
   if(!hit(hero.position.x+movement.x*v,hero.position.z))hero.position.x+=movement.x*v;
   if(!hit(hero.position.x,hero.position.z+movement.z*v))hero.position.z+=movement.z*v;
  }
  if(keys.has('Space')&&!lockActions.jump&&altitude<=.01){jumpV=5.8;lockActions.jump=true;}
  if(altitude>0||jumpV>0){altitude+=jumpV*dt;jumpV-=15*dt;if(altitude<0){altitude=0;jumpV=0;}}
 }
 if(!keys.has('Space'))lockActions.jump=false;
 if(keys.has('KeyJ')&&!lockActions.attack){attackT=.32;lockActions.attack=true;physics?.strike(hero.position,hero.rotation.y);if(quarks)quarks.burst(new THREE.Vector3(hero.position.x+Math.sin(hero.rotation.y)*.8,hero.position.y+1.1,hero.position.z+Math.cos(hero.rotation.y)*.8),'warm')}
 if(!keys.has('KeyJ'))lockActions.attack=false;
 if(keys.has('KeyQ')&&!lockActions.roll){rollT=.45;lockActions.roll=true}
 if(!keys.has('KeyQ'))lockActions.roll=false;
 attackT=Math.max(0,attackT-dt);rollT=Math.max(0,rollT-dt);
 const bob=(moving?Math.sin(elapsed*(running?17:11))*.04:0);
 hero.position.y=altitude + bob;
 torso.scale.y+=((crouch?.57:1)-torso.scale.y)*Math.min(1,dt*14);
 head.position.y+=( (crouch?1.25:1.68)-head.position.y)*Math.min(1,dt*14);
 hair.position.y=head.position.y+.26;eyes.position.y=head.position.y;
 scarf.position.y+=( (crouch?1.13:1.45)-scarf.position.y)*Math.min(1,dt*14);
 const swing=moving?Math.sin(elapsed*(running?17:11))*.45:0;
 leftLeg.rotation.x=swing;rightLeg.rotation.x=-swing;
 leftArm.rotation.x=-swing*.6;rightArm.rotation.x=attackT>0?(-Math.sin((1-attackT/.32)*Math.PI)*2):swing*.6;
 torso.rotation.z=rollT>0 ? Math.sin((1-rollT/.45)*Math.PI*2)*.3:0;
 for(let i=0;i<flames.length;i++){const f=flames[i];f.mesh.scale.y=.75+Math.sin(elapsed*11+f.phase)*.18;f.mesh.position.x+=Math.sin(elapsed*6+f.phase)*dt*.085;f.mesh.position.y=f.base+Math.sin(elapsed*5+f.phase)*.07;}
 fireLight.intensity=57+Math.sin(elapsed*12)*6+Math.cos(elapsed*19)*4;
 portalLight.intensity=22+4*Math.sin(elapsed*1.43);
 crystalLight.intensity=14+3*Math.sin(elapsed*2.11+.5);
 for (let i=0;i<portalEmbers.length;i++) {
   const p=portalEmbers[i];
   particleDummy.position.copy(p.base);
   particleDummy.position.y+=.16*Math.sin(elapsed*1.3+p.phase);
   particleDummy.position.x+=.1*Math.sin(elapsed*.8+p.phase);
   writeInstance(portalMesh,i,particleDummy.position,.6+.4*(1+Math.sin(elapsed*2.3+p.phase))*.5);
 }
 portalMesh.instanceMatrix.needsUpdate=true;
 for(let i=0;i<sparks.length;i++){
   const p=sparks[i];p.pos.y+=p.spd*dt;p.pos.x+=Math.sin(elapsed*2+p.seed)*dt*.07;
   if(p.pos.y>5.5){p.pos.y=.55;p.pos.x=(Math.random()-.5)*1.3;p.pos.z=(Math.random()-.5)*1.2;}
   writeInstance(sparkMesh,i,p.pos);
 }
 sparkMesh.instanceMatrix.needsUpdate=true;
 for(let i=0;i<fireflies.length;i++){
   const f=fireflies[i];particlePosition.copy(f.base);
   particlePosition.y+=Math.sin(elapsed*1.9+f.phase)*.24;
   particlePosition.x+=Math.sin(elapsed*.53+f.phase)*.3;
   writeInstance(fireflyMesh,i,particlePosition,.75+.2*(1+Math.sin(elapsed*3+f.phase))*.5);
 }
 fireflyMesh.instanceMatrix.needsUpdate=true;
 if(quarks){try{quarks.update(dt)}catch(error){
   console.warn('Quarks runtime failure; restoring original instanced effects',error);
   try{quarks.dispose()}catch(_){}quarks=null;
   for(const mesh of fallbackParticles)mesh.visible=true;
   if(quarksButton)quarksButton.textContent='✕ QUARKS OFF';
 }}
 if(livingForest)livingForest.update(dt,elapsed);
 pixelArt?.update(elapsed);
 for(const mixer of relicMixers)mixer.update(dt);
 for(let p of pickables){if(p.got)continue;p.m.rotation.y+=dt;p.m.position.y=1+Math.sin(elapsed*2+p.m.position.x)*.2;let dist=Math.hypot(p.m.position.x-hero.position.x,p.m.position.z-hero.position.z);
  if(dist<.7){p.got=true;p.m.visible=false;quarks?.burst(p.m.position,'cool');count++;quest.textContent=`✧ ${count} / 6 лесных искр`;if(count===6){subtitle.textContent='Лес вновь начинает просыпаться. ✦';fireLight.intensity=90;}}}
 const look=target.set(hero.position.x,1.5,hero.position.z);
 const desired=new THREE.Vector3(hero.position.x+11,9.0,hero.position.z+13.5);
 camera.position.lerp(desired,1-Math.exp(-1.2*dt));camera.lookAt(look.x,look.y,look.z);
 if (fxPipeline && fxMode !== 'off') {
   try {fxPipeline.render(dt)}
   catch(error) {
     console.warn('Post FX failed; native renderer restored',error);
     try {fxPipeline.dispose()} catch (_) {}
     fxPipeline=null;applyFXMode('off');renderer.render(scene,camera);
   }
 } else renderer.render(scene,camera);
}
const loader = configureAssetLoader(new GLTFLoader());
function placeRelic(url,x,y,z,rotation=0,fallback='') {
  loader.load(url, gltf => {
    // CRITICAL: external placement is an anchor, otherwise glTF root animation
    // would overwrite world-space position and teleport ruins to the origin.
    const anchor=new THREE.Group();
    anchor.position.set(x,y,z);
    anchor.rotation.y=rotation;
    anchor.add(gltf.scene);
    scene.add(anchor);
    if(url.includes("moon_gate")||url.includes("moon_crystals")){
      const name=url.includes("moon_gate")?"gate":"crystal";
      if(physics)physics.registerRelic(name,anchor);
      else relicColliderQueue.push({name,anchor});
    }
    if(gltf.animations?.length){
      const mixer=new THREE.AnimationMixer(gltf.scene);
      for(const clip of gltf.animations)mixer.clipAction(clip).play();
      relicMixers.push(mixer);
    }
  }, undefined, error => {
    console.warn('Animated relic unavailable, trying original model:',url,error);
    if(fallback)placeRelic(fallback,x,y,z,rotation);
  });
}
// Same actual Goxel/Blockbench voxel geometry; glTF animations originate in
// Blender when available, with a reproducible glTF2 animation fallback.
placeRelic('./assets/moon_gate_pixelorama_animated.glb',-2.5,0,-8.2,.15,'./assets/moon_gate.glb');
placeRelic('./assets/moon_crystals_pixelorama_animated.glb',6.4,0,-1.5,-.3,'./assets/moon_crystals.glb');
loader.load('./assets/night_forest.glb',gltf=>{
 scene.add(gltf.scene);
 // Real Goxel geometry is shared with Recast pathfinding; Rapier handles physics.
 import('./fx/recast-living-world.js').then(mod=>{
   livingForest=mod.createLivingForest(THREE,scene,gltf.scene,hero,{onMode:(mode,n)=>{
     villagersButton.textContent=mode==='RECAST'?`✦ ${n} · RECAST`:`✧ ${n} · NAV`;
     villagersButton.title=mode==='RECAST'?'WASM NavMesh + Crowd':'A* по коллайдерам леса';
   }});
   villagersButton.textContent=`✧ ${livingForest.count} · NAV`;
 }).catch(error=>console.error('Living world module missing:',error));
 import('./fx/rapier-physics.js')
  .then(module=>module.createRapierPhysics(THREE,scene,hero,gltf.scene))
  .then(engine=>{physics=engine;for(const item of relicColliderQueue)engine.registerRelic(item.name,item.anchor);relicColliderQueue.length=0;if(physicsButton){physicsButton.textContent='⬡ RAPIER ON';physicsButton.title=engine.environmentColliderCount+' коллайдеров'}})
  .catch(error=>{console.warn('Optional Rapier unavailable: native movement remains playable',error);if(physicsButton)physicsButton.textContent='⬢ PHYSICS OFF'});
 loading.style.opacity='0';setTimeout(()=>loading.remove(),650);
 const now=performance.now();last=now;requestAnimationFrame(animate);
},undefined,e=>{loading.textContent='Не удалось загрузить GLB. Откройте через локальный HTTP-сервер: python -m http.server 8000';console.error(e)});
