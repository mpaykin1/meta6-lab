import * as T from 'three';
import {createLivingWatercolor3D,createWatercolorStyle} from '../../reference/ink-fallen-guardian/shared/living-watercolor-3d.js';
import {createIllustrationCamera} from '../../reference/ink-fallen-guardian/shared/living-watercolor-generators.js';
import {fir,birch,rock,shelter,lantern} from '../../reference/ink-fallen-guardian/ink-objects.js';
import {createInkSteamTrain} from '../../demos/living-watercolor/ink-steam-train.js';

const scene=new T.Scene();scene.background=new T.Color('#eae5dd');
scene.fog=new T.FogExp2('#dedbd1',.023);
const camera=createIllustrationCamera(T,{
  width:innerWidth,height:innerHeight,viewHeight:13,position:[-16,8,15],lookAt:[1.1,1.65,0]
});
const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.outputColorSpace=T.SRGBColorSpace;
renderer.toneMapping=T.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.24;
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.15));
renderer.setSize(innerWidth,innerHeight);
document.body.prepend(renderer.domElement);
const style=createWatercolorStyle({
  seed:'ink-steam-train-watercolor-2026',inkColor:'#35404b',
  paperColor:'#eae5dd',washColor:'#908d88',
  washOpacity:.74,washLayers:6,edgeWidth:.023,edgeJitter:.25,
  granulation:.45,bleed:.25,shadowWash:.16,motion:.08,
  pigmentPooling:.28,paperGap:.13,paintedLight:.66
});
const paint=createLivingWatercolor3D({THREE:T,renderer,scene,camera,style});
scene.add(new T.HemisphereLight('#ffead2','#81949a',2.25));
const sun=new T.DirectionalLight('#ffe8cc',1.8);sun.position.set(-5,11,9);scene.add(sun);
const fill=new T.DirectionalLight('#cbd5d5',.65);fill.position.set(7,6,-8);scene.add(fill);
const all=new T.Group();scene.add(all);
const earth=new T.Mesh(new T.PlaneGeometry(200,200),new T.MeshStandardMaterial({
  color:'#c9c4b3',roughness:1,side:T.DoubleSide
}));
earth.rotation.x=-Math.PI/2;earth.position.y=-.25;earth.userData.watercolorOutline=false;all.add(earth);
// A painterly railway bed with an uneven shoreline rather than a rectangular level edge.
const ballast=new T.Group();all.add(ballast);
const bedShape=new T.Shape();
bedShape.moveTo(-9,-1.55);
for(let i=0;i<=35;i++){const x=-9+i*.71;
  bedShape.lineTo(x,-1.55-.10*Math.sin(i*.69)-.06*Math.sin(i*1.91));
}
for(let i=35;i>=0;i--){const x=-9+i*.71;
  bedShape.lineTo(x,1.53+.10*Math.sin(i*.65)+.07*Math.sin(i*1.79));
}
bedShape.closePath();
const bedGeo=new T.ShapeGeometry(bedShape);
bedGeo.rotateX(-Math.PI/2);
const bed=new T.Mesh(bedGeo,new T.MeshStandardMaterial({color:'#a7a295',roughness:1,side:T.DoubleSide}));
bed.position.y=-.13;bed.userData.watercolorOutline=false;ballast.add(bed);
const sleeperMat=new T.MeshStandardMaterial({color:'#877e78',roughness:1});
const tieGeo=new T.BoxGeometry(.20,.13,2.55);
const ties=new T.InstancedMesh(tieGeo,sleeperMat,71);
const dummy=new T.Object3D(),color=new T.Color();
function r(n){const v=Math.sin(n*127.13+221.83)*43758.5453;return v-Math.floor(v);}
for(let i=0;i<71;i++){
  dummy.position.set(-8.7+i*.34,.012,0);
  dummy.rotation.set(0,(r(i+5)-.5)*.045,0);
  dummy.scale.set(1+(r(i+11)-.5)*.07,1,1);dummy.updateMatrix();
  ties.setMatrixAt(i,dummy.matrix);
  color.set(i%3?'#81756f':'#b19b85');ties.setColorAt(i,color);
}
ties.userData.watercolorOutline=false;ballast.add(ties);
for(const side of [-1,1]){
  const rail=new T.Mesh(new T.BoxGeometry(25,.092,.089),
    new T.MeshStandardMaterial({color:'#6e6868',roughness:.9}));
  rail.position.set(3.0,.152,side*.92);rail.userData.watercolorOutline=false;ballast.add(rail);
  const shine=new T.Mesh(new T.BoxGeometry(25,.014,.04),
    new T.MeshStandardMaterial({color:'#c3aea0',roughness:1}));
  shine.position.set(3.0,.208,side*.92);shine.userData.watercolorOutline=false;ballast.add(shine);
  const clips=new T.InstancedMesh(new T.BoxGeometry(.055,.09,.17),
    new T.MeshStandardMaterial({color:'#655f64',roughness:1}),71);
  for(let i=0;i<71;i++){
    dummy.position.set(-8.7+i*.34,.15,side*1.015);
    dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.updateMatrix();
    clips.setMatrixAt(i,dummy.matrix);
  }
  clips.userData.watercolorOutline=false;ballast.add(clips);
}
const gravelGeo=new T.DodecahedronGeometry(.11,0);
const gravel=new T.InstancedMesh(gravelGeo,
  new T.MeshStandardMaterial({color:'#9e9387',roughness:1}),240);
