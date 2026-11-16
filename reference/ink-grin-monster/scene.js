import * as T from 'three';
import {createLivingWatercolor3D,createWatercolorStyle}
  from '../ink-fallen-guardian/shared/living-watercolor-3d.js';
import {createIllustrationCamera}
  from '../ink-fallen-guardian/shared/living-watercolor-generators.js';
import {createInkGrinMonster} from './ink-grin-monster.js';

const background='#050708';
const scene=new T.Scene();
scene.background=new T.Color(background);
scene.fog=new T.FogExp2('#06090a',.085);
const camera=createIllustrationCamera(T,{
  width:innerWidth,height:innerHeight,viewHeight:8,
  position:[4,5,12],lookAt:[0,2.6,0]
});
const renderer=new T.WebGLRenderer({
  antialias:true,alpha:false,powerPreference:'high-performance',
  preserveDrawingBuffer:true
});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.3));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=T.SRGBColorSpace;
renderer.toneMapping=T.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.22;
document.body.insertBefore(renderer.domElement,document.body.firstChild);
const style=createWatercolorStyle({
  seed:'ink-grinning-creature-dark-living-paint',inkColor:'#0b0f12',
  paperColor:'#20282a',washColor:'#424f51',washOpacity:.70,
  washLayers:7,edgeWidth:.020,edgeJitter:.24,granulation:.34,
  bleed:.18,shadowWash:.18,motion:.11,pigmentPooling:.27,
  paperGap:.08,paintedLight:.64
});
const paint=createLivingWatercolor3D({THREE:T,renderer,scene,camera,style});
const ambient=new T.HemisphereLight('#8fa0a2','#0c1214',.5);scene.add(ambient);
const key=new T.DirectionalLight('#c8e2d6',.16);key.position.set(-4,7,8);scene.add(key);
const rim=new T.DirectionalLight('#9bcad3',1.1);rim.position.set(5,8,-8);scene.add(rim);
const faceLight=new T.PointLight('#dfe6dc',26,7.5,2);faceLight.position.set(.25,3.55,2.9);scene.add(faceLight);
const world=new T.Group();scene.add(world);
const ground=new T.Mesh(new T.PlaneGeometry(90,90),
  new T.MeshStandardMaterial({color:'#253032',roughness:1,side:T.DoubleSide}));
