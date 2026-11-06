(()=>{'use strict';
// ABYSS GLOW play: owner-derived layered maw encounter in actual game.
// No changes to the accepted stand. Transparent overlay does not intercept touch.
const SIZE=[217,289], P=[108,168], atlas=new Image(),lights=new Image(),throatArt=new Image();
const lanternSide=new Image(),lanternFront=new Image(),invertedBells=new Image();
atlas.src='../assets/maw_front_v1/maw_front_atlas.png';
lights.src='../assets/maw_front_v1/maw_front_light8.png';
lanternSide.src='assets/lantern-ray/lantern_ray_side4.png';
lanternFront.src='assets/lantern-ray/lantern_ray_front.png';
invertedBells.src='assets/lantern-ray/inverted_bells_biome.png';
// Palette-locked 96x112 crop from sketches/maw_front_owner.png; embedded to avoid a third network request.
throatArt.src='data:image/png;base64,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';

// The live game renders the inherited maw and this cycle's pair in the existing #gl.
// This replaces the former Canvas2D path: no overlay canvas or second renderer is made.
if(startGpuEncounter({atlas,lights,throatArt,lanternSide,lanternFront,invertedBells}))return;
function startGpuEncounter(images){
 const gameCanvas=document.getElementById('gl');
 if(!gameCanvas)return false;
 const clamp=x=>Math.max(0,Math.min(1,x));
 const smooth=x=>{const a=clamp(x);return a*a*(3-2*a)};
 const imageReady=image=>image.complete?(image.naturalWidth?Promise.resolve(image):Promise.reject(new Error('image unavailable'))):new Promise((resolve,reject)=>{image.addEventListener('load',()=>resolve(image),{once:true});image.addEventListener('error',()=>reject(new Error('image unavailable')),{once:true})});

 const FIRST=8.5,PERIOD=38;
 let ready=false,gpu=null,start=0,gameFrame=-1,hiddenAt=0,lightDirection=1,lightX=Math.SQRT1_2,lightY=Math.SQRT1_2,lightDirty=true;
 let jawOpen=0,jawVelocity=0,targetCycle=-2,attackedCycle=-1,targetHero=null,heroSample=null,nextHeroSample=0;
 let worldWidth=1,worldHeight=1,cameraX=0,cameraY=0,aimX=0,aimY=0,cameraKick=0,retreatKickX=0,retreatKickY=0;
 let lanternX=0,lanternY=0,lanternStarted=false;
 const mawState={ready:false,visible:false,phase:'waiting',attackCount:0,avoidedCount:0,lastHit:false,reaction:'none',targetOffset:[0,0],cameraKick:0,z:-32,renderer:'main-webgl'};
 const lanternState={visible:false,front:false,side:true,guide:'finger-light',z:-24,biomePlanes:3,position:[0,0],renderer:'main-webgl'};
 Object.defineProperty(window,'__abyssPlayMaw',{value:mawState,configurable:false});
 window.__abyssLanternRay=()=>lanternState;
 const aimLight=event=>{
  const point=event.touches&&event.touches.length?event.touches[0]:event;
  if(!point||!Number.isFinite(point.clientX)||!Number.isFinite(point.clientY))return;
  const next=((Math.atan2(point.clientY-innerHeight*.47,point.clientX-innerWidth*.5)+Math.PI*2)/(Math.PI*.25)+8)%8;if(Math.abs(next-lightDirection)>.0001){lightDirection=next;const angle=next*Math.PI*.25;lightX=Math.cos(angle);lightY=Math.sin(angle);lightDirty=true}
 };
 addEventListener('pointerdown',aimLight,{passive:true});addEventListener('pointermove',aimLight,{passive:true});
 if(!('PointerEvent' in window)){addEventListener('touchstart',aimLight,{passive:true});addEventListener('touchmove',aimLight,{passive:true})}
 const sampleHero=(seconds,force)=>{
  if(!force&&seconds<nextHeroSample)return heroSample;
  nextHeroSample=seconds+.08;
  try{
   const stats=typeof window.__abyssStats==='function'?window.__abyssStats():(typeof window.__abyssPlayHero==='function'?window.__abyssPlayHero():null);
   if(stats&&Array.isArray(stats.hero)){
    if(!heroSample)heroSample=[0,0];heroSample[0]=Number(stats.hero[0])||0;heroSample[1]=Number(stats.hero[1])||0;
    worldWidth=Math.max(1,Number(stats.W)||worldWidth);worldHeight=Math.max(1,Number(stats.H)||worldHeight);
    cameraX=Array.isArray(stats.camera)?Number(stats.camera[0])||0:heroSample[0];cameraY=Array.isArray(stats.camera)?Number(stats.camera[1])||0:heroSample[1];
   }
  }catch(error){}
  return heroSample;
 };
 const frameQ={phase:'waiting',visible:0,scale:.68,open:0,light:0,impact:0,hit:false,cycle:-1};
 const setFrame=(phase,visible,scale,open,light,impact,hit,cycle)=>Object.assign(frameQ,{phase,visible,scale,open,light,impact,hit,cycle});
 const frameState=seconds=>{
  if(seconds<FIRST)return setFrame('waiting',0,.68,0,0,0,false,-1);
  const cycle=Math.floor((seconds-FIRST)/PERIOD),t=(seconds-FIRST)-cycle*PERIOD;
  if(t<1){const a=smooth(t);return setFrame('warning',.08+.34*a,.68+.04*a,0,.14+.76*a,0,false,cycle)}
  if(t<1.95){const a=smooth((t-1)/.95);return setFrame('emerge',.08+.92*a,.72+.23*a,a*.9,.46+.54*a,0,false,cycle)}
  if(t<2.68){
   const raw=(t-1.95)/.73,a=smooth(raw);let open;
   if(raw<.30)open=.9+.1*smooth(raw/.30);else if(raw<.48)open=1;else if(raw<.82)open=1-.95*smooth((raw-.48)/.34);else open=.05+.13*smooth((raw-.82)/.18);
   const impact=Math.sin(Math.PI*clamp((raw-.48)/.52));return setFrame('bite',1,.95+.08*a-.018*impact,open,1+.35*impact,impact,raw>=.78,cycle);
  }
  if(t<3.63){const a=smooth((t-2.68)/.95);return setFrame('retreat',1-a,1.03-.31*a,.38*(1-a),1-a,0,false,cycle)}
  return setFrame('waiting',0,.68,0,0,0,false,cycle);
 };
 const springJaw=(target,dt)=>{
  const step=Math.min(.05,Math.max(0,dt)),stiffness=target<jawOpen?150:92,damping=target<jawOpen?9.5:11.5;
  jawVelocity+=(target-jawOpen)*stiffness*step;jawVelocity*=Math.exp(-damping*step);
  jawOpen=Math.max(-.045,Math.min(1.075,jawOpen+jawVelocity*step));return Math.max(0,jawOpen);
 };
 function makeGpu(){
  const gl=gameCanvas.getContext('webgl2')||gameCanvas.getContext('webgl');if(!gl)return null;
  const webgl2=typeof WebGL2RenderingContext!=='undefined'&&gl instanceof WebGL2RenderingContext;
  const vaoExt=!webgl2&&gl.getExtension('OES_vertex_array_object'),initial=saveGl(gl,webgl2,vaoExt,2);
  const vertexBody=`precision highp float;
attribute vec2 aPos;attribute vec2 aUv;
uniform vec2 uViewport,uCenter,uSize,uPivot,uShift;uniform float uRotation,uMode,uTime,uPart;
varying vec2 vUv;
void main(){
 vec2 p=aPos*uSize*.5;
 if(uMode==3.0){float tail=(1.0-aUv.x)*.5,wing=sin(uTime*3.1-aUv.x*2.4),wingDelay=sin(uTime*3.1-aUv.x*2.4-aUv.y*1.8);p.y+=(sin(uTime*2.25-aUv.x*2.8)*.035*tail+wing*.018*(1.-tail)+wingDelay*.012*aUv.y)*uSize.y;p.x+=sin(uTime*1.35+aUv.y*2.1)*uSize.x*.012;}
 vec2 pivot=uPivot*uSize;
 if(uMode==0.0){float c=cos(uRotation),s=sin(uRotation);p-=pivot;p=mat2(c,-s,s,c)*p;p+=pivot;}
 vec2 px=uCenter+p+uShift;
 gl_Position=vec4(px.x/uViewport.x*2.0-1.0,1.0-px.y/uViewport.y*2.0,0.0,1.0);vUv=aUv;
}`;
  const fragmentBody=`precision highp float;
uniform sampler2D tAtlas,tLight,tThroat,tSide,tFront,tBiome;
uniform vec2 uViewport,uLightDir,uHeroCenter,uHeroInvRadius,uBiomeDrift2;uniform vec4 uBiomeDrift01;uniform float uTime,uMode,uPart,uAlpha,uGlow,uImpact,uFlip,uLightIndex;
varying vec2 vUv;
vec3 pal(float i){if(i<.5)return vec3(0.0);if(i<1.5)return vec3(62.,21.,0.)/255.;if(i<2.5)return vec3(112.,39.,0.)/255.;if(i<3.5)return vec3(173.,66.,1.)/255.;if(i<4.5)return vec3(229.,120.,7.)/255.;if(i<5.5)return vec3(249.,189.,43.)/255.;return vec3(253.,231.,102.)/255.;}
float nearestTone(vec3 c){float r=c.r;return r<.12156863?0.:r<.34117648?1.:r<.55882353?2.:r<.7882353?3.:r<.9372549?4.:r<.98431373?5.:6.;}
vec4 over(vec4 a,vec4 b){float alpha=b.a+a.a*(1.-b.a);return alpha<.001?vec4(0.):vec4((b.rgb*b.a+a.rgb*a.a*(1.-b.a))/alpha,alpha);}
vec4 overPremul(vec4 a,vec4 b){return vec4(b.rgb*b.a+a.rgb*(1.-b.a),b.a+a.a*(1.-b.a));}
vec2 mirrorUv(vec2 p){return 1.-abs(mod(p,2.)-1.);}
float bubble(vec2 p,vec2 center,float radius){float d=abs(length(p-center)-radius);return 1.-smoothstep(.004,.012,d);}
void main(){
 vec2 frag=gl_FragCoord.xy,hero=(frag-uHeroCenter)*uHeroInvRadius;if(dot(hero,hero)<1.)discard;
 if(uMode==4.0){float crop=clamp(uViewport.x/max(1.,uViewport.y)*.38,.23,.82);vec2 nearUv=vec2(.5+(vUv.x-.5)*crop+uBiomeDrift01.z*.14,vUv.y+uBiomeDrift01.w*.14);vec4 nearC=texture2D(tBiome,mirrorUv(nearUv));nearC.a*=.92;vec4 farC=texture2D(tBiome,mirrorUv(vec2(.22+(vUv.x-.5)*crop*1.15+uBiomeDrift01.x*.12,vUv.y*.85+.07+uBiomeDrift01.y*.12)));farC.a*=.19;vec4 deepC=texture2D(tBiome,mirrorUv(vec2(.80+(vUv.x-.5)*crop*1.35-uBiomeDrift2.x*.10,vUv.y*.79+.10+uBiomeDrift2.y*.10)));deepC.a*=.12;vec4 sum=overPremul(overPremul(deepC,farC),nearC);if(sum.a<.025)discard;gl_FragColor=vec4(sum.rgb/max(sum.a,.001),sum.a*uAlpha);return;}
 if(uMode==3.0){vec2 uv=vUv;if(uFlip>.5)uv.x=1.-uv.x;float frontMix=smoothstep(.72,.9,abs(uLightDir.y));vec4 c;if(frontMix>=1.)c=texture2D(tFront,uv);else{float phase=mod(uTime*2.2,4.),frame=floor(phase),next=mod(frame+1.,4.);vec4 a=texture2D(tSide,vec2((uv.x+frame)*.25,uv.y)),b=texture2D(tSide,vec2((uv.x+next)*.25,uv.y)),side=mix(a,b,smoothstep(0.,1.,fract(phase)));c=frontMix<=0.?side:mix(side,texture2D(tFront,uv),frontMix);}float glowPulse=.72+.28*sin(uTime*4.6-uv.x*7.+uv.y*5.),halo=exp(-dot(vUv-.5-uLightDir*.035,vUv-.5-uLightDir*.035)*13.)*(.075+.04*glowPulse)*uAlpha;if(c.a<.03){if(halo<.008)discard;gl_FragColor=vec4(pal(5.+step(.91,glowPulse)),halo);return;}float tone=nearestTone(c.rgb),directional=clamp(.42+.58*dot(normalize(vUv-.5+vec2(.001)),uLightDir),.18,1.),litTone=floor(tone*(.58+.42*directional)+.5)+step(4.5,tone)*step(.91,glowPulse);gl_FragColor=vec4(pal(clamp(litTone,0.,6.)),c.a*uAlpha);return;}
 if(uMode==2.0){vec2 p=vUv-.5;float halo=exp(-dot(p,p)*8.)*.12*uGlow;float rings=0.;for(int i=0;i<12;i++){float fi=float(i),rise=fract(uTime*(.18+mod(fi,3.)*.035)+fi/12.);vec2 c=vec2(sin(fi*7.13+uTime)*.28,.32-rise*.68);rings+=bubble(p,c,.013+mod(fi,3.)*.006)*(1.-smoothstep(.88,1.,rise));}float flash=uImpact*exp(-dot(p*p,vec2(69.44444444,816.32653061)));float alpha=(halo+rings*.34+flash*.34)*uAlpha;if(alpha<.008)discard;vec3 color=mix(pal(4.),pal(6.),clamp(rings+flash,0.,1.));gl_FragColor=vec4(color,alpha);return;}
 if(uMode==1.0){vec2 breath=(vUv-.5)*(1.+sin(uTime*3.05)*.025);vec4 c=texture2D(tThroat,breath+.5);if(c.a<.025)discard;float pulse=.72+.28*sin(uTime*5.2);gl_FragColor=vec4(c.rgb*(.76+.24*pulse)+pal(4.)*.08*uGlow,c.a*uAlpha);return;}
 float finL=step(vUv.x,.255)*step(.22,vUv.y)*step(vUv.y,.61),finR=step(.745,vUv.x)*step(.22,vUv.y)*step(vUv.y,.61);
 if(uPart<.5&&(finL>0.||finR>0.)&&(vUv.x<.235||vUv.x>.765))discard;
 if(uPart>1.5&&uPart<2.5&&finL<.5)discard;if(uPart>2.5&&finR<.5)discard;
 float atlasRow=uPart>1.5?0.:uPart>.5?295.:0.,lightRow=uPart>.5&&uPart<1.5?289.:0.;vec2 bodyUv=(vec2(2.,2.+atlasRow)+vUv*vec2(217.,289.))/vec2(886.,588.);vec2 detailUv=(vec2(223.,2.+atlasRow)+vUv*vec2(217.,289.))/vec2(886.,588.);vec2 emissiveUv=(vec2(665.,2.+atlasRow)+vUv*vec2(217.,289.))/vec2(886.,588.);
 float first=floor(uLightIndex),mixK=fract(uLightIndex),second=mod(first+1.,8.);vec2 lightUvA=(vec2(first*217.,lightRow)+vUv*vec2(217.,289.))/vec2(1736.,578.);vec2 lightUvB=(vec2(second*217.,lightRow)+vUv*vec2(217.,289.))/vec2(1736.,578.);
 vec4 base=over(texture2D(tAtlas,bodyUv),texture2D(tAtlas,detailUv)),lit=mix(texture2D(tLight,lightUvA),texture2D(tLight,lightUvB),mixK),emit=texture2D(tAtlas,emissiveUv);float directional=clamp(.28+.72*dot(normalize(vUv-.5+vec2(.001)),uLightDir),.12,1.);vec3 color=base.rgb*(.42+.58*directional)+lit.rgb*lit.a*(.28+.34*uGlow)+emit.rgb*emit.a*(.45+.42*uGlow+.16*uImpact);float alpha=max(base.a,max(lit.a*.55,emit.a));if(alpha<.025)discard;gl_FragColor=vec4(color,alpha*uAlpha);
}`;
  const vertex=webgl2?'#version 300 es\n'+vertexBody.replace(/attribute/g,'in').replace(/varying/g,'out'):vertexBody;
  const fragment=webgl2?'#version 300 es\n'+fragmentBody.replace(/varying/g,'in').replace(/texture2D/g,'texture').replace(/gl_FragColor/g,'outColor').replace('precision highp float;','precision highp float;out vec4 outColor;'):fragmentBody;
  const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader)||'encounter shader compile failed');return shader};
  const program=gl.createProgram(),vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program)||'encounter shader link failed');gl.deleteShader(vs);gl.deleteShader(fs);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,0,1,1,-1,1,1,-1,1,0,0,1,1,1,0]),gl.STATIC_DRAW);
  const vao=webgl2?gl.createVertexArray():vaoExt?vaoExt.createVertexArrayOES():null;if(webgl2)gl.bindVertexArray(vao);else if(vaoExt)vaoExt.bindVertexArrayOES(vao);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  const aPos=gl.getAttribLocation(program,'aPos'),aUv=gl.getAttribLocation(program,'aUv');gl.enableVertexAttribArray(aPos);gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,16,0);gl.enableVertexAttribArray(aUv);gl.vertexAttribPointer(aUv,2,gl.FLOAT,false,16,8);
  const makeTexture=image=>{const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);return texture};
  const textures=[images.atlas,images.lights,images.throatArt,images.lanternSide,images.lanternFront,images.invertedBells].map(makeTexture),uniforms={};
  for(const name of ['uViewport','uCenter','uSize','uPivot','uShift','uRotation','uMode','uTime','uPart','uAlpha','uGlow','uImpact','uFlip','uLightIndex','uLightDir','uHeroCenter','uHeroInvRadius','uBiomeDrift01','uBiomeDrift2','tAtlas','tLight','tThroat','tSide','tFront','tBiome'])uniforms[name]=gl.getUniformLocation(program,name);
  gl.useProgram(program);for(const [name,unit] of [['tAtlas',0],['tLight',1],['tThroat',0],['tSide',0],['tFront',1],['tBiome',0]])gl.uniform1i(uniforms[name],unit);
  restoreGl(gl,initial,webgl2,vaoExt);return {gl,webgl2,vao,vaoExt,program,buffer,textures,uniforms,viewportW:0,viewportH:0};
 }
 const saveGl=(gl,webgl2,vaoExt,textureUnits)=>{const state={program:gl.getParameter(gl.CURRENT_PROGRAM),array:gl.getParameter(gl.ARRAY_BUFFER_BINDING),element:gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING),framebuffer:gl.getParameter(gl.FRAMEBUFFER_BINDING),active:gl.getParameter(gl.ACTIVE_TEXTURE),viewport:gl.getParameter(gl.VIEWPORT),blend:gl.isEnabled(gl.BLEND),depth:gl.isEnabled(gl.DEPTH_TEST),cull:gl.isEnabled(gl.CULL_FACE),scissor:gl.isEnabled(gl.SCISSOR_TEST),srcRGB:gl.getParameter(gl.BLEND_SRC_RGB),dstRGB:gl.getParameter(gl.BLEND_DST_RGB),srcA:gl.getParameter(gl.BLEND_SRC_ALPHA),dstA:gl.getParameter(gl.BLEND_DST_ALPHA),eqRGB:gl.getParameter(gl.BLEND_EQUATION_RGB),eqA:gl.getParameter(gl.BLEND_EQUATION_ALPHA),depthMask:gl.getParameter(gl.DEPTH_WRITEMASK),colorMask:gl.getParameter(gl.COLOR_WRITEMASK),vao:webgl2?gl.getParameter(gl.VERTEX_ARRAY_BINDING):vaoExt?gl.getParameter(vaoExt.VERTEX_ARRAY_BINDING_OES):null,textures:[]};for(let unit=0;unit<textureUnits;unit++){gl.activeTexture(gl.TEXTURE0+unit);state.textures.push(gl.getParameter(gl.TEXTURE_BINDING_2D))}gl.activeTexture(state.active);return state};
 const restoreGl=(gl,s,webgl2,vaoExt)=>{for(let unit=0;unit<s.textures.length;unit++){gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,s.textures[unit])}gl.activeTexture(s.active);gl.useProgram(s.program);if(webgl2)gl.bindVertexArray(s.vao);else if(vaoExt)vaoExt.bindVertexArrayOES(s.vao);gl.bindBuffer(gl.ARRAY_BUFFER,s.array);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,s.element);gl.bindFramebuffer(gl.FRAMEBUFFER,s.framebuffer);gl.viewport(s.viewport[0],s.viewport[1],s.viewport[2],s.viewport[3]);s.blend?gl.enable(gl.BLEND):gl.disable(gl.BLEND);s.depth?gl.enable(gl.DEPTH_TEST):gl.disable(gl.DEPTH_TEST);s.cull?gl.enable(gl.CULL_FACE):gl.disable(gl.CULL_FACE);s.scissor?gl.enable(gl.SCISSOR_TEST):gl.disable(gl.SCISSOR_TEST);gl.blendFuncSeparate(s.srcRGB,s.dstRGB,s.srcA,s.dstA);gl.blendEquationSeparate(s.eqRGB,s.eqA);gl.depthMask(s.depthMask);gl.colorMask(...s.colorMask)};
 const prepare=(time)=>{
  if(!gpu)return false;const {gl,webgl2,vao,vaoExt,program,textures,uniforms}=gpu,saved=saveGl(gl,webgl2,vaoExt,2),w=gameCanvas.width,h=gameCanvas.height;if(!w||!h)return false;
  gl.useProgram(program);if(webgl2)gl.bindVertexArray(vao);else if(vaoExt)vaoExt.bindVertexArrayOES(vao);gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,w,h);gl.disable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.disable(gl.SCISSOR_TEST);gl.enable(gl.BLEND);gl.blendEquation(gl.FUNC_ADD);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.colorMask(true,true,true,true);
  if(gpu.viewportW!==w||gpu.viewportH!==h){gpu.viewportW=w;gpu.viewportH=h;gl.uniform2f(uniforms.uViewport,w,h);gl.uniform2f(uniforms.uHeroCenter,w*.5,h*.5);const heroScale=Math.min(w,h);gl.uniform2f(uniforms.uHeroInvRadius,1/Math.max(24,heroScale*.10),1/Math.max(13,heroScale*.052))}const camX=cameraX/320,camY=cameraY/320;gl.uniform1f(uniforms.uTime,time);gl.uniform4f(uniforms.uBiomeDrift01,camX*.42+time*.008,camY*.34+Math.sin(time*.055)*.055,camX+time*.012,camY+Math.sin(time*.073)*.055);gl.uniform2f(uniforms.uBiomeDrift2,camX*.20+time*.016,camY*.16+Math.sin(time*.091)*.055);if(lightDirty){gl.uniform2f(uniforms.uLightDir,lightX,lightY);gl.uniform1f(uniforms.uLightIndex,lightDirection);lightDirty=false}gl.uniform2f(uniforms.uPivot,0,0);gl.uniform2f(uniforms.uShift,0,0);gl.uniform1f(uniforms.uRotation,0);gl.uniform1f(uniforms.uImpact,0);gl.uniform1f(uniforms.uFlip,0);return {gl,textures,uniforms,saved,w,h,lightX,lightY,activeUnit:saved.active-gl.TEXTURE0};
 };
 const bindTextures=(pass,first,second=-1)=>{const {gl,textures}=pass;if(pass.activeUnit!==0){gl.activeTexture(gl.TEXTURE0);pass.activeUnit=0}gl.bindTexture(gl.TEXTURE_2D,textures[first]);if(second>=0){if(pass.activeUnit!==1){gl.activeTexture(gl.TEXTURE1);pass.activeUnit=1}gl.bindTexture(gl.TEXTURE_2D,textures[second])}};
 const draw=(pass,mode,cx,cy,sx,sy,alpha,part=0,rotation=0,pivotX=0,pivotY=0,shiftX=0,shiftY=0,glow=0,impact=0)=>{const {gl,uniforms}=pass;gl.uniform1f(uniforms.uMode,mode);gl.uniform2f(uniforms.uCenter,cx,cy);gl.uniform2f(uniforms.uSize,sx,sy);gl.uniform1f(uniforms.uAlpha,alpha);if(mode===0){gl.uniform1f(uniforms.uPart,part);gl.uniform1f(uniforms.uRotation,rotation);gl.uniform2f(uniforms.uPivot,pivotX,pivotY);gl.uniform2f(uniforms.uShift,shiftX,shiftY);gl.uniform1f(uniforms.uGlow,glow);gl.uniform1f(uniforms.uImpact,impact)}else if(mode===1){gl.uniform1f(uniforms.uGlow,glow)}else if(mode===2){gl.uniform1f(uniforms.uGlow,glow);gl.uniform1f(uniforms.uImpact,impact)}gl.drawArrays(gl.TRIANGLE_STRIP,0,4)};
 const render=(time,dt,q,open)=>{
  const pass=prepare(time);if(!pass)return;const {gl,textures,uniforms,w,h,lightX,lightY,saved}=pass;
  bindTextures(pass,5);gl.uniform1f(uniforms.uMode,4);gl.uniform2f(uniforms.uCenter,w*.5,h*.5);gl.uniform2f(uniforms.uSize,w,h);gl.uniform1f(uniforms.uAlpha,1);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  const reach=Math.min(w,h)*.235,targetX=w*.5+lightX*reach,targetY=h*.5+lightY*reach*.78;
  if(!lanternStarted){lanternX=w*.5+reach*.45;lanternY=h*.43;lanternStarted=true}const follow=1-Math.exp(-Math.max(0,dt)*2.15);lanternX+=(targetX-lanternX)*follow;lanternY+=(targetY-lanternY)*follow;const lanternAlpha=1,bob=Math.sin(time*1.35)*Math.max(2,h*.006),dx=targetX-lanternX,dy=targetY-lanternY;lanternState.visible=lanternAlpha>.02;lanternState.front=Math.abs(dy)>Math.abs(dx)*1.08;lanternState.side=!lanternState.front;lanternState.position[0]=Math.round(lanternX);lanternState.position[1]=Math.round(lanternY+bob);gl.uniform1f(uniforms.uFlip,dx<0?1:0);const raySize=Math.min(w*.72,312);bindTextures(pass,3,4);draw(pass,3,lanternX,lanternY+bob,raySize,raySize*160/256,lanternAlpha);
  if(q.visible>.02){
   const base=Math.min(w/217,h/289)*.86,s=base*q.scale,retreat=q.phase==='retreat'?smooth(1-q.visible):0,side=q.cycle%2?1:-1;let approachX=0,approachY=0,roll=0;
   if(q.phase==='warning'){const settle=smooth((q.light-.14)/.76);approachX=side*w*(.085-.035*settle);approachY=h*(.055-.018*settle);roll=side*(.045-.015*settle)}else if(q.phase==='emerge'){const remain=1-smooth((q.visible-.42)/.58);approachX=side*w*.05*remain;approachY=h*.037*remain;roll=side*.03*remain}
   const cx=w*.5+aimX+approachX+retreatKickX*retreat,cy=h*.47+aimY+approachY+retreatKickY*retreat,retreatRoll=retreatKickX/Math.max(1,w)*retreat*.72,alpha=q.phase==='warning'?clamp(q.visible*(.08+.12*smooth((q.light-.45)/.45))):clamp(q.visible),sizeX=217*s,sizeY=289*s,pivotX=108/217-.5,pivotY=168/289-.5;
   const effectSize=Math.max(280*s,140);draw(pass,2,cx,cy,effectSize,effectSize,q.visible,0,0,0,0,0,0,q.light,q.impact);
   const reveal=smooth((open-.08)/.92);if(reveal>.001){bindTextures(pass,2);draw(pass,1,cx,cy+18*s,96*s,112*s,alpha*reveal,0,roll+retreatRoll,0,0,0,0,q.light,q.impact)}
   const upperOpen=smooth(clamp(open*.82)),lowerOpen=smooth(clamp((open-.035)/.965));let recoil=0;if(q.phase==='bite')recoil=Math.sin((time-FIRST)*38)*q.impact*.012;else if(q.phase==='retreat')recoil=Math.sin(retreat*Math.PI*4)*q.visible*.008;
   const upperRot=roll+retreatRoll+(-.012*(1-upperOpen)+.018*upperOpen+recoil*.45),lowerRot=roll+retreatRoll+(.04*(1-lowerOpen)-.068*lowerOpen-recoil),upperShiftY=(5-12*upperOpen)*s,lowerShiftY=(-30+54*lowerOpen)*s;
   bindTextures(pass,0,1);draw(pass,0,cx,cy,sizeX,sizeY,alpha,0,upperRot,pivotX,pivotY,0,upperShiftY,q.light,q.impact);draw(pass,0,cx,cy,sizeX,sizeY,alpha,1,lowerRot,pivotX,pivotY,0,lowerShiftY,q.light,q.impact);
   const finWave=Math.sin(time*1.42)*.017+Math.sin(time*2.65)*.005;draw(pass,0,cx,cy,sizeX,sizeY,alpha,2,upperRot-finWave*(.38+upperOpen*.62),-.293,-.074,0,upperShiftY,q.light,q.impact);draw(pass,0,cx,cy,sizeX,sizeY,alpha,3,upperRot+finWave*(.38+upperOpen*.62),.293,-.074,0,upperShiftY,q.light,q.impact);
  }
  restoreGl(gl,saved,gpu.webgl2,gpu.vaoExt);
 };
 const update=(now,dt)=>{
  const seconds=(now-start)/1000,q=frameState(seconds),open=springJaw(q.open,dt),w=gameCanvas.width,h=gameCanvas.height;
  if(cameraKick>0){cameraKick=Math.max(0,cameraKick-dt*3.8);const amp=cameraKick*7.5;gameCanvas.style.transform=`translate3d(${Math.sin(seconds*71)*amp}px,${Math.cos(seconds*59)*amp*.55}px,0) scale(1.018)`}else if(gameCanvas.style.transform)gameCanvas.style.transform='';
  if(q.cycle>=0&&q.cycle!==targetCycle){targetCycle=q.cycle;const hero=sampleHero(seconds,true);targetHero=hero&&hero.slice();aimX=0;aimY=0;retreatKickX=0;retreatKickY=0;mawState.reaction='warning';try{if(typeof window.__abyssPlayMawWarn==='function')window.__abyssPlayMawWarn(q.cycle%2?1:-1)}catch(error){console.error('ABYSS maw warning:',error)}}
  const hero=sampleHero(seconds,false);if(targetHero&&hero){const desiredX=clamp((targetHero[0]-hero[0])/worldWidth+.5)-.5,desiredY=clamp((hero[1]-targetHero[1])/worldHeight+.5)-.5,follow=1-Math.exp(-dt*12);aimX+=(desiredX*w-aimX)*follow;aimY+=(desiredY*h-aimY)*follow}else{aimX*=.85;aimY*=.85}
  mawState.ready=ready;mawState.visible=ready&&q.visible>.02;mawState.phase=q.phase;mawState.elapsed=seconds;mawState.dt=dt;mawState.targetOffset[0]=aimX;mawState.targetOffset[1]=aimY;mawState.cameraKick=cameraKick;
  if(q.hit&&q.cycle!==attackedCycle){attackedCycle=q.cycle;const current=sampleHero(seconds,true),s=Math.min(w/217,h/289)*.86*q.scale,inMouth=!targetHero||!current||Math.hypot(aimX,aimY)<Math.max(22*s,Math.min(w,h)*.055);let hit=false;if(inMouth){try{if(typeof window.__abyssPlayMawHit==='function')hit=!!window.__abyssPlayMawHit()}catch(error){console.error('ABYSS maw hit:',error)}}else{mawState.avoidedCount++;const sweep=q.cycle%2?1:-1;retreatKickX=sweep*w*.12;retreatKickY=-h*.045;try{if(typeof window.__abyssPlayMawDodge==='function')window.__abyssPlayMawDodge(sweep)}catch(error){console.error('ABYSS maw dodge:',error)}mawState.reaction='dodged'}if(hit){cameraKick=1;retreatKickY=-h*.025;mawState.reaction='hit'}mawState.lastHit=hit;mawState.attackCount++}
  return {seconds,q,open};
 };
 Promise.all(Object.values(images).map(imageReady)).then(()=>{gpu=makeGpu();if(!gpu)throw new Error('main WebGL context unavailable');ready=true;mawState.ready=true}).catch(error=>{console.error('ABYSS main-canvas encounter:',error)});
 const gameRAF=window.requestAnimationFrame.bind(window);document.addEventListener('visibilitychange',()=>{const now=performance.now();if(document.hidden){hiddenAt=now;return}if(hiddenAt){if(start)start+=now-hiddenAt;hiddenAt=0;gameFrame=now}},{passive:true});
 window.requestAnimationFrame=callback=>gameRAF(now=>{let snapshot=null;if(ready&&typeof window.__abyssPlayMawHit==='function'&&now!==gameFrame){if(!start)start=now;const dt=gameFrame<0?0:Math.min(.05,(now-gameFrame)/1000);gameFrame=now;snapshot=update(now,dt)}callback(now);if(snapshot)render(snapshot.seconds,mawState.dt||0,snapshot.q,snapshot.open)});
 return true;
}
})();
