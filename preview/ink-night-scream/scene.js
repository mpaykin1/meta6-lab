import * as T from 'three';
import {createLivingWatercolor3D,createWatercolorStyle}
  from '../../reference/ink-fallen-guardian/shared/living-watercolor-3d.js';
import {createInkGrinMonster} from '../../reference/ink-grin-monster/ink-grin-monster.js';
import {createInkNightTrain} from '../../demos/living-watercolor/ink-night-train.js';
import {createHorrorAudio} from './audio.js';

// INK · Ночной перегон — horror screamer.
// You stand by the railway at night with a flashlight. The grinning thing stalks you
// in the dark, leaping closer whenever it is not in your light. Hold it in the beam and
// it hisses and backs away. Trains thunder past: their noise covers its steps.
// Survive the trains of the night until dawn. Fail — and it bites.

const TRACK_Z=-7.5,EYE=1.7,TRAIN_SPEED=38;
const audio=createHorrorAudio();
const scene=new T.Scene();
scene.background=new T.Color('#000000');
scene.fog=new T.FogExp2('#000000',.06);
const camera=new T.PerspectiveCamera(62,innerWidth/innerHeight,.05,600);
camera.position.set(0,EYE,0);camera.rotation.order='YXZ';
const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.3));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=T.SRGBColorSpace;
renderer.toneMapping=T.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.1;
document.body.insertBefore(renderer.domElement,document.body.firstChild);
const style=createWatercolorStyle({
  seed:'ink-night-scream-living-paint',inkColor:'#0b0f12',
  paperColor:'#20282a',washColor:'#424f51',washOpacity:.70,
  washLayers:7,edgeWidth:.020,edgeJitter:.24,granulation:.34,
  bleed:.18,shadowWash:.18,motion:.11,pigmentPooling:.27,
  paperGap:.08,paintedLight:.64
});
const paint=createLivingWatercolor3D({THREE:T,renderer,scene,camera,style});
const ambient=new T.HemisphereLight('#6d7b86','#000000',.035);scene.add(ambient);

const rnd=i=>{const f=Math.sin(i*127.1+39.4)*43758.5453;return f-Math.floor(f);};
// ---------- world: ground, railway, bare trees ----------
const gc=document.createElement('canvas');gc.width=gc.height=256;
{const x=gc.getContext('2d');x.fillStyle='#777';x.fillRect(0,0,256,256);
 for(let i=0;i<2600;i++){const v=40+Math.floor(rnd(i)*170);x.fillStyle=`rgb(${v},${v},${v})`;
  x.globalAlpha=.25+rnd(i+9)*.5;x.fillRect(rnd(i+3)*256,rnd(i+5)*256,1+rnd(i+7)*3,1+rnd(i+8)*2);}}
