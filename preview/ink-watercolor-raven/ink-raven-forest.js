import * as T from 'three';
import {createLivingWatercolor3D,createWatercolorStyle} from '../../demos/living-watercolor/shared/living-watercolor-3d.js';
import {createIllustrationCamera} from '../../demos/living-watercolor/shared/living-watercolor-generators.js';
import {objectMakers} from '../../demos/living-watercolor/ink-objects.js';
import {createFallenRobot} from '../../demos/living-watercolor/ink-fallen-robot.js';
import {createInkRaven} from '../../demos/living-watercolor/ink-flying-raven.js';
objectMakers.robot = createFallenRobot;
objectMakers.raven = createInkRaven;

document.querySelectorAll('#label,#hint,#chooser').forEach(o=>o.remove());
document.title='INK · Летящий ворон · Павший великан';
const css=document.createElement('style');css.textContent=`
body{background:#efece2;color:#343d3b}canvas{position:fixed;inset:0;touch-action:none}body.mono canvas{filter:grayscale(1)}
#ink-ui{position:fixed;z-index:9;inset:0;pointer-events:none}#ink-ui button,#ink-menu{pointer-events:auto}
.ink-round{width:44px;height:44px;border:1px solid #364b3d25;border-radius:50%;background:#f7f3e7d9;color:#344640;backdrop-filter:blur(12px);font:20px Georgia;cursor:pointer;box-shadow:0 3px 16px #3446400a}
#ink-menu-button{position:absolute;left:max(18px,env(safe-area-inset-left));top:max(18px,env(safe-area-inset-top))}
#ink-tools{position:absolute;right:max(18px,env(safe-area-inset-right));top:max(18px,env(safe-area-inset-top));display:flex;gap:9px}
#ink-menu{position:absolute;left:18px;top:max(74px,calc(env(safe-area-inset-top) + 60px));width:260px;max-height:calc(100dvh - 120px);overflow:auto;padding:22px;box-sizing:border-box;border:1px solid #34464018;border-radius:14px;background:#f7f3e7f2;backdrop-filter:blur(20px);box-shadow:0 12px 50px #34464015}
#ink-menu[hidden]{display:none}#ink-menu h1{font:italic 32px Georgia;margin:0 0 5px;letter-spacing:.10em}#ink-menu p{font:12px/1.6 system-ui;color:#65746b;margin:0 0 17px}#ink-menu nav{display:grid;grid-template-columns:1fr 1fr;gap:7px}
#ink-menu nav button{border:1px solid #3c504018;border-radius:7px;text-align:left;padding:10px 8px;background:transparent;font:12px system-ui;color:#44534b;cursor:pointer}#ink-menu nav button[aria-pressed=true]{background:#405d4b12;border-color:#405d4b55}
#ink-menu a{display:block;font:11px system-ui;color:#65746b;margin-top:20px}#ink-menu small{display:block;margin-top:20px;font:10px/1.7 system-ui;color:#788277}
#ink-caption{position:absolute;bottom:max(23px,env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);font:italic 15px Georgia;letter-spacing:.14em;color:#4c6057;white-space:nowrap;opacity:.7}
#ink-joystick{position:absolute;bottom:max(28px,env(safe-area-inset-bottom));left:22px;width:92px;height:92px;border-radius:50%;border:1px solid #526b5044;background:#ffffff20;pointer-events:auto;touch-action:none;display:none}
#ink-stick{position:absolute;left:28px;top:28px;width:36px;height:36px;border:1px solid #526b5055;border-radius:50%;background:#f6f1e7a0;pointer-events:none}
@media(pointer:coarse){#ink-joystick{display:block}#ink-caption{bottom:30px;font-size:12px;left:auto;right:23px;transform:none;letter-spacing:.05em}}
`;document.head.append(css);
const ui=document.createElement('div');ui.id='ink-ui';ui.innerHTML=`
<button id="ink-menu-button" class="ink-round" aria-label="Объекты и управление" aria-expanded="false">☰</button>
<div id="ink-tools"><button id="ink-color" class="ink-round" aria-label="Переключить Ч/Б и цвет" aria-pressed="false">◐</button><button id="ink-orbit" class="ink-round" aria-label="Вращать камеру" aria-pressed="false">↻</button></div>
<section id="ink-menu" hidden><h1>INK</h1><p>Дождевой лес<br>Объёмные объекты · живая акварель</p><nav></nav><small>Проведи пальцем — повернуть.<br>Колёсико / два пальца — приблизить.<br>WASD / стрелки / джойстик — идти.<br>◐ — чёрно-белый / цвет.</small><a href="../../demos/living-watercolor/?reference=1">Эталон Living Watercolor ↗</a></section>
<div id="ink-caption">Там, где дождь рисует лес</div><div id="ink-joystick"><div id="ink-stick"></div></div>`;document.body.append(ui);
const menu=ui.querySelector('#ink-menu');ui.querySelector('#ink-menu-button').onclick=e=>{menu.hidden=!menu.hidden;e.currentTarget.setAttribute('aria-expanded',String(!menu.hidden));};
const scene=new T.Scene();
const camera=createIllustrationCamera(T,{width:innerWidth,height:innerHeight,viewHeight:16,position:[12,13,17],lookAt:[0,.5,0]});
const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=T.SRGBColorSpace;document.body.prepend(renderer.domElement);
const style=createWatercolorStyle({seed:'ink-rain-forest-1113',inkColor:'#303c38',paperColor:'#efece2',washColor:'#839487',washOpacity:.78,washLayers:6,edgeWidth:.019,edgeJitter:.26,granulation:.40,bleed:.24,shadowWash:.17,motion:.10,pigmentPooling:.27,paperGap:.15,paintedLight:.67});
const paint=createLivingWatercolor3D({THREE:T,renderer,scene,camera,style});
scene.add(new T.HemisphereLight('#fff3d7','#96aca3',2.4));const sun=new T.DirectionalLight('#fff4dc',1.3);sun.position.set(-3,9,6);scene.add(sun);
const world=new T.Group(),specimen=new T.Group();scene.add(world,specimen);specimen.visible=false;
const animatedTrees=[],lamps=[];let hero;
function add(kind,x=0,z=0,scale=1,angle=0,seed=1){const o=objectMakers[kind](seed);o.position.set(x,0,z);o.scale.setScalar(scale);o.rotation.y=angle;world.add(o);if(kind==='fir'||kind==='birch')animatedTrees.push(o);return o;}
const rnd=n=>{const a=Math.sin(n*127.1+311.7)*43758.5453;return a-Math.floor(a);};
const ground=new T.Mesh(new T.CylinderGeometry(7.4,6.9,.30,64,1),new T.MeshStandardMaterial({color:'#b6bda4',roughness:1}));ground.position.y=-.23;ground.scale.z=.82;ground.userData.watercolorOutline=false;world.add(ground);
const under=new T.Mesh(new T.CylinderGeometry(6.9,6.5,.36,64),new T.MeshStandardMaterial({color:'#c0b89e',roughness:1}));under.position.y=-.55;under.scale.z=.82;under.userData.watercolorOutline=false;world.add(under);
// A winding ribbon of shallow water, underneath the arched footbridge.
const verts=[],inds=[];for(let i=0;i<=48;i++){const z=-5.9+i/48*11.8,x=1.8+Math.sin(z*.45)*.7;verts.push(x-.44,.003,z,x+.44,.003,z);if(i<48){const a=i*2;inds.push(a,a+2,a+1,a+1,a+2,a+3);}}
const riverGeo=new T.BufferGeometry();riverGeo.setAttribute('position',new T.Float32BufferAttribute(verts,3));riverGeo.setIndex(inds);riverGeo.computeVertexNormals();const river=new T.Mesh(riverGeo,new T.MeshStandardMaterial({color:'#729b9b',roughness:.7,side:T.DoubleSide}));river.userData.watercolorOutline=false;world.add(river);
const path=[];for(let i=0;i<=40;i++){const z=-5.7+i*.28;path.push(new T.Vector3(-.7+Math.sin(z*.46)*.9,.018,z));}
const pathMesh=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(path),50,.35,5,false),new T.MeshStandardMaterial({color:'#bdad8c',roughness:1}));pathMesh.scale.y=.035;pathMesh.userData.watercolorOutline=false;world.add(pathMesh);
for(let i=0;i<17;i++){
  const a=i*2.39996,r=3.4+rnd(i+30)*2.6,x=Math.cos(a)*r,z=Math.sin(a)*r*.79;
  if(x>-.4&&x<3.5&&z<0)continue;
  if((x-2.7)**2+(z+3.15)**2<8.5)continue;
  add(i%5===0?'birch':'fir',x,z,.65+rnd(i+20)*.36,rnd(i)*6.28,i+1);
}
const fallenGuardian=add('robot',2.7,-3.15,.83,-.28,23);
// Genuine articulated 3D raven flying over the fallen giant; v1 files stay untouched.
const raven=add('raven',2.1,-2.5,.88,0,47);
raven.position.y=3.55;
const hut=add('shelter',-3.5,-1.6,.77,.12);add('bench',-2.50,.3,.72,-.1);add('sign',-.70,1.6,.8,-.25);add('bridge',2.45,.9,.9,Math.PI/2);
hero=add('traveller',-.30,2.5,.70,.6);add('mushrooms',-3.9,1.9,1.1);add('mushrooms',1.3,-3.3,.80);
for(let i=0;i<6;i++)add('rock',Math.cos(i*2.2)*5.4,Math.sin(i*2.2)*4.4,.55+rnd(i)*.4,i,22+i);
for(let i=0;i<3;i++){const lamp=add('lantern',-.3+Math.sin(i)*1.2,-2.7+i*1.7,.85);lamps.push(lamp);}
// Meadow blades share one instanced geometry; no per-blade outline passes.
const grassGeo=new T.ConeGeometry(.035,.24,3),grass=new T.InstancedMesh(grassGeo,new T.MeshStandardMaterial({color:'#7d9478',roughness:1}),420);const temp=new T.Object3D();
for(let i=0;i<420;i++){const a=rnd(i+900)*Math.PI*2,r=Math.sqrt(rnd(i+1300))*6.8,x=Math.cos(a)*r,z=Math.sin(a)*r*.80;const nearPath=Math.abs(x-(-.7+Math.sin(z*.46)*.9))<.5;const nearRiver=Math.abs(x-(1.8+Math.sin(z*.45)*.7))<.6;temp.position.set(x,.08,z);temp.rotation.set(.1,rnd(i)*6.28,.1);temp.scale.setScalar(nearPath||nearRiver?.02:.65+rnd(i+1));temp.updateMatrix();grass.setMatrixAt(i,temp.matrix);}
grass.userData.watercolorOutline=false;grass.userData.watercolorSkipWash=true;world.add(grass);
paint.apply(world,{seed:'ink-forest'});
// One coherent smoke brush emitter, directly reused from the accepted reference.
paint.createBrushEmitter({parent:hut,origin:new T.Vector3(.58,2.9,.14),count:7,scale:.35,rise:.32,spread:.25,wind:.13,opacity:.12,seed:'hut-smoke'});
paint.addGroundWash(world,{width:15,depth:10,opacity:.14,seed:'forest-ground'});
const displayObjects={};for(const [name,maker] of Object.entries(objectMakers)){const o=maker(13);o.visible=false;specimen.add(o);paint.apply(o,{seed:'ink-specimen:'+name});paint.addGroundWash(o,{width:4,depth:2.5,opacity:.15,seed:name});displayObjects[name]=o;}
// Rain lines and expanding rings remain fully three-dimensional.
const rainPositions=new Float32Array(180*6),rainGeo=new T.BufferGeometry();rainGeo.setAttribute('position',new T.BufferAttribute(rainPositions,3));
const rain=new T.LineSegments(rainGeo,new T.LineBasicMaterial({color:'#5c7979',transparent:true,opacity:.30,depthWrite:false}));world.add(rain);
const ringGeo=new T.RingGeometry(.12,.132,18);ringGeo.rotateX(-Math.PI/2);const rings=[];
for(let i=0;i<22;i++){const o=new T.Mesh(ringGeo,new T.MeshBasicMaterial({color:'#5c7979',transparent:true,opacity:.15,depthWrite:false,side:T.DoubleSide}));o.position.set((rnd(i+4)-.5)*10,.022,(rnd(i+7)-.5)*8);world.add(o);rings.push(o);}
const labels={forest:'Дождевой лес',fir:'Ель',birch:'Берёза',shelter:'Лесной домик',traveller:'Путник',lantern:'Фонарь',sign:'Указатель',bench:'Скамейка',rock:'Камни',mushrooms:'Грибы',bridge:'Мостик',robot:'Павший великан',raven:'Летящий ворон'};
let active='forest',mono=false,orbit=false,yaw=.62,pitch=.65,zoom=1,drag=null,pinch=0,previous=0,elapsed=0,frameAvg=16,quality=1;
const params=new URLSearchParams(location.search);
function choose(name){active=labels[name]?name:'forest';world.visible=active==='forest';specimen.visible=!world.visible;for(const [k,o] of Object.entries(displayObjects))o.visible=k===active;
  zoom=1;ui.querySelector('#ink-joystick').style.visibility=world.visible?'visible':'hidden';ui.querySelector('#ink-caption').textContent=world.visible?'Там, где дождь рисует лес':labels[active];ui.querySelectorAll('nav button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.object===active)));params.set('ink',active);history.replaceState(null,'','?'+params);resize();}
for(const [id,label] of Object.entries(labels)){const b=document.createElement('button');b.textContent=label;b.dataset.object=id;b.onclick=()=>{choose(id);menu.hidden=true;ui.querySelector('#ink-menu-button').setAttribute('aria-expanded','false');};menu.querySelector('nav').append(b);}
function setMono(value){mono=value;document.body.classList.toggle('mono',mono);ui.querySelector('#ink-color').setAttribute('aria-pressed',String(mono));ui.querySelector('#ink-color').title=mono?'Включить цвет':'Включить Ч/Б';params.set('palette',mono?'mono':'color');history.replaceState(null,'','?'+params);}
ui.querySelector('#ink-color').onclick=()=>setMono(!mono);ui.querySelector('#ink-orbit').onclick=e=>{orbit=!orbit;e.currentTarget.setAttribute('aria-pressed',String(orbit));};
function resize(){const aspect=innerWidth/Math.max(1,innerHeight);camera.userData.viewHeight=active==='forest'?Math.max(14.2,15.7/aspect):active==='robot'?Math.max(9.1,10/aspect):active==='raven'?Math.max(8.4,8.5/aspect):Math.max(5.6,5.1/aspect);camera.updateForViewport(innerWidth,innerHeight);camera.zoom=zoom;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);}
addEventListener('resize',resize);choose(params.get('ink')||'forest');setMono(params.get('palette')==='mono');
const keys=new Set(),stick={x:0,y:0},pointers=new Map();
addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();keys.add(e.key.toLowerCase());});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
const resetInput=()=>{keys.clear();stick.x=stick.y=0;ui.querySelector('#ink-stick').style.transform='';drag=null;pointers.clear();};addEventListener('blur',resetInput);document.addEventListener('visibilitychange',()=>{if(document.hidden)resetInput();});
renderer.domElement.addEventListener('pointerdown',e=>{renderer.domElement.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});drag={x:e.clientX,y:e.clientY};if(pointers.size===2){const p=[...pointers.values()];pinch=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);}});
renderer.domElement.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const p=[...pointers.values()],d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);zoom=T.MathUtils.clamp(zoom*d/Math.max(1,pinch),.6,2.3);pinch=d;resize();}else if(drag){yaw-=(e.clientX-drag.x)*.007;pitch=T.MathUtils.clamp(pitch+(e.clientY-drag.y)*.004,.26,1.25);}drag={x:e.clientX,y:e.clientY};});
for(const event of ['pointerup','pointercancel','lostpointercapture'])renderer.domElement.addEventListener(event,e=>{pointers.delete(e.pointerId);drag=null;});
renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();zoom=T.MathUtils.clamp(zoom*Math.exp(-e.deltaY*.001),.6,2.3);resize();},{passive:false});
const pad=ui.querySelector('#ink-joystick'),knob=ui.querySelector('#ink-stick');let padId=null;
function moveStick(e){const r=pad.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,len=Math.max(32,Math.hypot(dx,dy));stick.x=dx/len;stick.y=dy/len;knob.style.transform=`translate(${stick.x*27}px,${stick.y*27}px)`;}
pad.onpointerdown=e=>{padId=e.pointerId;pad.setPointerCapture(padId);moveStick(e);};pad.onpointermove=e=>{if(e.pointerId===padId)moveStick(e);};
for(const event of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(event,()=>{padId=null;stick.x=stick.y=0;knob.style.transform='';});
function animate(ms){requestAnimationFrame(animate);if(document.hidden){previous=ms;return;}const dt=Math.min(.04,Math.max(0,(ms-previous)/1000));previous=ms;elapsed+=dt;
  frameAvg=frameAvg*.97+dt*1000*.03;if(frameAvg>30&&quality>.7){quality=.7;renderer.setPixelRatio(1);paint.setQuality(.7);}
  if(orbit&&!drag)yaw+=dt*.12;const targetY=active==='forest'?.6:active==='fir'||active==='birch'?1.6:active==='shelter'?1.2:active==='robot'?1.15:active==='raven'?.12:.65;const radius=22;
  camera.position.set(Math.sin(yaw)*Math.cos(pitch)*radius,targetY+Math.sin(pitch)*radius,Math.cos(yaw)*Math.cos(pitch)*radius);camera.lookAt(0,targetY,0);
  let vx=stick.x+(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),vy=stick.y+(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);const length=Math.hypot(vx,vy),moving=active==='forest'&&length>.05;
  if(moving){vx/=Math.max(1,length);vy/=Math.max(1,length);const dx=Math.cos(yaw)*vx+Math.sin(yaw)*vy,dz=-Math.sin(yaw)*vx+Math.cos(yaw)*vy;const nx=hero.position.x+dx*dt*1.9,nz=hero.position.z+dz*dt*1.9;if(nx*nx/43+nz*nz/27<1&&!(nx<-2.3&&nx>-4.8&&nz<-1&&nz>-2.8)){hero.position.x=nx;hero.position.z=nz;}hero.rotation.y=Math.atan2(dx,dz);hero.position.y=Math.abs(Math.sin(elapsed*9))*.035;}else hero.position.y=Math.sin(elapsed*2)*.012;
  hero.userData.legs.forEach((leg,i)=>leg.rotation.x=moving?Math.sin(elapsed*9+i*Math.PI)*.40:0);hero.userData.scarf.rotation.z=Math.sin(elapsed*2.3)*.09;
  animatedTrees.forEach((tree,i)=>{tree.rotation.z=Math.sin(elapsed*.8+i)*.015;tree.rotation.x=Math.sin(elapsed*.6+i)*.009;});
  for(let i=0;i<180;i++){const x=(rnd(i+100)-.5)*14,z=(rnd(i+700)-.5)*11,y=7-((elapsed*4+rnd(i+70)*7)%7),n=i*6;rainPositions[n]=x;rainPositions[n+1]=y;rainPositions[n+2]=z;rainPositions[n+3]=x-.055;rainPositions[n+4]=y+.30;rainPositions[n+5]=z;}
  rainGeo.attributes.position.needsUpdate=true;rings.forEach((ring,i)=>{const phase=(elapsed*.65+rnd(i))%1;ring.scale.setScalar(.3+phase*2.6);ring.material.opacity=(1-phase)*.19;});
  const displayed=displayObjects.traveller;displayed.userData.scarf.rotation.z=Math.sin(elapsed*2.3)*.1;
  for(const guardian of [fallenGuardian,displayObjects.robot]){
    const eye=guardian.userData.robotEyes;
    if(eye)eye.color.setRGB(1,.39+Math.sin(elapsed*.75)*.065,.20);
  }

  // Orbit through the forest in three dimensions; the isolated specimen also flaps.
  const turn=elapsed*.25;
  raven.position.set(2.55+1.25*Math.cos(turn),3.46+.22*Math.sin(elapsed*1.15),
    -3.12+1.15*Math.sin(turn));
  raven.rotation.y=Math.atan2(-1.25*Math.sin(turn),1.15*Math.cos(turn));
  raven.rotation.z=.08*Math.sin(turn);
  raven.userData.updateInkRaven(elapsed);
  displayObjects.raven.userData.updateInkRaven(elapsed);
  paint.tick(ms);renderer.render(scene,camera);
  window.__INK_RAVEN_RENDERED__=(window.__INK_RAVEN_RENDERED__||0)+1;
}
requestAnimationFrame(animate);
window.__INK_RAVEN__={
  model:raven,
  display:displayObjects.raven,
  get wingAngle(){return raven.userData.ravenRig.wings[1].shoulder.rotation.z;},
  get triangleCount(){let n=0;displayObjects.raven.traverse(o=>{if(o.isMesh&&o.geometry?.index)n+=o.geometry.index.count/3;});return n;},
  get fpsEstimate(){return 1000/Math.max(1,frameAvg);},
  get renderedFrames(){return window.__INK_RAVEN_RENDERED__||0;}
};
window.__INK_FOREST__={version:'1.2.0-raven-preview',objects:Object.keys(objectMakers),show:choose,setMono,get active(){return active;}};
