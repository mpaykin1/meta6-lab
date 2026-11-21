#!/usr/bin/env python3
"""Upgrade the recognized original Ash Frontier HTML without changing embedded artwork.
Produces an explicitly incomplete technical preview, not invented directional/combat art.
Usage: python upgrade_ash_game.py INPUT.html OUTPUT.html
"""
import argparse, hashlib, json, re
from pathlib import Path

def upgrade(src, runtime):
    def replace(old,new):
        nonlocal src
        if src.count(old)!=1:raise ValueError('Unsupported source revision, expected exactly one: '+old[:90])
        src=src.replace(old,new,1)
    if 'HeroVisualQuality' in src:raise ValueError('Already upgraded; use the original HTML')
    if '<title>Пепельный предел' not in src:raise ValueError('Not the recognized Ash Frontier game')
    assets=json.loads(re.search(r'window.ASSETS=(.*?);</script>',src,re.S).group(1))
    if assets['hero']['frames']!=9 or assets['hero']['w']!=512 or assets['hero']['h']!=363:
        raise ValueError('Unsupported hero atlas layout')
    replace('<script>window.ASSETS=', '<script>'+runtime+'</script><script>window.ASSETS=')
    replace('uniform vec3 uCamera;', 'uniform vec3 uCamera;uniform float uCutout;uniform float uGround;uniform float uLocalLight;')
    replace('uniform vec3 uCamera;uniform float uCutout;uniform float uGround;uniform float uLocalLight;',
            'uniform vec3 uCamera;uniform float uCutout;uniform float uGround;uniform float uLocalLight;\n${globalThis.HeroVisualQuality.GROUND_GLSL}')
    replace('vec4 c=texture2D(uTex,uv);', 'vec4 c=texture2D(uTex,uv);if(uGround>.5)c=heroGroundTexture(uTex,uv,vW);')
    replace('c.a*=uOpacity;if(c.a<.036)discard;', 'c.a*=uOpacity;if(c.a<max(.036,uCutout))discard;')
    replace('gl_FragColor=c;', '''float portalDistance=length(vW.xz-vec2(-6.,-9.));
 float warm=exp(-portalDistance*.36)*(.08+.018*sin(uTime*2.1));
 c.rgb+=vec3(.48,.22,.045)*warm*uLocalLight;
 gl_FragColor=c;''')
    replace("'uTime','uCamera']", "'uTime','uCamera','uCutout','uGround','uLocalLight']")
    replace("{uv:[0,0,8,8],fog:.5,shade:.85}", "{uv:[0,0,1.8,1.8],fog:.5,shade:.85,ground:1}")
    replace("gl.uniform1f(loc.uGlow,options.glow||0);", "gl.uniform1f(loc.uGlow,options.glow||0);gl.uniform1f(loc.uCutout,options.cutout||0);gl.uniform1f(loc.uGround,options.ground||0);gl.uniform1f(loc.uLocalLight,options.localLight===false?0:1);")
    replace("return [(frame%3)/3,1-(Math.floor(frame/3)+1)/3,1/3,1/3]", "return [(frame%3)/3+.5/A[n].aw,1-(Math.floor(frame/3)+1)/3+.5/A[n].ah,1/3-1/A[n].aw,1/3-1/A[n].ah]")
    start=src.index('let keys={},touch=')
    end=src.index('const drawList=[',start)
    src=src[:start]+INPUT+src[end:]
    start=src.index('const xAxis=',src.index('function render(now)'))
    end=src.index('const eyeX=',start)
    src=src[:start]+MOTION+src[end:]
    start=src.index('// Transparent original GIF atlas frames:')
    end=src.index('requestAnimationFrame(render)}',start)
    src=src[:start]+RENDER+src[end:]
    replace('Мышь — поворот камеры (±37°)', 'Мышь — обзор сцены (±55°)')
    replace('ОРИГИНАЛЬНЫЙ РИСУНОК · НАСТОЯЩАЯ 3D-НАВИГАЦИЯ', 'ТЕХНИЧЕСКИЙ PREVIEW · ИСХОДНЫЙ АРТ СОХРАНЁН')
    replace('WASD / стрелки — идти', 'WASD / стрелки — идти (любая раскладка)')
    replace('E — портал</div>', 'E — портал · ракурсы и боевые клипы ещё не добавлены</div>')
    replace('data-move="up"','data-hero-key="up"');replace('data-move="left"','data-hero-key="left"')
    replace('data-move="down"','data-hero-key="down"');replace('data-move="right"','data-hero-key="right"')
    replace('id="run"','id="run" data-hero-key="run"');replace('id="jump"','id="jump" data-hero-key="jump"')
    replace('<button id="jump" data-hero-key="jump">ПРЫЖОК</button>', '<button id="jump" data-hero-key="jump">ПРЫЖОК</button><button data-hero-key="interact">ПОРТАЛ</button>')
    replace('</style>', '''@media(pointer:coarse){#mobile{display:flex}#help{bottom:138px;font-size:10px}#badge{display:none}}
@media(max-width:760px){#help{bottom:150px;max-width:90vw}#hud small{font-size:9px}#portalHint{top:100px}.actions{display:grid;grid-template-columns:repeat(2,62px);gap:5px}.actions button{width:62px;font-size:10px}}
@media(pointer:coarse) and (orientation:landscape){#help{display:none}#mobile{bottom:10px}.pad{grid-template-columns:repeat(3,40px)}.pad button{width:40px;height:40px}#hud h1{font-size:18px}#portalHint{top:12px}}
</style>''')
    # Proof that every original embedded artwork URL and metadata stayed byte-equivalent.
    after=json.loads(re.search(r'window.ASSETS=(.*?);</script>',src,re.S).group(1))
    if assets!=after:raise ValueError('Art Lock violation')
    return src,assets