for(let i=0;i<240;i++){
  const x=-8+r(i+4)*24,z=(r(i+63)-.5)*3.8;
  dummy.position.set(x,-.13+r(i+119)*.065,z);
  dummy.rotation.set(r(i+4),r(i+24)*6.28,r(i+66));
  dummy.scale.set(.33+r(i)*.7,.28+r(i+101)*.6,.25+r(i+9)*.7);
  dummy.updateMatrix();gravel.setMatrixAt(i,dummy.matrix);
}
gravel.userData.watercolorOutline=false;ballast.add(gravel);
// Distant damp forest, illustrated with the same accepted volumetric INK tree makers.
const woodland=new T.Group();all.add(woodland);
for(let i=0;i<18;i++){
  const x=-9+r(i+41)*26;
  const back=i%4?-(3.6+r(i+166)*7):(4.7+r(i+91)*4);
  const tree=i%5===0?birch(i+7):fir(i+19);
  tree.position.set(x,-.20,back);
  tree.scale.multiplyScalar(.70+r(i+227)*.55);
  tree.rotation.y=r(i+77)*6.28;
  woodland.add(tree);
}
for(let i=0;i<29;i++){
  const x=-8.2+r(i+100)*24;
  const z=(i%2?1:-1)*(2.1+r(i+92)*1.6);
  const stone=rock(i+100);stone.position.set(x,-.19,z);
  stone.scale.setScalar(.19+r(i+136)*.24);
  woodland.add(stone);
}
const station=shelter();
station.position.set(12.7,-.16,-4.9);station.scale.setScalar(.67);
station.rotation.y=-.36;woodland.add(station);
for(const x of [-5.8,12.0]){
  const lamp=lantern();lamp.position.set(x,.01,2.8);lamp.scale.setScalar(.95);
  all.add(lamp);
}
const blades=new T.InstancedMesh(new T.ConeGeometry(.035,.26,3),
  new T.MeshStandardMaterial({color:'#889581',roughness:1}),480);