ground.rotation.x=-Math.PI/2;ground.position.y=-.19;
ground.userData.watercolorOutline=false;world.add(ground);
const wash=new T.Group();world.add(wash);
// Irregular puddles and charcoal pools surround the creature's feet.
for(let i=0;i<24;i++){
  const a=i*2.39996,r=.65+Math.sqrt(i/24)*2.9;
  const x=Math.cos(a)*r,z=Math.sin(a)*r*.83;
  const m=new T.Mesh(new T.CircleGeometry(.25+(i%5)*.10,15),
    new T.MeshStandardMaterial({color:i%3?'#303e42':'#4c5960',
      roughness:.23,transparent:true,opacity:.26,side:T.DoubleSide}));
  m.rotation.x=-Math.PI/2;
  m.rotation.z=(i%5)*.27;
  m.scale.set(1+(i%3)*.48,.38+(i%4)*.14,1);
  m.position.set(x,-.175,z);
  m.userData.watercolorOutline=false;wash.add(m);
}
// Broken, thin trees disappear into layered fog.
function deadTree(x,z,height,seed){
  const g=new T.Group();
  const trunkMaterial=new T.MeshStandardMaterial({color:'#293033',roughness:1});
  const rnd=n=>{
    const k=Math.sin((n+seed)*123.17+23.72)*41787.191;
    return k-Math.floor(k);
  };
  const p=[
    new T.Vector3(0,0,0),
    new T.Vector3(-.15+rnd(1)*.2,height*.29,.10),
    new T.Vector3(.15-rnd(4)*.25,height*.65,-.08),
    new T.Vector3((rnd(9)-.5)*.38,height,0)
  ];
  const tube=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(p),15,.10,5),trunkMaterial);
  tube.userData.watercolorOutline=false;g.add(tube);
  for(let i=0;i<6;i++){
    const h=.30+i*.105,side=i%2?1:-1;
    const start=p[1].clone().lerp(p[3],h);
    const end=start.clone().add(new T.Vector3(side*(.75+rnd(i)*.45),.35+rnd(i+13)*.8,.0));
    const curve=new T.CatmullRomCurve3([
      start,start.clone().lerp(end,.55).add(new T.Vector3(0,.2,0)),end
    ]);
    const m=new T.Mesh(new T.TubeGeometry(curve,8,.038,4),trunkMaterial);
    m.userData.watercolorOutline=false;g.add(m);
  }
  g.position.set(x,-.15,z);g.scale.setScalar(height/5);
  world.add(g);
}
for(let i=0;i<13;i++){
  const angle=i*2.39996;
  const d=7.4+i%4*1.6;
  const x=Math.sin(angle)*d,z=-3-Math.abs(Math.cos(angle))*6;
  deadTree(x,z,5.7+i%4*.55,i*17+5);
}
// A few sharp stones in the foreground pick up the watercolor edge light.
const stoneGeo=new T.DodecahedronGeometry(1,0);
const stones=new T.InstancedMesh(stoneGeo,new T.MeshStandardMaterial({
  color:'#414e4d',roughness:1
}),65);
const dummy=new T.Object3D(),c=new T.Color();
for(let i=0;i<65;i++){
  const angle=i*2.399963,dist=1.25+Math.sqrt(i/65)*5;
  dummy.position.set(Math.cos(angle)*dist,-.15,Math.sin(angle)*dist*.76);
  dummy.rotation.set(i*.43,i*1.27,.1*i);
  const scale=.08+(i%7)*.025;
  dummy.scale.set(scale,.05+(i%3)*.025,scale*1.1);
  dummy.updateMatrix();stones.setMatrixAt(i,dummy.matrix);
  c.set(i%4?'#4c5553':'#69706c');stones.setColorAt(i,c);
}
stones.userData.watercolorOutline=false;world.add(stones);
// The creature is a single reusable animated THREE.Group, with genuine
// independently moving shoulder, elbow, wrist, knee, eye and jaw parts.
const monster=createInkGrinMonster(31);
monster.position.set(0,-.01,.32);
world.add(monster);
paint.apply(monster,{seed:'ink-monster-owner-model'});
paint.apply(wash,{seed:'ink-wet-ground'});
paint.addGroundWash(monster,{
  width:3.0,depth:2.0,opacity:.20,seed:'black-creature-contact-shadow'
});
// Volumetric fog cards stay in the 3D world, not painted over the face.
const fogCanvas=document.createElement('canvas');
fogCanvas.width=fogCanvas.height=128;
const ctx=fogCanvas.getContext('2d');
const grad=ctx.createRadialGradient(64,64,0,64,64,63);
grad.addColorStop(0,'rgba(199,207,201,.32)');
grad.addColorStop(.52,'rgba(164,187,178,.13)');
grad.addColorStop(1,'rgba(164,187,178,0)');
ctx.fillStyle=grad;ctx.fillRect(0,0,128,128);
const fogTexture=new T.CanvasTexture(fogCanvas),fogs=[];
for(let i=0;i<10;i++){
  const fog=new T.Sprite(new T.SpriteMaterial({
    map:fogTexture,color:'#9caca6',transparent:true,
    opacity:.06,depthWrite:false
  }));
  fog.position.set(-9+i*2.2,.20+(i%3)*.50,-1.6-(i%4)*2.3);
  fog.scale.set(6.5+(i%4)*1.6,1.5+(i%3),1);
  world.add(fog);fogs.push(fog);
}
// Slow drifting particles, rain and drips on a separate atmospheric layer.
const mistCount=130,mistPos=new Float32Array(mistCount*3),mist=new T.BufferGeometry();
mist.setAttribute('position',new T.BufferAttribute(mistPos,3));
const dust=new T.Points(mist,new T.PointsMaterial({
  color:'#9eaba5',size:.028,transparent:true,opacity:.26,depthWrite:false
}));world.add(dust);
const rnd=i=>{
  const f=Math.sin(i*127.1+39.4)*43758.5453;
  return f-Math.floor(f);
};
// Old-film post-processing: soft focus, chromatic fringe, grain, vignette,
// and line glitches that flare when the jaw snaps or the creature twitches.
let fear=0;
const target=new T.WebGLRenderTarget(2,2,{type:T.HalfFloatType,depthBuffer:true});
const post=new T.ShaderMaterial({
  uniforms:{tMap:{value:target.texture},uTime:{value:0},uFear:{value:0},
    uRes:{value:new T.Vector2(2,2)}},
  depthTest:false,depthWrite:false,
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:`
    uniform sampler2D tMap;uniform float uTime,uFear;uniform vec2 uRes;varying vec2 vUv;
    float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    vec3 soft(vec2 uv,vec2 px){
      vec3 c=texture2D(tMap,uv).rgb*.36;
      c+=texture2D(tMap,uv+px*vec2(1.3,.6)).rgb*.16;
      c+=texture2D(tMap,uv+px*vec2(-1.3,-.6)).rgb*.16;
      c+=texture2D(tMap,uv+px*vec2(.6,-1.3)).rgb*.16;
      c+=texture2D(tMap,uv+px*vec2(-.6,1.3)).rgb*.16;
      return c;
    }
    void main(){
      vec2 uv=vUv,c=uv-.5;float r=length(c);
      float line=floor(uv.y*90.);
      float g=step(.93-.25*uFear,h(vec2(line,floor(uTime*14.))))*uFear;
      uv.x+=g*(h(vec2(line,uTime))-.5)*.05;
      uv+=vec2(sin(uTime*.9),cos(uTime*.7))*.0012;
      vec2 px=(1.6+2.2*r)/uRes;
      float ab=(.0025+.007*uFear)*r*2.;
      vec3 col=soft(uv,px);
      col.r=soft(uv+c*ab,px).r;col.b=soft(uv-c*ab,px).b;
      float l=dot(col,vec3(.3,.59,.11));
      col=mix(col,vec3(l)*vec3(.96,1.,.98),.82);
      float flick=.93+.05*sin(uTime*11.)*sin(uTime*2.3)+.04*h(vec2(floor(uTime*9.),3.));
      col*=flick*smoothstep(.86,.18,r);
      gl_FragColor=vec4(col,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      float n=h(gl_FragCoord.xy+fract(uTime)*91.7)-.5;
      float scr=step(.997,h(vec2(floor(gl_FragCoord.x/2.),floor(uTime*10.))))*.05;
      gl_FragColor.rgb+=n*(.075+.05*uFear)+scr;
    }`
});
const postScene=new T.Scene(),postCamera=new T.OrthographicCamera(-1,1,1,-1,0,1);
const quad=new T.Mesh(new T.PlaneGeometry(2,2),post);quad.frustumCulled=false;postScene.add(quad);
const ui=document.querySelector('#panel');
const menuButton=document.querySelector('#menu-btn');
menuButton.onclick=()=>{
  ui.hidden=!ui.hidden;
  menuButton.setAttribute('aria-expanded',String(!ui.hidden));
};
let mode='body',paused=false,yaw=.36,pitch=.15,zoom=1;
const headPos=new T.Vector3();let camY=2.6,yawS=.36,pitchS=.15,swellS=0;
let elapsed=0,prevMs=0,renderedFrames=0,quality=1,smoothedFrame=16.7;
const info={body:{target:2.60,height:7.6},face:{target:4.28,height:3.5},
  profile:{target:2.65,height:7.6}};
