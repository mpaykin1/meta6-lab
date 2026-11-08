import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import {createFlailCombat} from '../../shared/components/pod-i-nad/animations/flail-combat.mjs';
import {createFlailImpactFX} from '../../shared/components/pod-i-nad/animations/flail-vfx.mjs';
import {createFlailAudio} from '../../shared/components/pod-i-nad/animations/flail-audio.mjs';

const canvas=document.querySelector('#stage');
const menu=document.querySelector('#menu');
const menuButton=document.querySelector('#menu-button');
const restartButton=document.querySelector('#restart');
const muteButton=document.querySelector('#audio');
const errorBox=document.querySelector('#error');
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x07151d);
scene.fog=new THREE.FogExp2(0x07151d,.037);
const camera=new THREE.PerspectiveCamera(52,1,.1,120);
let renderer;
try {
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
} catch(error) {
  errorBox.textContent='Для сцены требуется WebGL: '+error.message;
  errorBox.hidden=false;
  throw error;
}
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.3;
function resize(){
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
  renderer.setSize(window.innerWidth,window.innerHeight,false);
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize',resize);
resize();

scene.add(new THREE.HemisphereLight(0x90d4d8,0x0b1118,1.5));
const sun=new THREE.DirectionalLight(0xb8e5df,2.3);
sun.position.set(-6,11,9);
scene.add(sun);
const rim=new THREE.PointLight(0x52e9df,24,13,2);
rim.position.set(-3,3,2);
scene.add(rim);
const purple=new THREE.PointLight(0xb97aff,23,12,2);
purple.position.set(4,3,-4);
scene.add(purple);

function mat(color,{emissive=0x000000,glow=0,metal=.0,rough=.84}={}){
  return new THREE.MeshStandardMaterial({color,emissive,emissiveIntensity:glow,metalness:metal,roughness:rough,flatShading:true});
}
const groundCanvas=document.createElement('canvas');
groundCanvas.width=64;groundCanvas.height=64;
const gc=groundCanvas.getContext('2d');
let seed=815227;
function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
for(let y=0;y<64;y++)for(let x=0;x<64;x++){
  const r=rand(),v=Math.floor(26+r*22);
  gc.fillStyle='rgb('+Math.floor(v*.48)+','+Math.floor(v*.86)+','+v+')';
  gc.fillRect(x,y,1,1);
}
const groundTexture=new THREE.CanvasTexture(groundCanvas);
groundTexture.wrapS=groundTexture.wrapT=THREE.RepeatWrapping;
groundTexture.repeat.set(15,15);
groundTexture.magFilter=THREE.NearestFilter;
groundTexture.minFilter=THREE.NearestMipmapNearestFilter;
groundTexture.colorSpace=THREE.SRGBColorSpace;
const island=new THREE.Mesh(new THREE.CylinderGeometry(12.4,13,1.65,64,1),mat(0x112c31));
island.position.y=-.9;scene.add(island);
const floor=new THREE.Mesh(new THREE.CircleGeometry(12.4,80),new THREE.MeshStandardMaterial({map:groundTexture,roughness:1}));
floor.rotation.x=-Math.PI/2;floor.position.y=-.06;scene.add(floor);
const voidRing=new THREE.Mesh(new THREE.TorusGeometry(11.8,.1,6,100),mat(0x22465a,{emissive:0x224d69,glow:1.3}));
voidRing.rotation.x=Math.PI/2;voidRing.position.y=-.05;scene.add(voidRing);
function groundCircle(radius,color,width=.014){
 const mesh=new THREE.Mesh(new THREE.TorusGeometry(radius,width,3,128),mat(color,{emissive:color,glow:1.8}));
 mesh.rotation.x=Math.PI/2;mesh.position.y=.018;scene.add(mesh);return mesh;
}
const summoning=groundCircle(2.9,0x2c8e9c,.025);
groundCircle(3.12,0x265a79);
groundCircle(1.0,0x24535b);
const runeMat=new THREE.MeshBasicMaterial({color:0x5ce0d8,transparent:true,opacity:.65,depthWrite:false});
for(let i=0;i<32;i++){
 const theta=i*Math.PI*2/32;
 const cube=new THREE.Mesh(new THREE.BoxGeometry(.07,.012,.21),runeMat);
 cube.position.set(Math.cos(theta)*3.02,.03,Math.sin(theta)*3.02);
 cube.rotation.y=-theta;scene.add(cube);
}
const pillarStone=mat(0x263b43,{rough:.95});
const pillarCap=mat(0x536875,{metal:.15});
const moss=mat(0x26584c);
for(let i=0;i<23;i++){
 const a=i*Math.PI*2/23,rad=6.8+rand()*4.2;
 const height=1.2+rand()*4.3;
 const group=new THREE.Group();
 group.position.set(Math.cos(a)*rad,0,Math.sin(a)*rad);
 const shaft=new THREE.Mesh(new THREE.BoxGeometry(.75+rand()*.5,height,.8+rand()*.35),pillarStone);
 shaft.position.y=height*.5;shaft.rotation.y=rand()*.45;group.add(shaft);
 const cap=new THREE.Mesh(new THREE.BoxGeometry(1.2,.24,1.2),pillarCap);
 cap.position.y=height+.1;cap.rotation.z=(rand()-.5)*.13;group.add(cap);
 const vine=new THREE.Mesh(new THREE.BoxGeometry(.1,height*.65,.12),moss);
 vine.position.set(.37,height*.45,.37);group.add(vine);
 scene.add(group);
}
const rubbleGeo=new THREE.DodecahedronGeometry(.18,0);
const rubbleMat=mat(0x344953);
const rubble=new THREE.InstancedMesh(rubbleGeo,rubbleMat,235);
const dummy=new THREE.Object3D();
for(let i=0;i<235;i++){
 const a=rand()*Math.PI*2,r=3.7+rand()*8;
 dummy.position.set(Math.cos(a)*r,.03+rand()*.08,Math.sin(a)*r);
 dummy.rotation.set(rand()*2,rand()*3,rand());
 dummy.scale.setScalar(.3+rand()*1.8);
 dummy.updateMatrix();rubble.setMatrixAt(i,dummy.matrix);
}
rubble.instanceMatrix.needsUpdate=true;scene.add(rubble);
const grassGeo=new THREE.ConeGeometry(.06,.5,3);
const grassMat=mat(0x32796d);
const reeds=new THREE.InstancedMesh(grassGeo,grassMat,180);
for(let i=0;i<180;i++){
 const a=rand()*Math.PI*2,r=3.65+rand()*8.4;
 dummy.position.set(Math.cos(a)*r,.15,Math.sin(a)*r);
 dummy.rotation.set(0,rand()*6.28,.1+rand()*.45);
 dummy.scale.setScalar(.4+rand()*1.6);dummy.updateMatrix();reeds.setMatrixAt(i,dummy.matrix);
}
reeds.instanceMatrix.needsUpdate=true;scene.add(reeds);

const player=new THREE.Group();
const armor=mat(0x6f928d,{metal:.67,rough:.31});
const trims=mat(0xc4e1cc,{metal:.75,rough:.26});
const cloak=mat(0x273c57);
function box(parent,w,h,d,material,x=0,y=0,z=0){
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
 mesh.position.set(x,y,z);parent.add(mesh);return mesh;
}
box(player,.55,.75,.39,armor,0,1,0);
box(player,.68,.14,.48,trims,0,1.25,0);
box(player,.42,.42,.45,armor,0,1.55,0);
box(player,.5,.10,.5,trims,0,1.82,0);
box(player,.7,.9,.09,cloak,0,.75,-.26);
box(player,.15,.55,.17,armor,-.16,.35,0);
box(player,.15,.55,.17,armor,.16,.35,0);
box(player,.18,.45,.18,armor,-.39,.99,0);
box(player,.18,.45,.18,armor,.39,.99,0);
const eyeMat=new THREE.MeshBasicMaterial({color:0xa9f9e8});
box(player,.25,.045,.04,eyeMat,0,1.58,.246);
scene.add(player);
const playerGlow=new THREE.PointLight(0x73fce4,8,4,2);
playerGlow.position.set(0,1.4,.4);scene.add(playerGlow);
const shadow=new THREE.Mesh(new THREE.CircleGeometry(.6,24),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.24,depthWrite:false}));
shadow.rotation.x=-Math.PI/2;shadow.position.y=.005;scene.add(shadow);

