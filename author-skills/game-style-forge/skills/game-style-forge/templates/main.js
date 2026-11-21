import * as THREE from 'three';
import cfg from './config.json';
import shaderNoise from './noise.js';
import shaderNoise3D from './noise3D.js';
import './style.css';
const postFXLoader=/*POSTFX_LOADER*/ null;
const rapierLoader=/*RAPIER_LOADER*/ null;
const depthLoader=/*DEPTH_LOADER*/ null;
const assetLoader=/*ASSET_LOADER*/ null;
const spatialLoader=/*SPATIAL_LOADER*/ null;
const csgLoader=/*CSG_LOADER*/ null;
const navLoader=/*NAV_LOADER*/ null;
const root=document.querySelector('#viewport'),status=document.querySelector('#status');
const palette=cfg.palette.map(x=>new THREE.Color(x));
// OpenCV measures frame appearance, not gameplay physics or player identity.
// Its data may tune only visual atmosphere when an analyzed reference exists.
const cvStyle=cfg.vision||{};
const measuredVideo=Boolean(cvStyle.opencv_enabled&&cfg.source_video);
const frameMotion=cvStyle.motion?.status==='measured'?cvStyle.motion:null;
const cvEdge=THREE.MathUtils.clamp(Number(cvStyle.edge_fraction)||.10,0,.35);
const cvBrightness=THREE.MathUtils.clamp(Number(cvStyle.mean_brightness)||.4,0,1);
const cvCadence=measuredVideo&&frameMotion?THREE.MathUtils.clamp(Number(frameMotion.temporal_activity_0_to_1)||0,0,1):.15;
const depthInfluence=cfg.depth?.enabled?THREE.MathUtils.clamp(Number(cfg.depth.near_fraction)||0,0,1):.25;
const visualFog=measuredVideo?THREE.MathUtils.clamp(.017+(.15-cvEdge)*.07+(depthInfluence-.25)*.004,.012,.042):.023;
const visualDetail=measuredVideo?THREE.MathUtils.clamp(.21+cvEdge*1.1,.18,.5):.28;
const dark=palette[0]||new THREE.Color('#141e32'),mist=palette[1]||new THREE.Color('#8794a7'),ember=palette[2]||new THREE.Color('#e5b388');
const scene=new THREE.Scene();scene.background=dark;scene.fog=new THREE.FogExp2(dark.clone().lerp(mist,.17),visualFog);
const camera=new THREE.PerspectiveCamera(57,innerWidth/innerHeight,.1,220);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.8));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=measuredVideo?THREE.MathUtils.clamp(1.16+(0.4-cvBrightness)*.18,1.02,1.32):1.2;root.append(renderer.domElement);
scene.add(new THREE.HemisphereLight(mist,0x10141c,2.4));
const sun=new THREE.DirectionalLight(ember,2.3);sun.position.set(-12,22,-12);scene.add(sun);
const noiseFallback=`float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float snoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x),mix(h21(i+vec2(0.,1.)),h21(i+1.),f.x),f.y)*2.-1.;}`;
const cloudLibrary=shaderNoise3D ? shaderNoise3D : '';
const cloudFunction=shaderNoise3D
 ? 'float cloudField(vec3 v,float t){float a=snoise(v*8.0+vec3(t*.018,t*.011,0.0));float b=snoise(v*16.0+vec3(-t*.031,t*.015,t*.012));return .5+.36*a+.14*b;}'
 : 'float cloudField(vec3 v,float t){return 0.5;}';
