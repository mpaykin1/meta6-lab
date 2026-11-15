import * as T from 'three';
import {createLivingWatercolor3D,createWatercolorStyle}
  from '../../reference/ink-fallen-guardian/shared/living-watercolor-3d.js';
import {createInkNightTrain} from '../../demos/living-watercolor/ink-night-train.js';

const SPEED=36;                       // world units per second at full run
const scene=new T.Scene();
scene.background=new T.Color('#000000');
scene.fog=new T.FogExp2('#000000',.05);
const camera=new T.PerspectiveCamera(40,innerWidth/innerHeight,.1,420);
const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance',preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.3));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=T.SRGBColorSpace;
renderer.toneMapping=T.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.0;
document.body.insertBefore(renderer.domElement,document.body.firstChild);
const style=createWatercolorStyle({
  seed:'ink-night-express-dark-living-paint',inkColor:'#0b0f12',
  paperColor:'#20282a',washColor:'#424f51',washOpacity:.70,
  washLayers:7,edgeWidth:.020,edgeJitter:.24,granulation:.34,
  bleed:.18,shadowWash:.18,motion:.11,pigmentPooling:.27,
  paperGap:.08,paintedLight:.64
});
const paint=createLivingWatercolor3D({THREE:T,renderer,scene,camera,style});
scene.add(new T.HemisphereLight('#7e8f99','#000000',.02));
const rim=new T.DirectionalLight('#8fb0c4',.05);rim.position.set(-30,14,-24);scene.add(rim);

const rnd=i=>{const f=Math.sin(i*127.1+39.4)*43758.5453;return f-Math.floor(f);};
const wrap=(x,L)=>((x%L)+L)%L-L/2;
// ---------- the world that streams past ----------
const world=new T.Group();scene.add(world);
const gc=document.createElement('canvas');gc.width=gc.height=256;
{const x=gc.getContext('2d');x.fillStyle='#777';x.fillRect(0,0,256,256);
 for(let i=0;i<2600;i++){const v=40+Math.floor(rnd(i)*170);x.fillStyle=`rgb(${v},${v},${v})`;
  x.globalAlpha=.25+rnd(i+9)*.5;x.fillRect(rnd(i+3)*256,rnd(i+5)*256,1+rnd(i+7)*3,1+rnd(i+8)*2);}}