const groundTex=new T.CanvasTexture(gc);groundTex.wrapS=groundTex.wrapT=T.RepeatWrapping;groundTex.repeat.set(70,70);
groundTex.colorSpace=T.SRGBColorSpace;
const ground=new T.Mesh(new T.PlaneGeometry(400,400),new T.MeshStandardMaterial({color:'#262d31',map:groundTex,roughness:1}));
ground.rotation.x=-Math.PI/2;scene.add(ground);
const rail=new T.Group();rail.position.z=TRACK_Z;scene.add(rail);
const ballastTex=groundTex.clone();ballastTex.repeat.set(120,2);ballastTex.needsUpdate=true;
const ballast=new T.Mesh(new T.BoxGeometry(700,.12,4.6),new T.MeshStandardMaterial({color:'#3a4248',map:ballastTex,roughness:.95}));
ballast.position.y=.05;rail.add(ballast);
const railMat=new T.MeshStandardMaterial({color:'#9aa4aa',roughness:.26,metalness:.95});
for(const z of [-.76,.76]){const r=new T.Mesh(new T.BoxGeometry(700,.13,.09),railMat);r.position.set(0,.185,z);rail.add(r);}
const sleepers=new T.InstancedMesh(new T.BoxGeometry(.27,.09,2.7),new T.MeshStandardMaterial({color:'#15191b',roughness:1}),220);
{const d=new T.Object3D();for(let i=0;i<220;i++){d.position.set(-88+i*.8,.115,0);d.updateMatrix();sleepers.setMatrixAt(i,d.matrix);}}
rail.add(sleepers);
const bark=new T.MeshStandardMaterial({color:'#2b3134',roughness:.95});
function deadTree(height,seed){
  const g=new T.Group(),r=n=>rnd(n+seed);
  const p=[new T.Vector3(0,0,0),new T.Vector3(-.15+r(1)*.3,height*.3,.1),
    new T.Vector3(.2-r(4)*.4,height*.65,-.08),new T.Vector3((r(9)-.5)*.5,height,0)];
  g.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(p),10,.085,5),bark));
  for(let i=0;i<7;i++){
    const h=.28+i*.1,side=i%2?1:-1,start=p[1].clone().lerp(p[3],h);
    const end=start.clone().add(new T.Vector3(side*(.6+r(i)*.7),.5+r(i+13)*1.1,(r(i+5)-.5)*1.2));
    const c=new T.CatmullRomCurve3([start,start.clone().lerp(end,.5).add(new T.Vector3(0,.22,0)),end]);
    g.add(new T.Mesh(new T.TubeGeometry(c,6,.03,4),bark));
  }
  return g;
}
const trees=[];
for(let i=0;i<46;i++){
  const a=rnd(i+3)*Math.PI*2,d=7+rnd(i+11)*30;
  const x=Math.cos(a)*d,z=Math.sin(a)*d;
  if(Math.abs(z-TRACK_Z)<3.4)continue;
  const g=deadTree(3.8+rnd(i+70)*4.2,i*17+5);g.position.set(x,0,z);g.rotation.y=rnd(i+2)*6.28;
  scene.add(g);trees.push(g);
}
// ---------- flashlight ----------
const torch=new T.SpotLight('#eef0ff',0,40,.4,.85,1.4);
torch.position.set(.25,-.25,0);camera.add(torch);
torch.target.position.set(0,0,-1);camera.add(torch.target);scene.add(camera);
const torchFill=new T.PointLight('#dfe4ff',0,6,2);camera.add(torchFill);

// ---------- the creature ----------
const monster=createInkGrinMonster(31);
monster.userData.auto=false;
const MS=.82;monster.scale.setScalar(MS);
scene.add(monster);
paint.apply(monster,{seed:'ink-night-scream-monster'});
const faceLight=new T.PointLight('#dfe6dc',0,7,2);scene.add(faceLight);
// two pale glints: its eyes catch whatever light there is, even in the dark
const glintTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);
  g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(230,236,230,.55)');g.addColorStop(1,'rgba(230,236,230,0)');x.fillStyle=g;x.fillRect(0,0,64,64);
  return new T.CanvasTexture(c);})();
const glints=monster.userData.rig.face.eyes.map(eye=>{
  const s=new T.Sprite(new T.SpriteMaterial({map:glintTex,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending,fog:false}));
  s.position.set(0,0,.14);s.scale.setScalar(.28);eye.add(s);return s;});

// ---------- the train ----------
const train=createInkNightTrain({cars:7,seed:11,look:{
  glareBase:1.5,glareGain:3.4,glareDepthTest:true,smallBase:.7,smallGain:.55,
  beamLen:[84,58],beamRad:[3.0,5.0],beamI:[.85,.24],cab:.22,beamBody:.02,beamPow:2.6,beamFall:1.9,tilt:.06,
  spot:800,nose:0,warm:5,spill:.1,mullions:true,halo:9,minGlare:.075,minSmall:.02,minHalo:.3,bodyColor:'#07090a'}});
train.position.z=TRACK_Z;scene.add(train);
const LEN=train.userData.length;