for(let i=0;i<480;i++){
  const x=-8+r(i+531)*25,z=(r(i+431)-.5)*17;
  dummy.position.set(x,-.08,z);dummy.rotation.set(0,r(i+221)*6.28,.13);
  dummy.scale.setScalar(Math.abs(z)<1.85?0:.4+r(i+17)*1.3);
  dummy.updateMatrix();blades.setMatrixAt(i,dummy.matrix);
}
blades.userData.watercolorOutline=false;all.add(blades);
const train=createInkSteamTrain(11);train.position.y=.02;all.add(train);
// INK silhouette remains richly outlined while tiny bolts/trim avoid costly
// triple-pass outlines (especially on phones).
train.traverse(o=>{
  if(!o.isMesh || o.userData.watercolorOutline===false)return;
  o.geometry?.computeBoundingSphere?.();
  const r=o.geometry?.boundingSphere?.radius||0;
  if(r<.36)o.userData.watercolorOutline=false;
});
paint.apply(train,{seed:'steam-locomotive'});
paint.apply(woodland,{seed:'railway-woodland'});
paint.apply(ballast,{seed:'railway-ballast'});
// Reuse one compiled watercolor shader program across deterministic pigment
// seeds; the accepted INK reference uses the same optimization.
for(const part of [train,woodland,ballast]){
  part.traverse(o=>{
    if(o.isMesh && o.material?.userData?.livingWatercolorPatched){
      o.material.customProgramCacheKey=()=>'ink-steam-watercolor-20261114';
    }
  });
}
// A translucent ground wash anchors the 3D model to the same mist as the forest.
paint.addGroundWash(train,{x:2.0,z:0,width:16,depth:4.4,opacity:.14,seed:'rolling-shadow'});
const veilCanvas=document.createElement('canvas');veilCanvas.width=veilCanvas.height=128;
const vctx=veilCanvas.getContext('2d');
const grd=vctx.createRadialGradient(64,64,2,64,64,64);
grd.addColorStop(0,'rgba(243,237,226,.32)');
grd.addColorStop(.58,'rgba(228,226,218,.16)');
grd.addColorStop(1,'rgba(226,226,218,0)');
vctx.fillStyle=grd;vctx.fillRect(0,0,128,128);
const veilTex=new T.CanvasTexture(veilCanvas),veils=[];
for(let i=0;i<9;i++){
  const fog=new T.Sprite(new T.SpriteMaterial({map:veilTex,color:'#dee1d9',
    transparent:true,opacity:.22,depthWrite:false}));
  fog.position.set(-7+i*2.7,.58,-3.5+(i%3)*1.3);fog.scale.set(8,2.0,1);
  all.add(fog);veils.push(fog);
}
const user=new URLSearchParams(location.search);
let active=['train','engine','travel'].includes(user.get('view'))?user.get('view'):
  (innerWidth/innerHeight<.75?'engine':'train');
