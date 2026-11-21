/* Casual Game Studio v1.2 — Three.js + Rapier + Tween + pmndrs FX + Blockbench + Three.quarks. */
import {Group, Tween, Easing} from './vendor/tween.esm.js';
const ui = id => document.getElementById(id);
const mount = ui('game');
// Three and pmndrs/postprocessing share the same version-pinned import map.
let THREE;
try {
  THREE = await import('three');
} catch (error) {
  ui('errorMessage').textContent='Cannot load the Three.js engine. Run vendor_engines.py for full offline use, or connect to the internet. '+String(error).slice(0,120);
  ui('error').classList.remove('hidden');
  throw error;
}

try {
const params = new URLSearchParams(location.search);
const title = (params.get('title') || 'PASTEL DROP').slice(0,24);
ui('gameTitle').textContent = title.toUpperCase();
document.title = title + ' · Casual Game Studio';
let seed = Number(params.get('seed') || 7) >>> 0;
function rnd() {seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;}
const clamp=(a,b,c)=>Math.max(b,Math.min(c,a));
const rows=9, cols=7, unit=.88, gap=.055, tileW=.84, tileH=.84, boardW=cols*(unit+gap), target=480;
const palette={pink:0xff95ac,peach:0xffc58f,ice:0xa6ecfa,stone:0xbac0d3,brick:0xc77955,cream:0xf7e9e5,mint:0x99dec9,gift:0xffd6ae};
const scene=new THREE.Scene();
scene.fog=new THREE.FogExp2(0xb6d6f8,.018);
const camera=new THREE.OrthographicCamera(-5,5,5,-5,.1,100);
camera.position.set(3.8,5.2,20);camera.lookAt(0,3.5,0);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setClearColor(0xffffff,0);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.35;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
mount.appendChild(renderer.domElement);
// Import the actual pmndrs postprocessing effects without ever blocking gameplay.
let fx=null, fxDesired=true, fxBroken=false, fxFlash=null;
const fxButton=ui('fxToggle');
const updateFxButton=()=>{
  fxButton.setAttribute('aria-pressed',String(fxDesired && !fxBroken));
  fxButton.textContent=fxDesired && !fxBroken?'✦ FX':'FX OFF';
};
fxButton.addEventListener('click',()=>{fxDesired=!fxDesired;updateFxButton();});
updateFxButton();
import('./postfx.js').then(({createPastelPostFX})=>createPastelPostFX(THREE,renderer,scene,camera))
  .then(result=>{fx=result;if(fx){fx.resize(innerWidth,innerHeight);}})
  .catch(error=>{fxBroken=true;updateFxButton();console.warn('Postprocessing unavailable, falling back to clean Three.js rendering.',error);});

scene.add(new THREE.HemisphereLight(0xffffff,0xb3b4e4,3.2));
const key=new THREE.DirectionalLight(0xfff7e8,3.5);key.position.set(-5,14,12);key.castShadow=true;
key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-11;key.shadow.camera.right=11;key.shadow.camera.top=15;key.shadow.camera.bottom=-7;
key.shadow.bias=-.0008;key.shadow.radius=4;scene.add(key);
const rim=new THREE.DirectionalLight(0xbde8ff,1.6);rim.position.set(7,10,-5);scene.add(rim);
const ambientMat=new THREE.MeshStandardMaterial({color:0xe8ffff,roughness:.9});
const mat=(hex,more={})=>new THREE.MeshStandardMaterial({color:hex,roughness:.72,metalness:0,...more});
const platform=new THREE.Mesh(new THREE.BoxGeometry(8,.38,2.1),mat(0xc4b1ed));platform.position.set(0,-.54,.08);platform.receiveShadow=true;scene.add(platform);
const platformFace=new THREE.Mesh(new THREE.BoxGeometry(7.85,.18,2),mat(0xf1e9ff));platformFace.position.set(0,-.28,.08);platformFace.receiveShadow=true;scene.add(platformFace);
const layerBack=new THREE.Mesh(new THREE.BoxGeometry(boardW+.34,rows*(unit+gap)+.32,.17),mat(0xf4e9fe));
layerBack.position.set(0,3.77,-.62);layerBack.receiveShadow=true;scene.add(layerBack);
const shadowPanel=new THREE.Mesh(new THREE.BoxGeometry(boardW+.58,rows*(unit+gap)+.55,.1),mat(0xb9b7dc));shadowPanel.position.set(.17,3.6,-.82);scene.add(shadowPanel);
const groundShadow = new THREE.Mesh(new THREE.CircleGeometry(3.8,64),new THREE.MeshBasicMaterial({color:0x6a74a8,transparent:true,opacity:.095,depthWrite:false}));
groundShadow.rotation.x=-Math.PI/2;groundShadow.scale.set(1,.24,1);groundShadow.position.set(0,-.75,0);scene.add(groundShadow);
const decorations = [];
for(let i=0;i<22;i++){
  const x=(rnd()-.5)*14, y=rnd()*10, z=-1-rnd()*3;
  if(Math.abs(x)<3.6&&y<8.5)continue;
  const s=.025+rnd()*.055;
  const sparkle=new THREE.Mesh(new THREE.OctahedronGeometry(s),new THREE.MeshBasicMaterial({color:i%3===0?0xffffff:0xf9f0ff,transparent:true,opacity:.3+rnd()*.45}));
  sparkle.position.set(x,y,z);scene.add(sparkle);decorations.push({mesh:sparkle,t:rnd()*10,s});
}
const textures={};
function makeTexture(kind) {
  const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');
  const colors={pink:'#ffacc0',peach:'#ffd2a9',ice:'#c6fbff',stone:'#e1e1f1',brick:'#e1a176',cream:'#fff2e8',mint:'#b7efdc',gift:'#fff1b8'};
  g.fillStyle=colors[kind];g.fillRect(0,0,128,128);
  const pr=()=>rnd();
  if(kind==='pink'||kind==='peach'||kind==='mint') {
    for(let i=0;i<32;i++) {g.fillStyle=kind==='pink'?'rgba(205,94,125,.14)':'rgba(255,255,255,.24)';g.beginPath();g.arc(10+pr()*108,10+pr()*108,1+pr()*2,0,Math.PI*2);g.fill();}
    g.fillStyle='rgba(255,255,255,.32)';g.fillRect(5,4,118,5);
  } else if(kind==='stone') {
    for(let i=0;i<8;i++){g.fillStyle=i%2?'#9fa3b9':'#c0bccb';g.beginPath();g.ellipse(14+pr()*100,14+pr()*100,3+pr()*5,3+pr()*5,pr(),0,7);g.fill();}
  } else if(kind==='ice') {
    g.strokeStyle='rgba(255,255,255,.84)';g.lineWidth=6;g.beginPath();g.moveTo(17,40);g.bezierCurveTo(45,20,61,88,99,26);g.stroke();g.beginPath();g.moveTo(22,90);g.bezierCurveTo(50,45,88,127,104,76);g.stroke();
    g.fillStyle='rgba(255,255,255,.45)';g.fillRect(12,7,104,6);
  } else if(kind==='brick') {
    g.strokeStyle='#a95b41';g.lineWidth=6;g.beginPath();g.moveTo(0,43);g.lineTo(128,43);g.moveTo(0,86);g.lineTo(128,86);g.moveTo(64,0);g.lineTo(64,43);g.moveTo(35,43);g.lineTo(35,86);g.moveTo(95,43);g.lineTo(95,86);g.moveTo(64,86);g.lineTo(64,128);g.stroke();
    g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=2;g.strokeRect(5,6,118,116);
  } else if(kind==='cream') {
    g.fillStyle='rgba(255,255,255,.82)';g.fillRect(24,24,35,31);g.fillRect(72,24,31,31);g.fillRect(24,66,35,34);g.fillRect(72,66,31,34);
  } else if(kind==='gift') {
    g.fillStyle='#fb7ab0';g.fillRect(14,35,100,80);g.fillStyle='#ff96c9';g.fillRect(7,30,114,25);g.fillStyle='#ffd775';g.fillRect(55,30,18,85);g.fillRect(7,53,114,13);
    g.strokeStyle='#ffe6a0';g.lineWidth=7;g.beginPath();g.ellipse(46,24,19,11,.55,0,6.28);g.ellipse(84,24,19,11,-.55,0,6.28);g.stroke();
  }
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return t;
}
Object.keys(palette).forEach(k=>textures[k]=makeTexture(k));
function roundedShape(w,h,r){const s=new THREE.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
const cubeGeo=new THREE.ExtrudeGeometry(roundedShape(tileW,tileH,.105),{depth:.47,steps:1,bevelEnabled:true,bevelThickness:.045,bevelSize:.045,bevelSegments:2,curveSegments:3});cubeGeo.translate(0,0,-.235);
const sideMaterials={};const faceMaterials={};
for(const kind in palette){faceMaterials[kind]=new THREE.MeshStandardMaterial({color:0xffffff,map:textures[kind],roughness:.75,metalness:kind==='ice'?.07:0});sideMaterials[kind]=mat(new THREE.Color(palette[kind]).multiplyScalar(.84));}
// GPU texture upload is optional and happens only after a successful KTX2 decode.
// It changes the maps of the existing materials, NEVER object identity, physics or animation.
const textureStatus=ui('textureStatus');
import('./ktx2-textures.js').then(({upgradeToKtx2})=>upgradeToKtx2({
  THREE,renderer,materials:faceMaterials,originalTextures:textures,
  status:value=>{if(textureStatus)textureStatus.textContent=value;}
})).catch(error=>console.warn('KTX2 texture adapter unavailable; keeping canvas textures.',error));

const columns=Array.from({length:cols},()=>[]);const hitMeshes=[];
// Quarks only owns decorative particles. The physics.js module remains the
// sole authority for rigid-body motion, and the frame clock stays shared.
let particles=null, particlesDisabled=false;
const particlesStatus=ui('particlesStatus');
const particleButton=ui('particlesToggle');
particleButton.setAttribute('aria-pressed','true');
particleButton.addEventListener('click',()=>{
  particlesDisabled=!particlesDisabled;
  particles?.setEnabled(!particlesDisabled);
  particleButton.setAttribute('aria-pressed',String(!particlesDisabled));
  particleButton.textContent=particlesDisabled?'✿ VFX OFF':'✿ VFX';
});
function particleStatus(state){if(particlesStatus)particlesStatus.textContent=state;}
particleStatus('PARTICLES · LOADING');
import('./particles.js').then(({createQuarksParticles})=>createQuarksParticles({THREE,scene}))
 .then(instance=>{
   particles=instance;
   particles.setEnabled(!particlesDisabled);
   particleStatus('PARTICLES · QUARKS');
 }).catch(err=>{
   particleStatus('PARTICLES · FALLBACK');
   console.warn('Three.quarks unavailable; the original physical debris and contact ring remain.',err);
 });
let physics=null,physicsLoading=true;
const cx=x=>(x-(cols-1)/2)*(unit+gap), cy=y=>y*(unit+gap)+.19;
const getKind=(x,y)=>{
 if(y===1&&(x===0||x===3||x===6))return 'gift';
 if(y===0)return 'brick';
 const span=(x*5+y*3+Math.floor(y/3))%9;
 if(y===3&&x%2===0)return 'ice';
 return ['pink','stone','stone','peach','pink','mint','brick','cream','pink'][span];
};
for(let x=0;x<cols;x++)for(let y=0;y<rows;y++) {
  if(y>=7 && (x===0||x===6))continue;
  if(y===8 && x%3===1)continue;
  const kind=getKind(x,y);
  const piece=new THREE.Mesh(cubeGeo,[faceMaterials[kind],sideMaterials[kind]]);
  piece.position.set(cx(x),cy(y),.05);piece.castShadow=true;piece.receiveShadow=true;
  piece.userData={x,y,kind,live:true};scene.add(piece);columns[x].push(piece);hitMeshes.push(piece);
}
// Start genuine Rapier dynamics without blocking the board if WebAssembly/CDN is unavailable.
// The original Tween-based drop remains an explicit fallback, never mislabeled as physics.
const physicsStatus=ui('physicsStatus');
function setPhysicsStatus(value){ if(physicsStatus)physicsStatus.textContent=value; }
setPhysicsStatus('PHYSICS · LOADING');
import('./physics.js').then(({createRapierPhysics})=>createRapierPhysics({
  THREE,scene,blocks:hitMeshes,onImpact:(block,ball)=>settleImpact(block,ball)
})).then(instance=>{physics=instance;physicsLoading=false;setPhysicsStatus('PHYSICS · RAPIER');})
 .catch(error=>{physicsLoading=false;setPhysicsStatus('PHYSICS · FALLBACK');console.warn('Rapier not available; using cosmetic tween-only fallback.',error);});

// An opaque soft-gradient aim pillar makes the target legible without replacing the art.
const aimGroup=new THREE.Group();scene.add(aimGroup);
const beam=new THREE.Mesh(new THREE.CylinderGeometry(.055,.12,9,12,1,true),new THREE.MeshBasicMaterial({color:0xfff0a5,transparent:true,opacity:.16,depthWrite:false,side:THREE.DoubleSide}));beam.position.y=4.1;aimGroup.add(beam);
const pointerRing=new THREE.Mesh(new THREE.TorusGeometry(.32,.072,9,40),new THREE.MeshBasicMaterial({color:0xfff3ab}));pointerRing.rotation.x=.11;aimGroup.add(pointerRing);
const pointerGem=new THREE.Mesh(new THREE.OctahedronGeometry(.2,0),new THREE.MeshStandardMaterial({color:0xffdd8d,emissive:0xffbd54,emissiveIntensity:.4,metalness:.15,roughness:.28}));aimGroup.add(pointerGem);
let selected=3,score=0,moves=15,level=7,busy=false,ended=false;
// Blockbench-compatible .bbmodel source -> real .glb mesh: same model, not a sprite.
// GLTFLoader comes from the pinned Three.js addons distribution.
const mascotBaseY=-.02;
const mascotRig=new THREE.Group();mascotRig.position.set(3.13,mascotBaseY,1.16);scene.add(mascotRig);
const mascotPod=new THREE.Mesh(new THREE.CylinderGeometry(.53,.59,.18,32),mat(0xf1ccf3));
mascotPod.position.set(3.13,-.2,1.16);mascotPod.castShadow=true;mascotPod.receiveShadow=true;scene.add(mascotPod);
const mascotHalo=new THREE.Mesh(new THREE.TorusGeometry(.51,.018,8,48),new THREE.MeshBasicMaterial({color:0xfff5be,transparent:true,opacity:.7}));
mascotHalo.rotation.x=Math.PI/2;mascotHalo.position.set(3.13,-.11,1.16);scene.add(mascotHalo);
let mascotReady=false,mascotMotion=null;
import('./model-loader.js').then(({loadMascot})=>loadMascot(scene)).then(model=>{
  model.scale.setScalar(.74);mascotRig.add(model);bunnyModel=model;mascotReady=true; if(activeAvatar)model.visible=false;
}).catch(error=>console.warn('Editable Blockbench model unavailable; gameplay remains active.',error));
function celebrateMascot(showParticles=true){
  if(!mascotReady && !activeAvatar)return;
  mascotMotion?.stop();
  mascotRig.position.y=mascotBaseY;mascotRig.rotation.z=0;
  const bounce={y:mascotBaseY,tilt:0};
  mascotMotion=new Tween(bounce,motion).to({y:mascotBaseY+.42,tilt:-.10},155).easing(Easing.Cubic.Out)
   .onUpdate(()=>{mascotRig.position.y=bounce.y;mascotRig.rotation.z=bounce.tilt;});
  const land=new Tween(bounce,motion).to({y:mascotBaseY,tilt:0},490).easing(Easing.Bounce.Out)
   .onUpdate(()=>{mascotRig.position.y=bounce.y;mascotRig.rotation.z=bounce.tilt;});
  mascotMotion.chain(land);mascotMotion.start();glowOnHit(.45);
  if(showParticles) particles?.burst({x:mascotRig.position.x,y:mascotRig.position.y+1.12,z:mascotRig.position.z+.25},'pet');
}
ui('pet').addEventListener('click',celebrateMascot);
// VRM avatars share the same real scene, one Tween clock, Quarks and bloom.
// Only an explicit user click switches identities; no idle or autonomous actions.
let activeAvatar = null, avatarLoading = false;
let bunnyModel = null;
const avatarStatus = ui('avatarStatus');
const avatarWave = ui('avatarWave');
const avatarBlink = ui('avatarBlink');
function showAvatarStatus(text) {avatarStatus.textContent = text;}
async function chooseAvatar(source, objectUrl = null) {
  if (avatarLoading) {if(objectUrl)URL.revokeObjectURL(objectUrl);return;}
  avatarLoading = true;
  ui('avatarDemo').disabled = ui('avatarUpload').disabled = true;
  showAvatarStatus('VRM · LOADING');
  try {
    const {prepareVrm} = await import('./vrm-avatar.js');
    const next = await prepareVrm({THREE, source, motion});
    // Preserve the previous model until the new VRM is fully parsed.
    if(activeAvatar)activeAvatar.dispose();
    if(bunnyModel)bunnyModel.visible=false;
    mascotRig.add(next.model);
    activeAvatar=next;
    avatarWave.disabled=!next.canWave;
    avatarBlink.disabled=!next.canBlink;
    mascotMotion?.stop();
    mascotRig.position.y=mascotBaseY;
    mascotRig.rotation.set(0,0,0);
    ui('pet').textContent='♡ JUMP';
    showAvatarStatus('VRM · READY');
  } catch(error){
    console.warn('VRM import failed; previous avatar unchanged',error);
    showAvatarStatus('VRM · LOAD FAILED');
  } finally {
    avatarLoading=false;
    ui('avatarDemo').disabled=ui('avatarUpload').disabled=false;
    if(objectUrl)URL.revokeObjectURL(objectUrl);
  }
}
ui('avatarDemo').addEventListener('click',()=>chooseAvatar('./models/pastel-scout.vrm'));
ui('avatarUpload').addEventListener('click',()=>ui('avatarFile').click());
ui('avatarFile').addEventListener('change',e=>{
  const f=e.target.files?.[0];e.target.value='';
  if(!f)return;
  if(!/\.vrm$/i.test(f.name)||f.size>40_000_000){showAvatarStatus('VRM · INVALID FILE');return;}
  const objectUrl=URL.createObjectURL(f);chooseAvatar(objectUrl,objectUrl);
});
ui('avatarWave').addEventListener('click',()=>{if(activeAvatar?.wave())glowOnHit(.25);});
ui('avatarBlink').addEventListener('click',()=>activeAvatar?.blink());


// One authoritative tween clock controls scene meshes, effects and HUD.
const motion=new Group();
function glowOnHit(strength=1){
  if(!fx || !fxDesired || fxBroken) return;
  fxFlash?.stop();
  const glow={value:fx.getBloom()};
  fxFlash=new Tween(glow,motion).to({value:.62+strength*.62},110).easing(Easing.Cubic.Out)
    .onUpdate(()=>fx.setBloom(glow.value));
  const recovery=new Tween(glow,motion).to({value:fx.defaultBloom},480).easing(Easing.Quadratic.Out)
    .onUpdate(()=>fx.setBloom(glow.value));
  fxFlash.chain(recovery);fxFlash.start();
}

let aimMotion=null;
const coinGeometry=new THREE.TorusGeometry(.19,.065,12,28);
const coinMaterial=new THREE.MeshStandardMaterial({color:0xffdc70,metalness:.5,roughness:.28,emissive:0xffbb49,emissiveIntensity:.16});
function animateValue(object, end, duration, ease=Easing.Cubic.Out){
  return new Tween(object,motion).to(end,duration).easing(ease);
}
function rewardCoins(x,y,z,amount=4){
  for(let i=0;i<amount;i++){
    const coin=new THREE.Mesh(coinGeometry,coinMaterial);
    coin.position.set(x+(rnd()-.5)*.32,y,z+.66);
    coin.castShadow=true;
    scene.add(coin);
    const start=coin.position.clone();
    const vx=(rnd()-.5)*2.9, vy=1.1+rnd()*2.1, vz=.25+rnd()*.7;
    const state={t:0};
    animateValue(state,{t:1},700+i*55,Easing.Quadratic.Out).onUpdate(()=>{
      const t=state.t;coin.position.set(start.x+vx*t,start.y+vy*t-2.35*t*t,start.z+vz*t);
      coin.rotation.y=t*Math.PI*5;coin.rotation.z=t*Math.PI*2;
      coin.scale.setScalar(Math.max(.015,Math.sin(Math.PI*Math.min(.99,t))*.95));
    }).onComplete(()=>scene.remove(coin)).start();
  }
}

const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
// Lazy, optional acceleration for static Blockbench-like block geometry only.
// Physics never delegates collisions to BVH; Rapier continues to own them.
let bvhPicking=null;
const pickingStatus=ui('pickingStatus');
if(pickingStatus)pickingStatus.textContent='PICKING · LOADING';
import('./bvh-picking.js').then(({enableBvhPicking})=>enableBvhPicking({
  THREE, geometry:cubeGeo, meshes:hitMeshes, raycaster:ray,
  onState:value=>{if(pickingStatus)pickingStatus.textContent=value;}
})).then(bvh=>{bvhPicking=bvh;}).catch(error=>{
  if(pickingStatus)pickingStatus.textContent='PICKING · STANDARD';
  console.warn('three-mesh-bvh unavailable: standard Three.js picking remains active.',error);
});
// Tapping is the only way to trigger actions; this ripple marks the exact
// BVH-reported contact position and is animated with the existing Tween Group.
const contactRingGeometry=new THREE.RingGeometry(.10,.14,24);
const contactRingMaterial=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.85,depthWrite:false,side:THREE.DoubleSide});
function highlightContact(point){
  const ring=new THREE.Mesh(contactRingGeometry,contactRingMaterial.clone());
  ring.position.copy(point);ring.position.z+=.06;
  scene.add(ring);
  const pulse={scale:.65,alpha:.88};
  new Tween(pulse,motion).to({scale:3,alpha:0},350).easing(Easing.Quadratic.Out)
    .onUpdate(()=>{ring.scale.setScalar(pulse.scale);ring.material.opacity=pulse.alpha;})
    .onComplete(()=>{scene.remove(ring);ring.material.dispose();}).start();
}