let elapsed=0;
const sky=new THREE.Mesh(new THREE.SphereGeometry(115,32,20),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,
 uniforms:{cold:{value:dark},fog:{value:mist},glow:{value:ember},time:{value:0}},
 vertexShader:`varying vec3 d;void main(){d=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`varying vec3 d;uniform vec3 cold,fog,glow;uniform float time;${cloudLibrary}${cloudFunction}void main(){vec3 v=normalize(d);float q=smoothstep(-.3,.7,v.y);vec3 c=mix(fog*.75,cold*.56,q);float sun=pow(max(0.,dot(v,normalize(vec3(-.55,.35,-.7)))),7.);c+=glow*sun*.26;float cloud=cloudField(v,time);float cloudBand=smoothstep(-.07,.20,v.y)*(1.-smoothstep(.48,.84,v.y));float wisps=smoothstep(.49,.80,cloud)*cloudBand;c+=mix(fog*.22,glow*.10,q)*wisps; c+=.012*sin(v.y*24.+time*.14);gl_FragColor=vec4(c,1.);}`
}));scene.add(sky);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(240,240),new THREE.ShaderMaterial({side:THREE.DoubleSide,uniforms:{fog:{value:mist},base:{value:dark.clone().lerp(mist,.25)},glow:{value:ember},time:{value:0},detail:{value:visualDetail}},
 vertexShader:`varying vec2 uv2;void main(){uv2=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`varying vec2 uv2;uniform vec3 fog,base,glow;uniform float time,detail;${shaderNoise||noiseFallback}void main(){vec2 p=uv2*49.+vec2(time*.023,-time*.009);float n=snoise(p*detail)+.38*snoise(p*detail*5.0);vec3 c=mix(base,fog*.52,clamp(n*.3+.4,0.,1.));c+=glow*pow(max(0.,n+.28),8.)*.05;gl_FragColor=vec4(c,1.);}`
}));ground.rotation.x=-Math.PI/2;ground.position.y=-.06;scene.add(ground);
const rand=(()=>{let s=97731;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;}})();
const rockMat=new THREE.MeshStandardMaterial({color:mist.clone().lerp(dark,.51),roughness:1});
const leafMat=new THREE.MeshStandardMaterial({color:mist.clone().lerp(ember,.33),roughness:1,side:THREE.DoubleSide});
const fireMat=new THREE.MeshStandardMaterial({color:ember,emissive:ember,emissiveIntensity:2.4});
const obstacles=[];
const staticMeshes=[];
for(let i=0;i<55;i++){const theta=rand()*Math.PI*2,d=8+Math.sqrt(rand())*72,x=Math.cos(theta)*d,z=Math.sin(theta)*d,height=.6+rand()*(i%9===0?13:3.5);
 const topRadius=.22+rand()*.7, bottomRadius=.48+rand()*.8;
 const pillar=new THREE.Mesh(new THREE.CylinderGeometry(topRadius,bottomRadius,height,5),rockMat);pillar.position.set(x,height/2,z);scene.add(pillar);staticMeshes.push(pillar);
 obstacles.push([x,z,Math.max(topRadius,bottomRadius),height]);
 if(i%9===0){const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(.5),fireMat);crystal.position.set(x,height+.15,z);scene.add(crystal);const bulb=new THREE.PointLight(ember,.8,6);bulb.position.copy(crystal.position);scene.add(bulb);}}