INPUT=r'''
const VQ=globalThis.HeroVisualQuality;
const input=VQ.createInput();
const gait=VQ.createLocomotion({frames:9,stride:3.3});
let player={x:0,z:8,y:0,vy:0,face:1},cam={x:0,y:4.9,z:20},mouseYaw=0,clock=performance.now(),frameTime=0,portalState=false;
let moving=false,walkFrame=0,lastDistance=0,jumpCount=0,landCount=0,animPhase=0;
const obstacles=[[-13,-14,2.5],[-18,-23,2.4],[6,-20,1.4],[10,-20,1.4],[14,-20,1.4],[18,-20,1.4],[21,-29,5],[-20,-8,2.5]];
function blocked(x,z){if(Math.abs(x)>26||z>13||z < -32)return true;for(let o of obstacles)if((x-o[0])**2+(z-o[1])**2 < (o[2]+.55)**2)return true;return false}
let pointer=null;canvas.addEventListener('pointerdown',e=>{pointer={id:e.pointerId,x:e.clientX};canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(!pointer||e.pointerId!==pointer.id)return;let dx=e.clientX-pointer.x;pointer.x=e.clientX;mouseYaw=VQ.clamp(mouseYaw+dx*.006,-.96,.96);});
for(const ev of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(ev,()=>pointer=null);
window.addEventListener('blur',()=>pointer=null);
// A ground decal is generated, never a replacement drawing of the hero.
const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;
const sc=shadowCanvas.getContext('2d'),sg=sc.createRadialGradient(64,64,0,64,64,64);
sg.addColorStop(0,'rgba(18,9,3,.8)');sg.addColorStop(.48,'rgba(18,9,3,.36)');sg.addColorStop(1,'rgba(18,9,3,0)');
sc.fillStyle=sg;sc.fillRect(0,0,128,128);
const shadowTex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,shadowTex);
gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,shadowCanvas);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);T.contact_shadow=shadowTex;
// Match original frame foot pivot (hero art feet lie at y=346 of 363 canvas pixels).
const footInset=4.45*(363-346)/363;
const evidence={version:'0.9.0',artComplete:false,missing:'front/back/left + all non-walk action clips',artPreserved:true};
Object.defineProperty(globalThis,'heroGameEvidence',{get:()=>Object.freeze({...evidence,position:{...player},moving,walkFrame,animPhase,lastDistance,jumpCount,landCount,cameraYaw:mouseYaw,portalState,shadow:VQ.contactShadow(player.y),textures:ready,errors:gl.getError()})});
'''

MOTION=r'''
const xAxis=Number(input.held('right'))-Number(input.held('left'));
const zAxis=Number(input.held('up'))-Number(input.held('down'));
const running=input.held('run'),speed=running?7.4:4.1;
if(input.pressed('jump')&&player.y<=.001){player.vy=5.9;jumpCount++;}
if(input.pressed('interact')&&Math.hypot(player.x+6,player.z+9)<4){portalState=!portalState;document.getElementById('portalHint').textContent=portalState?'Портал активирован':'Нажмите E у портала';}
const oldX=player.x,oldZ=player.z;
if(xAxis||zAxis){let len=Math.hypot(xAxis,zAxis),dx=xAxis/len*speed*dt,dz=zAxis/len*speed*dt;
let tx=player.x+dx*Math.cos(mouseYaw)+dz*Math.sin(mouseYaw),tz=player.z+dx*Math.sin(mouseYaw)-dz*Math.cos(mouseYaw);
if(!blocked(tx,player.z))player.x=tx;if(!blocked(player.x,tz))player.z=tz;}
lastDistance=Math.hypot(player.x-oldX,player.z-oldZ);moving=lastDistance>.00001;
// No invented jump pose: existing art is retained, with readiness explicitly BLOCKED.
if(player.y>0||player.vy>0){player.vy-=15*dt;player.y=Math.max(0,player.y+player.vy*dt);if(player.y===0){player.vy=0;landCount++;}}
if(moving&&player.y===0){walkFrame=gait.advance(lastDistance);animPhase=gait.phase;}
else if(!moving&&player.y===0){walkFrame=0;gait.reset();animPhase=0;}
input.endFrame();
'''

