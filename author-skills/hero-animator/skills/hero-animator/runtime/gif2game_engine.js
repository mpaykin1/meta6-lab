import * as THREE from 'three';
// HERO ANIMATOR — STRICT INPUT-DRIVEN ACTOR RUNTIME.
// No character GIF autoplay. Individual lossless atlas frames are selected by the finite-state controller.
const $=s=>document.querySelector(s);
const canvas=$('#game');
if(!canvas) throw Error('Hero Animator needs <canvas id="game">');
const manifest=await (await fetch('./assets/game.json',{cache:'no-store'})).json();
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();scene.background=new THREE.Color('#16110e');
const camera=new THREE.OrthographicCamera(-8,8,4.5,-4.5,.1,100);
const clock=new THREE.Clock();const game={win:false,time:0,cameraX:0,quality:Math.min(devicePixelRatio||1,1.5)};
const keys=new Set(); const justPressed=new Set();
const playable=new Set(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyA','KeyD','KeyW','KeyS','Space','KeyJ','KeyE','ShiftLeft','ShiftRight','KeyR']);
function releaseAll(){keys.clear();justPressed.clear();for(const b of document.querySelectorAll('button.pressed'))b.classList.remove('pressed');}
addEventListener('keydown',e=>{
 if(!playable.has(e.code))return;
 if(e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))return;
 e.preventDefault();
 if(!keys.has(e.code))justPressed.add(e.code);
 keys.add(e.code);
});
addEventListener('keyup',e=>{if(playable.has(e.code)){e.preventDefault();keys.delete(e.code);}});
addEventListener('blur',releaseAll);
document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseAll();});
function down(...codes){return codes.some(c=>keys.has(c));}
function trigger(...codes){return codes.some(c=>justPressed.has(c));}
function wireButton(id,code){const b=$('#'+id);if(!b)return;
 const release=e=>{if(e)e.preventDefault();keys.delete(code);b.classList.remove('pressed');};
 b.addEventListener('pointerdown',e=>{e.preventDefault();if(!keys.has(code))justPressed.add(code);keys.add(code);b.classList.add('pressed');b.setPointerCapture(e.pointerId);});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,release);
}
for(const [id,code] of [['left','ArrowLeft'],['right','ArrowRight'],['jump','ArrowUp'],['crouch','ArrowDown'],['attack','KeyJ'],['interact','KeyE'],['run','ShiftLeft']])wireButton(id,code);
$('#full')?.addEventListener('click',()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.());
$('#restart')?.addEventListener('click',()=>location.reload());

async function texture(file){const t=await new THREE.TextureLoader().loadAsync('./assets/'+file);t.colorSpace=THREE.SRGBColorSpace;t.minFilter=t.magFilter=THREE.LinearFilter;t.generateMipmaps=false;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;return t;}
const clips={};for(const item of manifest.clips){clips[item.id]={...item,texture:await texture(item.sheet)};}
const roles=manifest.roles||{};
const characterLock=manifest.characterLock;
if(!characterLock?.enabled || !characterLock.actions?.idle){
  throw Error('CHARACTER_IDENTITY_LOCK: no approved main hero; refusing to render player');
}
const lockedAction=(a)=>characterLock.actions[a]||null;