const groundTex=new T.CanvasTexture(gc);groundTex.wrapS=groundTex.wrapT=T.RepeatWrapping;groundTex.repeat.set(60,30);
groundTex.colorSpace=T.SRGBColorSpace;
const ground=new T.Mesh(new T.PlaneGeometry(480,240),new T.MeshBasicMaterial({color:'#000000'}));
ground.rotation.x=-Math.PI/2;world.add(ground);
const ballastTex=groundTex.clone();ballastTex.repeat.set(120,2);ballastTex.needsUpdate=true;
const ballast=new T.Mesh(new T.BoxGeometry(480,.12,4.6),new T.MeshStandardMaterial({color:'#07090a',map:ballastTex,roughness:.95}));
ballast.position.y=.05;world.add(ballast);
const railMat=new T.MeshStandardMaterial({color:'#9aa4aa',roughness:.26,metalness:.95});
for(const z of [-.76,.76]){const r=new T.Mesh(new T.BoxGeometry(480,.13,.09),railMat);r.position.set(0,.185,z);world.add(r);}
const SL=.8,sleepers=new T.InstancedMesh(new T.BoxGeometry(.27,.09,2.7),new T.MeshStandardMaterial({color:'#15191b',roughness:1}),300);
{const d=new T.Object3D();for(let i=0;i<300;i++){d.position.set(-130+i*SL,.115,0);d.updateMatrix();sleepers.setMatrixAt(i,d.matrix);}}
world.add(sleepers);
const wire=new T.Mesh(new T.CylinderGeometry(.018,.018,480,4),new T.MeshStandardMaterial({color:'#5d676c',roughness:.4,metalness:.8}));
wire.rotation.z=Math.PI/2;wire.position.set(0,5.76,0);
// masts and bare trees wrap around: endless line, nothing ever ends
const movers=[];
// pure black silhouettes: they exist only where they cut the light
const dark=new T.MeshBasicMaterial({color:'#000000',fog:false});
for(let i=0;i<0;i++){
  const g=new T.Group();
  const pole=new T.Mesh(new T.CylinderGeometry(.11,.15,7.4,6),dark);pole.position.y=3.7;g.add(pole);
  const arm=new T.Mesh(new T.BoxGeometry(.09,.09,4.2),dark);arm.position.set(0,6.3,2.0);g.add(arm);
  const stay=new T.Mesh(new T.BoxGeometry(.05,.05,3.3),dark);stay.position.set(0,6.95,1.5);stay.rotation.x=.42;g.add(stay);
  g.position.z=-4.1;world.add(g);movers.push({g,x0:i*90+37,L:360});
}
function deadTree(height,seed){
  const g=new T.Group(),r=n=>rnd(n+seed);
  const p=[new T.Vector3(0,0,0),new T.Vector3(-.15+r(1)*.3,height*.3,.1),
    new T.Vector3(.2-r(4)*.4,height*.65,-.08),new T.Vector3((r(9)-.5)*.5,height,0)];
  g.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(p),10,.085,5),dark));
  for(let i=0;i<7;i++){
    const h=.28+i*.1,side=i%2?1:-1,start=p[1].clone().lerp(p[3],h);
    const end=start.clone().add(new T.Vector3(side*(.6+r(i)*.7),.5+r(i+13)*1.1,(r(i+5)-.5)*1.2));
    const c=new T.CatmullRomCurve3([start,start.clone().lerp(end,.5).add(new T.Vector3(0,.22,0)),end]);
    g.add(new T.Mesh(new T.TubeGeometry(c,6,.03,4),dark));
  }
  return g;
}
// tall bare saplings close to the line, between the eye and the beam
for(let i=0;i<16;i++){
  const g=deadTree(4.6+rnd(i+70)*3.4,i*17+5);
  const near=i%4!==3;
  g.position.z=near?2.1+rnd(i+11)*1.9:-(2.6+rnd(i+11)*5);
  g.scale.set(.8,1,.8);
  g.rotation.y=rnd(i+2)*6.28;world.add(g);movers.push({g,x0:i*17.5+rnd(i+31)*9,L:280});
}
// fog banks: brighter when they cross the searchlight
const fc=document.createElement('canvas');fc.width=fc.height=128;
{const x=fc.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,63);
 g.addColorStop(0,'rgba(210,220,235,.5)');g.addColorStop(.5,'rgba(180,195,215,.16)');g.addColorStop(1,'rgba(180,195,215,0)');
 x.fillStyle=g;x.fillRect(0,0,128,128);}
const fogTex=new T.CanvasTexture(fc),fogs=[];
for(let i=0;i<0;i++){
  const s=new T.Sprite(new T.SpriteMaterial({map:fogTex,color:'#aab8c8',transparent:true,opacity:.05,depthWrite:false,blending:T.AdditiveBlending,fog:false}));
  s.position.set(0,.8+rnd(i+3)*3.2,(rnd(i+8)-.5)*14);
  s.scale.set(9+rnd(i)*9,2.2+rnd(i+1)*3,1);world.add(s);fogs.push({s,x0:rnd(i+40)*220,L:220,par:.82+rnd(i+6)*.3});
}
// GPU streaks (drizzle and dust) and far village lights: wrapped in the vertex shader
function streaks(count,L,sizeFn,parFn,placeFn,color,alpha){
  const pos=new Float32Array(count*3),aux=new Float32Array(count*2);
  for(let i=0;i<count;i++){const p=placeFn(i);pos.set(p,i*3);aux[i*2]=parFn(i);aux[i*2+1]=sizeFn(i);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));
  g.setAttribute('aux',new T.BufferAttribute(aux,2));
  const m=new T.ShaderMaterial({uniforms:{uDist:{value:0},uL:{value:L},uColor:{value:new T.Color(color)},uA:{value:alpha},uPx:{value:1}},
    transparent:true,depthWrite:false,blending:T.AdditiveBlending,
    vertexShader:`attribute vec2 aux;uniform float uDist,uL,uPx;varying float vF;
      void main(){vec3 p=position;p.x=mod(p.x-uDist*aux.x,uL)-uL*.5;
      vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
      gl_PointSize=clamp(aux.y*uPx*46./max(1.,-mv.z),1.,9.);vF=exp(-.03*max(0.,-mv.z-8.));}`,
    fragmentShader:`uniform vec3 uColor;uniform float uA;varying float vF;
      void main(){vec2 c=gl_PointCoord-.5;float d=smoothstep(.5,0.,length(c*vec2(1.,2.6)));
      gl_FragColor=vec4(uColor*uA*d*vF,1.);}`});
  const pts=new T.Points(g,m);pts.frustumCulled=false;world.add(pts);return m;
}
const drizzle=streaks(700,140,i=>.5+rnd(i+1)*.9,i=>.9+rnd(i+2)*.25,
  i=>[rnd(i+3)*140,.2+rnd(i+4)*6.5,(rnd(i+5)-.5)*26],'#b9c6d8',0);