function show(kind){
  if(!info[kind])return;
  mode=kind;
  if(kind==='profile')yaw=Math.PI/2;
  if(kind==='body')yaw=.36;
  if(kind==='face')yaw=.14;
  pitch=.12;zoom=1;
  ui.hidden=true;menuButton.setAttribute('aria-expanded','false');
  resize();
}
document.querySelectorAll('[data-view]').forEach(button=>{
  button.addEventListener('click',()=>show(button.dataset.view));
});
document.querySelectorAll('[data-act]').forEach(button=>{
  button.addEventListener('click',()=>{
    if(paused)pauseToggle();
    monster.userData.play(button.dataset.act);
    ui.hidden=true;menuButton.setAttribute('aria-expanded','false');
  });
});
const pauseButton=document.querySelector('#pause');
function pauseToggle(){
  paused=!paused;
  pauseButton.textContent=paused?'Запустить анимацию':'Остановить анимацию';
}
pauseButton.onclick=pauseToggle;
addEventListener('keydown',e=>{
  if(e.code==='Space'){e.preventDefault();pauseToggle();}
  if(e.key==='1')show('body');
  if(e.key==='2')show('face');
  if(e.key==='3')show('profile');
});
function resize(){
  const aspect=innerWidth/Math.max(1,innerHeight);
  const desired=info[mode].height;
  camera.userData.viewHeight=Math.max(desired,desired*.83/Math.max(.64,aspect));
  camera.updateForViewport(innerWidth,innerHeight);
  camera.zoom=zoom;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
  const pr=renderer.getPixelRatio()*.8;
  target.setSize(Math.max(2,Math.round(innerWidth*pr)),Math.max(2,Math.round(innerHeight*pr)));
  post.uniforms.uRes.value.set(target.width,target.height);
}
let drag=null,pinch=0;const touches=new Map();
renderer.domElement.addEventListener('pointerdown',e=>{
  renderer.domElement.setPointerCapture(e.pointerId);
  touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
  drag={x:e.clientX,y:e.clientY};
  if(touches.size===2){
    const p=[...touches.values()];
    pinch=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);
  }
});
renderer.domElement.addEventListener('pointermove',e=>{
  if(!touches.has(e.pointerId))return;
  touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(touches.size===2){
    const p=[...touches.values()],d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);
    zoom=T.MathUtils.clamp(zoom*d/Math.max(1,pinch),.55,2.6);
    pinch=d;resize();
  }else if(drag){
    yaw-=(e.clientX-drag.x)*.0065;
    pitch=T.MathUtils.clamp(pitch+(e.clientY-drag.y)*.003,-.24,1.05);
  }
  drag={x:e.clientX,y:e.clientY};
});
for(const type of ['pointerup','pointercancel','lostpointercapture']){
  renderer.domElement.addEventListener(type,e=>{touches.delete(e.pointerId);drag=null;});
}
renderer.domElement.addEventListener('wheel',e=>{
  e.preventDefault();zoom=T.MathUtils.clamp(zoom*Math.exp(-e.deltaY*.001),.55,2.6);
  resize();
},{passive:false});
addEventListener('resize',resize);
resize();
function animate(ms){
  requestAnimationFrame(animate);
  if(document.hidden){prevMs=ms;return;}
  const dt=Math.min(.045,Math.max(0,(ms-prevMs)/1000));
  prevMs=ms;
  smoothedFrame=.93*smoothedFrame+.07*dt*1000;
  if(smoothedFrame>33&&quality>.68){
    quality=.68;renderer.setPixelRatio(1);
    paint.setQuality(.68);resize();
  }
  if(!paused)elapsed+=dt;
  monster.userData.tick(elapsed,paused?0:dt);
  fogs.forEach((fog,i)=>{
    fog.position.x=-9+i*2.2+Math.sin(elapsed*.17+i)*.51;
  });
  for(let i=0;i<mistCount;i++){
    const n=i*3;
    mistPos[n]=(rnd(i+51)-.5)*14+Math.sin(elapsed*.24+i)*.25;
    mistPos[n+1]=.18+((rnd(i+105)*5+elapsed*.08)%5);
    mistPos[n+2]=(rnd(i+91)-.5)*12;
  }
  mist.attributes.position.needsUpdate=true;
  const pulse=monster.userData.pulse||0;
  fear+=(pulse-fear)*(pulse>fear?.5:Math.min(1,dt*2.2));
  faceLight.intensity=26*(.86+.09*Math.sin(elapsed*.58)+.05*Math.sin(elapsed*7.3)*Math.sin(elapsed*1.9))+12*fear;
  // Heavy cinematic camera: it chases the orbit and the head with a lag,
  // and gets kicked by snaps and landings.
  const rig=monster.userData.rig;
  rig.head.getWorldPosition(headPos);
  const swell=rig.head.scale.z-1;
  const wantY=mode==='face'?headPos.y-.05-1.7*swell:info[mode].target+(headPos.y-4.31)*.35;
  swellS+=(swell-swellS)*(1-Math.exp(-dt*4));
  faceLight.position.set(.25,3.55-1.5*swellS,2.9+1.6*swellS);faceLight.distance=7.5+5*swellS;
  faceLight.intensity+=30*swellS;
  camera.zoom=zoom/(1+(mode==='face'?.85:.12)*swellS);camera.updateProjectionMatrix();
  const kcam=1-Math.exp(-dt*3.2),korb=1-Math.exp(-dt*7);
  camY+=(wantY-camY)*kcam;
  yawS+=(yaw-yawS)*korb;pitchS+=(pitch-pitchS)*korb;
  const shake=fear*fear*.07;
  const targetY=camY+shake*Math.sin(elapsed*61),d=13.5;
  camera.position.set(Math.sin(yawS)*Math.cos(pitchS)*d+shake*Math.sin(elapsed*47),
    targetY+Math.sin(pitchS)*d,Math.cos(yawS)*Math.cos(pitchS)*d);
  camera.lookAt(shake*Math.sin(elapsed*47),targetY,0);
  monster.userData.lookTarget=camera.position;
  paint.tick(ms);
  post.uniforms.uTime.value=elapsed;post.uniforms.uFear.value=fear;
  renderer.setRenderTarget(target);renderer.render(scene,camera);
  renderer.setRenderTarget(null);renderer.render(postScene,postCamera);
  renderedFrames++;
}
requestAnimationFrame(animate);
window.__INK_GRIN_MONSTER__={
  ready:true,model:monster,scene,camera,show,play:n=>monster.userData.play(n),
  pause:()=>{paused=true;pauseButton.textContent='Запустить анимацию';},
  resume:()=>{paused=false;pauseButton.textContent='Остановить анимацию';},
  stats:()=>{
    let meshes=0,triangles=0;
    monster.traverse(o=>{
      if(o.isMesh&&o.name!=='__livingWatercolorOutline'){
        meshes++;
        const g=o.geometry;
        triangles+=g?.index?g.index.count/3:(g?.attributes?.position?.count||0)/3;
      }
    });
    return {mode,meshes,triangles,renderedFrames,elapsed,quality,smoothedFrame};
  }
};