RENDER=r'''
// Ground shadow: a surface-following decal, independent of hero jump elevation.
gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);
const shadow=VQ.contactShadow(player.y,{radius:.93,opacity:.55});
let shadowVerts=[];const resolution=8;
for(let iz=0;iz<resolution;iz++)for(let ix=0;ix<resolution;ix++){
  const point=(i,j)=>{let u=i/resolution,v=j/resolution,x=player.x+(u-.5)*shadow.radius*2.2,z=player.z+(v-.5)*shadow.radius*1.5;return [x,terrainY(x,z)-.215,z,u,v,0,1,0]};
  const a=point(ix,iz),b=point(ix+1,iz),c=point(ix+1,iz+1),d=point(ix,iz+1);shadowVerts.push(...a,...b,...c,...a,...c,...d);
}
// Reuse one GPU buffer; no allocation of GPU objects per frame.
if(!V.shadow){V.shadow={buf:gl.createBuffer(),count:0};}
gl.bindBuffer(gl.ARRAY_BUFFER,V.shadow.buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(shadowVerts),gl.DYNAMIC_DRAW);V.shadow.count=shadowVerts.length/8;
draw(V.shadow,'contact_shadow',model(0,0,0,1,1,1),{opacity:shadow.opacity,localLight:false});
const heroYaw=Math.atan2(cam.x-player.x,cam.z-player.z),heroY=terrainY(player.x,player.z)-.22+player.y-footInset;
// Opaque interior depth prepass: transparent canvas never writes a rectangle into depth.
gl.depthMask(true);gl.colorMask(false,false,false,false);
draw(plane,'hero',model(player.x,heroY,player.z,3.4,4.45,1,heroYaw),{uv:atlasFor('hero',walkFrame),cutout:.96});
gl.colorMask(true,true,true,true);gl.depthMask(false);
const layers=[];
for(let [name,x,y,z,w,h,yaw,fog,shift,glow] of drawList){if(name==='original')continue;let a=A[name];
  layers.push([name,x+Math.sin(t*.29+z)*shift,y+Math.sin(t*.41+z)*shift*.5,z,w,h,Math.floor(t*1000*a.speed/180)%9,a.alpha,fog,glow,yaw]);}
layers.push(['portal',-6,terrainY(-6,-9),-9,6.7,6,Math.floor(t*7)%9,portalState?1:.88,.12,portalState?.5:.15,Math.atan2(cam.x+6,cam.z+9)]);
layers.push(['hero',player.x,heroY,player.z,3.4,4.45,walkFrame,1,0,0,heroYaw]);
const dir=[focus[0]-cam.x,focus[1]-cam.y,focus[2]-cam.z];
const depth=a=>(a[1]-cam.x)*dir[0]+(a[2]+a[5]*.5-cam.y)*dir[1]+(a[3]-cam.z)*dir[2];
layers.sort((a,b)=>depth(b)-depth(a));
for(const item of layers)paint(...item);
gl.depthMask(true);
readout.textContent='X '+player.x.toFixed(1)+' · Z '+player.z.toFixed(1)+' · '+(moving?'идёт':'стоит');
'''

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('input',type=Path);p.add_argument('output',type=Path);a=p.parse_args()
    if a.input.resolve()==a.output.resolve():p.error('Use a separate output; original is preserved')
    try:
        original=a.input.read_text(encoding='utf8')
        runtime=Path(__file__).resolve().parent.parent/'runtime'/'visual-quality.js'
        result,assets=upgrade(original,runtime.read_text(encoding='utf8'))
        a.output.parent.mkdir(parents=True,exist_ok=True);a.output.write_text(result,encoding='utf8')
        manifest={'pluginVersion':'0.9.0','kind':'technical-preview','complete':False,
          'inputSHA256':hashlib.sha256(a.input.read_bytes()).hexdigest(),'outputSHA256':hashlib.sha256(a.output.read_bytes()).hexdigest(),
          'assetsPreserved':len(assets),'missingArt':'4/8 views and distinct actions including combat/grab/hurt/death',
          'limits':'No new hero artwork or gameplay actions invented. View-preserving camera is limited to 55 degrees.'}
        a.output.with_suffix('.upgrade.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
        print(json.dumps(manifest,ensure_ascii=False));return 0
    except (ValueError,OSError,KeyError,AttributeError) as e:raise SystemExit('BLOCKED: '+str(e))
if __name__=='__main__':raise SystemExit(main())