const clipOf=(role)=>clips[roles[role]]||null;
function createPlane(clip,height,order=0){
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(height*clip.width/clip.height,height),new THREE.MeshBasicMaterial({map:clip.texture.clone(),transparent:clip.alpha,depthWrite:false,alphaTest:clip.alpha?.006:0,side:THREE.DoubleSide,toneMapped:false}));
 mesh.material.map.needsUpdate=true;mesh.renderOrder=order;mesh.frustumCulled=false;scene.add(mesh);
 const cached=new Map([[clip.id,mesh.material.map]]);
 const st={mesh,clip,frames:[...Array(clip.frameCount).keys()],loop:true,elapsed:0,lastIndex:-1,frame:0};
 function bind(next){if(st.clip.id!==next.id){let t=cached.get(next.id);if(!t){t=next.texture.clone();t.needsUpdate=true;cached.set(next.id,t);}st.mesh.material.map=t;st.mesh.material.transparent=next.alpha;st.mesh.material.alphaTest=next.alpha?.006:0;st.mesh.material.needsUpdate=true;st.mesh.scale.x=Math.sign(st.mesh.scale.x||1)*(next.width/next.height)/(clip.width/clip.height);st.clip=next;st.lastIndex=-1;}}
 st.set=(next,frames,loop)=>{if(!next)return;
  const frameList=Array.isArray(frames)&&frames.length?frames.filter(i=>Number.isInteger(i)&&i>=0&&i<next.frameCount):[0];
  const list=frameList.length?frameList:[0];
  const same=st.clip.id===next.id&&st.loop===loop&&st.frames.length===list.length&&st.frames.every((v,i)=>v===list[i]);
  if(same)return;bind(next);st.frames=list;st.loop=loop;st.elapsed=0;st.lastIndex=-1;st.draw(0);
 };
 st.draw=(i)=>{const f=st.frames[Math.max(0,Math.min(i,st.frames.length-1))];if(f===st.lastIndex)return;st.lastIndex=f;st.frame=f;
  const x=f%st.clip.cols,y=Math.floor(f/st.clip.cols),t=st.mesh.material.map,c=st.clip;
  t.repeat.set((c.width-1)/c.sheetWidth,(c.height-1)/c.sheetHeight);
  t.offset.set((x*c.width+.5)/c.sheetWidth,1-((y+1)*c.height-.5)/c.sheetHeight);t.updateMatrix();
 };
 st.duration=()=>st.frames.reduce((n,f)=>n+(st.clip.timings[f]||100),0)/1000;
 st.update=(dt)=>{if(st.frames.length<=1){st.draw(0);return;}
  st.elapsed+=dt;const total=Math.max(.02,st.duration());const ms=(st.loop?st.elapsed%total:Math.min(st.elapsed,total-0.00001))*1000;
  let at=ms,idx=0;for(;idx<st.frames.length-1;idx++){if(at<(st.clip.timings[st.frames[idx]]||100))break;at-=st.clip.timings[st.frames[idx]]||100;}st.draw(idx);
 };
 st.draw(0);return st;
}
// A renderable action is either a dedicated approved clip or an explicit subset of approved frames.
// A clip with uncertain semantic content MUST NOT auto-play during idle.
const segments=manifest.segments||{};
function spec(action){
 // No guessing by filename, no fallback to another actor or another action.
 const approved=lockedAction(action);
 if(!approved)return null;
 const clip=clips[approved.clip];
 if(!clip || clip.sourceSHA256!==approved.sourceSHA256 || roles[action]!==clip.id)
   throw Error('CHARACTER_IDENTITY_LOCK: action source mismatch: '+action);
 const frames=approved.frames;
 if(!Array.isArray(frames)||!frames.length||frames.some(i=>!Number.isInteger(i)||i<0||i>=clip.frameCount))
   throw Error('CHARACTER_IDENTITY_LOCK: invalid frames for '+action);
 return {clip,frames,loop:action==='walk'||action==='run'};
}
const actionSpecs={};for(const action of ['idle','walk','run','jump','crouch','attack','pickup'])actionSpecs[action]=spec(action);
for(const [btn,action] of [['attack','attack'],['crouch','crouch'],['jump','jump'],['interact','pickup'],['run','run']]){
 const el=$('#'+btn); if(el&&!actionSpecs[action]) {el.disabled=true;el.title='Нет утверждённых кадров этого героя для действия: '+action;}
}

let bg=null,portal=null;
if(clipOf('background')){const c=clipOf('background');bg=createPlane(c,8.9,-12);bg.mesh.scale.x=Math.max(1,26/(8.9*c.width/c.height));bg.mesh.position.set(0,1.6,-16);}
let video=null;
if(manifest.webm){video=document.createElement('video');video.src='./assets/'+manifest.webm;video.loop=true;video.muted=true;video.playsInline=true;video.autoplay=true;
 const t=new THREE.VideoTexture(video);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(27,9),new THREE.MeshBasicMaterial({map:t,depthWrite:false,side:THREE.DoubleSide}));m.position.set(0,1.6,-18);scene.add(m);video.play().catch(()=>{});}
