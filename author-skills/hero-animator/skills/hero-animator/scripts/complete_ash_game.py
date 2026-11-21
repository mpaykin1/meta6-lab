#!/usr/bin/env python3
"""Build a self-contained adventure from the recognized original HTML and real 4-view art pack.
No CDN, no source overwrite, no invented artistic approvals. See pack provenance.
"""
import argparse,hashlib,json,re
from pathlib import Path
from upgrade_ash_game import upgrade

def validate_pack(pack,canonical_hash):
    if pack.get('directions')!=4:raise ValueError('This adapter requires the actual four approved reference views')
    provenance=pack.get('provenance',{})
    if not re.fullmatch('[a-f0-9]{64}',canonical_hash) or provenance.get('canonical_sha256')!=canonical_hash:raise ValueError('Canonical reference SHA256 mismatch')
    if provenance.get('canonical_approved_by')!='user':raise ValueError('User-approved canonical reference required')
    for direction in ['front','back','left','right']:
        s=pack.get('sheets',{}).get(direction,{})
        if s.get('width')!=2048 or s.get('height')!=2816 or not s.get('url','').startswith('data:image/webp;base64,'):raise ValueError('Embedded lossless atlas required: '+direction)
    for action in ['idle','walk','run','jump','crouch','dodge','roll','attack','grab','hurt','death']:
        for direction in ['front','back','left','right']:
            clip=pack.get('anims',{}).get(action+'_'+direction,{})
            if len(clip.get('frames',[]))!=8 or clip.get('sheet')!=direction:raise ValueError('Missing actual eight-frame clip: '+action+'_'+direction)
            for f in clip['frames']:
                if not isinstance(f,list) or len(f)!=4 or not all(isinstance(n,int) for n in f):raise ValueError('Invalid frame rectangle')
                x,y,w,h=f
                if x<0 or y<0 or w<=0 or h<=0 or x+w>2048 or y+h>2816:raise ValueError('Atlas frame out of bounds')
    return {'clips':44,'frames':352,'canonicalMatched':True,'humanReviewedEachFrame':provenance.get('human_reviewed_each_frame',False)}

