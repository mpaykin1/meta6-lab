import * as T from 'three';
import {createLivingWatercolor3D,createWatercolorStyle} from './shared/living-watercolor-3d.js';
import {createIllustrationCamera} from './shared/living-watercolor-generators.js';
import {objectMakers} from './ink-objects.js';
import {extraObjectMakers} from './ink-extras.js';
import {settlementMakers} from './ink-settlement.js';
import {buildWorld} from './ink-world.js';
import {createInkOptics} from './ink-optics.js';
import {createFallenRobot} from './ink-fallen-robot.js';
const allObjectMakers = {...objectMakers, ...extraObjectMakers, ...settlementMakers, robot: createFallenRobot};

document.querySelectorAll('#label,#hint,#chooser').forEach(o=>o.remove());
document.title='INK · Долина дождя';
const css=document.createElement('style');css.textContent=`
#ink-zones{margin:12px 0 18px}#ink-vignette{position:fixed;inset:0;pointer-events:none;z-index:2;background:radial-gradient(ellipse at 50% 43%,transparent 35%,#4b574b1a 100%)}body{background:#efece2;color:#343d3b}canvas{position:fixed;inset:0;touch-action:none}body.mono canvas{filter:grayscale(1)}
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
<div id="ink-tools"><button id="ink-color" class="ink-round" aria-label="Переключить Ч/Б и цвет" aria-pressed="false">◐</button><button id="ink-orbit" class="ink-round" aria-label="Вращать камеру" aria-pressed="false">↻</button><button id="ink-map" class="ink-round" aria-label="Весь мир" aria-pressed="false">⌖</button></div>
<section id="ink-menu" hidden><h1>INK</h1><p>Город · осенний лес · озеро<br>Объёмный мир живой акварели</p><nav id="ink-zones"></nav><nav id="ink-objects"></nav><small>Проведи пальцем — повернуть.<br>Колёсико / два пальца — приблизить.<br>WASD / стрелки / джойстик — идти.<br>⌖ — весь мир / следовать за героем.<br>◐ — чёрно-белый / цвет.</small><a href="?reference=1">Эталон Living Watercolor ↗</a></section>
<div id="ink-caption">Там, где дождь рисует мир</div><div id="ink-joystick"><div id="ink-stick"></div></div>`;document.body.append(ui);const vignette=document.createElement('div');vignette.id='ink-vignette';document.body.append(vignette);
const menu=ui.querySelector('#ink-menu');ui.querySelector('#ink-menu-button').onclick=e=>{menu.hidden=!menu.hidden;e.currentTarget.setAttribute('aria-expanded',String(!menu.hidden));};
const scene = new T.Scene();
const camera = createIllustrationCamera(T, {
  width: innerWidth, height: innerHeight, viewHeight: 17,
  position: [12, 13, 17], lookAt: [0, .5, 0]
});
camera.far = 180;
const renderer = new T.WebGLRenderer({antialias: true, alpha: false, powerPreference: 'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
renderer.setSize(innerWidth, innerHeight); renderer.outputColorSpace = T.SRGBColorSpace;
document.body.prepend(renderer.domElement);
const style = createWatercolorStyle({
  seed: 'ink-rain-forest-1113', inkColor: '#303c38', paperColor: '#efece2', washColor: '#839487',
  washOpacity: .78, washLayers: 6, edgeWidth: .019, edgeJitter: .26, granulation: .40,
  bleed: .24, shadowWash: .17, motion: .10, pigmentPooling: .27, paperGap: .15, paintedLight: .67
});
const optics = createInkOptics(renderer);
const paint = createLivingWatercolor3D({THREE: T, renderer, scene, camera, style});
const ambient = new T.HemisphereLight('#fff3d7', '#96aca3', 2.2); scene.add(ambient);
const sun = new T.DirectionalLight('#fff0cd', 1.4); sun.position.set(-5, 9, 6); scene.add(sun);
scene.fog = new T.Fog('#e7e5d6', 64, 108);
const valley = buildWorld({makers: allObjectMakers, paint, scene});
const {world, hero} = valley;
const specimen = new T.Group(); scene.add(specimen); specimen.visible = false;
const displayObjects = {};
const labels = {
  forest: 'Долина дождя', fir: 'Ель', birch: 'Берёза', shelter: 'Лесной домик', traveller: 'Путник',
  lantern: 'Фонарь', sign: 'Указатель', bench: 'Скамейка', rock: 'Камни', mushrooms: 'Грибы', bridge: 'Мостик',
  windmill: 'Мельница', deer: 'Олень', rowboat: 'Лодка', fox: 'Лиса', shrine: 'Каменные ворота',
  apothecary: 'Угловая аптека', pier: 'Причал', streetlamp: 'Уличный фонарь', car: 'Автомобиль',
  bush: 'Кустарник', reeds: 'Камыш', wildflowers: 'Цветы и зонтики', sapling: 'Саженец', robot: 'Павший великан'
};
let active = 'forest', mono = false, orbit = false, overview = false;
let yaw = -.62, pitch = .65, zoom = 1, drag = null, pinch = 0, previous = 0, elapsed = 0;
let frameAvg = 16, quality = 1;
const params = new URLSearchParams(location.search);
const focus = new T.Vector3(hero.position.x, .6, hero.position.z);
const desired = focus.clone();
function choose(name) {
  active = labels[name] ? name : 'forest'; world.visible = active === 'forest';
  specimen.visible = !world.visible;
  if (!world.visible && !displayObjects[active]) {
    const o = allObjectMakers[active](13); specimen.add(o);
    paint.apply(o, {seed: 'ink-specimen:' + active}); displayObjects[active] = o;
  }
  for (const [k, o] of Object.entries(displayObjects)) o.visible = k === active;
  zoom = 1;
  ui.querySelector('#ink-joystick').style.visibility = world.visible ? 'visible' : 'hidden';
  ui.querySelector('#ink-caption').textContent = world.visible ? 'Там, где дождь рисует мир' : labels[active];
  ui.querySelectorAll('#ink-objects button').forEach(b =>
    b.setAttribute('aria-pressed', String(b.dataset.object === active)));
  params.set('ink', active); try {history.replaceState(null, '', '?' + params);} catch (e) {} resize();
}
function closeMenu() {
  menu.hidden = true; ui.querySelector('#ink-menu-button').setAttribute('aria-expanded', 'false');
}
for (const [id, label] of Object.entries(labels)) {
  const b = document.createElement('button'); b.textContent = label; b.dataset.object = id;
  b.onclick = () => {choose(id); closeMenu();}; menu.querySelector('#ink-objects').append(b);
}
for (const [id, label] of Object.entries({city: 'Город', woodland: 'Осенний лес', lakeside: 'Озеро и лодка', meadow: 'Лесная поляна', guardian: 'Павший великан'})) {
  const b = document.createElement('button'); b.textContent = label;
  b.onclick = () => {
    choose('forest'); overview = false; ui.querySelector('#ink-map').setAttribute('aria-pressed', 'false');
    const [x, z] = valley.zones[id]; hero.position.set(x, 0, z); focus.set(x, .6, z);
    resize(); closeMenu();
  };
  menu.querySelector('#ink-zones').append(b);
}
const sourceNote = document.createElement('small');
sourceNote.textContent = 'Видеореференс: Nookvale alpha · a very important sound test.';
menu.append(sourceNote);
function setMono(value) {
  mono = value; document.body.classList.toggle('mono', mono);
  ui.querySelector('#ink-color').setAttribute('aria-pressed', String(mono));
  params.set('palette', mono ? 'mono' : 'color'); try {history.replaceState(null, '', '?' + params);} catch (e) {}
}
ui.querySelector('#ink-color').onclick = () => setMono(!mono);
ui.querySelector('#ink-orbit').onclick = e => {
  orbit = !orbit; e.currentTarget.setAttribute('aria-pressed', String(orbit));
};
ui.querySelector('#ink-map').onclick = e => {
  overview = !overview; e.currentTarget.setAttribute('aria-pressed', String(overview)); resize();
};
function resize() {
  const aspect = innerWidth / Math.max(1, innerHeight);
  camera.userData.viewHeight = active === 'forest'
    ? overview ? Math.max(52, 54 / aspect) : Math.max(15, 14 / aspect)
    : active === 'apothecary' ? Math.max(11, 10 / aspect) : active === 'robot' ? Math.max(9.1, 10 / aspect) : Math.max(6, 5.5 / aspect);
  camera.updateForViewport(innerWidth, innerHeight); camera.zoom = zoom; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}
addEventListener('resize', resize); choose(params.get('ink') || 'forest'); setMono(params.get('palette') === 'mono');
const keys=new Set(),stick={x:0,y:0},pointers=new Map();
addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();keys.add(e.key.toLowerCase());});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
const resetInput=()=>{keys.clear();stick.x=stick.y=0;ui.querySelector('#ink-stick').style.transform='';drag=null;pointers.clear();};addEventListener('blur',resetInput);document.addEventListener('visibilitychange',()=>{if(document.hidden)resetInput();});
renderer.domElement.addEventListener('pointerdown',e=>{renderer.domElement.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});drag={x:e.clientX,y:e.clientY};if(pointers.size===2){const p=[...pointers.values()];pinch=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);}});
renderer.domElement.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const p=[...pointers.values()],d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);zoom=T.MathUtils.clamp(zoom*d/Math.max(1,pinch),.55,2.8);pinch=d;resize();}else if(drag){yaw-=(e.clientX-drag.x)*.007;pitch=T.MathUtils.clamp(pitch+(e.clientY-drag.y)*.004,.26,1.25);}drag={x:e.clientX,y:e.clientY};});
for(const event of ['pointerup','pointercancel','lostpointercapture'])renderer.domElement.addEventListener(event,e=>{pointers.delete(e.pointerId);drag=null;});
renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();zoom=T.MathUtils.clamp(zoom*Math.exp(-e.deltaY*.001),.55,2.8);resize();},{passive:false});
const pad=ui.querySelector('#ink-joystick'),knob=ui.querySelector('#ink-stick');let padId=null;
function moveStick(e){const r=pad.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,len=Math.max(32,Math.hypot(dx,dy));stick.x=dx/len;stick.y=dy/len;knob.style.transform=`translate(${stick.x*27}px,${stick.y*27}px)`;}
pad.onpointerdown=e=>{padId=e.pointerId;pad.setPointerCapture(padId);moveStick(e);};pad.onpointermove=e=>{if(e.pointerId===padId)moveStick(e);};
for(const event of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(event,()=>{padId=null;stick.x=stick.y=0;knob.style.transform='';});

function animate(ms) {
  requestAnimationFrame(animate);
  if (document.hidden) {previous = ms; return;}
  const dt = Math.min(.04, Math.max(0, (ms - previous) / 1000)); previous = ms; elapsed += dt;
  frameAvg = frameAvg * .97 + dt * 1000 * .03;
  if (frameAvg > 30 && quality > .7) {quality = .7; renderer.setPixelRatio(1); paint.setQuality(.7);}
  let vx = stick.x + (keys.has('d') || keys.has('arrowright') ? 1 : 0)
    - (keys.has('a') || keys.has('arrowleft') ? 1 : 0);
  let vy = stick.y + (keys.has('s') || keys.has('arrowdown') ? 1 : 0)
    - (keys.has('w') || keys.has('arrowup') ? 1 : 0);
  const length = Math.hypot(vx, vy), moving = active === 'forest' && length > .05;
  if (moving) {
    vx /= Math.max(1, length); vy /= Math.max(1, length);
    const dx = Math.cos(yaw) * vx + Math.sin(yaw) * vy;
    const dz = -Math.sin(yaw) * vx + Math.cos(yaw) * vy;
    const nx = hero.position.x + dx * dt * 3.0, nz = hero.position.z + dz * dt * 3.0;
    // Sliding against walls keeps touch movement responsive.
    if (valley.canWalk(nx, hero.position.z)) hero.position.x = nx;
    if (valley.canWalk(hero.position.x, nz)) hero.position.z = nz;
    hero.rotation.y = Math.atan2(dx, dz); hero.position.y = Math.abs(Math.sin(elapsed * 9)) * .035;
  } else hero.position.y = Math.sin(elapsed * 2) * .012;
  if (hero.position.x > 5.5 && Math.abs(hero.position.z - 10.8) < .72) hero.position.y += .34;
  hero.userData.legs.forEach((leg, i) => {leg.rotation.x = moving ? Math.sin(elapsed * 9 + i * Math.PI) * .40 : 0;});
  hero.userData.scarf.rotation.z = Math.sin(elapsed * 2.3) * .09;
  if (orbit && !drag) yaw += dt * .12;
  const targetY = active === 'forest' ? .6 : active === 'apothecary' ? 1.8 : active === 'robot' ? 1.15 :
    ['fir', 'birch', 'windmill'].includes(active) ? 1.6 : .65;
  if (active === 'forest') desired.set(overview ? 0 : hero.position.x, targetY, overview ? 0 : hero.position.z);
  else desired.set(0, targetY, active === 'pier' ? 1.7 : 0);
  focus.lerp(desired, 1 - Math.exp(-dt * 5));
  const radius = 60;
  camera.position.set(focus.x + Math.sin(yaw) * Math.cos(pitch) * radius,
    focus.y + Math.sin(pitch) * radius, focus.z + Math.cos(yaw) * Math.cos(pitch) * radius);
  camera.lookAt(focus);
  const warmth = active === 'forest' ? T.MathUtils.smoothstep(hero.position.z, -6, 12) : .5;
  ambient.color.set('#e3f1e2').lerp(new T.Color('#ffe3b2'), warmth);
  sun.color.set('#b9e0d6').lerp(new T.Color('#ffd095'), warmth);
  valley.tick(elapsed, focus, overview);
  const shown = displayObjects[active];
  if (shown) {
    if (shown.userData.rotor) shown.userData.rotor.rotation.z = elapsed * .23;
    if (shown.userData.tail) shown.userData.tail.rotation.y = Math.sin(elapsed) * .13;
    if (active === 'rowboat') shown.position.y = Math.sin(elapsed) * .04;
    if (shown.userData.orb) shown.userData.orb.position.y = 1.32 + Math.sin(elapsed) * .10;
    if (shown.userData.robotEyes) shown.userData.robotEyes.color.setRGB(1, .39 + Math.sin(elapsed * .75) * .065, .20);
    if (shown.userData.scarf) shown.userData.scarf.rotation.z = Math.sin(elapsed * 2.3) * .1;
  }
  paint.tick(ms); optics.render(scene, camera, overview);
}
requestAnimationFrame(animate);
window.__INK_FOREST__ = {
  version: '2.0.0', objects: Object.keys(allObjectMakers), show: choose, setMono,
  get active() {return active;}, get region() {return hero.position.z < -5 ? 'city' : hero.position.x > 2 ? 'lakeside' : 'woodland';}
};
