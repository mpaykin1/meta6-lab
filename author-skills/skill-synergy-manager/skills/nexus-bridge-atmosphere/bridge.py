#!/usr/bin/env python3
"""Skill Nexus 3: real cross-plugin file ingestion into an editable game scene.

The importer is intentionally conservative. It never starts a character action,
changes an approved portrait, creates a second physics/FX engine or runs untrusted
JavaScript. An imported resource becomes playable only after the runtime has
loaded the resulting scene. A successful handoff alone is not gameplay proof.
"""
from __future__ import annotations
import argparse, hashlib, json, shutil, re, struct, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parent
MAP=ROOT/'routes.json'
ROLES=['hero-animator','voxel-game-creator','casual-game-studio','voxel-atmosphere-engine',
       'game-style-forge','blender-model-animation-enhancer','meta-game-fusion']
KINDS={'.png',' .glb','.json'}

def load(path):
    return json.loads(Path(path).read_text('utf-8'))
def save(path,data):
    p=Path(path);p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(data,ensure_ascii=False,indent=2,sort_keys=True)+'\n','utf-8')
def sha(path):
    h=hashlib.sha256()
    with Path(path).open('rb') as f:
        for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
    return h.hexdigest()
def route(source,target):
    for r in load(MAP)['edges']:
        if r['from']==source and r['to']==target:return r
    raise ValueError(f'unknown route {source}->{target}')
def safe(path):
    p=Path(path)
    if p.is_absolute() or '..' in p.parts or any(x.startswith('.') for x in p.parts):raise ValueError('unsafe relative file path')
    return p

def validate_asset(path,kind):
    p=Path(path)
    if not p.is_file() or p.is_symlink():raise ValueError('not regular asset')
    if p.stat().st_size>64*1024*1024:raise ValueError('oversized asset')
    if kind=='style_profile.json' and p.name!='style_profile.json':raise ValueError('expected style_profile.json')
    if kind in ('json','style_profile.json'):
        v=load(p)
        if not isinstance(v,dict):raise ValueError('JSON object required')
        return v
    if kind=='png':
        with p.open('rb') as f:head=f.read(24)
        if len(head)<24 or head[:8]!=b'\x89PNG\r\n\x1a\n' or head[12:16]!=b'IHDR':raise ValueError('PNG header')
        w,h=struct.unpack('>II',head[16:24]);
        if w==0 or h==0 or w>4096 or h>4096:raise ValueError('PNG dimensions')
        from PIL import Image
        with Image.open(p) as im:
            im.verify()
        return {'width':w,'height':h}
    if kind=='glb':
        with p.open('rb') as f:
            h=f.read(20)
            if len(h)!=20 or h[:4]!=b'glTF' or struct.unpack('<II',h[4:12])!=(2,p.stat().st_size):
                raise ValueError('GLB header/version/size')
            chunklen,tag=struct.unpack('<I4s',h[12:20])
            if tag!=b'JSON' or chunklen>p.stat().st_size-20:raise ValueError('GLB JSON chunk')
            data=json.loads(f.read(chunklen).decode('utf8').strip())
        if not data.get('meshes') or not data.get('nodes') or not data.get('scenes'):
            raise ValueError('GLB must contain a real mesh, nodes and scene')
        return {'meshes':len(data['meshes']),'nodes':len(data['nodes']),'animations':len(data.get('animations',[]))}
    raise ValueError('unknown payload kind')

def color(c):
    return isinstance(c,str) and re.fullmatch('#[a-fA-F0-9]{6}',c)

def extract(kind,path,target,source):
    p=Path(path);v=validate_asset(p,kind)
    result={'route_type':kind,'receiver':target,'source':source,'consumed':True}
    if kind=='style_profile.json':
        raw=v.get('palette') or v.get('lab_palette') or v.get('palette_rgb') or []
        colors=[c for c in raw if color(c)]
        if len(colors)<2:raise ValueError('style palette must have at least two hex colors')
        result.update({'palette':colors[:8],'style_applied':True,'fog_intensity':min(.8,max(0.,float(v.get('fog_density',.22))))})
    elif kind=='png':
        from PIL import Image,ImageStat
        with Image.open(p) as im:
            rgb=im.convert('RGB').resize((24,24));m=ImageStat.Stat(rgb).mean
        result.update(v);result['preview_color']='#'+''.join('%02x'%round(x) for x in m)
        result['reference_loaded']=True
    elif kind=='glb':
        result.update(v)
        result['mesh_loaded']=True
        result['identity_preserved']=True
    else:
        # Not an unvalidated key-value dump: each receiving game subsystem must
        # understand and transform at least one meaningful source property.
        d=v
        if target=='hero-animator':
            actions=d.get('actions') or d.get('inputs') or d.get('hero_actions')
            lighting=d.get('lighting') or d.get('effects')
            if not actions and not lighting:raise ValueError('hero actions or lighting required')
            result['hero_inputs']=actions;result['hero_lighting']=lighting;result['idle_forced']=True;result['character_unchanged']=True
        elif target=='voxel-game-creator':
            palette=d.get('palette') or d.get('colors') or d.get('lighting')
            placements=d.get('placements') or d.get('objects') or d.get('colliders') or d.get('navigation')
            hero=d.get('hero_actions')
            if palette is None and placements is None and hero is None:raise ValueError('voxel colors, layout or hero state required')
            result['voxel_colors']=palette;result['placements']=placements;result['hero_actions']=hero;result['blocks_adapted']=True
        elif target=='casual-game-studio':
            events=d.get('events') or d.get('timeline') or d.get('actions') or d.get('quests')
            lighting=d.get('lighting') or d.get('weather') or d.get('fx')
            if events is None and lighting is None:raise ValueError('casual events or lighting required')
            result['casual_events']=events;result['casual_lighting']=lighting;result['input_only']=True
        elif target=='voxel-atmosphere-engine':
            light=d.get('lighting') or d.get('palette') or d.get('weather') or d.get('effects') or d.get('events') or d.get('hero_state')
            if light is None:raise ValueError('atmosphere weather/lighting or events required')
            result['atmosphere']=light;result['postfx_owner']='game-runtime'
        elif target=='blender-model-animation-enhancer':
            guide=d.get('material') or d.get('poses') or d.get('silhouette') or d.get('defects') or d.get('palette')
            if guide is None:raise ValueError('model constraints required')
            result['blender_guidance']=guide
            # Metadata import is NOT evidence that native Blender processing ran.
            result['native_blender_executed']=False
        elif target=='meta-game-fusion':
            s=d.get('events') or d.get('nodes') or d.get('actor') or d.get('fx') or d.get('world') or d.get('materials')
            if s is None:raise ValueError('fusion event/world/fx data required')
            result['fusion_data']=s;result['physics_owner']='game-runtime'
        else:
            raise ValueError('unexpected JSON importer')
    return result