function updateUi(){ui('score').textContent=score.toLocaleString();ui('moves').textContent=moves;ui('level').textContent=String(level).padStart(2,'0');ui('progress').style.width=(clamp(score/target,0,1)*100).toFixed(2)+'%';}
function select(x){
  if(ended)return;
  selected=(x+cols)%cols;
  aimMotion?.stop();
  aimMotion=animateValue(aimGroup.position,{x:cx(selected)},180,Easing.Cubic.Out).start();
}
function gain(points){
  score+=points;updateUi();
  const label=ui('score'),bump={s:1};
  animateValue(bump,{s:1.34},120,Easing.Quadratic.Out)
    .onUpdate(()=>label.style.transform=`scale(${bump.s})`)
    .chain(animateValue(bump,{s:1},280,Easing.Elastic.Out)
      .onUpdate(()=>label.style.transform=`scale(${bump.s})`))
    .start();
}
function topBlock(x){return columns[x].findLast(t=>t.userData.live)||null;}

// Real, user-triggered boolean subtraction. The existing collision world
// uses conservative tile bodies; CSG modifies the visual mesh only.
let csgCarver = null;
const carveButton = ui('carve');
const csgStatus = ui('csgStatus');
const setCsgStatus = message => { if (csgStatus) csgStatus.textContent = message; };
setCsgStatus('CSG · LOADING');
import('./csg-workshop.js').then(({createCsgCarver}) => createCsgCarver({
  THREE, onStatus: setCsgStatus
})).then(carver => {
  csgCarver = carver;
  carveButton.disabled = false;
}).catch(error => {
  setCsgStatus('CSG · UNAVAILABLE');
  console.warn('three-bvh-csg unavailable; the original game remains playable.', error);
});
function carveSelected() {
  if (busy || ended || !csgCarver) return;
  const block = topBlock(selected);
  if (!block || block.userData.csgCut) return;
  if (csgCarver.carve(block)) {
    const p = block.position;
    particles?.burst({x:p.x, y:p.y, z:p.z + .48}, 'ice');
    glowOnHit(.7);
    highlightContact(new THREE.Vector3(p.x, p.y, p.z + .49));
    // Exactly the same block object (and Rapier collider), no new identity.
  }
}
carveButton.addEventListener('click', carveSelected);

