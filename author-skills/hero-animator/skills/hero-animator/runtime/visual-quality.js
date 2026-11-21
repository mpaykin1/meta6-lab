/* Hero Animator: renderer-independent visual/input helpers. No external dependencies. */
(function(root){
  'use strict';
  const DIRECTIONS=['front','front_right','right','back_right','back','back_left','left','front_left'];
  const ACTIONS=['idle','walk','run','jump','crouch','dodge','roll','attack','grab','hurt','death'];
  // WebGL1-compatible continuous stochastic sampling; repeat-wrapped ground textures only.
  const GROUND_GLSL=`
    vec2 heroGroundHash(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);}
    vec4 heroGroundTile(sampler2D tex,vec2 uv,vec2 cell){
      vec2 h=heroGroundHash(cell);float angle=h.x*6.2831853;float c=cos(angle),s=sin(angle);
      return texture2D(tex,mat2(c,-s,s,c)*uv+h*7.13);
    }
    vec4 heroGroundTexture(sampler2D tex,vec2 uv,vec3 world){
      vec2 p=uv*.65,cell=floor(p),f=fract(p);f=f*f*(3.-2.*f);
      vec4 a=heroGroundTile(tex,p,cell),b=heroGroundTile(tex,p,cell+vec2(1.,0.));
      vec4 c=heroGroundTile(tex,p,cell+vec2(0.,1.)),d=heroGroundTile(tex,p,cell+vec2(1.,1.));
      vec4 result=mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
      result.rgb*=.73+.09*sin(world.x*.23+world.z*.17)*sin(world.z*.31);
      return result;
    }`;
  const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
  function selectView(actorYaw,cameraYaw,count=8,previous=null){
    if(count!==4&&count!==8)throw Error('views must be 4 or 8');
    const dirs=count===8?DIRECTIONS:DIRECTIONS.filter((_,i)=>i%2===0);
    const rel=Math.atan2(Math.sin(cameraYaw-actorYaw),Math.cos(cameraYaw-actorYaw));
    const p=dirs.indexOf(previous);
    if(p>=0){const delta=Math.atan2(Math.sin(rel-p*2*Math.PI/count),Math.cos(rel-p*2*Math.PI/count));
      if(Math.abs(delta)<Math.PI/count+.07)return previous;}
    return dirs[(Math.round(rel/(2*Math.PI)*count)+count)%count];
  }
  function matrixReport(anims={},count=8,actions=ACTIONS){
    if(count!==4&&count!==8)throw Error('views must be 4 or 8');
    const dirs=count===8?DIRECTIONS:DIRECTIONS.filter((_,i)=>i%2===0),missing=[];
    for(const a of actions)for(const d of dirs){const c=anims[a+'_'+d];if(!c||!Array.isArray(c.frames)||!c.frames.length)missing.push(a+'_'+d);}
    return {complete:missing.length===0,required:actions.length*dirs.length,missing};
  }
  function createLocomotion({frames=9,stride=3.3}={}){
    if(!Number.isInteger(frames)||frames<1||!(stride>0))throw Error('frames/stride invalid');
    let phase=0;
    return {advance(distance){if(!Number.isFinite(distance)||distance<0)throw Error('distance invalid');phase=(phase+distance/stride)%1;return Math.floor(phase*frames);},
      get phase(){return phase;},reset(){phase=0;}};
  }
  function contactShadow(height,{radius=0.65,opacity=.4}={}){
    height=Math.max(0,Number(height)||0);
    return {radius:radius*(1+Math.min(height,4)*.28),opacity:opacity/(1+height*1.5)};
  }
  // Separate keyboard and individual pointers. Releasing one finger never releases another.
  function createInput({target=globalThis.window,buttons=globalThis.document,map}={}){
    map=map||{KeyW:'up',ArrowUp:'up',KeyS:'down',ArrowDown:'down',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',ShiftLeft:'run',ShiftRight:'run',Space:'jump',KeyE:'interact'};
    const keys=new Map(),pointers=new Map(),edges=new Set(),cleanups=[];
    const held=a=>[...keys.values(),...pointers.values()].includes(a);
    const listen=(el,type,fn,options)=>{el?.addEventListener(type,fn,options);cleanups.push(()=>el?.removeEventListener(type,fn,options));};
    function down(e){const a=map[e.code];if(!a||e.target?.closest?.('input,textarea,select,[contenteditable]'))return;e.preventDefault();if(!held(a)&&!e.repeat)edges.add(a);keys.set(e.code,a);}
    function up(e){if(map[e.code]){e.preventDefault();keys.delete(e.code);}}
    function pointerDown(e){const b=e.target.closest?.('[data-hero-key]');if(!b)return;const a=b.dataset.heroKey;if(!a)return;e.preventDefault();if(!held(a))edges.add(a);pointers.set(e.pointerId,a);b.setPointerCapture?.(e.pointerId);}
    function pointerUp(e){pointers.delete(e.pointerId);}
    function clear(){keys.clear();pointers.clear();edges.clear();}
    listen(target,'keydown',down);listen(target,'keyup',up);listen(target,'blur',clear);
    listen(buttons,'pointerdown',pointerDown);
    for(const ev of ['pointerup','pointercancel','lostpointercapture'])listen(buttons,ev,pointerUp);
    const doc=globalThis.document;listen(doc,'visibilitychange',()=>{if(doc.hidden)clear();});
    return {held,pressed:a=>edges.has(a),endFrame:()=>edges.clear(),clear,dispose(){clear();cleanups.forEach(f=>f());}};
  }
  root.HeroVisualQuality=Object.freeze({version:'0.9.0',GROUND_GLSL,DIRECTIONS:Object.freeze(DIRECTIONS),ACTIONS:Object.freeze(ACTIONS),selectView,matrixReport,createLocomotion,contactShadow,createInput,clamp});
})(globalThis);