const portalX=6.8;if(clipOf('portal')){portal=createPlane(clipOf('portal'),3.55,1);portal.mesh.position.set(portalX,1.65,-1.4);}
const base=actionSpecs.idle?.clip;let hero=base?createPlane(base,3.05,3):null;
if(hero&&actionSpecs.idle)hero.set(base,actionSpecs.idle.frames,false);
const extras=(roles.extras||[]).map((id,i)=>{const c=clips[id];if(!c)return null;const s=createPlane(c,c.alpha?2.1:8.6,c.alpha?1:-11);s.mesh.position.set(i*3.5-8,c.alpha?1:1.5,c.alpha?-3:-15);if(c.alpha)s.set(c,[0],false);return s;}).filter(Boolean);
const heroCollider=new THREE.Box3(),attackBox=new THREE.Box3();
const player={x:-4.3,y:0,vx:0,vy:0,face:1,grounded:true,state:'idle',stateTime:0,hit:false};
const setState=(next)=>{const s=actionSpecs[next];if(!s||next===player.state)return;player.state=next;player.stateTime=0;if(hero)hero.set(s.clip,s.frames,s.loop);};
if(hero&&actionSpecs.idle)hero.set(actionSpecs.idle.clip,actionSpecs.idle.frames,false);
const fxGeo=new THREE.BufferGeometry(),pts=new Float32Array(90*3);for(let i=0;i<90;i++){pts[i*3]=((i*317)%97/97-.5)*24;pts[i*3+1]=i%29/29*7;pts[i*3+2]=-4-(i%13);}
fxGeo.setAttribute('position',new THREE.BufferAttribute(pts,3));const fxMat=new THREE.ShaderMaterial({uniforms:{time:{value:0}},vertexShader:'uniform float time;void main(){vec3 p=position;p.y=mod(p.y+time*.25,7.0);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);gl_PointSize=3.0;}',fragmentShader:'void main(){vec2 p=gl_PointCoord-.5;float a=max(0.,1.-length(p)*2.);gl_FragColor=vec4(1.,.45,.12,a*.45);}',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
const fx=new THREE.Points(fxGeo,fxMat);scene.add(fx);
$('#fx')?.addEventListener('click',()=>{fx.visible=!fx.visible;$('#fx').classList.toggle('active',fx.visible);});
let elapsedFps=0,framesFps=0;
function frame(dt){
 game.time+=dt;
 if(!game.win){
  let direction=(down('ArrowRight','KeyD')?1:0)-(down('ArrowLeft','KeyA')?1:0);
  const crouching=Boolean(actionSpecs.crouch)&&down('ArrowDown','KeyS')&&player.grounded;
  if(crouching)direction=0;
  if(direction!==0&&!actionSpecs.walk)direction=0;
  const running=Boolean(actionSpecs.run)&&direction!==0&&down('ShiftLeft','ShiftRight');
  const jumpPressed=trigger('ArrowUp','KeyW','Space');
  const attackPressed=trigger('KeyJ');
  const interactPressed=trigger('KeyE');
  if(attackPressed && actionSpecs.attack && player.state!=='attack' && player.state!=='pickup')setState('attack');
  if(jumpPressed&&actionSpecs.jump&&player.grounded&&!crouching){player.vy=6.25;player.grounded=false;setState('jump');}
  if(interactPressed&&actionSpecs.pickup){
   const near=Math.abs(player.x-portalX)<1.3;
   if(near&&portal){game.win=true;$('#victory')?.removeAttribute('hidden');}
  }
  const speed=running?5.7:3.6;
  player.vx=direction*speed;
  if(direction)player.face=direction;
  player.x=THREE.MathUtils.clamp(player.x+player.vx*dt,-10,10);
  if(!player.grounded){player.vy-=17*dt;player.y=Math.max(0,player.y+player.vy*dt);if(player.y===0){player.vy=0;player.grounded=true;}}
  player.stateTime+=dt;
  if(player.state==='attack'&&player.stateTime>=(actionSpecs.attack?.frames.reduce((sum,i)=>sum+(actionSpecs.attack.clip.timings[i]||100),0)/1000||.6))setState('idle');
  if(player.state==='pickup'&&player.stateTime>=.5)setState('idle');
  if(player.state!=='attack'&&player.state!=='pickup'){
   if(!player.grounded){if(actionSpecs.jump)setState('jump');else setState('idle');}
   else if(crouching)setState(actionSpecs.crouch?'crouch':'idle');
   else if(direction)setState(running?'run':'walk');
   else setState('idle');
  }
  const face=player.face;if(hero){hero.mesh.scale.x=Math.abs(hero.mesh.scale.x)*face;hero.mesh.position.set(player.x,1.48+player.y,.1);}
  heroCollider.setFromCenterAndSize(new THREE.Vector3(player.x,player.y+.86,0),new THREE.Vector3(.68,player.state==='crouch'?1.05:1.72,.44));
  const attackAllowed=player.state==='attack'&&player.stateTime>.17&&player.stateTime<.45;
  if(attackAllowed)attackBox.setFromCenterAndSize(new THREE.Vector3(player.x+.65*face,player.y+1,0),new THREE.Vector3(.98,.8,.7));else attackBox.makeEmpty();
  const label=$('#hint');if(label)label.textContent=Math.abs(player.x-portalX)<1.3?'E — ВОЙТИ В ПОРТАЛ':'← → ИДТИ · SHIFT+←→ БЕГ · ↑ ПРЫЖОК · ↓ ПРИСЕСТЬ · J УДАР · E ВЗЯТЬ';
 }
 if(hero)hero.update(dt);
 bg?.update(dt);portal?.update(dt);for(const extra of extras)extra.update(dt);
 fxMat.uniforms.time.value=game.time;
 game.cameraX+=(player.x*.76-game.cameraX)*Math.min(1,dt*3);
 camera.position.set(game.cameraX,2.1,15);camera.lookAt(game.cameraX,1.5,-4);if(bg)bg.mesh.position.x=game.cameraX*.23;
 justPressed.clear();
}
function resize(){const w=innerWidth,h=innerHeight,a=w/h,half=4.5;camera.left=-half*a;camera.right=half*a;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();renderer.setSize(w,h,false);}addEventListener('resize',resize);resize();
let last=0;function loop(){requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.05);frame(dt);renderer.render(scene,camera);last+=dt;framesFps++;if(last>2){if($('#fps'))$('#fps').textContent=Math.round(framesFps/last)+' FPS';last=0;framesFps=0;}}
$('#loading')?.remove();loop();