// ---------- old-film post ----------
const target=new T.WebGLRenderTarget(2,2,{type:T.HalfFloatType,depthBuffer:true});
const post=new T.ShaderMaterial({
  uniforms:{tMap:{value:target.texture},uTime:{value:0},uFear:{value:0},uFade:{value:0},uDawn:{value:0},uRes:{value:new T.Vector2(2,2)}},
  depthTest:false,depthWrite:false,
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:`
    uniform sampler2D tMap;uniform float uTime,uFear,uFade,uDawn;uniform vec2 uRes;varying vec2 vUv;
    float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    vec3 soft(vec2 uv,vec2 px){
      vec3 c=texture2D(tMap,uv).rgb*.36;
      c+=texture2D(tMap,uv+px*vec2(1.3,.6)).rgb*.16;c+=texture2D(tMap,uv+px*vec2(-1.3,-.6)).rgb*.16;
      c+=texture2D(tMap,uv+px*vec2(.6,-1.3)).rgb*.16;c+=texture2D(tMap,uv+px*vec2(-.6,1.3)).rgb*.16;
      return c;
    }
    void main(){
      vec2 uv=vUv,c=uv-.5;float r=length(c);
      float line=floor(uv.y*90.);
      float g=step(.93-.3*uFear,h(vec2(line,floor(uTime*14.))))*uFear;
      uv.x+=g*(h(vec2(line,uTime))-.5)*.06;
      uv+=vec2(sin(uTime*.9),cos(uTime*.7))*.0012;
      vec2 px=(1.4+2.0*r)/uRes;
      float ab=(.0022+.012*uFear)*r*2.;
      vec3 col=soft(uv,px);
      col.r=soft(uv+c*ab,px).r;col.b=soft(uv-c*ab,px).b;
      float l=dot(col,vec3(.3,.59,.11));
      col=mix(col,vec3(l)*vec3(1.03,1.,1.0),.78);
      col+=vec3(.16,.18,.22)*uDawn*(1.-uv.y*.5);
      float flick=.94+.04*sin(uTime*11.)*sin(uTime*2.3)+.03*h(vec2(floor(uTime*9.),3.));
      col*=flick*smoothstep(1.0,.25,r)*uFade;
      gl_FragColor=vec4(col,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      float n=h(gl_FragCoord.xy+fract(uTime)*91.7)-.5;
      float lum=dot(gl_FragColor.rgb,vec3(.33));
      float scr=step(.997,h(vec2(floor(gl_FragCoord.x/2.),floor(uTime*10.))))*.045;
      gl_FragColor.rgb+=n*(.014+.09*lum+.06*uFear)+scr*lum*4.;
    }`
});
const postScene=new T.Scene(),postCamera=new T.OrthographicCamera(-1,1,1,-1,0,1);
const quad=new T.Mesh(new T.PlaneGeometry(2,2),post);quad.frustumCulled=false;postScene.add(quad);

// ---------- UI (icons only; text lives in the menu) ----------
const $=s=>document.querySelector(s);
const ui=$('#panel'),menuButton=$('#menu-btn'),torchBtn=$('#torch'),ring=$('#torch-ring'),
  pips=$('#pips'),startBtn=$('#start'),againBtn=$('#again'),soundBtn=$('#sound');
let state='title';               // title | play | caught | dawn
let paused=false,menuOpen=false;
function setMenu(open){
  menuOpen=open;ui.hidden=!open;menuButton.setAttribute('aria-expanded',String(open));
  audio.suspend(open);
}
menuButton.onclick=()=>setMenu(!menuOpen);
$('#resume').onclick=()=>setMenu(false);
$('#restart').onclick=()=>{setMenu(false);startNight(1);};
soundBtn.onclick=()=>{audio.setEnabled(!audio.enabled);soundBtn.textContent=audio.enabled?'🔊 Звук включён':'🔇 Звук выключен';};

// ---------- game state ----------
let night=1,need=3,passed=0,battery=1,torchOn=true,torchDead=0;
let yaw=0,pitch=.02,yawS=0,pitchS=.02,yawVel=0;
const M={dist:24,ang:Math.PI*.5,lit:0,mode:'wait',timer:3,leapFrom:0,leapTo:0,leapAngFrom:0,leapAngTo:0,
  taunt:0,repels:0,seen:0};