def emit(args):
    r=route(args.role,args.to)
    asset=Path(args.asset).resolve(strict=True)
    information=validate_asset(asset,r['payload_kind'])
    if not args.rights_owned:raise ValueError('explicit --rights-owned is required')
    if ('hero-animator' in (args.role,args.to)) and not args.character:
        raise ValueError('Hero Animator requires --character')
    out=Path(args.out).resolve()
    if out.exists():raise ValueError('refusing to overwrite existing bundle')
    out.mkdir(parents=True);(out/'payload').mkdir()
    dest=out/'payload'/asset.name;shutil.copyfile(asset,dest)
    manifest={'schema':'skill-nexus.native/1','route_id':r['id'],'source':args.role,'target':args.to,
              'game_id':args.game,'character_id':args.character or None,'rights_owned':True,
              'kind':r['payload_kind'],'artifact':asset.name,'sha256':sha(dest),'size':dest.stat().st_size,
              'source_file_verified':True,'status':'source_exported'}
    save(out/'handoff.json',manifest)
    print(out)

def receive(args):
    package=Path(args.bundle).resolve(strict=True)
    manifest=load(package/'handoff.json')
    if manifest.get('schema')!='skill-nexus.native/1':raise ValueError('incompatible bundle')
    r=route(manifest.get('source'),args.role)
    if r['id']!=manifest.get('route_id') or manifest.get('target')!=args.role:raise ValueError('wrong destination')
    if not manifest.get('rights_owned'):raise ValueError('unlicensed payload')
    kind=r['payload_kind'];filename=safe(manifest['artifact'])
    if len(filename.parts)!=1:raise ValueError('single asset required')
    item=package/'payload'/filename
    if item.is_symlink() or not item.is_file() or sha(item)!=manifest['sha256'] or item.stat().st_size!=manifest['size']:
        raise ValueError('payload tampered')
    if ('hero-animator' in (args.role,manifest['source'])) and not manifest.get('character_id'):
        raise ValueError('missing hero lock')
    content=extract(kind,item,args.role,manifest['source'])
    statepath=Path(args.scene).resolve()
    if statepath.exists():
        state=load(statepath)
        if state.get('game_id')!=manifest['game_id']:raise ValueError('game_id mismatch')
        if manifest.get('character_id') and state.get('character_id') and state['character_id']!=manifest['character_id']:
            raise ValueError('character identity conflict')
    else:
        state={'schema':'skill-nexus.scene/1','game_id':manifest['game_id'],
               'character_id':manifest.get('character_id'),'links':{},'assets':{}}
    rid=r['id'];state['links'][rid]=content
    if manifest.get('character_id') and not state.get('character_id'):
        state['character_id']=manifest['character_id']
    if kind in ('glb','png'):
        dest=statepath.parent/'assets'/sha(item)[:16]
        dest.mkdir(parents=True,exist_ok=True)
        actual=dest/item.name
        if not actual.exists():shutil.copyfile(item,actual)
        state['assets'][rid]=str(actual.relative_to(statepath.parent)).replace('\\','/')
    save(statepath,state)
    print(rid+' consumed')

def main():
    a=argparse.ArgumentParser();a.add_argument('--role',choices=['voxel-atmosphere-engine'],default='voxel-atmosphere-engine')
    sub=a.add_subparsers(dest='command',required=True)
    e=sub.add_parser('export');e.add_argument('--to',choices=ROLES,required=True)
    e.add_argument('--asset',required=True);e.add_argument('--out',required=True)
    e.add_argument('--game',required=True);e.add_argument('--character',default='')
    e.add_argument('--rights-owned',action='store_true')
    i=sub.add_parser('import');i.add_argument('--bundle',required=True);i.add_argument('--scene',required=True)
    args=a.parse_args()
    if args.command=='export':emit(args)
    else:receive(args)
if __name__=='__main__':
    try:main()
    except (ValueError,KeyError,TypeError,OSError,json.JSONDecodeError) as e:
        print('Skill Nexus interop:',e,file=sys.stderr);sys.exit(2)
