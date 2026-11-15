import * as T from 'three';
import {createLivingWatercolor3D,createWatercolorStyle}
  from '../../reference/ink-fallen-guardian/shared/living-watercolor-3d.js';
import {createIllustrationCamera}
  from '../../reference/ink-fallen-guardian/shared/living-watercolor-generators.js';
import {createInkCarrionStalker}
  from '../../demos/living-watercolor/ink-carrion-stalker.js';

const params=new URLSearchParams(location.search);
const paper='#a6999a';
const scene=new T.Scene();
scene.background=new T.Color(paper);
scene.fog=new T.FogExp2('#a6999a',.018);
const camera=createIllustrationCamera(T,{
  width:innerWidth,height:innerHeight,viewHeight:8.0,
  position:[4.8,4.0,11],lookAt:[0,2.60,0]
});
const renderer=new T.WebGLRenderer({
  alpha:true,antialias:true,powerPreference:'high-performance',
  preserveDrawingBuffer:true
});
renderer.outputColorSpace=T.SRGBColorSpace;
renderer.toneMapping=T.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.54;
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
renderer.setSize(innerWidth,innerHeight);
document.body.prepend(renderer.domElement);
const paint=createLivingWatercolor3D({
  THREE:T,renderer,scene,camera,
  style:createWatercolorStyle({
    seed:'ink-carrion-stalker-20261115',
    inkColor:'#2e2c30',paperColor:'#b5aca7',
    washColor:'#797679',washOpacity:.72,washLayers:6,
    edgeWidth:.017,edgeJitter:.19,granulation:.34,
    bleed:.18,shadowWash:.21,motion:.08,
    pigmentPooling:.30,paperGap:.09,paintedLight:.60
  })
});
scene.add(new T.HemisphereLight('#f5eeea','#48474f',2.9));
const light=new T.DirectionalLight('#fff2e7',3.0);light.position.set(-5,10,8);scene.add(light);
const rim=new T.DirectionalLight('#c1c7cb',2.0);rim.position.set(7,7,-8);scene.add(rim);
const front=new T.DirectionalLight('#f1e9de',.5);front.position.set(2,4,9);scene.add(front);

const stalker=createInkCarrionStalker(113);
scene.add(stalker);
paint.apply(stalker,{seed:'carrion-stalker-author-approved-ink'});

// Ground contact, ink pooled below the claws. This stays a separate scene layer.
const ground=new T.Group();scene.add(ground);
const floor=new T.Mesh(new T.PlaneGeometry(80,80),
  new T.MeshStandardMaterial({color:'#918889',roughness:1}));
floor.rotation.x=-Math.PI/2;floor.position.y=-.21;
floor.userData.watercolorOutline=false;floor.userData.watercolorSkipWash=true;
ground.add(floor);
const shadowCanvas=document.createElement('canvas');
shadowCanvas.width=shadowCanvas.height=256;
const sx=shadowCanvas.getContext('2d');
const sg=sx.createRadialGradient(128,128,12,128,128,128);
sg.addColorStop(0,'rgba(24,22,25,.48)');
sg.addColorStop(.36,'rgba(36,34,36,.23)');
sg.addColorStop(1,'rgba(50,46,48,0)');
sx.fillStyle=sg;sx.fillRect(0,0,256,256);
const contact=new T.Mesh(new T.PlaneGeometry(7.0,5.4),
  new T.MeshBasicMaterial({
    map:new T.CanvasTexture(shadowCanvas),transparent:true,
    depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1
  }));
contact.rotation.x=-Math.PI/2;contact.position.set(0,-.201,.50);ground.add(contact);

