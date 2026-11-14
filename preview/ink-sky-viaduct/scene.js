import * as T from 'three';
import {
  createLivingWatercolor3D,createWatercolorStyle
} from '../../reference/ink-fallen-guardian/shared/living-watercolor-3d.js';
import {createIllustrationCamera} from '../../reference/ink-fallen-guardian/shared/living-watercolor-generators.js';
import {createInkSkyViaduct} from '../../demos/living-watercolor/ink-sky-viaduct.js';

const params=new URLSearchParams(location.search);
const paper='#e9e2db';
const scene=new T.Scene();
scene.background=new T.Color(paper);
scene.fog=new T.FogExp2('#dcd5ce',.009);
const camera=createIllustrationCamera(T,{
  width:innerWidth,height:innerHeight,viewHeight:22.0,
  position:[22,15,25],lookAt:[0,5.4,0]
});
const renderer=new T.WebGLRenderer({
  antialias:true,alpha:false,powerPreference:'high-performance'
});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.3));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=T.SRGBColorSpace;
renderer.toneMapping=T.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.17;
document.body.prepend(renderer.domElement);

const style=createWatercolorStyle({
  seed:'ink-sky-viaduct-20261115',
  inkColor:'#45565b',
  paperColor:paper,
  washColor:'#968e8b',
  washOpacity:.72,
  washLayers:6,
  edgeWidth:.023,edgeJitter:.27,
  granulation:.43,bleed:.23,
  shadowWash:.16,motion:.10,
  pigmentPooling:.33,paperGap:.13,
  paintedLight:.69
});
const paint=createLivingWatercolor3D({
  THREE:T,renderer,scene,camera,style
});
const ambient=new T.HemisphereLight('#fff3e6','#a0a3ae',2.5);scene.add(ambient);
const sun=new T.DirectionalLight('#fff0d9',1.65);
sun.position.set(-9,18,18);scene.add(sun);
const rim=new T.DirectionalLight('#d8e0e5',.85);
rim.position.set(14,7,-13);scene.add(rim);

const sky=createInkSkyViaduct(73);
scene.add(sky);
// Protect the approved watercolor material and line treatment by REUSE.
// Only the new bridges, rock and towers are painted; translucent cloud vapor
// stays transparent while the trees, carvings and arches remain true 3D.
for(const g of [sky.children[0],sky.children[1],sky.children[2]]){
  paint.apply(g,{seed:'ink-viaduct:'+g.name});
}

const ui=document.querySelector('#ui');
const menu=document.querySelector('#menu');
const menuBtn=document.querySelector('#menu-btn');
menuBtn.onclick=()=>{
  menu.hidden=!menu.hidden;
  menuBtn.setAttribute('aria-expanded',String(!menu.hidden));
};

const modes=['all','arches','citadel'];
let active=modes.includes(params.get('view'))?params.get('view'):'all';
let orbit=params.get('orbit')!=='off';
let mono=params.get('palette')==='mono';
let yaw=.47,pitch=.40,zoom=1.0,lastMs=0,clock=0;
let renderCount=0,frameAvg=16.7,quality=1;
let viewYaw=.47,viewPitch=.40,lookX=0,lookY=5.2,lookZ=0;
const touch=new Map();
let drag=null,lastPinch=0;