let stopped=false,monochrome=user.get('palette')==='mono';
let yaw=2.35,pitch=.39,zoom=1,drag=null,pinchDistance=0,lastMs=0,time=0;
let frameMs=16.7,quality=1;
const menu=document.querySelector('#menu'),menuButton=document.querySelector('#menu-btn');
menuButton.onclick=()=>{menu.hidden=!menu.hidden;menuButton.setAttribute('aria-expanded',String(!menu.hidden));};
function updateButtons(){
  document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===active)));
  document.querySelector('#pause').textContent=stopped?'Запустить движение':'Остановить движение';
  document.querySelector('#palette').textContent=monochrome?'Цветная акварель':'Чёрно-белая акварель';
}
function setView(mode){
  active=mode;user.set('view',active);
  history.replaceState(null,'','?'+user.toString());
  zoom=1;updateButtons();resize();
}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{setView(b.dataset.view);menu.hidden=true;menuButton.setAttribute('aria-expanded','false');});
document.querySelector('#pause').onclick=()=>{stopped=!stopped;updateButtons();};
function setMono(flag){monochrome=flag;document.body.style.filter=flag?'grayscale(1)':'';
  user.set('palette',flag?'mono':'color');history.replaceState(null,'','?'+user.toString());updateButtons();
}
document.querySelector('#palette').onclick=()=>setMono(!monochrome);
setMono(monochrome);
function resize(){
  const aspect=innerWidth/Math.max(1,innerHeight);
  const width=active==='engine'?8.9:active==='travel'?12.6:17.8;
  camera.userData.viewHeight=Math.max(active==='engine'?8.2:10.5,width/Math.max(.28,aspect));
  camera.updateForViewport(innerWidth,innerHeight);
  camera.zoom=zoom;camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
}
function lookAt(){
  const fx=active==='engine'?-1.85:active==='travel'?.75:2.05;
  const target=new T.Vector3(fx,1.48,0);
  const distance=23.3;
  camera.position.set(fx+Math.cos(yaw)*Math.cos(pitch)*distance,
    1.48+Math.sin(pitch)*distance,
    Math.sin(yaw)*Math.cos(pitch)*distance);
  camera.lookAt(target);
}
const fingers=new Map();renderer.domElement.addEventListener('pointerdown',e=>{
  renderer.domElement.setPointerCapture(e.pointerId);
  fingers.set(e.pointerId,{x:e.clientX,y:e.clientY});drag={x:e.clientX,y:e.clientY};
  if(fingers.size===2){const a=[...fingers.values()];pinchDistance=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);}
});
renderer.domElement.addEventListener('pointermove',e=>{
  if(!fingers.has(e.pointerId))return;
  fingers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(fingers.size===2){
    const a=[...fingers.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);
    zoom=T.MathUtils.clamp(zoom*d/Math.max(1,pinchDistance),.65,3.0);pinchDistance=d;resize();
  }else if(drag){
    yaw-=(e.clientX-drag.x)*.006;
    pitch=T.MathUtils.clamp(pitch+(e.clientY-drag.y)*.003,.12,1.22);
  }
  drag={x:e.clientX,y:e.clientY};
});
for(const type of ['pointerup','pointercancel','lostpointercapture'])
  renderer.domElement.addEventListener(type,e=>{fingers.delete(e.pointerId);drag=null;});
renderer.domElement.addEventListener('wheel',e=>{
  e.preventDefault();zoom=T.MathUtils.clamp(zoom*Math.exp(-e.deltaY*.001),.65,3.0);resize();
},{passive:false});
addEventListener('keydown',e=>{
  if(e.code==='Space'){e.preventDefault();stopped=!stopped;updateButtons();}
  if(e.key==='1')setView('engine');
  if(e.key==='2')setView('train');
});
addEventListener('resize',resize);
updateButtons();resize();
function animate(ms){
  requestAnimationFrame(animate);
  if(document.hidden){lastMs=ms;return;}
  const dt=Math.min(.05,Math.max(0,(ms-lastMs)/1000));lastMs=ms;
  if(!stopped)time+=dt;
  frameMs=.95*frameMs+.05*dt*1000;
  if(frameMs>33&&quality>0.7){
    quality=.7;renderer.setPixelRatio(1);paint.setQuality(.7);resize();
  }
  train.userData.tick(time,dt);
  if(active==='travel'){train.position.x=Math.sin(time*.28)*.90;}
  else train.position.x=0;
  veils.forEach((v,i)=>v.position.x=-7+i*2.7+Math.sin(time*.19+i)*.36);
  lookAt();
  paint.tick(ms);
  renderer.render(scene,camera);
}
requestAnimationFrame(animate);
window.__INK_TRAIN__={
  ready:true,mesh:train,isProcedural3D:true,
  getWheels:()=>train.getObjectByName('WHEELS')||null,
  stats:()=>({mode:active,quality,frameMs,elapsed:time,meshes:(()=>{
    let count=0;train.traverse(o=>{if(o.isMesh)count++;});return count;
  })()}),
  show:setView,pause:()=>{stopped=true;updateButtons();},
  resume:()=>{stopped=false;updateButtons();}
};