const grass=new THREE.InstancedMesh(new THREE.PlaneGeometry(.24,.68),leafMat,900),obj=new THREE.Object3D();
for(let i=0;i<900;i++){const a=rand()*Math.PI*2,d=3+Math.sqrt(rand())*78;obj.position.set(Math.cos(a)*d,.25,Math.sin(a)*d);obj.rotation.set(0,a,(rand()-.5)*.34);const scale=.3+rand()*1.6;obj.scale.set(scale,scale,scale);obj.updateMatrix();grass.setMatrixAt(i,obj.matrix);}grass.instanceMatrix.needsUpdate=true;grass.frustumCulled=false;scene.add(grass);
const motes=new Float32Array(600);for(let i=0;i<200;i++){motes[i*3]=(rand()-.5)*90;motes[i*3+1]=rand()*9+.3;motes[i*3+2]=(rand()-.5)*90;}
const dustGeo=new THREE.BufferGeometry();dustGeo.setAttribute('position',new THREE.BufferAttribute(motes,3));scene.add(new THREE.Points(dustGeo,new THREE.PointsMaterial({color:ember,size:.066,transparent:true,opacity:.6,depthWrite:false})));
// Identity lock: one hero group throughout idle, move, jump and attack.
const hero=new THREE.Group();scene.add(hero);const body=new THREE.Group();hero.add(body);
const cloak=new THREE.Mesh(new THREE.ConeGeometry(.48,1.6,7),new THREE.MeshStandardMaterial({color:0x22252d,roughness:1}));cloak.position.y=.92;body.add(cloak);
const head=new THREE.Mesh(new THREE.SphereGeometry(.29,14,10),new THREE.MeshStandardMaterial({color:ember.clone().lerp(dark,.3)}));head.position.y=1.78;body.add(head);
const halo=new THREE.Mesh(new THREE.TorusGeometry(.54,.028,5,38),fireMat);halo.rotation.x=Math.PI/2;halo.position.y=.14;hero.add(halo);
// Approved hero artwork can be placed in src/custom/hero.png; never swap it based on input.
const heroImage=new Image();heroImage.onload=()=>{const tex=new THREE.Texture(heroImage);tex.colorSpace=THREE.SRGBColorSpace;tex.needsUpdate=true;body.visible=false;const art=new THREE.Mesh(new THREE.PlaneGeometry(1.9,2.4),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,side:THREE.DoubleSide}));art.position.y=1.25;hero.add(art);hero.userData.art=art;};heroImage.src=new URL('./custom/hero.png',import.meta.url).href;
const slash=new THREE.Mesh(new THREE.TorusGeometry(.85,.024,4,40,Math.PI*1.2),new THREE.MeshBasicMaterial({color:ember,transparent:true,opacity:0}));slash.rotation.x=-.5;slash.position.set(0,1.3,.2);hero.add(slash);
let postFX=null,composer=null,postFXEnabled=true;
if(postFXLoader){
  try {
    const {createPostFX}=await postFXLoader();
    postFX=createPostFX(renderer,scene,camera,shaderNoise||noiseFallback,cvStyle,measuredVideo);
    composer=postFX.composer;
  } catch(e) { status.textContent='Эффекты отключены: '+e.message; }
}
window.addEventListener('keydown',e=>{
  if(e.code==='KeyP' && !e.repeat && composer){postFXEnabled=!postFXEnabled;status.textContent=postFXEnabled?'':'Эффекты выключены (P)';}
});
let depthScene=null;
if(depthLoader && cfg.depth?.enabled){
  try { const {createDepthLayers}=await depthLoader();
    depthScene=await createDepthLayers(scene,camera,cfg.depth);
  } catch(e) { status.textContent='Depth backdrop unavailable: '+e.message; }
}
let physics=null;
if(rapierLoader){
  try {
    const {createPhysics}=await rapierLoader();
    physics=await createPhysics(scene, obstacles, rockMat, rand);
  } catch(e) { status.textContent='Physics unavailable; fallback collisions active: '+e.message;physics=null; }
}
// Build a visual-only BVH on static meshes. Does not modify the Rapier world.
let spatial=null;
if (spatialLoader) {
  try {
    const {createSpatialIndex}=await spatialLoader();
    spatial=createSpatialIndex();
    for (const mesh of staticMeshes) spatial.registerStatic(mesh);
  } catch(e) { console.warn('Spatial index disabled:',e); }
}
// A subtle world-space scan ring visualizes precise geometry queries on demand.
const scanRing=new THREE.Mesh(new THREE.TorusGeometry(.29,.035,6,48),
 new THREE.MeshBasicMaterial({color:ember,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));
scanRing.visible=false;scanRing.renderOrder=3;scene.add(scanRing);
let scanTime=0;
function scanGeometry(){
  if(!spatial)return;
  const start=new THREE.Vector3(hero.position.x,hero.position.y+1.25,hero.position.z);
  const facing=new THREE.Vector3(Math.sin(hero.rotation.y),0,Math.cos(hero.rotation.y));
  const hit=spatial.cast(start,facing,10);
  if(!hit)return;
  scanRing.visible=true;
  scanRing.position.copy(hit.point).addScaledVector(
      hit.face?.normal?.clone().transformDirection(hit.object.matrixWorld) || facing,.06);
  if(hit.face?.normal){
    const n=hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
    scanRing.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),n);
  } else scanRing.lookAt(start);
  scanRing.scale.setScalar(1);
  scanTime=.65;
}
const scanButton=document.querySelector('button[data-key="KeyE"]');
if(scanButton){scanButton.hidden=!spatial;scanButton.addEventListener('pointerdown',e=>{e.preventDefault();scanGeometry();});}
window.addEventListener('keydown',e=>{if(e.code==='KeyE'&&!e.repeat)scanGeometry();});
// Imported GLB props are an independent 3D visual layer. They cannot change
// the sprite/rig identity of the player or infer colliders from render geometry.
let importedAssets=null;
if (assetLoader && cfg.models?.length) {
  try {
    const {loadSceneAssets}=await assetLoader();
    importedAssets=await loadSceneAssets(scene,cfg.models,physics,spatial);
  } catch (e) { status.textContent='GLB assets unavailable: '+e.message; }
}
// CSG runs once at initialization: true openings cut into the ruin geometry.
// Reuse existing BVH visual index and explicitly authored Rapier solid proxies.
let csgRuin=null;
if(csgLoader){
  try {
    const {createRuinGateway}=await csgLoader();
    csgRuin=createRuinGateway({scene,spatial,physics,stoneColor:'#7e8293',glowColor:ember.getStyle()});
  } catch(e){console.warn('CSG gateway unavailable, world still playable:',e);}
}
// Recast/Detour chooses NPC paths through AUTHORED CSG doorways. Rapier remains
// the sole collision engine, and no player controls are moved by navigation.
let livingNavigation=null;
if(navLoader){
  try {
    const {createLivingNavigation}=await navLoader();
    livingNavigation=await createLivingNavigation({scene,obstacles,staticMeshes,
      gateway:csgRuin,physics,glow:ember,authoredModels:cfg.models||[],importedAssets});
    const notice=document.querySelector('#nav-status');
    if(notice) notice.textContent=`${livingNavigation.npcCount} странника · ${livingNavigation.mode==='recast-0.44.0'?'Recast':'геометрический резерв'}`;
  }catch(e){console.warn('NPC navigation unavailable:',e);}
}
// Scene-specific color presets are extracted from real video shots.  They alter
// colors and lighting only; the current hero/collision transforms remain intact.
const shotPresets = Array.isArray(cfg.scene_presets) ? cfg.scene_presets : [];
let shotIndex = Math.max(0,shotPresets.findIndex(p=>p.id===cfg.scene_selected_id));
function applyShotPalette(index){
  if(!shotPresets.length)return;
  shotIndex=(index+shotPresets.length)%shotPresets.length;
  const entry=shotPresets[shotIndex];
  if(!Array.isArray(entry.palette)||entry.palette.length<3)return;
  const a=new THREE.Color(entry.palette[0]), b=new THREE.Color(entry.palette[1]), c=new THREE.Color(entry.palette[2]);
  scene.background=a;
  scene.fog.color.copy(a).lerp(b,.17);
  sky.material.uniforms.cold.value.copy(a);
  sky.material.uniforms.fog.value.copy(b);
  sky.material.uniforms.glow.value.copy(c);
  ground.material.uniforms.base.value.copy(a).lerp(b,.25);
  ground.material.uniforms.fog.value.copy(b);
  ground.material.uniforms.glow.value.copy(c);
  sun.color.copy(c);rockMat.color.copy(b).lerp(a,.51);
  leafMat.color.copy(b).lerp(c,.33);
  fireMat.color.copy(c);fireMat.emissive.copy(c);
  renderer.toneMappingExposure=THREE.MathUtils.clamp(1.16+(.4-(Number(entry.brightness)||.4))*.18,1.02,1.32);
  status.textContent=`Видео-сцена ${shotIndex+1}/${shotPresets.length} · N — следующая`;
}
if(shotPresets.length){applyShotPalette(shotIndex);window.addEventListener('keydown',e=>{
  if(e.code==='KeyN'&&!e.repeat)applyShotPalette(shotIndex+1);
});}
const held=new Set();function getKey(e){return {'w':'KeyW','a':'KeyA','s':'KeyS','d':'KeyD','j':'KeyJ',' ':'Space'}[e.key?.toLowerCase()]||e.code||e.key;}
let verticalSpeed=0,grounded=true,attackTime=0;
function jump(){if(physics){physics.jump();return;}if(grounded){verticalSpeed=7;grounded=false;}}
function attack(){attackTime=.24;}
window.addEventListener('keydown',e=>{const k=getKey(e);if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(k))e.preventDefault();held.add(k);if(!e.repeat&&k==='Space')jump();if(!e.repeat&&k==='KeyJ')attack();});
window.addEventListener('keyup',e=>held.delete(getKey(e)));window.addEventListener('blur',()=>held.clear());
for(const b of document.querySelectorAll('button[data-key]')){const k=b.dataset.key;const release=e=>{e.preventDefault();held.delete(k);b.classList.remove('active');};b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);held.add(k);b.classList.add('active');if(k==='Space')jump();if(k==='KeyJ')attack();});for(const name of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(name,release);}
const clock=new THREE.Clock(),direction=new THREE.Vector3(),desiredCamera=new THREE.Vector3();
function frame(){requestAnimationFrame(frame);const dt=Math.min(clock.getDelta(),.04);elapsed+=dt;sky.material.uniforms.time.value=elapsed;ground.material.uniforms.time.value=elapsed;
const dx=+(held.has('KeyD')||held.has('ArrowRight'))-+(held.has('KeyA')||held.has('ArrowLeft'));
const dz=+(held.has('KeyS')||held.has('ArrowDown'))-+(held.has('KeyW')||held.has('ArrowUp'));
direction.set(dx,0,dz);if(direction.lengthSq())direction.normalize();
if(livingNavigation)livingNavigation.update(dt,elapsed);
if(physics){
  // Rapier controls the same hero transform; no duplicate manual collision model.
  const p=physics.step(dt,direction,5.3);
  hero.position.set(p.x,p.y,p.z);
} else {
  // Explicit fallback keeps the game playable if the optional WASM cannot load.
  const nx=hero.position.x+direction.x*dt*5.3,nz=hero.position.z+direction.z*dt*5.3;
  if(!obstacles.some(([x,z,r])=>Math.hypot(nx-x,nz-z)<r+.32)){
    hero.position.x=THREE.MathUtils.clamp(nx,-98,98);hero.position.z=THREE.MathUtils.clamp(nz,-98,98);
  }
  verticalSpeed-=18*dt;hero.position.y=Math.max(0,hero.position.y+verticalSpeed*dt);
  if(hero.position.y===0){grounded=true;verticalSpeed=0;}
}
if(direction.lengthSq())hero.rotation.y=THREE.MathUtils.lerp(hero.rotation.y,Math.atan2(direction.x,direction.z),.13);
body.rotation.z=direction.lengthSq()?Math.sin(elapsed*12)*.06:0;
body.scale.setScalar(1+.009*Math.sin(elapsed*2));
scanTime=Math.max(0,scanTime-dt);
if(scanRing.visible){scanRing.scale.setScalar(1+(1-scanTime/.65)*1.8);scanRing.material.opacity=(scanTime/.65)*.85;
 if(scanTime<=0)scanRing.visible=false;}
attackTime=Math.max(0,attackTime-dt);slash.material.opacity=attackTime/.24*.9;if(attackTime>0)slash.rotation.z+=dt*9;
for(let i=0;i<200;i++){motes[i*3+1]+=(.05+cvCadence*.11)*dt;if(motes[i*3+1]>9)motes[i*3+1]=.2;}dustGeo.attributes.position.needsUpdate=true;

desiredCamera.set(hero.position.x+10,hero.position.y+9,hero.position.z+15);
if(spatial){
  const eye=new THREE.Vector3(hero.position.x,hero.position.y+1.55,hero.position.z);
  const blocker=spatial.castBetween(eye,desiredCamera);
  if(blocker){const vec=desiredCamera.clone().sub(eye).normalize();
    desiredCamera.copy(eye).addScaledVector(vec,Math.max(1.6,blocker.distance-.45));}
}
camera.position.lerp(desiredCamera,1-Math.exp(-4*dt));camera.lookAt(hero.position.x,hero.position.y+1.5,hero.position.z);sky.position.copy(camera.position);
if(hero.userData.art)hero.userData.art.lookAt(camera.position.x,hero.position.y+1.25,camera.position.z);
if(csgRuin)csgRuin.update(elapsed);
if(depthScene)depthScene.update(hero.position,elapsed);
if(composer && postFXEnabled){postFX.update(elapsed);composer.render(dt);}else renderer.render(scene,camera);
}
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);postFX?.setSize(innerWidth,innerHeight);});
camera.position.set(10,8,16);frame();
