/* HERO ANIMATOR — offline playable WebGL/GLSL renderer. Only approved GIF-derived pixels
   are used for visible world artwork. Native WebGL2 is a resilient fallback when the
   optional Three.js CDN cannot be reached, e.g. a local file:// opened offline. */
async function bootOffline(manifest, imageUrls) {
'use strict';
const $=s=>document.querySelector(s);
const canvas=$('#game'), loading=$('#loading');
const images=new Map(), textures=new Map();
const clips=Object.fromEntries(manifest.clips.map(c=>[c.id,c]));
const role=id=>clips[manifest.roles[id]] || null;
const bg=role('background'), portal=role('portal'), idle=role('idle')||role('walk')||role('attack');
const walk=role('walk')||idle, run=role('run')||walk, attack=role('attack');
const jumpClip=role('jump'), crouchClip=role('crouch'), pickupClip=role('pickup');
const segments=manifest.segments||{};
function actionInfo(action){
 const r=segments[action],clip=r?clips[r.clip]||role(action):role(action);
 if(!clip)return null;
 const all=Array.from({length:clip.frameCount},(_,i)=>i);
 const frames=r?.frames?.length ? r.frames.filter(i=>Number.isInteger(i)&&i>=0&&i<clip.frameCount) :
   (['idle','crouch','pickup'].includes(action) ? [0] :
    (['walk','run'].includes(action)&&clip.id===idle?.id ? [0] : all));
 return {clip,frames:frames.length?frames:[0],loop:action==='walk'||action==='run'};
}
const actionSpecs=Object.fromEntries(['idle','walk','run','crouch','jump','attack','pickup'].map(a=>[a,actionInfo(a)]));
const effects=manifest.roles.extras.map(id=>clips[id]).filter(Boolean);
const keys=new Set(), pulses=new Set(), player={x:-4.3,y:0,z:0,vx:0,vy:0,grounded:true,face:1,attackTimer:0,attackClipTime:0},
  control={win:false,fx:true,camX:0,t:0,quality:Math.min(1.5,window.devicePixelRatio||1)};
const gl=canvas.getContext('webgl2',{alpha:false,antialias:true,powerPreference:'high-performance',premultipliedAlpha:false,depth:true});
const ctx=!gl ? canvas.getContext('2d',{alpha:false}) : null;
if (!gl && !ctx) throw Error('В браузере недоступны WebGL2 и Canvas2D');
function message(s){loading.style.letterSpacing='.05em';loading.style.fontSize='14px';loading.textContent=s;}
const imagesLoaded=await Promise.all(manifest.clips.map(c=>new Promise((resolve,reject)=>{
 const im=new Image(); im.decoding='async';
 im.onload=()=>{
   if(im.naturalWidth!==c.sheetWidth||im.naturalHeight!==c.sheetHeight)reject(Error('Размер текстуры неверен: '+c.name));
   else {images.set(c.id,im);resolve();}
 };
 im.onerror=()=>reject(Error('Не удалось загрузить рисунок '+c.name));
 if(!imageUrls[c.sheet])return reject(Error('Отсутствует встроенный атлас '+c.sheet));
 im.src=imageUrls[c.sheet];
})));
const durations=new Map(manifest.clips.map(c=>[c.id,c.timings.reduce((a,b)=>a+b,0)/1000]));
const hitState={attack:false,jump:false,interact:false};
function frame(clip,seconds,action=null){
 const info=action ? actionSpecs[action] : null;
 const indices=info&&info.clip.id===clip.id?info.frames:null;
 if(!indices){const total=durations.get(clip.id)||.1;let t=((seconds%total)+total)%total*1000;
  for(let i=0;i<clip.frameCount-1;i++) {if(t<clip.timings[i])return i;t-=clip.timings[i];}return clip.frameCount-1;}
 if(indices.length===1)return indices[0];
 const total=indices.reduce((sum,i)=>sum+clip.timings[i],0);
 let t=info.loop?((seconds*1000)%total+total)%total:Math.min(Math.max(0,seconds*1000),total-.001);
 for(let j=0;j<indices.length-1;j++){if(t<clip.timings[indices[j]])return indices[j];t-=clip.timings[indices[j]];}
 return indices[indices.length-1];
}
function bindButton(id,code){
 const b=$('#'+id);if(!b)return;
 function release(e){e.preventDefault();keys.delete(code);b.classList.remove('pressed');}
 b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);if(!keys.has(code))pulses.add(code);keys.add(code);b.classList.add('pressed');});
 b.addEventListener('pointerup',release);b.addEventListener('pointercancel',release);b.addEventListener('lostpointercapture',release);
}
for(const [id,code] of [['left','ArrowLeft'],['right','ArrowRight'],['run','ShiftLeft'],['crouch','ArrowDown'],['jump','ArrowUp'],['attack','KeyJ'],['interact','KeyE']]) bindButton(id,code);
window.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','KeyJ','KeyE','KeyA','KeyD','KeyW','KeyS','ShiftLeft','ShiftRight'].includes(e.code))e.preventDefault();if(!e.repeat && !keys.has(e.code))pulses.add(e.code);keys.add(e.code);if(e.code==='KeyR'&&control.win)location.reload();});
window.addEventListener('keyup',e=>keys.delete(e.code));
function clearInputs(){keys.clear();pulses.clear();for(const b of document.querySelectorAll('button.pressed'))b.classList.remove('pressed');}
window.addEventListener('blur',clearInputs);document.addEventListener('visibilitychange',()=>{if(document.hidden)clearInputs();});
$('#full').onclick=()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.();
$('#fx').onclick=()=>{control.fx=!control.fx;$('#fx').classList.toggle('active',control.fx);};
$('#restart').onclick=()=>location.reload();
const pressed=(...codes)=>codes.some(code=>keys.has(code));
const PORTAL_X=6.8,HALF_H=4.5, groundY=0;
let width=innerWidth,height=innerHeight, halfW=HALF_H*width/height,ctxW=width,ctxH=height;
function resize(){
  width=Math.max(1,innerWidth);height=Math.max(1,innerHeight);halfW=HALF_H*width/height;
  canvas.width=Math.max(1,Math.round(width*control.quality));canvas.height=Math.max(1,Math.round(height*control.quality));
  ctxW=canvas.width;ctxH=canvas.height;if(gl)gl.viewport(0,0,ctxW,ctxH);
}
window.addEventListener('resize',resize);resize();
function tick(dt){
 control.t+=dt;
 if(!control.win){
   const crouching=pressed('ArrowDown','KeyS') && player.grounded;
   const dir=crouching?0:(pressed('ArrowRight','KeyD')?1:0)-(pressed('ArrowLeft','KeyA')?1:0);
   const speed=pressed('ShiftLeft','ShiftRight')?5.7:3.8;
   player.vx=dir*speed;
   if(dir)player.face=Math.sign(dir);
   player.x=Math.max(-10,Math.min(10,player.x+player.vx*dt));
   const jump=pressed('ArrowUp','KeyW','Space');
   if((jump&&!hitState.jump||pulses.has('ArrowUp')||pulses.has('KeyW')||pulses.has('Space'))&&player.grounded){player.vy=6.25;player.grounded=false;}
   hitState.jump=jump;
   player.vy-=17*dt;player.y+=player.vy*dt;
   if(player.y<=groundY){player.y=groundY;player.vy=0;player.grounded=true;}
   const attackNow=pressed('KeyJ');
   if((attackNow&&!hitState.attack||pulses.has('KeyJ'))&&attack&&!player.attackTimer){player.attackTimer=durations.get(attack.id)||.3;player.attackClipTime=0;}
   hitState.attack=attackNow;
   if(player.attackTimer>0){player.attackTimer=Math.max(0,player.attackTimer-dt);player.attackClipTime+=dt;}
   // Physically the character and portal occupy 3D AABB volumes; visual sprites do not collide.
   const near=!!portal && Math.abs(player.x-PORTAL_X)<1.75 && player.y<2.8 && Math.abs(player.z-(-1.4))<1.8;
   const interact=pressed('KeyE');
   $('#hint').textContent=near?'E — ВОЙТИ В ПОРТАЛ':'← → ХОДЬБА · SHIFT БЕГ · ↑ / SPACE ПРЫЖОК · ↓ ПРИСЕСТЬ · J АТАКА · E ПОРТАЛ';
   if((interact&&!hitState.interact||pulses.has('KeyE'))&&near){control.win=true;$('#victory').hidden=false;}
   hitState.interact=interact;
 }
 pulses.clear();
 control.camX+=(player.x*.76-control.camX)*Math.min(1,dt*3.2);
}
function actorAction(){
 if(player.attackTimer>0&&actionSpecs.attack)return 'attack';
 if(!player.grounded&&actionSpecs.jump)return 'jump';
 if(player.grounded&&pressed('ArrowDown','KeyS')&&actionSpecs.crouch)return 'crouch';
 if(Math.abs(player.vx)>.1)return pressed('ShiftLeft','ShiftRight')&&actionSpecs.run?'run':(actionSpecs.walk?'walk':'idle');
 return 'idle';
}
let program,quad,uniforms,pointsProg,pointsBuffer,pointCount=90;
if(gl){
  const VS=`#version 300 es
    in vec2 aXY; uniform vec4 uPositionSize;uniform vec2 uViewport;uniform vec4 uUV;uniform float uFlip;
    out vec2 vUV;
    void main(){vec2 p=vec2(aXY.x*uFlip,aXY.y)*uPositionSize.zw+uPositionSize.xy;
      gl_Position=vec4(p/uViewport,0.0,1.0);
      vUV=vec2(uUV.x+(aXY.x+0.5)*uUV.z,uUV.y+(aXY.y+0.5)*uUV.w);
    }`;
  const FS=`#version 300 es
    precision mediump float;in vec2 vUV;uniform sampler2D uTexture;out vec4 frag;
    void main(){vec4 c=texture(uTexture,vUV);if(c.a<0.015)discard;frag=c;}`;
  const FXS=`#version 300 es
    precision mediump float;in float vGlow;out vec4 frag;
    void main(){vec2 p=gl_PointCoord-.5;float a=smoothstep(.5,.0,length(p));
      frag=vec4(1.0,.28+.42*vGlow,.05,a*.36);}`;
  const FXV=`#version 300 es
    in vec3 aSeedPosition;uniform vec2 uViewport;uniform float uTime;uniform float uCameraX;uniform float uPixelRatio;
    out float vGlow;
    void main(){float speed=.12+fract(aSeedPosition.z)*.25;float y=mod(aSeedPosition.y+uTime*speed,7.0);
      float x=aSeedPosition.x+sin(uTime*.38+aSeedPosition.z*11.)*.12-uCameraX*.72;
      gl_Position=vec4(x/uViewport.x,(y-1.5)/uViewport.y,0.,1.);
      gl_PointSize=(2.+2.5*fract(aSeedPosition.z*11.))*uPixelRatio;vGlow=fract(aSeedPosition.z*31.);}`;
  function compile(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('GLSL: '+gl.getShaderInfoLog(s));return s;}
  function makeProgram(v,f){let p=gl.createProgram();gl.attachShader(p,compile(gl.VERTEX_SHADER,v));gl.attachShader(p,compile(gl.FRAGMENT_SHADER,f));gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error('GPU shader: '+gl.getProgramInfoLog(p));return p;}
  program=makeProgram(VS,FS);pointsProg=makeProgram(FXV,FXS);
  quad=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,quad);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-.5,-.5,.5,-.5,-.5,.5,.5,.5]),gl.STATIC_DRAW);
  uniforms={pos:gl.getUniformLocation(program,'uPositionSize'),view:gl.getUniformLocation(program,'uViewport'),uv:gl.getUniformLocation(program,'uUV'),flip:gl.getUniformLocation(program,'uFlip'),tex:gl.getUniformLocation(program,'uTexture')};
  for(const c of manifest.clips){
    const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,images.get(c.id));
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    textures.set(c.id,t);
  }
  const pts=new Float32Array(pointCount*3);
  for(let i=0;i<pointCount;i++){
    const s=((i*92821+53119)%65521)/65521,q=((i*17389+21611)%64513)/64513,r=((i*56311+63509)%64283)/64283;
    pts[i*3]=(s-.5)*23;pts[i*3+1]=q*7;pts[i*3+2]=r*10+q;
  }
  pointsBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,pointsBuffer);gl.bufferData(gl.ARRAY_BUFFER,pts,gl.STATIC_DRAW);
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.disable(gl.DEPTH_TEST);
}
function drawGL(clip,tm,x,y,w,h,parallax=1,flip=1,action=null){
  if(!clip)return;
  gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,quad);
  const loc=gl.getAttribLocation(program,'aXY');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  const fr=frame(clip,tm,action),col=fr%clip.cols,row=Math.floor(fr/clip.cols),u0=col*clip.width/clip.sheetWidth,u1=clip.width/clip.sheetWidth,
     v0=1-(row+1)*clip.height/clip.sheetHeight,v1=clip.height/clip.sheetHeight;
  gl.uniform4f(uniforms.pos,x-control.camX*parallax,y,w,h);
  gl.uniform2f(uniforms.view,halfW,HALF_H);
  gl.uniform4f(uniforms.uv,u0,v0,u1,v1);gl.uniform1f(uniforms.flip,flip);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,textures.get(clip.id));gl.uniform1i(uniforms.tex,0);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
}
function draw2D(clip,tm,x,y,w,h,parallax=1,flip=1,action=null){
  if(!clip)return;
  const sx=(x-control.camX*parallax)/halfW*ctxW*.5+ctxW*.5,
  sy=ctxH*.5-(y/HALF_H)*ctxH*.5,sw=w/(2*halfW)*ctxW,sh=h/(2*HALF_H)*ctxH;
  const fr=frame(clip,tm,action),col=fr%clip.cols,row=Math.floor(fr/clip.cols);
  ctx.save();ctx.translate(sx,sy);ctx.scale(flip,1);
  ctx.drawImage(images.get(clip.id),col*clip.width,row*clip.height,clip.width,clip.height,-sw*.5,-sh*.5,sw,sh);
  ctx.restore();
}
function drawParticles(){
  if(!control.fx)return;
  if(!gl){
    ctx.save();ctx.fillStyle='rgba(255,124,25,.5)';
    for(let i=0;i<75;i++){
      let x=((i*92821+53119)%65521)/65521*23-11.5-control.camX*.72,
      y=((i*17389+21611)%64513)/64513*7+control.t*(.12+(i%7)*.042);
      y%=7;const px=ctxW/2+x/halfW*ctxW/2,py=ctxH/2-(y-1.5)/HALF_H*ctxH/2;
      ctx.beginPath();ctx.arc(px,py,1.2*control.quality,0,2*Math.PI);ctx.fill();
    }ctx.restore();return;
  }
  gl.useProgram(pointsProg);gl.bindBuffer(gl.ARRAY_BUFFER,pointsBuffer);
  let l=gl.getAttribLocation(pointsProg,'aSeedPosition');gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,3,gl.FLOAT,false,0,0);
  gl.uniform2f(gl.getUniformLocation(pointsProg,'uViewport'),halfW,HALF_H);
  gl.uniform1f(gl.getUniformLocation(pointsProg,'uTime'),control.t);
  gl.uniform1f(gl.getUniformLocation(pointsProg,'uCameraX'),control.camX);
  gl.uniform1f(gl.getUniformLocation(pointsProg,'uPixelRatio'),control.quality);
  gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.drawArrays(gl.POINTS,0,pointCount);
  gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
}
const draw=gl?drawGL:draw2D;
function render(){
  if(gl){gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(.07,.052,.04,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);}else{
   ctx.fillStyle='#18120e';ctx.fillRect(0,0,ctxW,ctxH);
  }
  if(bg) draw(bg,control.t,0,1.6,Math.max(26,11.95*bg.width/bg.height),11.95,.23,1);
  for(let i=0;i<effects.length;i++){
   const c=effects[i],h=c.alpha?2.1:8.6;
   draw(c,control.t,i*3.5-8,c.alpha?1.5:1.5,h*c.width/c.height,h,c.alpha?1:.35,1);
  }
  if(portal)draw(portal,control.t,PORTAL_X,-0.68,3.55*portal.width/portal.height,3.55,1,1);
  const action=actorAction(), info=actionSpecs[action]||actionSpecs.idle;
  if(info){
    const c=info.clip;
    const tm=action==='attack'?player.attackClipTime:action==='idle'?0:control.t;
    draw(c,tm,player.x,player.y-0.95,3.05*c.width/c.height,3.05,1,player.face,action);
  }
  drawParticles();
}
let last=performance.now(),samples=0,frames=0,elapsed=0;
let cancel=false;
function loop(now){
 if(cancel)return;requestAnimationFrame(loop);
 const dt=Math.min(Math.max(0,(now-last)/1000),.045);last=now;
 if(!document.hidden)tick(dt);
 render();
 elapsed+=dt;samples+=dt;frames++;
 if(elapsed>2.5){
   const fps=Math.round(frames/Math.max(.01,samples));$('#fps').textContent=fps+' FPS';
   if(fps<45&&control.quality>.8){control.quality=Math.max(.8,control.quality-.2);resize();}
   else if(fps>58&&control.quality<Math.min(1.5,devicePixelRatio||1)){
     control.quality=Math.min(1.5,devicePixelRatio||1,control.quality+.1);resize();
   }
   elapsed=0;samples=0;frames=0;
 }
}
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancel=true;message('Потерян графический контекст. Обновите страницу.');});
loading.remove();requestAnimationFrame(loop);
}