def build(original,pack,quality,adventure,canonical_hash):
    validate_pack(pack,canonical_hash)
    src,assets=upgrade(original,quality)
    def replace(old,new):
        nonlocal src
        if src.count(old)!=1:raise ValueError('Unsupported adapter revision: '+old[:100])
        src=src.replace(old,new,1)
    replace('<script>window.ASSETS=', '<script>'+adventure+'</script><script>window.HERO_PACK='+json.dumps(pack,ensure_ascii=False,separators=(',',':'))+';</script><script>window.ASSETS=')
    replace('for(let [n,a] of Object.entries(A))loadTex(n,a);', "for(const [direction,sheet] of Object.entries(window.HERO_PACK.sheets))A['hero_'+direction]={url:sheet.url,w:256,h:256,aw:2048,ah:2816,frames:88,alpha:1,speed:0};\nif(HERO_PACK.ground)A.earth_ground={url:HERO_PACK.ground.url,w:1024,h:1024,aw:1024,ah:1024,frames:1,alpha:1,speed:0};\nfor(let [n,a] of Object.entries(A))loadTex(n,a);")
    src=src.replace("name==='earth'?gl.REPEAT", "name.startsWith('earth')?gl.REPEAT")
    src=src.replace("draw(ground,'earth'", "draw(ground,HERO_PACK.ground?'earth_ground':'earth'")
    src=src.replace("draw(box,'earth'", "draw(box,HERO_PACK.ground?'earth_ground':'earth'")
    replace("status.textContent='3D / GLSL · '+ready+'/'+Object.keys(A).length+' текстур';", "status.textContent=ready===Object.keys(A).length?'':('Загрузка… '+Math.round(ready/Object.keys(A).length*100)+'%');")
    replace('uniform float uLocalLight;', 'uniform float uLocalLight;uniform vec3 uTint;')
    replace("'uGround','uLocalLight']", "'uGround','uLocalLight','uTint']")
    replace('gl_FragColor=c;', 'c.rgb*=uTint;gl_FragColor=c;')
    replace('gl.drawArrays(gl.TRIANGLES,0,mesh.count)', 'gl.uniform3fv(loc.uTint,new Float32Array(options.tint||[1,1,1]));gl.drawArrays(gl.TRIANGLES,0,mesh.count)')
    # Smooth fog is interpolated from geometry, not exponentiated for every background pixel.
    src=src.replace('varying vec3 vW;', 'varying vec3 vW;varying float vFogFactor;')
    replace('uniform mat4 uMVP;uniform mat4 uM;', 'uniform mat4 uMVP;uniform mat4 uM;uniform vec3 uCamera;')
    replace('vU=aU;gl_Position=', 'vU=aU;float dd=length(world.xyz-uCamera);vFogFactor=1.-exp(-pow(max(0.,dd-8.)*.019,1.48));gl_Position=')
    replace('float dist=length(vW-uCamera);float f=1.-exp(-pow(max(0.,dist-8.)*.019,1.48));', 'float f=vFogFactor;')
    src=src.replace('uniform vec3 uCamera;', 'uniform mediump vec3 uCamera;')
    replace('float portalDistance=length(vW.xz-vec2(-6.,-9.));', 'if(uLocalLight>.5){float portalDistance=length(vW.xz-vec2(-6.,-9.));')
    replace('warm*uLocalLight;', 'warm;}')
    replace('{uv:atlasFor(n,fr),opacity:op,fog,glow}', "{uv:atlasFor(n,fr),opacity:op,fog,glow,localLight:n.startsWith('hero_')||n==='portal'}")
    replace('let dt=Math.min(.05,(now-clock)/1000||.016);', 'const rawDt=(now-clock)/1000;let dt=Math.min(.05,rawDt||.016);')
    replace('const dpr=Math.min(1.5,devicePixelRatio||1)', 'const dpr=Math.min(1.25,devicePixelRatio||1)*renderScale')
    replace('function atlasFor(n,frame){', "function atlasFor(n,frame){if(n.startsWith('hero_'))return [(frame%8 )/8+.5/2048,1-(Math.floor(frame/8)+1)/11+.5/2816,1/8-1/2048,1/11-1/2816];")
    start=src.index('const VQ=globalThis.HeroVisualQuality;');end=src.index('const drawList=[',start)
    # Retain the recognized renderer's contact shadow texture generation.
    previous=src[start:end];shadow=previous[previous.index('// A ground decal'):previous.index('// Match original frame foot pivot')]
    src=src[:start]+INPUT+shadow+DIAGNOSTICS+src[end:]
    start=src.index('const xAxis=',src.index('function render(now)'));end=src.index('const eyeX=',start)
    src=src[:start]+MOTION+src[end:]
    replace('gl.clearColor(.075,.047,.027,1);','gl.clearColor(.075,.047,.027,1);')
    # Add stone sentinels into the opaque geometry pass, not canvas substitutes for hero art.
    replace('// Ground shadow: a surface-following decal, independent of hero jump elevation.',ENEMIES.replace("'earth'", "(HERO_PACK.ground?'earth_ground':'earth')")+'\n// Ground shadow: a surface-following decal, independent of hero jump elevation.')
    replace('const heroYaw=Math.atan2(cam.x-player.x,cam.z-player.z),heroY=terrainY(player.x,player.z)-.22+player.y-footInset;',
      "const heroYaw=Math.atan2(cam.x-player.x,cam.z-player.z),heroY=terrainY(player.x,player.z)-.22+player.y-footInset;\nheroFacing=VQ.selectView(player.yaw,heroYaw,4,heroFacing);const heroName='hero_'+heroFacing;walkFrame=HeroAdventure.ACTIONS.indexOf(player.action)*8+player.frame;")
    replace("draw(plane,'hero',model(player.x,heroY,player.z,3.4,4.45,1,heroYaw),{uv:atlasFor('hero',walkFrame),cutout:.96});", "draw(plane,heroName,model(player.x,heroY,player.z,5,5,1,heroYaw),{uv:atlasFor(heroName,walkFrame),cutout:.96});")
    replace("layers.push(['hero',player.x,heroY,player.z,3.4,4.45,walkFrame,1,0,0,heroYaw]);", "layers.push([heroName,player.x,heroY,player.z,5,5,walkFrame,player.invulnerable>0?.82:1,0,0,heroYaw]);\nfor(const s of game.seals)if(!s.collected)layers.push(['portal',s.x,terrainY(s.x,s.z)+.25+Math.sin(t*3)*.1,s.z,1.2,1.2,Math.floor(t*7)%9,1,0,.6,Math.atan2(cam.x-s.x,cam.z-s.z)]);")
    replace("readout.textContent='X '+player.x.toFixed(1)+' · Z '+player.z.toFixed(1)+' · '+(moving?'идёт':'стоит');",'updateHUD();')
    replace('ТЕХНИЧЕСКИЙ PREVIEW · ИСХОДНЫЙ АРТ СОХРАНЁН','ТРИ ПЕЧАТИ · ОДИН ПУТЬ НАЗАД')
    replace('<div id="portalHint">Подойдите к порталу, нажмите E</div>', '<div id="portalHint">Победите трёх пепельных стражей и соберите печати</div>')
    hstart=src.index('<div id="help">');hend=src.index('<script>',hstart)
    src=src[:hstart]+UI+src[hend:]
    replace('</style>',CSS+'\n</style>')
    return src