const farLights=streaks(46,420,i=>18.+rnd(i+71)*16.,i=>.035+rnd(i+72)*.05,
  i=>[rnd(i+73)*420,1.2+rnd(i+74)*5,(i%2?1:-1)*(60+rnd(i+75)*45)],'#ffd9a0',0);
farLights.fragmentShader=farLights.fragmentShader.replace('*vF','').replace('vec2(1.,2.6)','vec2(1.7,1.7)');farLights.needsUpdate=true;

// ---------- the train ----------
const train=createInkNightTrain({cars:7,seed:7,look:{
  glareBase:1.5,glareGain:3.4,glareDepthTest:true,smallBase:.7,smallGain:.55,
  beamLen:[84,58],beamRad:[4.6,8.5],beamI:[.72,.2],cab:.22,beamBody:.02,beamPow:2.6,beamFall:1.9,tilt:.06,
  spot:800,nose:0,warm:3,spill:.06,mullions:true,halo:9,minGlare:.075,minSmall:.02,minHalo:.3,bodyColor:'#07090a'}});
scene.add(train);
// no wash here: the body must stay inside the dark, only light draws the train
const LEN=train.userData.length;

// ---------- old-film post: bloom for windows and lamp, soft focus, grain ----------
let fear=0,fade=1;
const target=new T.WebGLRenderTarget(2,2,{type:T.HalfFloatType,depthBuffer:true});
const post=new T.ShaderMaterial({
  uniforms:{tMap:{value:target.texture},uTime:{value:0},uFear:{value:0},uFade:{value:1},uRes:{value:new T.Vector2(2,2)}},
  depthTest:false,depthWrite:false,
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:`
    uniform sampler2D tMap;uniform float uTime,uFear,uFade;uniform vec2 uRes;varying vec2 vUv;
    float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    vec3 soft(vec2 uv,vec2 px){
      vec3 c=texture2D(tMap,uv).rgb*.36;
      c+=texture2D(tMap,uv+px*vec2(1.3,.6)).rgb*.16;c+=texture2D(tMap,uv+px*vec2(-1.3,-.6)).rgb*.16;
      c+=texture2D(tMap,uv+px*vec2(.6,-1.3)).rgb*.16;c+=texture2D(tMap,uv+px*vec2(-.6,1.3)).rgb*.16;
      return c;
    }
    vec3 bright(vec2 uv){vec3 c=min(texture2D(tMap,uv).rgb,vec3(1.6));return c*smoothstep(.7,1.5,max(c.r,max(c.g,c.b)));}
    void main(){
      vec2 uv=vUv,c=uv-.5;float r=length(c);
      float line=floor(uv.y*90.);
      float g=step(.93-.25*uFear,h(vec2(line,floor(uTime*14.))))*uFear;
      uv.x+=g*(h(vec2(line,uTime))-.5)*.04;
      uv+=vec2(sin(uTime*.9),cos(uTime*.7))*.0012;
      vec2 px=(1.4+2.0*r)/uRes;
      float ab=(.0022+.006*uFear)*r*2.;
      vec3 col=soft(uv,px);
      col.r=soft(uv+c*ab,px).r;col.b=soft(uv-c*ab,px).b;
      float l=dot(col,vec3(.3,.59,.11));
      col=mix(col,vec3(l)*vec3(1.03,1.,1.0),.8);
      float flick=.94+.04*sin(uTime*11.)*sin(uTime*2.3)+.03*h(vec2(floor(uTime*9.),3.));
      col*=flick*smoothstep(1.0,.25,r)*uFade;
      gl_FragColor=vec4(col,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      float n=h(gl_FragCoord.xy+fract(uTime)*91.7)-.5;
      float scr=step(.997,h(vec2(floor(gl_FragCoord.x/2.),floor(uTime*10.))))*.045;
      float lum=dot(gl_FragColor.rgb,vec3(.33));
      gl_FragColor.rgb+=n*(.012+.09*lum+.05*uFear)+scr*lum*4.;
    }`
});
const postScene=new T.Scene(),postCamera=new T.OrthographicCamera(-1,1,1,-1,0,1);
const quad=new T.Mesh(new T.PlaneGeometry(2,2),post);quad.frustumCulled=false;postScene.add(quad);