const orbitBtn=document.querySelector('#orbit');
const monoBtn=document.querySelector('#mono');
function show(mode){
  active=modes.includes(mode)?mode:'all';params.set('view',active);
  history.replaceState(null,'','?'+params);
  zoom=1;
  // Viewpoint changes preserve the full 3D structure, not alternative sprites.
  if(active==='arches'){lookX=0;lookY=7.25;lookZ=0;zoom=1.33;}
  else if(active==='citadel'){lookX=-11.4;lookY=9.2;lookZ=-1.7;zoom=2.05;}
  else{lookX=0;lookY=5.25;lookZ=0;}
  document.querySelectorAll('[data-view]').forEach(b=>
    b.setAttribute('aria-pressed',String(b.dataset.view===active))
  );
  resize();
}
document.querySelectorAll('[data-view]').forEach(b=>{
  b.onclick=()=>{
    show(b.dataset.view);
    menu.hidden=true;
    menuBtn.setAttribute('aria-expanded','false');
  };
});
function setOrbit(flag){
  orbit=flag;orbitBtn.textContent=flag?'Остановить вращение':'Вращение камеры 360°';
  params.set('orbit',flag?'on':'off');history.replaceState(null,'','?'+params);
}
orbitBtn.onclick=()=>setOrbit(!orbit);
function setMono(flag){
  mono=flag;
  // The actual watercolor pigment geometry stays unchanged.
  renderer.domElement.style.filter=flag?'grayscale(1)':'';
  monoBtn.textContent=flag?'Цветная акварель':'Чёрно-белая акварель';
  params.set('palette',flag?'mono':'color');
  history.replaceState(null,'','?'+params);
}
monoBtn.onclick=()=>setMono(!mono);
function resize(){
  const aspect=innerWidth/Math.max(1,innerHeight);
  const sceneWidth=active==='citadel'?19.5:active==='arches'?31.0:36.5;
  const vertical=active==='citadel'?17.5:active==='arches'?21.0:23.5;
  camera.userData.viewHeight=Math.max(vertical,sceneWidth/Math.max(aspect,.25));
  camera.updateForViewport(innerWidth,innerHeight);
  camera.zoom=zoom;camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
}
function cameraOrbit(){
  const target=new T.Vector3(lookX,lookY,lookZ);
  const distance=45.0;
  camera.position.set(
    lookX+Math.cos(yaw)*Math.cos(pitch)*distance,
    lookY+Math.sin(pitch)*distance,
    lookZ+Math.sin(yaw)*Math.cos(pitch)*distance
  );
  camera.lookAt(target);
}
renderer.domElement.addEventListener('pointerdown',e=>{
  renderer.domElement.setPointerCapture(e.pointerId);
  touch.set(e.pointerId,{x:e.clientX,y:e.clientY});
  drag={x:e.clientX,y:e.clientY};
  setOrbit(false);
  if(touch.size===2){
    const p=[...touch.values()];
    lastPinch=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);
  }
});
renderer.domElement.addEventListener('pointermove',e=>{
  if(!touch.has(e.pointerId))return;
  touch.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(touch.size===2){
    const p=[...touch.values()];
    const d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);
    zoom=T.MathUtils.clamp(zoom*d/Math.max(1,lastPinch),.50,3.8);
    lastPinch=d;resize();
  }else if(drag){
    yaw-=(e.clientX-drag.x)*.007;
    pitch=T.MathUtils.clamp(pitch+(e.clientY-drag.y)*.004,-.18,1.20);
  }
  drag={x:e.clientX,y:e.clientY};
});
for(const event of ['pointerup','pointercancel','lostpointercapture']){
  renderer.domElement.addEventListener(event,e=>{
    touch.delete(e.pointerId);drag=null;
  });
}
renderer.domElement.addEventListener('wheel',e=>{
  e.preventDefault();
  zoom=T.MathUtils.clamp(zoom*Math.exp(-e.deltaY*.001),.50,3.8);
  resize();
},{passive:false});
addEventListener('keydown',e=>{
  if(e.key===' '){e.preventDefault();setOrbit(!orbit);}
  if(e.key==='1')show('all');
  if(e.key==='2')show('arches');
  if(e.key==='3')show('citadel');
});
addEventListener('resize',resize);
addEventListener('blur',()=>{touch.clear();drag=null;});

setOrbit(orbit);setMono(mono);show(active);cameraOrbit();

function frame(ms){
  requestAnimationFrame(frame);
  if(document.hidden){lastMs=ms;return;}
  const dt=Math.min(.05,Math.max(0,(ms-lastMs)/1000));lastMs=ms;
  clock+=dt;
  // An entire cinematic revolution takes about 55 s; visitor can override it.
  if(orbit)yaw+=dt*.115;
  sky.userData.tick(clock,dt);
  frameAvg=frameAvg*.965+dt*1000*.035;
  if(frameAvg>35&&quality>.72){
    quality=.72;renderer.setPixelRatio(1);
    paint.setQuality(.72);resize();
  }
  cameraOrbit();
  paint.tick(ms);
  renderer.render(scene,camera);
  renderCount++;
}
requestAnimationFrame(frame);

// For embedding in other INK worlds, the export is in ink-sky-viaduct.js.
window.__INK_VIADUCT__={
  ready:true,model:sky,
  counts:sky.userData.counts,
  camera,
  show,pause:()=>setOrbit(false),play:()=>setOrbit(true),
  stats:()=>({mode:active,renderCount,frameAvg,orbit,quality,
    meshes:(()=>{let n=0;sky.traverse(o=>{if(o.isMesh)n++;});return n;})()})
};