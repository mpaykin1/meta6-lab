#!/usr/bin/env python3
"""Hero Animator: approved GIF -> locked-pixel 2.5D/3D game with command-only actor actions."""
from __future__ import annotations
import argparse, hashlib, json, math, shutil, zipfile
from pathlib import Path
from PIL import Image, ImageChops

BASE=Path(__file__).resolve().parent.parent
ENGINE=BASE/'runtime'/'gif2game_engine.js'

def digest(p):
    h=hashlib.sha256()
    with p.open('rb') as fh:
        for part in iter(lambda:fh.read(1<<20),b''):h.update(part)
    return h.hexdigest()

def exact(a,b):
    # RGBA getbbox may ignore RGB changes when alpha is unchanged.
    # Preserve every source byte, including hidden RGB under transparent pixels.
    return a.size==b.size and a.mode==b.mode and a.tobytes()==b.tobytes()

def make_clip(p,assets):
    with Image.open(p) as im:
        w,h=im.size;n=getattr(im,'n_frames',1)
        if not(0<w<=4096 and 0<h<=4096 and 0<n<=300):raise ValueError('Invalid GIF size/frame count: '+str(p))
        frames=[];times=[];has_alpha=False
        for i in range(n):
            im.seek(i);f=im.convert('RGBA');frames.append(f)
            times.append(max(20,int(im.info.get('duration',100) or 100)))
            has_alpha |= f.getchannel('A').getextrema()[0]<255
    cols=min(n,4096//w);rows=math.ceil(n/cols)
    if rows*h>4096:raise ValueError('GIF exceeds 4096x4096 atlas limit: '+p.name)
    sheet=Image.new('RGBA',(cols*w,rows*h),(0,0,0,0))
    for i,f in enumerate(frames):sheet.paste(f,((i%cols)*w,(i//cols)*h))
    ident='gif_'+digest(p)[:16]
    png=assets/(ident+'.png');webp=assets/(ident+'.webp')
    sheet.save(png,format='PNG',optimize=True,compress_level=9)
    result=png
    try:
        sheet.save(webp,format='WEBP',lossless=True,method=6,exact=True)
        with Image.open(webp) as test: same=exact(sheet,test.convert('RGBA'))
        if same and webp.stat().st_size<png.stat().st_size:result=webp
    except Exception:pass
    for file in (png,webp):
        if file!=result and file.exists():file.unlink()
    with Image.open(result) as test:
        output=test.convert('RGBA')
        for i,frame in enumerate(frames):
            rect=(i%cols*w,i//cols*h,(i%cols+1)*w,(i//cols+1)*h)
            if not exact(output.crop(rect),frame):raise RuntimeError('Pixel corruption in '+p.name+' frame '+str(i))
    return dict(id=ident,name=p.name,sourceSHA256=digest(p),sheet=result.name,sheetSHA256=digest(result),width=w,height=h,sheetWidth=cols*w,sheetHeight=rows*h,cols=cols,rows=rows,timings=times,alpha=has_alpha,seconds=sum(times)/1000,frameCount=n)

def role_of(c):
    s=c['name'].lower();aspect=c['width']/c['height']
    if any(w in s for w in ('портал','portal','gate','врата')):return 'portal'
    if any(w in s for w in ('руин','фон','пейзаж','landscape','background','scenery','forest','sky')) or (not c['alpha'] and aspect>2.1):return 'background'
    for role,parts in [('attack',['удар','атак','attack','sword','strike','slash']),('crouch',['присед','crouch','duck','kneel']),('jump',['прыж','jump','leap']),('pickup',['подбор','pickup','collect','take']),('run',['run','sprint','бег']),('walk',['шаг','walk','ход','step']),('idle',['idle','стой','ожидан','stand','странствующего воина'])]:
        if any(w in s for w in parts):return role
    return 'idle' if c['alpha'] else 'background'

def make_roles(clips,configuration):
    byname={c['name']:c['id'] for c in clips}; byid={c['id']:c['id'] for c in clips}
    keys=('background','portal','idle','walk','run','crouch','jump','pickup','attack','extras')
    roles={k:([] if k=='extras' else None) for k in keys}; segments={}
    supplied=({k:v for k,v in configuration.items() if k in keys} if 'character_lock' in configuration and 'roles' not in configuration else configuration.get('roles',configuration)) if configuration else None
    if supplied:
        for k,v in supplied.items():
            if k in ('segments','version','character_lock'):continue
            if k not in keys:raise ValueError('Unknown role '+k)
            def get(item):
                if not item:return None
                value=byname.get(item,byid.get(item))
                if not value:raise ValueError('Role references unapproved GIF: '+str(item))
                return value
            roles[k]=[get(x) for x in v] if k=='extras' else get(v)
    else:
        for c in clips:
            role=role_of(c)
            if role in roles and roles[role] is None:roles[role]=c['id']
            elif role=='walk' and roles['run'] is None:roles['run']=c['id']
            else:roles['extras'].append(c['id'])
    if not roles['idle'] and not (configuration or {}).get('character_lock'):
        actors=[c['id'] for c in clips if c['alpha'] and c['id']!=roles['portal']]
        if actors: roles['idle']=actors[0]
    # No cross-action automatic substitution: missing walk stays unavailable.
    # Explicit source frame attribution is the only safe way to split a mixed-action GIF.
    rawSegments=(configuration or {}).get('segments',{})
    for action,rule in rawSegments.items():
        if action not in ('idle','walk','run','crouch','jump','attack','pickup'):
            raise ValueError('Unknown segment action '+action)
        if not isinstance(rule,dict):raise ValueError('Segment must be object: '+action)
        clipname=rule.get('clip')
        clipid=byname.get(clipname,byid.get(clipname)) if clipname else roles.get(action)
        if not clipid:raise ValueError('Unapproved segment source for '+action)
        clip=next(c for c in clips if c['id']==clipid)
        frames=rule.get('frames')
        if not isinstance(frames,list) or not frames or any(type(i)!=int or i<0 or i>=clip['frameCount'] for i in frames):
            raise ValueError('Invalid frame selection '+action)
        segments[action]={'clip':clipid,'frames':frames}
        # Only expose crouch, pickup etc if corresponding approved frames exist.
        roles[action]=clipid
    # Fail-closed: idle never autoplays. Source GIF can contain run/crouch/death frames.
    if roles['idle'] and 'idle' not in segments:segments['idle']={'clip':roles['idle'],'frames':[0]}
    return roles,segments

# Identity Lock is a *source approval contract*, not AI face matching.
# It protects against opportunistically mixing GIFs that look vaguely similar.
PLAYER_ACTIONS=('idle','walk','run','crouch','jump','attack','pickup')

def enforce_character_lock(clips,roles,segments,config):
    by_id={c['id']:c for c in clips}
    by_sha={c['sourceSHA256']:c for c in clips}
    lock=(config or {}).get('character_lock')
    actor_sources={roles[a] for a in PLAYER_ACTIONS if roles.get(a)}
    if not lock:
        # One GIF may have several authored action segments, but a second GIF is
        # never automatically accepted as the same hero, even if named 'attack'.
        if len(actor_sources)>1:
            raise ValueError('CHARACTER_IDENTITY_LOCK: several actor GIF sources detected. '
                             'Review all frames and supply an explicitly approved character_lock '
                             'with hero_id, reference_sha256 and action SHA-256/frame maps; '
                             'do not assign attacks by filename alone.')
        if not roles['idle']:
            raise ValueError('CHARACTER_IDENTITY_LOCK: approved hero idle is missing')
        ref=by_id[roles['idle']]
        if not ref['alpha']:
            raise ValueError('CHARACTER_IDENTITY_LOCK: selected player sprite must have an alpha channel; supply a cutout GIF')
        safe={}
        # Without a human-approved pack, only explicitly segmented frames from
        # the SAME input GIF may be used; do not infer attack from unrelated GIF.
        for action in PLAYER_ACTIONS:
            seg=segments.get(action)
            if action=='idle':
                seg=seg or {'clip':ref['id'],'frames':[0]}
            if seg and seg['clip']==ref['id'] and roles.get(action)==ref['id']:
                safe[action]={'clip':ref['id'],'frames':list(seg['frames']),'sourceSHA256':ref['sourceSHA256']}
            else:
                roles[action]=None
                segments.pop(action,None)
        if 'idle' not in safe:raise ValueError('CHARACTER_IDENTITY_LOCK: no idle frame')
        return roles,segments,{'enabled':True,'heroId':'single-approved-source','referenceSHA256':ref['sourceSHA256'],'mode':'one-source','actions':safe}

    if not isinstance(lock,dict) or lock.get('approved') is not True:
        raise ValueError('CHARACTER_IDENTITY_LOCK: character_lock must be explicitly approved after comparing EVERY frame with the chosen hero')
    hero_id=lock.get('hero_id')
    ref_sha=lock.get('reference_sha256')
    specs=lock.get('actions')
    if not isinstance(hero_id,str) or not hero_id.strip() or not isinstance(ref_sha,str) or ref_sha not in by_sha:
        raise ValueError('CHARACTER_IDENTITY_LOCK: hero_id or reference_sha256 invalid')
    if not isinstance(specs,dict) or 'idle' not in specs:
        raise ValueError('CHARACTER_IDENTITY_LOCK: approval must define idle and all intended actions')
    ref=by_sha[ref_sha]
    if not ref['alpha']:raise ValueError('CHARACTER_IDENTITY_LOCK: hero reference must have transparency')
    approved={}
    for action in PLAYER_ACTIONS:
        entry=specs.get(action)
        if entry is None:
            if roles.get(action):
                raise ValueError('CHARACTER_IDENTITY_LOCK: '+action+' has no approved character frames. '
                                 'Remove the action or approve its GIF; substitution is forbidden.')
            roles[action]=None;segments.pop(action,None)
            continue
        if not isinstance(entry,dict):raise ValueError('CHARACTER_IDENTITY_LOCK: invalid approved action '+action)
        sha=entry.get('sha256')
        c=by_sha.get(sha)
        if c is None or not c['alpha']:
            raise ValueError('CHARACTER_IDENTITY_LOCK: '+action+' source digest missing/invalid/not RGBA')
        fr=entry.get('frames')
        if not isinstance(fr,list) or not fr or any(type(i)!=int or i<0 or i>=c['frameCount'] for i in fr):
            raise ValueError('CHARACTER_IDENTITY_LOCK: '+action+' requires precise approved frame indices')
        if action=='idle' and len(fr)!=1:
            raise ValueError('CHARACTER_IDENTITY_LOCK: strict idle must use one static frame')
        if roles.get(action) and roles[action]!=c['id']:
            raise ValueError('CHARACTER_IDENTITY_LOCK: '+action+' role conflicts with approved hero clip')
        if segments.get(action) and (segments[action]['clip']!=c['id'] or segments[action]['frames']!=fr):
            raise ValueError('CHARACTER_IDENTITY_LOCK: '+action+' frames conflict with approved frame set')
        roles[action]=c['id'];segments[action]={'clip':c['id'],'frames':fr}
        approved[action]={'clip':c['id'],'frames':fr,'sourceSHA256':sha}
    if not approved.get('idle'):
        raise ValueError('CHARACTER_IDENTITY_LOCK: missing idle action')
    required=lock.get('required_actions',list(PLAYER_ACTIONS))
    if not isinstance(required,list) or any(x not in PLAYER_ACTIONS for x in required):
        raise ValueError('CHARACTER_IDENTITY_LOCK: invalid required_actions')
    missing=[x for x in required if x not in approved]
    if missing:
        raise ValueError('CHARACTER_IDENTITY_LOCK: missing pre-drawn approved actions: '+', '.join(missing))
    # A secondary actor animation cannot masquerade as decorative 'extras'.
    hero_clips={spec['clip'] for spec in approved.values()}
    roles['extras']=[cid for cid in roles['extras'] if cid not in hero_clips]
    return roles,segments,{'enabled':True,'heroId':hero_id.strip(),'referenceSHA256':ref_sha,
            'mode':'approved-identity-pack','actions':approved}

HTML='''<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><title>__TITLE__</title><style>
*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden;touch-action:none;background:#16110e;color:#f2ca9a;font-family:Georgia,serif}#game{position:absolute;inset:0;width:100%;height:100%;display:block;outline:none}#hud{position:absolute;left:15px;top:14px;right:15px;display:flex;gap:12px;align-items:center;font-size:14px;letter-spacing:.18em;text-shadow:0 2px 7px #000;pointer-events:none}#fps{margin-left:auto;font-size:11px}button{background:#22130fc9;border:1px solid #ad784b;color:#ffd8a8;border-radius:6px;min-width:45px;min-height:43px;cursor:pointer;touch-action:none;user-select:none}button.pressed,button:active{background:#9b5428}#fx,#full,#restart{pointer-events:auto}#hint{position:absolute;left:0;right:0;bottom:4px;text-align:center;font-size:12px;letter-spacing:.08em;text-shadow:0 2px 6px #000;pointer-events:none}#touch{position:absolute;bottom:32px;left:12px;right:12px;display:flex;justify-content:space-between;gap:8px;pointer-events:none}#touch>div{display:flex;gap:7px;pointer-events:auto}#touch button{min-width:54px;height:54px}#victory{position:absolute;inset:0;display:grid;place-items:center;z-index:5;background:#140a06b8;font-size:clamp(20px,4vw,45px);text-align:center}#victory[hidden]{display:none}#loading{position:absolute;inset:0;display:grid;place-items:center;background:#1d120b;z-index:9}@media (pointer:fine){#touch{opacity:.24}#touch:hover{opacity:1}}@media(max-width:750px){#hud{font-size:10px;gap:4px;letter-spacing:0}#hint{font-size:9px}#touch button{min-width:42px;height:46px}}
</style><script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js"}}</script></head><body>
<canvas id="game" tabindex="0" aria-label="Игровая сцена"></canvas>
<div id="hud"><span>ПОСЛЕДНЕЕ ЗЕРНО</span><span id="fps">— FPS</span><button id="fx" class="active">FX</button><button id="full">⛶</button><button id="restart">↻</button></div>
<div id="touch"><div><button id="left" aria-label="Влево">←</button><button id="right" aria-label="Вправо">→</button><button id="run" aria-label="Бег">БЕГ</button></div><div><button id="crouch" aria-label="Присесть">↓</button><button id="jump" aria-label="Прыжок">↑</button><button id="attack" aria-label="Атака">⚔</button><button id="interact" aria-label="Взять">E</button></div></div>
<div id="hint">← → ХОДЬБА · SHIFT+←→ БЕГ · ↑ / SPACE ПРЫЖОК · ↓ ПРИСЕСТЬ · J АТАКА · E ВЗЯТЬ</div>
<div id="victory" hidden>ПОРТАЛ ПРОБУЖДЁН</div><div id="loading">ЗАГРУЗКА ОРИГИНАЛЬНЫХ GIF-КАДРОВ</div><script type="module" src="./engine.js"></script></body></html>'''

def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('gifs',nargs='*',type=Path)
    ap.add_argument('--from-dir',type=Path)
    ap.add_argument('--out',required=True,type=Path)
    ap.add_argument('--roles',type=Path,help='JSON with roles and optional segments for mixed-action clips')
    ap.add_argument('--title',default='Последнее зерно')
    ap.add_argument('--webm',type=Path)
    ap.add_argument('--keep-gifs',action='store_true')
    ap.add_argument('--no-zip',action='store_true')
    args=ap.parse_args()
    sources=[*args.gifs]
    if args.from_dir:sources.extend(sorted(args.from_dir.glob('*.gif')))
    if not sources:ap.error('Supply approved GIF files')
    uniques=[];seen=set()
    for p in sources:
        if not p.is_file() or p.suffix.lower()!='.gif':ap.error('Missing GIF '+str(p))
        key=digest(p)
        if key not in seen:uniques.append(p);seen.add(key)
    out=args.out.resolve();assets=out/'assets';assets.mkdir(parents=True,exist_ok=True)
    clips=[make_clip(s,assets) for s in uniques]
    config=json.loads(args.roles.read_text(encoding='utf-8')) if args.roles else None
    roles,segments=make_roles(clips,config)
    roles,segments,character_lock=enforce_character_lock(clips,roles,segments,config)
    webm=None
    if args.webm:
        if not args.webm.is_file() or args.webm.suffix.lower()!='.webm':ap.error('Invalid WebM source')
        webm='atmosphere.webm';shutil.copy2(args.webm,assets/webm)
    if args.keep_gifs:
        preview=out/'previews';preview.mkdir(exist_ok=True)
        for i,p in enumerate(uniques):shutil.copy2(p,preview/(f'{i:02d}_'+p.name))
    data={'version':2,'title':args.title,'clips':clips,'roles':roles,'segments':segments,'characterLock':character_lock,'webm':webm,'inputContract':'idle frames frozen until player keydown; all locomotion, crouch, jump, attack, pickup are command-gated; on blur release keys', 'sourcePolicy':'Lossless RGBA from approved GIF, no artistic alteration'}
    (assets/'game.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
    from html import escape
    (out/'index.html').write_text(HTML.replace('__TITLE__',escape(args.title)),encoding='utf-8')
    shutil.copy2(ENGINE,out/'engine.js')
    if not args.no_zip:
        with zipfile.ZipFile(out.with_suffix('.zip'),'w',compression=zipfile.ZIP_DEFLATED,compresslevel=7) as z:
            for p in out.rglob('*'):
                if p.is_file():z.write(p,p.relative_to(out))
    print('GAME:',out/'index.html','ZIP:',out.with_suffix('.zip'))

if __name__=='__main__':main()