const foes=[];
const monolithStone=mat(0x4f566f,{metal:.32,rough:.65});
const monolithEdge=mat(0x8d93b0,{metal:.72,rough:.4});
const gemMaterials=[];
for(let i=0;i<5;i++){
 const baseAngle=i*Math.PI*2/5;
 const home={x:Math.cos(baseAngle)*2.17,z:Math.sin(baseAngle)*2.17};
 const group=new THREE.Group();
 const pedestal=new THREE.Mesh(new THREE.CylinderGeometry(.48,.62,.35,6),monolithStone);
 pedestal.position.y=.22;group.add(pedestal);
 const body=new THREE.Mesh(new THREE.CylinderGeometry(.26,.42,1.34,5),monolithStone);
 body.position.y=1.05;body.rotation.y=i*.4;group.add(body);
 const crown=new THREE.Mesh(new THREE.OctahedronGeometry(.47,0),monolithEdge);
 crown.position.y=1.88;group.add(crown);
 const gemMat=new THREE.MeshStandardMaterial({color:0x82dfde,emissive:0x2af4dc,emissiveIntensity:2.2,metalness:.25,roughness:.15});
 gemMaterials.push(gemMat);
 const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.26,0),gemMat);
 gem.position.set(0,1.27,.32);group.add(gem);
 const level=new THREE.Group();
 for(let k=0;k<4;k++){
   const bar=new THREE.Mesh(new THREE.BoxGeometry(.11,.06,.06),new THREE.MeshBasicMaterial({color:0x72e5c9}));
   bar.position.set((k-1.5)*.16,1.94,.29);level.add(bar);
 }
 group.add(level);
 scene.add(group);
 foes.push({home,position:{x:home.x,y:.85,z:home.z},velocity:{x:0,z:0},rad:.42,hp:100,alive:true,dead:false,group,level,gem,gemMat,flash:0,fade:0});
}
const linkGeo=new THREE.CylinderGeometry(.052,.052,1,6);
const linkMat=mat(0xa4c4bc,{metal:.86,rough:.22});
const links=Array.from({length:9},()=>{
 const mesh=new THREE.Mesh(linkGeo,linkMat);scene.add(mesh);return mesh;
});
const ballMat=mat(0x9bd8d4,{emissive:0x1e9b99,glow:.7,metal:.88,rough:.22});
const ball=new THREE.Mesh(new THREE.IcosahedronGeometry(.29,1),ballMat);
scene.add(ball);
const ballLight=new THREE.PointLight(0x8cfff0,13,4,2);
scene.add(ballLight);
const hand={x:.33,y:1.12,z:.24};
const vfx=createFlailImpactFX(THREE,scene,{capacity:180,maxRings:10});
const audio=createFlailAudio({volume:.25});
const combat=createFlailCombat({
 reach:2.32,damage:30,knockback:1.2,tick:.24,ballRadius:.5,
 onWhoosh(){audio.whoosh()},
 onImpact(hit){
   vfx.burst(hit.position,{count:28,color:0xffcf9a,strength:.85});
   audio.impact();
   const f=hit.foe;
   f.flash=1;
 },
 onDefeat({foe,hit}){
   foe.fade=.001;
   vfx.burst(hit.position,{count:68,color:0x9dfdea,strength:1.7});
   audio.defeat();
 }
});
function resetFoes(){
 combat.reset();
 for(const f of foes){
   combat.collisions.clear(f);
   f.hp=100;f.alive=true;f.dead=false;f.flash=0;f.fade=0;
   f.position.x=f.home.x;f.position.z=f.home.z;f.position.y=.85;
   f.velocity.x=0;f.velocity.z=0;
   f.group.visible=true;f.group.scale.set(1,1,1);
 }
 lastCleared=-1;
}
let lastCleared=-1;
restartButton.addEventListener('click',()=>{
 resetFoes();menu.hidden=true;menuButton.setAttribute('aria-expanded','false');
});
menuButton.addEventListener('click',()=>{
 menu.hidden=!menu.hidden;
 menuButton.setAttribute('aria-expanded',String(!menu.hidden));
});
let muted=false;
muteButton.addEventListener('click',async()=>{
 muted=!muted;
 audio.setMuted(muted);
 muteButton.textContent=muted?'Включить звук':'Выключить звук';
 if(!muted)await audio.unlock();
});
const raycaster=new THREE.Raycaster();
const groundPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
const targetPoint=new THREE.Vector3();
let attackPointer=null,keyboardAttack=false;
const aim={x:1,z:0};
function setAim(event){
 const coords=new THREE.Vector2(event.clientX/window.innerWidth*2-1,-event.clientY/window.innerHeight*2+1);
 raycaster.setFromCamera(coords,camera);
 if(raycaster.ray.intersectPlane(groundPlane,targetPoint)){
   const n=Math.hypot(targetPoint.x,targetPoint.z);
   if(n>.3){aim.x=targetPoint.x/n;aim.z=targetPoint.z/n;}
 }
}
canvas.addEventListener('pointerdown',event=>{
 if(attackPointer!==null)return;
 attackPointer=event.pointerId;
 setAim(event);
 canvas.setPointerCapture(event.pointerId);
 void audio.unlock();
});
canvas.addEventListener('pointermove',event=>{
 if(event.pointerId===attackPointer)setAim(event);
});
function releasePointer(event){
 if(event.pointerId===attackPointer)attackPointer=null;
}
canvas.addEventListener('pointerup',releasePointer);
canvas.addEventListener('pointercancel',releasePointer);
canvas.addEventListener('lostpointercapture',releasePointer);
window.addEventListener('keydown',event=>{
 if(event.code==='Space'&& !event.repeat){
   event.preventDefault();keyboardAttack=true;void audio.unlock();
 }
 if(event.code==='KeyR')resetFoes();
});
window.addEventListener('keyup',event=>{if(event.code==='Space')keyboardAttack=false});
window.addEventListener('blur',()=>{keyboardAttack=false;attackPointer=null});
const cameraDesired=new THREE.Vector3();
const lookAt=new THREE.Vector3(0,.7,0);
let previous=0;
const up=new THREE.Vector3(0,1,0);
const tmp=new THREE.Vector3();
const chainFrom=new THREE.Vector3();
const chainTo=new THREE.Vector3();
const chainMid=new THREE.Vector3();
function tick(ms){
 const dt=previous?Math.min(.05,Math.max(0,(ms-previous)/1000)):.016;
 previous=ms;
 const t=ms*.001;
 cameraDesired.set(9+Math.sin(t*.08)*1.8,12.4+Math.cos(t*.06)*.3,19.6+Math.cos(t*.07)*1.3);
 camera.position.lerp(cameraDesired,.045);
 camera.lookAt(lookAt);
 const output=combat.update(dt,{attack:attackPointer!==null||keyboardAttack,player:{x:0,y:0,z:0},aim,foes});
 const points=[hand,...output.chain,output.state.ball];
 for(let i=0;i<links.length;i++){
   const a=points[i]||points[points.length-1];
   const b=points[i+1]||points[points.length-1];
   chainFrom.set(a.x,a.y,a.z);chainTo.set(b.x,b.y,b.z);
   chainMid.addVectors(chainFrom,chainTo).multiplyScalar(.5);
   links[i].position.set(chainMid.x,chainMid.y,chainMid.z);
   tmp.subVectors(chainTo,chainFrom);
   const length=tmp.length();
   links[i].scale.y=Math.max(.015,length);
   links[i].quaternion.setFromUnitVectors(up,tmp.normalize());
   links[i].visible=output.state.on;
 }
 ball.position.set(output.state.ball.x,output.state.ball.y,output.state.ball.z);
 ball.rotation.set(t*.9,t*1.6,t*.7);
 ball.visible=output.state.on;
 ballLight.position.set(ball.position.x,ball.position.y,ball.position.z);
 ballLight.intensity=output.state.on?12:0;
 player.position.y=.035+Math.sin(t*2)*.024;
 player.rotation.y+=((Math.atan2(aim.x,aim.z))-player.rotation.y)*.04;
 playerGlow.intensity=6+Math.sin(t*2.7)*2;
 summoning.material.emissiveIntensity=1.2+Math.sin(t*2)*.45;
 for(const f of foes){
   if(f.alive){
     f.velocity.x+=(f.home.x-f.position.x)*dt*2;
     f.velocity.z+=(f.home.z-f.position.z)*dt*2;
     const drag=Math.exp(-4*dt);
     f.velocity.x*=drag;f.velocity.z*=drag;
     f.position.x+=f.velocity.x*dt;
     f.position.z+=f.velocity.z*dt;
     f.group.position.set(f.position.x,0,f.position.z);
     f.group.rotation.y=Math.sin(t*.85+f.home.x)*.13;
     f.group.position.y=Math.sin(t*1.65+f.home.z)*.055;
     f.flash=Math.max(0,f.flash-dt*5);
     f.gemMat.emissiveIntensity=2+f.flash*6;
     const visibleBars=Math.ceil(f.hp/25);
     f.level.children.forEach((bar,k)=>bar.visible=k<visibleBars);
   } else {
     f.fade=Math.min(1,f.fade+dt*1.6);
     f.group.scale.setScalar(Math.max(0,1-f.fade));
     f.group.rotation.z+=dt*.9;
     if(f.fade>=1)f.group.visible=false;
   }
 }
 const alive=foes.some(f=>f.alive);
 if(!alive&&lastCleared<0)lastCleared=t;
 if(lastCleared>=0&&t-lastCleared>4)resetFoes();
 vfx.update(dt);
 renderer.render(scene,camera);
}
camera.position.set(9,12,20);
camera.lookAt(lookAt);
renderer.setAnimationLoop(tick);
window.addEventListener('pagehide',()=>{renderer.setAnimationLoop(null);vfx.dispose();void audio.dispose();renderer.dispose();});