INPUT=r'''
const VQ=globalThis.HeroVisualQuality;
const input=VQ.createInput({map:{KeyW:'up',ArrowUp:'up',KeyS:'down',ArrowDown:'down',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',ShiftLeft:'run',ShiftRight:'run',Space:'jump',KeyC:'crouch',ControlLeft:'crouch',KeyQ:'dodge',KeyF:'roll',KeyJ:'attack',KeyG:'grab',KeyE:'interact',KeyR:'restart',Escape:'pause',KeyP:'pause'}});
let audio=null,soundOn=true;
function sound(type){if(!soundOn||!audio)return;const tones={attack:150,hit:85,hurt:65,jump:240,land:55,dodge:180,seal:520,win:660};const o=audio.createOscillator(),g=audio.createGain();o.type=type==='seal'||type==='win'?'sine':'triangle';o.frequency.setValueAtTime(tones[type]||110,audio.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(30,(tones[type]||110)*.55),audio.currentTime+.15);g.gain.setValueAtTime(.035,audio.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+.25);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.26);}
function unlockAudio(){if(!audio){const Context=window.AudioContext||window.webkitAudioContext;if(Context)audio=new Context();}audio?.resume();}
const obstacles=[[-13,-14,2.5],[-18,-23,2.4],[6,-20,1.4],[10,-20,1.4],[14,-20,1.4],[18,-20,1.4],[21,-29,5],[-20,-8,2.5]];
function blocked(x,z,y=0){if(Math.abs(x)>24||z>13||z < -31)return true;for(const o of obstacles)if(Math.hypot(x-o[0],z-o[1])<o[2]+.45)return true;return false;}
let best=null;try{best=Number(localStorage.getItem('ash-frontier-best'))||null;}catch{}
const game=HeroAdventure.create({blocked,onSound:sound,onWin:time=>{if(!best||time<best){best=time;try{localStorage.setItem('ash-frontier-best',String(time));}catch{}}}});
let player=game.player,cam={x:0,y:4.9,z:20},mouseYaw=0,clock=performance.now(),frameTime=0,portalState=false;
let moving=false,walkFrame=0,heroFacing='back',lastDistance=0,renderScale=1,slowFrames=0;const footInset=5*(256-232)/256;
let pointer=null;canvas.addEventListener('pointerdown',e=>{pointer={id:e.pointerId,x:e.clientX};canvas.setPointerCapture(e.pointerId);unlockAudio();});
canvas.addEventListener('pointermove',e=>{if(!pointer||pointer.id!==e.pointerId)return;mouseYaw=VQ.clamp(mouseYaw+(e.clientX-pointer.x)*.006,-.96,.96);pointer.x=e.clientX;});
for(const ev of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(ev,()=>pointer=null);
window.addEventListener('blur',()=>{pointer=null;game.clearInputs();});
function start(){unlockAudio();game.begin();document.getElementById('overlay').hidden=true;input.clear();}
document.getElementById('startGame').addEventListener('click',start);
document.getElementById('resumeGame').addEventListener('click',()=>{const e=new KeyboardEvent('keydown',{code:'Escape',bubbles:true,cancelable:true});window.dispatchEvent(e);window.dispatchEvent(new KeyboardEvent('keyup',{code:'Escape',bubbles:true}));});
document.getElementById('restartGame').addEventListener('click',()=>{game.reset();player=game.player;start();});
document.getElementById('soundToggle').addEventListener('click',e=>{unlockAudio();soundOn=!soundOn;e.target.textContent=soundOn?'Звук: вкл':'Звук: выкл';e.target.setAttribute('aria-pressed',String(soundOn));});
document.getElementById('pauseGame').addEventListener('click',()=>{window.dispatchEvent(new KeyboardEvent('keydown',{code:'Escape',bubbles:true,cancelable:true}));window.dispatchEvent(new KeyboardEvent('keyup',{code:'Escape',bubbles:true}));});
window.addEventListener('keydown',e=>{if(e.code==='Enter'&&!game.started)start();if(e.code==='KeyJ'||e.code==='Space')unlockAudio();});
function updateHUD(){
 document.getElementById('healthFill').style.width=player.hp+'%';document.getElementById('staminaFill').style.width=player.stamina+'%';
 document.getElementById('healthText').textContent=Math.ceil(player.hp);document.getElementById('sealCount').textContent=game.collected+'/3';
 readout.textContent='Печати '+game.collected+'/3 · '+Math.floor(game.time)+' с'+(best?' · рекорд '+Math.round(best)+' с':'');
 const nearSeal=game.seals.some(s=>!s.collected&&Math.hypot(s.x-player.x,s.z-player.z)<1.6);
 const hint=document.getElementById('portalHint');hint.textContent=nearSeal?'Нажмите E — забрать печать.':game.collected===3?'Три печати собраны. Вернитесь к порталу и нажмите E.':game.grabbed!==null?'Страж захвачен: J — бросить, отпустите G — освободить.':'Победите трёх стражей. Яркое свечение — приготовьтесь уклониться.';
 const end=game.won||player.hp<=0,overlay=document.getElementById('overlay');overlay.hidden=game.started&&!game.paused&&!end;
 document.getElementById('startGame').hidden=game.started;
 document.getElementById('resumeGame').hidden=!game.paused;
 document.getElementById('restartGame').hidden=!end;
 document.getElementById('overlayTitle').textContent=game.won?'ПУТЬ ОТКРЫТ':player.hp<=0?'ПЕПЕЛ ПОМНИТ':game.paused?'ПАУЗА':'ПЕПЕЛЬНЫЙ ПРЕДЕЛ';
 document.getElementById('overlayText').textContent=game.won?'Вы собрали три печати и вернулись домой за '+Math.round(game.time)+' с.':player.hp<=0?'Странствие окончено. Попробуйте снова: уклонение и захват помогают пережить удар.':game.paused?'Нажмите «Продолжить» или Esc.':'Три каменных стража удерживают печати портала. Победите их, соберите печати и вернитесь к огненному кольцу.';
}
'''