// Muted fragments are instanced: not a visible repeating grid.
const stoneGeo=new T.IcosahedronGeometry(1,0);
const stoneMat=new T.MeshStandardMaterial({color:'#666164',roughness:1});
const stones=new T.InstancedMesh(stoneGeo,stoneMat,54);
const dummy=new T.Object3D(),col=new T.Color();
for(let i=0;i<54;i++){
  const angle=i*2.3999632,dist=2.0+Math.sqrt(i/54)*2.4;
  dummy.position.set(Math.cos(angle)*dist,-.17,Math.sin(angle)*dist*.7);
  dummy.rotation.set(i*.16,i*1.27,i*.31);
  dummy.scale.set(.07+(i%5)*.029,.032+(i%4)*.014,.075+(i%7)*.016);
  dummy.updateMatrix();stones.setMatrixAt(i,dummy.matrix);
  col.set(i%3?'#7c7375':'#928688');stones.setColorAt(i,col);
}
stones.userData.watercolorSkipWash=true;
stones.userData.watercolorOutline=false;ground.add(stones);

// UI is hidden while playing; open with a single hamburger icon.
const menu=document.querySelector('#menu');
const btn=document.querySelector('#menu-btn');
function closeMenu(){menu.hidden=true;btn.setAttribute('aria-expanded','false');}
btn.onclick=()=>{
  menu.hidden=!menu.hidden;
  btn.setAttribute('aria-expanded',String(!menu.hidden));
};
let orbit=params.get('orbit')!=='off';
let paused=false;
let monochrome=params.get('palette')==='mono';
let transparent=params.get('background')==='transparent';
let mode='all';
let yaw=.42,pitch=.11,zoom=1;
let followYaw=yaw,followPitch=pitch;
let elapsed=0,lastMs=0,frames=0,quality=1,frameTime=16.7;
const modes={all:7.7,head:3.1,legs:5.0};
function setMode(next){
  if(!modes[next])return;
  mode=next;
  if(mode==='head'){yaw=.14;pitch=.08;zoom=1.0;}
  if(mode==='legs'){yaw=.82;pitch=.15;zoom=1.0;}
  if(mode==='all'){zoom=1.0;}
  resize();closeMenu();
}
function setOrbit(flag){
  orbit=!!flag;
  document.querySelector('#orbit').textContent=orbit?'Остановить вращение 360°':'Включить вращение 360°';
}
function setPaused(flag){
  paused=!!flag;stalker.userData.state.paused=paused;
  document.querySelector('#pause').textContent=paused?'Продолжить движение':'Остановить движение';
}
function setMono(flag){
  monochrome=!!flag;
  renderer.domElement.style.filter=monochrome?'grayscale(1)':'';
  document.querySelector('#mono').textContent=monochrome?'Цветная акварель':'Чёрно-белая акварель';
}
function setTransparent(flag){
  transparent=!!flag;
  scene.background=transparent?null:new T.Color(paper);
  floor.visible=!transparent;
  contact.visible=!transparent;
  stones.visible=!transparent;
  scene.fog=transparent?null:new T.FogExp2(paper,.018);
  renderer.setClearColor(paper,transparent?0:1);
  renderer.domElement.style.background=transparent?'transparent':paper;
  document.body.style.background=transparent?'transparent':paper;
  document.querySelector('#transparent').textContent=
    transparent?'Вернуть фон INK':'Прозрачный фон';
}
function action(kind){
  if(paused)setPaused(false);
  stalker.userData.play(kind);
  closeMenu();
}
document.querySelectorAll('[data-act]').forEach(e=>e.onclick=()=>action(e.dataset.act));
document.querySelectorAll('[data-view]').forEach(e=>e.onclick=()=>setMode(e.dataset.view));
document.querySelector('#orbit').onclick=()=>setOrbit(!orbit);
document.querySelector('#pause').onclick=()=>setPaused(!paused);
document.querySelector('#mono').onclick=()=>setMono(!monochrome);
document.querySelector('#transparent').onclick=()=>setTransparent(!transparent);