const TR={x:-420,active:true,timer:9,horn:true};
let elapsed=0,fear=0,fade=0,dawn=0,caughtT=0,dawnT=0,prevMs=0,renderedFrames=0;

function drawPips(){
  pips.innerHTML='';
  for(let i=0;i<need;i++){const s=document.createElement('i');if(i<passed)s.className='on';pips.appendChild(s);}
}
function placeMonster(){
  monster.position.set(-Math.sin(M.ang)*M.dist,0,-Math.cos(M.ang)*M.dist);
  monster.rotation.y=Math.atan2(-monster.position.x,-monster.position.z);
}
function startNight(n){
  night=n;need=2+n;passed=0;battery=1;torchOn=true;torchDead=0;
  // it comes from behind your shoulder the first time
  M.dist=26;M.ang=yaw+Math.PI*(.75+.5*Math.random());M.mode='wait';M.timer=4.5;M.lit=0;M.repels=0;M.seen=0;
  placeMonster();
  TR.active=false;TR.timer=7+Math.random()*4;TR.x=-2000;train.position.x=TR.x;
  state='play';fade=0;caughtT=0;dawn=0;
  startBtn.hidden=true;againBtn.hidden=true;torchBtn.hidden=false;pips.hidden=false;
  drawPips();audio.sting();
}
startBtn.onclick=()=>{audio.unlock();startNight(1);};
againBtn.onclick=()=>{audio.unlock();startNight(night);};
function toggleTorch(){
  if(state!=='play')return;
  if(torchDead>0)return;
  torchOn=!torchOn;audio.click();
}
torchBtn.addEventListener('click',e=>{e.stopPropagation();toggleTorch();});