DIAGNOSTICS=r'''
Object.defineProperty(globalThis,'heroGameEvidence',{get:()=>({...game.snapshot(),version:'0.10.0',facing:heroFacing,atlasFrame:walkFrame,artClips:Object.keys(HERO_PACK.anims).length,textures:ready,cameraYaw:mouseYaw,renderScale,glError:gl.getError(),audio:audio?.state??'not-started',artProvenance:HERO_PACK.provenance})});
'''
MOTION=r'''
const oldX=player.x,oldZ=player.z;game.update(dt,input,mouseYaw);player=game.player;input.endFrame();
slowFrames=rawDt>.09?slowFrames+1:Math.max(0,slowFrames-1);if(slowFrames>=15&&renderScale>.6){renderScale=Math.max(.6,renderScale*.8);slowFrames=0;}
lastDistance=Math.hypot(player.x-oldX,player.z-oldZ);moving=lastDistance>.00001;portalState=game.collected===3;
'''
ENEMIES=r'''
for(const e of game.enemies){
 const groundY=terrainY(e.x,e.z)-.22;
 if(e.state==='dead'){draw(box,'earth',model(e.x,groundY,e.z,1.5,.38,1.2,e.yaw),{shade:.8,fog:.3});continue;}
 const bob=e.state==='chase'?Math.sin(t*8+e.id)*.07:0;
 const wind=e.state==='windup'?Math.sin(e.age*17)*.1:0;
 draw(box,'earth',model(e.x,groundY+bob,e.z,1.15,1.7+wind,.9,e.yaw),{shade:.7,fog:.25,glow:e.flash?2:e.state==='windup'?1.5:.1,tint:e.state==='windup'?[2,.65,.25]:[1.2,1.1,1]});
 draw(box,'earth',model(e.x,groundY+1.7+bob,e.z,.9,.7,.8,e.yaw),{shade:.65,fog:.2,glow:e.state==='windup'?2.4:.4});
 const eyeY=groundY+2.07+bob,ex=e.x+Math.sin(e.yaw)*.46,ez=e.z+Math.cos(e.yaw)*.46;
 draw(box,'earth',model(ex,eyeY,ez,.55,.12,.13,e.yaw),{shade:0,glow:4});
 // Three physical rune blocks show remaining health without screen-space labels.
 for(let hp=0;hp<e.hp;hp++)draw(box,'earth',model(e.x+(hp-1)*.26,groundY+2.7,e.z,.18,.18,.18,t*.6),{shade:0,glow:2});
}
'''
UI=r'''
<div id="help">WASD — идти · Shift — бег · Space — прыжок · C — присесть · Q — уклониться · F — перекат · J — удар · G — захват · E — взять / портал · Esc — пауза · R — заново</div>
<div id="meters"><label>Жизнь <span id="healthText">100</span><div class="meter"><i id="healthFill"></i></div></label><label>Выносливость<div class="meter"><i id="staminaFill"></i></div></label><strong>ПЕЧАТИ <span id="sealCount">0/3</span></strong></div>
<div id="topButtons"><button id="pauseGame" aria-label="Пауза">Ⅱ</button><button id="soundToggle" aria-pressed="true">Звук: вкл</button></div>
<div id="mobile"><div class="pad"><button data-hero-key="up" aria-label="Вперёд">↑</button><button data-hero-key="left" aria-label="Влево">←</button><button data-hero-key="down" aria-label="Назад">↓</button><button data-hero-key="right" aria-label="Вправо">→</button></div><div class="actions"><button data-hero-key="attack">УДАР</button><button data-hero-key="grab">ЗАХВАТ</button><button data-hero-key="jump">ПРЫЖОК</button><button data-hero-key="dodge">УКЛОН</button><button data-hero-key="roll">ПЕРЕКАТ</button><button data-hero-key="crouch">ПРИСЕД</button><button data-hero-key="run">БЕГ</button><button data-hero-key="interact">ПОРТАЛ</button></div></div>
<div id="overlay"><section><small>ЖИВОПИСНОЕ ПРИКЛЮЧЕНИЕ</small><h2 id="overlayTitle">ПЕПЕЛЬНЫЙ ПРЕДЕЛ</h2><p id="overlayText"></p><p class="guide">J — удар · держать G — захват · J в захвате — бросок<br>Q / F — уклонение / перекат · Space — прыжок</p><button id="startGame">НАЧАТЬ ПУТЬ</button><button id="resumeGame" hidden>ПРОДОЛЖИТЬ</button><button id="restartGame" hidden>ПОПРОБОВАТЬ СНОВА</button></section></div>
'''
CSS=r'''
[hidden]{display:none!important}#meters{position:absolute;top:112px;left:26px;z-index:5;display:grid;gap:9px;width:190px;font:11px Arial;color:#e2bf88}#meters label{display:block}.meter{height:5px;background:#241a14;border:1px solid #725036;margin-top:4px}.meter i{display:block;height:100%;width:100%;background:#b64931;transition:width .12s}#staminaFill{background:#c7a765}.meter span{float:right}#topButtons{position:absolute;top:66px;right:20px;z-index:6;display:flex;gap:7px}#topButtons button{font-size:12px;width:auto;padding:8px 13px;height:36px;border-radius:6px}#help{font-size:11px;max-width:850px}#mobile{align-items:end}.actions{display:grid;grid-template-columns:repeat(4,48px);gap:5px}.actions button{width:48px;height:44px;font-size:9px;border-radius:8px}.pad{grid-template-columns:repeat(3,44px)}.pad button{width:44px;height:44px}#overlay{position:absolute;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;background:linear-gradient(#0b0806b8,#100905e8);backdrop-filter:blur(3px);color:#eed9ae;font-family:Georgia,serif;text-align:center;padding:18px}#overlay section{max-width:540px;padding:30px;border:1px solid #a7783f66;background:#17100be8;box-shadow:0 20px 100px #0009}#overlay small{font:10px Arial;letter-spacing:.2em;color:#bb9058}#overlay h2{font-size:32px;letter-spacing:.06em}#overlay p{line-height:1.65;color:#d5bd95}#overlay .guide{font:12px/1.8 Arial;color:#bd9c6d}#overlay button{width:auto;min-width:200px;height:48px;font:12px Arial;letter-spacing:.1em;border-radius:4px;padding:0 20px;background:#6d4225;margin-top:8px}#portalHint{max-width:320px;line-height:1.5}#status{font-size:10px}
@media(max-width:760px){#hud h1{font-size:22px}#hud small{font-size:8px}#meters{left:15px;top:105px;width:135px;font-size:10px;gap:6px}#portalHint{top:155px;left:15px;right:auto;max-width:220px;font-size:10px;padding:6px}#topButtons{top:105px;right:12px}#help{display:none}#mobile{left:8px;right:8px;bottom:12px}#overlay h2{font-size:24px}#overlay section{padding:20px}#overlay p{font-size:14px}}
@media(pointer:coarse) and (orientation:landscape){#hud h1{font-size:17px}#hud small{display:none}#meters{top:75px;width:125px;font-size:9px;gap:4px}#portalHint{top:10px;left:auto;right:12px;max-width:310px;font-size:10px}#topButtons{top:60px}#overlay section{padding:12px;max-width:600px}#overlay h2{font-size:22px;margin:8px}#overlay p{margin:8px;font-size:12px}#overlay .guide{font-size:10px}.actions button{height:38px}.pad button{width:40px;height:40px}.pad{grid-template-columns:repeat(3,40px)}}
'''

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('input',type=Path);p.add_argument('pack',type=Path);p.add_argument('output',type=Path);p.add_argument('--canonical',type=Path,required=True);a=p.parse_args()
    if a.output.resolve()==a.input.resolve():p.error('Original must be retained')
    base=Path(__file__).resolve().parent.parent
    result=build(a.input.read_text(encoding='utf8'),json.loads(a.pack.read_text(encoding='utf8')),(base/'runtime/visual-quality.js').read_text(encoding='utf8'),(base/'runtime/ash-adventure.js').read_text(encoding='utf8'),hashlib.sha256(a.canonical.read_bytes()).hexdigest())
    a.output.parent.mkdir(parents=True,exist_ok=True);a.output.write_text(result,encoding='utf8');print(json.dumps({'output':str(a.output),'bytes':a.output.stat().st_size,'sha256':hashlib.sha256(a.output.read_bytes()).hexdigest(),'clips':44,'frames':352}))
if __name__=='__main__':main()