// ---------- views, menu, input ----------
const ui=document.querySelector('#panel'),menuButton=document.querySelector('#menu-btn');
menuButton.onclick=()=>{ui.hidden=!ui.hidden;menuButton.setAttribute('aria-expanded',String(!ui.hidden));};
// orbit views are given in train space: target, yaw (0 = straight ahead of the nose), pitch, distance
const VIEWS={
  front:{t:[-2,4.2,-2],yaw:.17,pitch:-.05,d:52},
  side:{t:[-30,2.2,0],yaw:1.32,pitch:.07,d:27},
  chase:{t:[-LEN+6,2.3,0],yaw:2.82,pitch:.1,d:17}
};
let mode='flyby',paused=false,yaw=0,pitch=0,zoom=1,flyX=150;
let yawS=yaw,pitchS=pitch,elapsed=0,prevMs=0,renderedFrames=0,quality=1,smoothedFrame=16.7,dist=0,speedK=1;
const camT=new T.Vector3(-2,4.2,-2),camD={v:52},look=new T.Vector3(95,5,-5),want=new T.Vector3();
function show(kind){
  if(kind!=='flyby'&&!VIEWS[kind])return;
  mode=kind;zoom=1;
  if(VIEWS[kind]){yaw=VIEWS[kind].yaw;pitch=VIEWS[kind].pitch;}
  else{flyX=165;yaw=0;pitch=0;}
  ui.hidden=true;menuButton.setAttribute('aria-expanded','false');
}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.view)));
const pauseButton=document.querySelector('#pause');
function pauseToggle(){paused=!paused;pauseButton.textContent=paused?'Поехали':'Остановить';}
pauseButton.onclick=pauseToggle;
addEventListener('keydown',e=>{
  if(e.code==='Space'){e.preventDefault();pauseToggle();}
  const k={'1':'front','2':'side','3':'flyby','4':'chase'}[e.key];if(k)show(k);
});
function resize(){
  renderer.setSize(innerWidth,innerHeight);
  camera.aspect=innerWidth/Math.max(1,innerHeight);
  const pr=renderer.getPixelRatio()*.8;
  target.setSize(Math.max(2,Math.round(innerWidth*pr)),Math.max(2,Math.round(innerHeight*pr)));
  post.uniforms.uRes.value.set(target.width,target.height);
  drizzle.uniforms.uPx.value=farLights.uniforms.uPx.value=target.height/600;
}
let drag=null,pinch=0;const touches=new Map(),el=renderer.domElement;
el.addEventListener('pointerdown',e=>{
  el.setPointerCapture(e.pointerId);touches.set(e.pointerId,{x:e.clientX,y:e.clientY});drag={x:e.clientX,y:e.clientY};
  if(touches.size===2){const p=[...touches.values()];pinch=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);}
});
el.addEventListener('pointermove',e=>{
  if(!touches.has(e.pointerId))return;
  touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(touches.size===2){
    const p=[...touches.values()],d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);
    zoom=T.MathUtils.clamp(zoom*d/Math.max(1,pinch),.5,2.6);pinch=d;
  }else if(drag){
    yaw-=(e.clientX-drag.x)*.0065;
    pitch=T.MathUtils.clamp(pitch+(e.clientY-drag.y)*.003,-.05,1.1);
  }
  drag={x:e.clientX,y:e.clientY};
});
for(const type of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(type,e=>{touches.delete(e.pointerId);drag=null;});
el.addEventListener('wheel',e=>{e.preventDefault();zoom=T.MathUtils.clamp(zoom*Math.exp(-e.deltaY*.001),.5,2.6);},{passive:false});
addEventListener('resize',resize);resize();

function step(dt,ms){
  // the train never stops instantly: speed eases in and out
  speedK+=((paused?0:1)-speedK)*(1-Math.exp(-dt*1.1));
  const v=SPEED*speedK*(1+.03*Math.sin(elapsed*.37));
  elapsed+=dt*(.15+.85*speedK);dist+=v*dt;
  train.userData.tick(elapsed,dt,speedK,camera);
  // streaming world
  groundTex.offset.x=dist/8;ballastTex.offset.x=dist/4;
  sleepers.position.x=-(dist%SL);
  for(const m of movers)m.g.position.x=wrap(m.x0-dist,m.L);
  for(const f of fogs){
    const x=wrap(f.x0-dist*f.par,f.L);f.s.position.x=x;
    const inBeam=Math.exp(-Math.pow((x-18)/16,2))*Math.exp(-Math.pow(f.s.position.z/5,2));
    f.s.material.opacity=.035+.3*inBeam;
  }
  drizzle.uniforms.uDist.value=dist;farLights.uniforms.uDist.value=dist;
  const pulse=train.userData.pulse||0;
  // camera
  let shake=0,wantFade=1;
  if(mode==='flyby'){
    // the camera stands by the track; the train tears past it, then darkness, then again
    // the eye stands low by the line: a far light, a long shaft, the pass, darkness, again
    flyX-=v*dt;
    if(flyX<-LEN-30)flyX=165+rnd(Math.floor(elapsed))*25;
    wantFade=T.MathUtils.smoothstep(flyX,-LEN-28,-LEN-8)*(1-T.MathUtils.smoothstep(flyX,150,165));
    want.set(flyX,1.2+pitch*6,9);
    camera.position.lerp(want,1-Math.exp(-dt*30));
    // look past the line so the train sits low-left; lift the gaze as the lamp arrives
    const k2=1-T.MathUtils.smoothstep(flyX,2,70);
    want.set(flyX-55,5.0+1.2*k2+(camera.aspect<1?3.2:0),-5+yaw*30);
    look.lerp(want,1-Math.exp(-dt*3.2));
    const near=Math.exp(-Math.pow(Math.max(0,flyX-2)/7,2))*(flyX>-LEN-3?1:Math.exp(-Math.pow((flyX+LEN+3)/5,2)));
    shake=.045*near*speedK;
    camera.fov=(camera.aspect<1?58:44)/zoom;
  }else{
    const V=VIEWS[mode];
    want.fromArray(V.t);camT.lerp(want,1-Math.exp(-dt*2.6));
    camD.v+=(V.d-camD.v)*(1-Math.exp(-dt*2.6));
    const ko=1-Math.exp(-dt*6);yawS+=(yaw-yawS)*ko;pitchS+=(pitch-pitchS)*ko;
    const d=camD.v;
    want.set(camT.x+Math.cos(yawS)*Math.cos(pitchS)*d,Math.max(.6,camT.y+Math.sin(pitchS)*d),camT.z+Math.sin(yawS)*Math.cos(pitchS)*d);
    camera.position.lerp(want,1-Math.exp(-dt*5));
    look.lerp(camT,1-Math.exp(-dt*5));
    shake=.012*speedK;
    camera.fov=(camera.aspect<1?54:40)/zoom;
  }
  fear+=(pulse-fear)*(pulse>fear?.5:Math.min(1,dt*2.4));
  fade+=(wantFade-fade)*(1-Math.exp(-dt*9));
  shake+=fear*.05;
  camera.position.x+=shake*Math.sin(elapsed*53);camera.position.y+=shake*Math.sin(elapsed*71+1);
  camera.lookAt(look.x,look.y+shake*Math.sin(elapsed*47),look.z);
  camera.updateProjectionMatrix();
  paint.tick(ms);
  post.uniforms.uTime.value=elapsed;post.uniforms.uFear.value=fear;post.uniforms.uFade.value=fade;
}
function draw(){
  renderer.setRenderTarget(target);renderer.render(scene,camera);
  renderer.setRenderTarget(null);renderer.render(postScene,postCamera);
  renderedFrames++;
}
let manual=false;
function animate(ms){
  requestAnimationFrame(animate);
  if(document.hidden||manual){prevMs=ms;return;}
  const dt=Math.min(.045,Math.max(0,(ms-prevMs)/1000));prevMs=ms;
  smoothedFrame=.93*smoothedFrame+.07*dt*1000;
  if(smoothedFrame>33&&quality>.68){quality=.68;renderer.setPixelRatio(1);paint.setQuality(.68);resize();}
  step(dt,ms);draw();
}
requestAnimationFrame(animate);
window.__INK_NIGHT_TRAIN__={
  ready:true,model:train,scene,camera,show,
  pause:()=>{if(!paused)pauseToggle();},resume:()=>{if(paused)pauseToggle();},
  // deterministic stepping for checks: advance the simulation and draw one frame
  advance:(sec)=>{manual=true;for(let i=0;i<Math.round(sec/.016);i++)step(.016,performance.now());draw();},
  stats:()=>({mode,renderedFrames,elapsed,quality,smoothedFrame,dist,flyX})
};