function popAt(x,y,z,kind){
 particles?.burst({x,y,z:z+.55},kind);
 const tint=new THREE.Color(palette[kind]||0xffe7b1);
 if(physics){
   physics.emitDebris({x,y,z},palette[kind]||0xffe7b1,rnd);
 }else{
 for(let i=0;i<16;i++){
   const size=.065+rnd()*.12;
   const geo=i%3===0?new THREE.OctahedronGeometry(size):new THREE.BoxGeometry(size,size,size);
   const material=mat(tint.clone().multiplyScalar(.83+rnd()*.35),{transparent:true,opacity:1});
   const shard=new THREE.Mesh(geo,material);
   shard.position.set(x+(rnd()-.5)*.22,y+(rnd()-.5)*.25,z+(rnd()-.5)*.12);
   scene.add(shard);
   const origin=shard.position.clone(),dx=(rnd()-.5)*3.4,dy=1.2+rnd()*3.1,dz=(rnd()-.5)*1.7;
   const state={t:0};
   animateValue(state,{t:1},510+rnd()*320,Easing.Quadratic.Out).onUpdate(()=>{
     const t=state.t;
     shard.position.set(origin.x+dx*t,origin.y+dy*t-2.6*t*t,origin.z+dz*t);
     shard.rotation.x=t*5;shard.rotation.y=t*5;
     shard.material.opacity=Math.max(0,1-t*t);
     shard.scale.setScalar(Math.max(.001,1-.6*t));
   }).onComplete(()=>{scene.remove(shard);shard.geometry.dispose();shard.material.dispose();}).start();
 }
 }
 const ring=new THREE.Mesh(new THREE.RingGeometry(.09,.16,38),new THREE.MeshBasicMaterial({color:0xfff7c5,side:THREE.DoubleSide,transparent:true,opacity:.8,depthWrite:false}));
 ring.position.set(x,y,z+.4);scene.add(ring);
 const pulse={s:1,alpha:.8};
 animateValue(pulse,{s:9,alpha:0},410,Easing.Cubic.Out).onUpdate(()=>{
   ring.scale.setScalar(pulse.s);ring.material.opacity=pulse.alpha;
 }).onComplete(()=>{scene.remove(ring);ring.geometry.dispose();ring.material.dispose();}).start();
 if(kind==='gift'){rewardCoins(x,y,z,6);particles?.burst({x,y:y+.18,z:z+.55},'reward');}
}
function breakBlock(block){
 if(!block||!block.userData.live)return;
 block.userData.live=false;physics?.removeBlock(block);const {x,kind}=block.userData;
 popAt(block.position.x,block.position.y,block.position.z,kind);
 glowOnHit(kind==='gift'?1.4:1);
 if(!activeAvatar)celebrateMascot(false);
 csgCarver?.releaseTile(block);
 scene.remove(block);
 gain(kind==='gift'?75:kind==='ice'?30:20);
 columns[x]=columns[x].filter(b=>b.userData.live);
 columns[x].forEach((b,idx)=>{
   b.userData.y=idx;
   animateValue(b.position,{y:cy(idx)},440+idx*21,Easing.Bounce.Out)
     .delay(idx*28).start();
 });
}
function destroyBall(ball){
  scene.remove(ball);
  ball.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});
}
function settleImpact(block,ball){
  destroyBall(ball);
  if(block?.userData?.live)breakBlock(block);
  animateValue({t:0},{t:1},760,Easing.Linear.None).onComplete(()=>{
    busy=false;
    if(score>=target||moves<=0)finish();
  }).start();
}
function drop(picked=null){
 if(busy||ended||moves<=0)return;
 // A falling body hits the highest solid tile; never tunnel through other cubes.
 const targetBlock=topBlock(selected);
 if(!targetBlock){select(selected+1);return;}
 busy=true;moves--;updateUi();
 const ball=new THREE.Group();
 const shell=new THREE.Mesh(new THREE.IcosahedronGeometry(.31,1),new THREE.MeshStandardMaterial({color:0xffdd84,emissive:0xffbe53,emissiveIntensity:.35,metalness:.24,roughness:.27}));ball.add(shell);
 const lobe=new THREE.Mesh(new THREE.IcosahedronGeometry(.145,1),mat(0xfff6d0));lobe.position.set(-.15,.21,.24);ball.add(lobe);
 scene.add(ball);
 if(physics){
   physics.launch(ball,{x:targetBlock.position.x,y:Math.max(9.8,targetBlock.position.y+2.3),z:.43},targetBlock,()=>{destroyBall(ball);busy=false;if(moves<=0)finish();});
 }else{
   // The fallback uses only Tween; UI clearly indicates missing physics.
   ball.position.set(targetBlock.position.x,9.8,1.3);
   animateValue(ball.position,{y:targetBlock.position.y+.52},480,Easing.Quadratic.In)
     .onUpdate(()=>{ball.rotation.z+=.095;ball.scale.setScalar(1+.08*Math.sin(ball.position.y*2));})
     .onComplete(()=>settleImpact(targetBlock,ball)).start();
 }
}
function finish(){ended=true;ui('end').classList.remove('hidden');ui('endHeading').textContent=score>=target?'LEVEL COMPLETE!':'SWEET ATTEMPT!';ui('endText').textContent=score>=target?`You collected ${score} shiny points!`:`You earned ${score} points. Try for ${target}!`;}
function onPointer(ev){if(ended)return;const rect=renderer.domElement.getBoundingClientRect();pointer.x=((ev.clientX-rect.left)/rect.width)*2-1;pointer.y=-((ev.clientY-rect.top)/rect.height)*2+1;ray.setFromCamera(pointer,camera);const petHits=ray.intersectObject(mascotRig,true);if(petHits.length){celebrateMascot();return;}
const intersects=ray.intersectObjects(hitMeshes.filter(b=>b.userData.live),false);if(intersects.length){const piece=intersects[0].object;highlightContact(intersects[0].point);select(piece.userData.x);drop(piece);}}
renderer.domElement.addEventListener('pointerdown',onPointer,{passive:true});
ui('left').addEventListener('click',()=>select(selected-1));ui('right').addEventListener('click',()=>select(selected+1));ui('drop').addEventListener('click',()=>drop());
ui('again').addEventListener('click',()=>window.location.reload());
window.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a'){e.preventDefault();select(selected-1);}if(e.key==='ArrowRight'||e.key.toLowerCase()==='d'){e.preventDefault();select(selected+1);}if(e.key.toLowerCase()==='c'){e.preventDefault();carveSelected();}if(e.code==='Space'||e.key==='Enter'){e.preventDefault();drop();}});
function resize(){const w=Math.max(1,innerWidth),h=Math.max(1,innerHeight),aspect=w/h;
 let viewH=Math.max(11.8,(boardW+1.1)/aspect);
 if(aspect>1.4)viewH=Math.max(11.2,(boardW+1.1)/aspect);
 camera.left=-viewH*aspect/2;camera.right=viewH*aspect/2;camera.top=viewH/2;camera.bottom=-viewH/2;camera.updateProjectionMatrix();
 renderer.setSize(w,h,false);
 if(fx)fx.resize(w,h);
}
window.addEventListener('resize',resize);resize();aimGroup.position.x=cx(selected);updateUi();
let last=performance.now(),time=0;
function render(now){const dt=Math.min((now-last)/1000,.05);last=now;time+=dt;
 const aimTarget=topBlock(selected);const y=aimTarget?aimTarget.position.y+.88:.3;
 aimGroup.position.y=y;pointerRing.position.y=.12+Math.sin(time*3.1)*.08;pointerGem.position.y=.62+Math.sin(time*3.1)*.09;pointerGem.rotation.y=time*1.2;beam.scale.y=.9;
 for(const deco of decorations){deco.mesh.rotation.y+=dt*.5;deco.mesh.material.opacity=.22+Math.sin(time*1.3+deco.t)*.13;}
 // Independent ambient breathing, without triggering user action animations.
 if(bunnyModel && !activeAvatar) bunnyModel.scale.y=.74*(1+.018*Math.sin(time*2.4));
 activeAvatar?.update(dt);
 motion.update(now);
 physics?.update(dt);
 if(particles) {
   try { particles.update(dt); }
   catch(error) { particles.dispose(); particles=null; particleStatus('PARTICLES · FALLBACK'); console.warn('Particle rendering disabled.',error); }
 }
 if(fx && fxDesired && !fxBroken){
   try{fx.render(dt);}catch(error){fxBroken=true;updateFxButton();console.warn('FX disabled after render error',error);renderer.render(scene,camera);}
 }else renderer.render(scene,camera);
}
renderer.setAnimationLoop(render);
} catch(error){console.error(error);ui('errorMessage').textContent=String(error).slice(0,240);ui('error').classList.remove('hidden');}