function resize(){
  const aspect=innerWidth/Math.max(1,innerHeight);
  const base=modes[mode];
  camera.userData.viewHeight=Math.max(base,mode==='head'?2.3/aspect:mode==='legs'?4.3/aspect:6.7/aspect);
  camera.updateForViewport(innerWidth,innerHeight);
  camera.zoom=zoom;camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
}
function cameraOrbit(){
  const targetY=mode==='head'?3.26:mode==='legs'?1.32:2.52;
  const lookZ=mode==='head'?1.54:mode==='legs'?-.11:.03;
  const distance=mode==='head'?9.1:mode==='legs'?11.2:12.6;
  camera.position.set(
    Math.sin(followYaw)*Math.cos(followPitch)*distance,
    targetY+Math.sin(followPitch)*distance,
    lookZ+Math.cos(followYaw)*Math.cos(followPitch)*distance
  );
  camera.lookAt(0,targetY,lookZ);
}
const touches=new Map();let prevPinch=0;let down=null;
renderer.domElement.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse'&&e.button!==0)return;
  renderer.domElement.setPointerCapture(e.pointerId);
  touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
  down={x:e.clientX,y:e.clientY};
  setOrbit(false);
  if(touches.size===2){
    const p=[...touches.values()];
    prevPinch=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);
  }
});
renderer.domElement.addEventListener('pointermove',e=>{
  if(!touches.has(e.pointerId))return;
  touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(touches.size>=2){
    const p=[...touches.values()];
    const d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);
    zoom=T.MathUtils.clamp(zoom*d/Math.max(1,prevPinch),.6,3.3);
    prevPinch=d;resize();
  }else if(down){
    yaw-=(e.clientX-down.x)*.0072;
    pitch=T.MathUtils.clamp(pitch+(e.clientY-down.y)*.0042,-.35,1.06);
  }
  down={x:e.clientX,y:e.clientY};
});
for(const ev of ['pointerup','pointercancel','lostpointercapture']){
  renderer.domElement.addEventListener(ev,e=>{touches.delete(e.pointerId);down=null;});
}
renderer.domElement.addEventListener('wheel',e=>{
  e.preventDefault();
  zoom=T.MathUtils.clamp(zoom*Math.exp(-e.deltaY*.001),.6,3.3);
  resize();
},{passive:false});
addEventListener('keydown',e=>{
  if(e.code==='Space'){e.preventDefault();setPaused(!paused);}
  if(e.code==='KeyB')action('bite');
  if(e.code==='KeyJ')action('jump');
  if(e.code==='KeyA')action('strike');
  if(e.code==='KeyR')setOrbit(!orbit);
  if(e.code==='Digit1')setMode('all');
  if(e.code==='Digit2')setMode('head');
  if(e.code==='Digit3')setMode('legs');
});
addEventListener('blur',()=>{touches.clear();down=null;});
addEventListener('resize',resize);
setOrbit(orbit);setPaused(false);setMono(monochrome);setTransparent(transparent);
resize();cameraOrbit();

function frame(ms){
  requestAnimationFrame(frame);
  if(document.hidden){lastMs=ms;return;}
  const dt=Math.min(.045,Math.max(0,(ms-lastMs)/1000));lastMs=ms;
  frameTime=frameTime*.95+dt*1000*.05;
  if(frameTime>36&&quality>.72){
    quality=.72;renderer.setPixelRatio(1);paint.setQuality(.72);resize();
  }
  if(!paused)elapsed+=dt;
  if(orbit)yaw+=dt*.19;
  stalker.userData.tick(elapsed,paused?0:dt);
  const w=1-Math.exp(-dt*7);
  followYaw+=(yaw-followYaw)*w;followPitch+=(pitch-followPitch)*w;
  cameraOrbit();paint.tick(ms);
  renderer.render(scene,camera);
  frames++;
}
requestAnimationFrame(frame);
window.__INK_CARRION_STALKER__={
  ready:true,model:stalker,scene,camera,
  play:action,show:setMode,pause:()=>setPaused(true),resume:()=>setPaused(false),
  stats:()=>{
    let meshes=0,triangles=0;
    stalker.traverse(o=>{
      if(o.isMesh&&o.name!=='__livingWatercolorOutline'){
        meshes++;
        triangles+=o.geometry.index?.count/3||o.geometry.attributes.position?.count/3||0;
      }
    });
    return {meshes,triangles,frames,orbit,paused,mode,frameTime,quality,
      jawAngle:stalker.userData.rig.jaw.rotation.x,
      leapHeight:stalker.userData.rig.body.position.y};
  }
};