// look around: drag with inertia (the heavy head of someone who is afraid to turn)
const el=renderer.domElement;let drag=null;
el.addEventListener('pointerdown',e=>{el.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY,t:performance.now()};});
el.addEventListener('pointermove',e=>{
  if(!drag)return;
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y,k=3.2/Math.max(320,innerWidth);
  yaw-=dx*k;pitch=T.MathUtils.clamp(pitch-dy*k*.8,-.5,.75);
  const now=performance.now();yawVel=-dx*k/Math.max(8,now-drag.t)*1000;
  drag={x:e.clientX,y:e.clientY,t:now};
});
for(const ev of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(ev,()=>{drag=null;});
const keys={};
addEventListener('keydown',e=>{
  keys[e.code]=true;
  if(e.code==='KeyF'||e.code==='Space'){e.preventDefault();toggleTorch();}
  if(e.code==='Escape')setMenu(!menuOpen);
});
addEventListener('keyup',e=>{keys[e.code]=false;});

function resize(){
  renderer.setSize(innerWidth,innerHeight);
  camera.aspect=innerWidth/Math.max(1,innerHeight);
  camera.fov=camera.aspect<1?74:60;camera.updateProjectionMatrix();
  const pr=renderer.getPixelRatio()*.8;
  target.setSize(Math.max(2,Math.round(innerWidth*pr)),Math.max(2,Math.round(innerHeight*pr)));
  post.uniforms.uRes.value.set(target.width,target.height);
}
addEventListener('resize',resize);resize();

const tmp=new T.Vector3(),fwd=new T.Vector3(),headPos=new T.Vector3();
const angDiff=(a,b)=>{let d=a-b;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return d;};
// stereo side of a world angle (same convention as camera yaw): -1 left, +1 right
const panOf=a=>-Math.sin(angDiff(a,yawS));
const ease=x=>x*x*(3-2*x);

function updateMonster(dt){
  const lightOn=torchOn&&torchDead<=0&&battery>0;
  monster.userData.rig.head.getWorldPosition(headPos);
  tmp.copy(headPos).sub(camera.position);
  const d=tmp.length();tmp.normalize();
  camera.getWorldDirection(fwd);
  const inBeam=fwd.dot(tmp)>Math.cos(.33)&&d<17;   // the beam only scares it from close enough
  const inView=fwd.dot(tmp)>Math.cos(camera.fov*Math.PI/360*1.25);
  const trainNear=TR.active?trainLoud:0;
  if(inView&&d<26)M.seen=Math.min(1,M.seen+dt*.8);
  // exposure to the beam pushes it back
  if(lightOn&&inBeam&&M.mode!=='retreat')M.lit+=dt*(1.4-.15*night);else M.lit=Math.max(0,M.lit-dt*.6);
  if(M.lit>.55&&M.mode!=='retreat'){
    M.mode='retreat';M.timer=0;M.lit=0;M.repels++;
    audio.hiss(panOf(M.ang));monster.userData.play('eyes');
  }
  const act=monster.userData.action();
  if(M.mode==='wait')M.timer-=dt*(1+1.2*trainNear);   // the train's roar covers it: it moves faster
  if(M.mode==='wait'&&M.timer<=0&&!act){
    // leap: closer, and around to where you are not looking
    const behind=yaw+Math.PI,drift=angDiff(behind,M.ang);
    M.leapFrom=M.dist;M.leapTo=Math.max(1.6,M.dist-(3+1.1*night+Math.random()*1.5));
    M.leapAngFrom=M.ang;M.leapAngTo=M.ang+T.MathUtils.clamp(drift,-.7,.7)*(inView?.3:.6);
    M.mode='leap';M.t=0;monster.userData.play('jump');
  }else if(M.mode==='leap'){
    M.t+=dt;const p=M.t/1.9,u=T.MathUtils.clamp((p-.33)/.39,0,1);
    M.dist=T.MathUtils.lerp(M.leapFrom,M.leapTo,ease(u));
    M.ang=T.MathUtils.lerp(M.leapAngFrom,M.leapAngTo,ease(u));
    if(p>=.72&&!M.landed){M.landed=true;audio.step(panOf(M.ang),Math.max(0,1-M.dist/24));}
    if(p>=1){M.landed=false;M.mode='wait';M.timer=Math.max(.9,(3.4-.45*night)*(.7+.6*Math.random()));
      // sometimes it stops to taunt you with a swipe or a bite of the air
      if(M.dist<14&&Math.random()<.35){monster.userData.play(['strikeL','strikeR','grab'][Math.floor(Math.random()*3)]);audio.chatter(panOf(M.ang),.12+.1*(1-M.dist/14));}
    }
  }else if(M.mode==='retreat'){
    M.timer+=dt;
    M.dist=Math.min(27,M.dist+dt*(9-3*Math.min(1,M.timer)));
    if(M.timer>2.2){
      // gone into the dark; it comes back from another side
      if(M.dist>=26){M.ang=yaw+Math.PI*(.6+.8*Math.random());}
      M.mode='wait';M.timer=2.2+Math.random()*2;
    }
  }
  if(M.dist<2.4&&state==='play')caught();
  placeMonster();
  // a dim light on its face only when your beam is on it, so the grin appears out of black
  const onFace=lightOn&&inBeam?1:0;
  faceLight.intensity+=((onFace*16*Math.min(1,10/Math.max(3,d)))-faceLight.intensity)*Math.min(1,dt*8);
  faceLight.position.copy(headPos).lerp(camera.position,.25);
  // eyes in the dark: brighter when it is close, gone when your light is on it
  const blink=Math.sin(elapsed*.7+M.ang*3)>.94?0:1;
  const eg=(onFace?0:1)*blink*T.MathUtils.clamp(1.15-d/26,0,1)*(.75+.25*Math.sin(elapsed*2.3));
  for(const g of glints)g.material.opacity+=(eg-g.material.opacity)*Math.min(1,dt*6);
  return {d,inBeam,inView};
}

let trainLoud=0;
function updateTrain(dt){
  if(!TR.active){
    TR.timer-=dt;
    if(TR.timer<=0){TR.active=true;TR.x=-420;TR.horn=false;}
    trainLoud=0;return;
  }
  TR.x+=TRAIN_SPEED*dt;train.position.x=TR.x;
  if(!TR.horn&&TR.x>-190){TR.horn=true;audio.horn(-.85);}
  const nearX=T.MathUtils.clamp(0,TR.x-LEN,TR.x),dd=Math.hypot(nearX,TRACK_Z);
  trainLoud=T.MathUtils.clamp(1-(dd-7.5)/150,0,1);
  if(TR.x-LEN>260){
    TR.active=false;TR.x=-2000;train.position.x=TR.x;TR.timer=8+Math.random()*8-night;trainLoud=0;
    if(state==='play'){passed++;drawPips();audio.click();if(passed>=need)dawnBreak();}
  }
}
function dawnBreak(){
  state='dawn';dawnT=0;torchBtn.hidden=true;
  M.mode='retreat';M.timer=0;
  audio.sting();
}
function caught(){
  state='caught';caughtT=0;torchBtn.hidden=true;
  // it is suddenly right in front of you, mouth opening
  M.ang=yaw;M.dist=3.2;placeMonster();
  monster.userData.play('bite');
  audio.scream();
}

function step(dt){
  elapsed+=dt;
  // camera inertia
  const kx=(keys.ArrowLeft||keys.KeyA?1:0)-(keys.ArrowRight||keys.KeyD?1:0);
  yaw+=kx*dt*1.9;
  if(!drag){yaw+=yawVel*dt;yawVel*=Math.exp(-dt*6);}
  const ko=1-Math.exp(-dt*9);
  yawS+=(yaw-yawS)*ko;pitchS+=(pitch-pitchS)*ko;
  let shake=0;
  const t=elapsed;
  // breathing camera: the player is scared
  const breath=.012*Math.sin(t*1.7)+.006*Math.sin(t*3.1);
  camera.position.set(0,EYE+breath,0);
  if(state==='play'||state==='dawn'){
    if(state==='play'){
      // battery: drains when on, sputters when low
      if(torchDead>0){torchDead-=dt;if(torchDead<=0){battery=.12;}}
      else if(torchOn){battery-=dt*(.026+.006*night);if(battery<=0){battery=0;torchDead=2.2;audio.buzz();}}
      else battery=Math.min(1,battery+dt*.09);
    }
    updateTrain(dt);
    const m=updateMonster(dt);
    const prox=T.MathUtils.clamp(1-(m.d-2.4)/18,0,1);
    fear+=((Math.max(prox*prox,monster.userData.pulse||0)*.9)-fear)*Math.min(1,dt*2);
    shake=.004*prox+.03*trainLoud*trainLoud;
    camera.rotation.set(pitchS+shake*Math.sin(t*61),yawS+shake*Math.sin(t*53),shake*.4*Math.sin(t*47));
    const rel=angDiff(M.ang,yawS);
    const nx=TR.active?T.MathUtils.clamp(0,TR.x-LEN,TR.x):0;
    audio.update({t,fear,prox,monster:state==='play',pan:panOf(M.ang),behind:Math.cos(rel)<0,
      train:trainLoud,trainPan:panOf(Math.atan2(-nx,-TRACK_Z)),calm:prox<.3&&trainLoud<.2});
    fade+=(1-fade)*Math.min(1,dt*1.2);
    if(state==='dawn'){
      dawnT+=dt;dawn=Math.min(1,dawnT/3)*(1-Math.max(0,dawnT-4.5)/1.5);
      if(dawnT>6){startNight(night+1);}
    }
  }else if(state==='caught'){
    caughtT+=dt;
    // the camera is dragged onto the face; the maw fills the screen
    monster.userData.rig.head.getWorldPosition(headPos);
    tmp.copy(headPos).sub(camera.position);
    const wantYaw=Math.atan2(-tmp.x,-tmp.z),wantPitch=Math.atan2(tmp.y,Math.hypot(tmp.x,tmp.z));
    yaw=yawS=yawS+angDiff(wantYaw,yawS)*Math.min(1,dt*14);
    pitch=pitchS=pitchS+(wantPitch-pitchS)*Math.min(1,dt*14);
    M.dist=Math.max(2.5,3.2-caughtT*1.3);placeMonster();
    for(const g of glints)g.material.opacity=0;
    faceLight.intensity=17;faceLight.position.copy(headPos).lerp(camera.position,.4);
    shake=.05*Math.max(0,1-caughtT/1.6);
    camera.rotation.set(pitchS+shake*Math.sin(t*71),yawS+shake*Math.sin(t*59),shake*Math.sin(t*43));
    fear=Math.min(1,.4+caughtT*2)*(caughtT<1.6?1:Math.max(0,1-(caughtT-1.6)));
    fade=caughtT<1.75?1:Math.max(0,1-(caughtT-1.75)*3);
    if(caughtT>2.4&&againBtn.hidden){againBtn.hidden=false;}
    audio.update({t,fear,prox:0,monster:false,pan:0,behind:false,train:trainLoud,trainPan:0,calm:false});
  }else{ // title: slow look at the dark line, a train far away now and then
    yaw+=dt*.02;
    camera.rotation.set(pitchS,yawS,0);
    updateTrain(dt);fade+=(.9-fade)*Math.min(1,dt*.6);
    audio.update({t,fear:0,prox:0,monster:false,pan:0,behind:false,train:trainLoud,trainPan:0,calm:true});
  }
  // flashlight: warm-white beam with a little hand tremble and dying-battery flicker
  const lightOn=(state==='play'||state==='dawn')&&torchOn&&torchDead<=0&&battery>0;
  let I=lightOn?1:0;
  if(lightOn&&battery<.22)I*=Math.sin(t*37)*Math.sin(t*13)>-.15?1:.15;
  torch.intensity+=(I*520-torch.intensity)*Math.min(1,dt*20);
  torchFill.intensity=I*1.1;
  torch.target.position.set(.25+.02*Math.sin(t*1.3),-.2+.015*Math.sin(t*1.9),-1);
  ring.style.strokeDashoffset=String(100-100*battery);
  // sound did not start (iPhone): the menu button glows softly to invite a tap
  menuButton.classList.toggle('need-sound',audio.enabled&&state!=='title'&&!audio.ok());
  torchBtn.classList.toggle('off',!lightOn);
  monster.userData.lookTarget=camera.position;
  monster.userData.tick(elapsed,dt);
  train.userData.tick(elapsed,dt,1,camera);
  paint.tick(performance.now());
  post.uniforms.uTime.value=elapsed;post.uniforms.uFear.value=fear;post.uniforms.uFade.value=fade;post.uniforms.uDawn.value=dawn;
}
function draw(){
  renderer.setRenderTarget(target);renderer.render(scene,camera);
  renderer.setRenderTarget(null);renderer.render(postScene,postCamera);
  renderedFrames++;
}
let manual=false,smoothedFrame=16.7,quality=1;
function animate(ms){
  requestAnimationFrame(animate);
  if(document.hidden||manual||menuOpen){prevMs=ms;return;}
  const dt=Math.min(.045,Math.max(0,(ms-prevMs)/1000));prevMs=ms;
  smoothedFrame=.93*smoothedFrame+.07*dt*1000;
  if(smoothedFrame>33&&quality>.68){quality=.68;renderer.setPixelRatio(1);paint.setQuality(.68);resize();}
  step(dt);draw();
}
requestAnimationFrame(animate);
document.addEventListener('visibilitychange',()=>audio.suspend(document.hidden||menuOpen));
// hooks for automatic checks (bot-tester)
window.__INK_NIGHT_SCREAM__={
  ready:true,scene,camera,monster,train,
  start:()=>startNight(1),
  advance:(sec)=>{manual=true;for(let i=0;i<Math.round(sec/.016);i++)step(.016);draw();},
  look:(a)=>{yaw=yawS=a;},
  torch:(v)=>{torchOn=v;},
  forceTrain:()=>{TR.timer=0;},
  stats:()=>({state,night,need,passed,battery:+battery.toFixed(3),monster:{mode:M.mode,dist:+M.dist.toFixed(2),ang:+M.ang.toFixed(2),repels:M.repels},
    train:{active:TR.active,x:Math.round(TR.x)},renderedFrames,audio:audio.ok(),media:audio.mediaPlaying})
};
