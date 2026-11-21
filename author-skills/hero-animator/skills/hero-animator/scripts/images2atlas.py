#!/usr/bin/env python3
"""Pack approved RGBA clips into Hero Animator sprite atlases.

Default: the upstream MIT maxrects-packer@3.0.0 library computes a two-pass,
rotation-free packing of *all* actions into shared bounded GPU textures.
The 6-element per-frame format [x, y, w, h, offset_x, offset_y] and one sheet
per action remain unchanged so HybridActor/Three.js/Rapier need no modifications.

Old shelf packing is still available explicitly via --packer shelf for existing
builds. Neither mode modifies original art or approves AI-generated frames.
"""
from __future__ import annotations
import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from PIL import Image

LOOP = {'idle','idle_happy','walk','run','fly','swim','hover','fidget','smoke','fire','glow'}
HOLD = {'death','die','dead'}
DIRECTIONS = ('front','back','left','right','front_left','front_right','back_left','back_right')
ROOT = Path(__file__).resolve().parent.parent
BRIDGE = Path(__file__).with_name('maxrects_layout.mjs')


def ordered_pngs(folder: Path):
    # Preserve old lexical ordering, matching directional_pack.py clip_hash order.
    return sorted((p for p in folder.iterdir() if p.is_file() and p.suffix.lower()=='.png'),key=lambda p:p.name)


def raw_bbox(frame: Image.Image):
    """Crop by union of all RGBA channel pixels, including hidden RGB, losslessly."""
    bounds = [b for band in frame.split() if (b:=band.getbbox())]
    if not bounds:
        return (0,0,1,1)
    return (min(b[0] for b in bounds),min(b[1] for b in bounds),
            max(b[2] for b in bounds),max(b[3] for b in bounds))


def read_clips(folder: Path, foot):
    clips={}
    for sub in sorted(folder.iterdir(),key=lambda p:p.name):
        if not sub.is_dir():
            continue
        # AI-generated candidates must pass explicit artistic approval first.
        if any((sub / n).exists() for n in ('rife-candidate.json','rembg-candidate.json','rembg-rife-candidate.json')):
            raise ValueError(f'{sub.name}: unapproved rembg/RIFE candidate directory; move artist-approved PNG to a clean folder after approval')
        paths=ordered_pngs(sub)
        if not paths:
            continue
        frames=[]
        size=None
        for p in paths:
            with Image.open(p) as source:
                rgba=source.convert('RGBA')
            if size is None:
                size=rgba.size
            if rgba.size!=size:
                raise ValueError(f'{sub.name}: inconsistent canvas dimensions')
            rect=raw_bbox(rgba)
            fx,fy=foot if foot is not None else (rgba.width/2,rgba.height)
            frames.append({'im':rgba.crop(rect), 'ox':round(rect[0]-fx),'oy':round(rect[1]-fy)})
        clips[sub.name]={'frames':frames,'paths':paths,'size':size}
    if not clips:
        raise ValueError('No action folders with PNG frames')
    return clips


def dependency_ready():
    try:
        r=subprocess.run(['node','-e',"require.resolve('maxrects-packer')"],cwd=ROOT,
                         text=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,timeout=8)
        return r.returncode==0
    except (FileNotFoundError,subprocess.TimeoutExpired):
        return False


def require_maxrects(auto_install=True):
    if not shutil.which('node'):
        raise RuntimeError('Node.js >= 18 required for MaxRects atlas building; --packer shelf is legacy-only')
    if dependency_ready():
        return
    if not auto_install:
        raise RuntimeError('Missing maxrects-packer@3.0.0; run npm install --ignore-scripts --no-audit --no-fund in the skill root')
    if not shutil.which('npm'):
        raise RuntimeError('npm required for one-time MaxRects installation')
    print('Installing pinned maxrects-packer@3.0.0 (build-time only)',file=sys.stderr)
    cmd=['npm','install','--prefix',str(ROOT),'--omit=dev','--ignore-scripts',
         '--no-audit','--no-fund','--fetch-retries=0','--fetch-timeout=15000']
    try:
        subprocess.run(cmd,check=True,timeout=120,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
    except (subprocess.CalledProcessError,subprocess.TimeoutExpired) as exc:
        raise RuntimeError('Could not install pinned maxrects-packer@3.0.0; network/npm unavailable. Run in a networked build environment or explicitly select --packer shelf for old builds.') from exc
    if not dependency_ready():
        raise RuntimeError('MaxRects installation completed but module is still unavailable')


def maxrects_layout(clips,max_width,max_height,padding,auto_install):
    require_maxrects(auto_install)
    request={'maxWidth':max_width,'maxHeight':max_height,'padding':padding,
             'clips':[{'name':name,'frames':[{'width':f['im'].width,'height':f['im'].height}
                       for f in clip['frames']]} for name,clip in clips.items()]}
    p=subprocess.run(['node',str(BRIDGE)],input=json.dumps(request),text=True,
                     stdout=subprocess.PIPE,stderr=subprocess.PIPE,cwd=ROOT,timeout=90)
    if p.returncode:
        raise RuntimeError('MaxRects packing failed: '+(p.stderr.strip() or 'unknown error'))
    try:
        layout=json.loads(p.stdout)
    except json.JSONDecodeError as exc:
        raise RuntimeError('MaxRects returned invalid JSON') from exc
    if layout.get('packer')!='maxrects-packer@3.0.0':
        raise RuntimeError('Expected actual upstream MaxRectsPacker layout')
    return layout


def validate_layout(clips,layout,max_width,max_height):
    sheets=layout.get('sheets')
    packs=layout.get('clips')
    if not isinstance(sheets,list) or not sheets or not isinstance(packs,dict) or set(packs)!=set(clips):
        raise ValueError('Missing MaxRects sheets or clips')
    per_sheet={i:[] for i in range(len(sheets))}
    for i,s in enumerate(sheets):
        w,h=s.get('width'),s.get('height')
        if not isinstance(w,int) or not isinstance(h,int) or not (0<w<=max_width and 0<h<=max_height):
            raise ValueError('Invalid GPU atlas dimensions')
    for name,clip in clips.items():
        info=packs[name];idx=info.get('sheet')
        if not isinstance(idx,int) or not (0<=idx<len(sheets)):
            raise ValueError(f'{name}: sheet index out of range')
        coords=info.get('frames')
        if not isinstance(coords,list) or len(coords)!=len(clip['frames']):
            raise ValueError(f'{name}: frame count mismatch')
        W,H=sheets[idx]['width'],sheets[idx]['height']
        for i,(item,rc) in enumerate(zip(clip['frames'],coords)):
            x,y,w,h=(rc.get(k) for k in ('x','y','w','h'))
            if not all(isinstance(z,int) for z in (x,y,w,h)) or not (x>=0 and y>=0 and w>0 and h>0):
                raise ValueError(f'{name}[{i}]: invalid placement')
            if x+w>W or y+h>H or (w,h)!=item['im'].size:
                raise ValueError(f'{name}[{i}]: out of bounds / rotated / resized')
            per_sheet[idx].append((x,y,x+w,y+h,name,i))
    for rects in per_sheet.values():
        for i,a in enumerate(rects):
            for b in rects[i+1:]:
                if a[0]<b[2] and b[0]<a[2] and a[1]<b[3] and b[1]<a[3]:
                    raise ValueError(f'Overlapping frames {a[4]}[{a[5]}] {b[4]}[{b[5]}]')
    return sheets


def shelf_pack(clips,max_width):
    """Original one-atlas-per-action row packing for explicit legacy mode."""
    sheets=[];out={}
    for name,clip in clips.items():
        rects=[];x=y=row=0
        for item in clip['frames']:
            w,h=item['im'].size
            if w>max_width:
                raise ValueError(f'{name}: frame wider than max atlas width')
            if x>0 and x+w>max_width:
                x=0;y+=row+2;row=0
            rects.append({'x':x,'y':y,'w':w,'h':h})
            x+=w+2;row=max(row,h)
        height=y+row
        if height>8192:
            raise ValueError(f'{name}: legacy atlas exceeds 8192 px')
        width=max(r['x']+r['w'] for r in rects)
        idx=len(sheets);sheets.append({'width':width,'height':height})
        out[name]={'sheet':idx,'frames':rects}
    return {'packer':'shelf-legacy','sheets':sheets,'clips':out}


def base_action(name):
    for direction in sorted(DIRECTIONS,key=len,reverse=True):
        if name.endswith('_'+direction):
            return name[:-(len(direction)+1)]
    return name


def build_metadata(clips,layout,hero_id,ppu,fps,events):
    actions={}
    for name,clip in clips.items():
        packed=layout['clips'][name]
        action=base_action(name)
        name_sheet=f'{hero_id}_sheet_{packed["sheet"]:03}.png' if layout['packer'].startswith('maxrects-') else f'{hero_id}_{name}.png'
        frames=[]
        for item,pos in zip(clip['frames'],packed['frames']):
            frames.append([pos['x'],pos['y'],pos['w'],pos['h'],item['ox'],item['oy']])
        desc={'sheet':name_sheet,'fps':fps,'frames':frames,'loop':action in LOOP,
              'hold':action.lower() in HOLD,'label':name}
        extra=events.get(name,events.get(action,{}))
        if extra:
            if not isinstance(extra,dict):
                raise ValueError(f'{name}: event data must be an object')
            for key in ('release','hitStart','hitEnd','hitboxes'):
                if key in extra:
                    if key=='hitboxes' and (not isinstance(extra[key],list) or len(extra[key])!=len(frames)):
                        raise ValueError(f'{name}: hitboxes must match {len(frames)} frames')
                    desc[key]=extra[key]
        actions[name]=desc
    return {'id':hero_id,'ppu':ppu,'height':0,'shadow':{'w':0,'h':0},
            'atlasPacker':layout['packer'],'anims':actions}


def build(src:Path,dest:Path,hero_id:str,ppu:float,fps:int,max_width:int,max_height:int,
          padding:int,foot,events,packer='maxrects',auto_install=True):
    if not src.is_dir():
        raise ValueError(f'Input directory does not exist: {src}')
    if src.resolve()==dest.resolve() or src.resolve() in dest.resolve().parents or dest.resolve() in src.resolve().parents:
        raise ValueError('Input and output directories must be disjoint')
    clips=read_clips(src,foot)
    layout=maxrects_layout(clips,max_width,max_height,padding,auto_install) if packer=='maxrects' else shelf_pack(clips,max_width)
    sheets=validate_layout(clips,layout,max_width,max(8192,max_height) if packer=='shelf' else max_height)
    metadata=build_metadata(clips,layout,hero_id,ppu,fps,events)
    dest.mkdir(parents=True,exist_ok=True)
    # Render in memory before writing. 'paste' preserves full original RGBA,
    # unlike alpha_composite on transparent pixels with nonzero hidden RGB.
    layers=[Image.new('RGBA',(s['width'],s['height']),(0,0,0,0)) for s in sheets]
    for name,clip in clips.items():
        idx=layout['clips'][name]['sheet']
        for frame,pos in zip(clip['frames'],layout['clips'][name]['frames']):
            layers[idx].paste(frame['im'],(pos['x'],pos['y']))
    with tempfile.TemporaryDirectory(prefix='hero-maxrects-',dir=dest) as tmpdir:
        temporary=Path(tmpdir)
        for i,atlas in enumerate(layers):
            if packer=='maxrects':
                atlas.save(temporary/f'{hero_id}_sheet_{i:03}.png',format='PNG',optimize=True)
            else:
                name=list(clips.keys())[i]
                atlas.save(temporary/f'{hero_id}_{name}.png',format='PNG',optimize=True)
        (temporary/f'{hero_id}.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
        for generated in sorted(temporary.iterdir()):
            os.replace(generated,dest/generated.name)
    return len(clips),len(sheets),dest/f'{hero_id}.json'


def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('input_dir',type=Path)
    p.add_argument('output_dir',type=Path)
    p.add_argument('--id',required=True)
    p.add_argument('--fps',type=int,default=12)
    p.add_argument('--max-width',type=int,default=2048)
    p.add_argument('--max-height',type=int,default=2048)
    p.add_argument('--padding',type=int,default=2)
    p.add_argument('--packer',choices=['maxrects','shelf'],default='maxrects')
    p.add_argument('--no-auto-install',action='store_true',help='Disable first-use npm installation')
    p.add_argument('--foot',nargs=2,type=float,metavar=('X','Y'))
    p.add_argument('--ppu',type=float,default=1.0)
    p.add_argument('--events',type=Path)
    a=p.parse_args(argv)
    if not a.id or '/' in a.id or '\\' in a.id or a.id in ('.','..'):
        p.error('safe nonempty --id required')
    if a.fps<=0 or a.ppu<=0 or a.max_width<64 or a.max_height<64 or a.padding<2:
        p.error('fps/ppu positive; max-width/height >=64, padding >=2')
    events={}
    if a.events:
        events=json.loads(a.events.read_text(encoding='utf8'))
        if not isinstance(events,dict):
            p.error('events must be a JSON object')
    try:
        n,m,path=build(a.input_dir,a.output_dir,a.id,a.ppu,a.fps,a.max_width,a.max_height,
                       a.padding,a.foot,events,a.packer,not a.no_auto_install)
    except (OSError,ValueError,RuntimeError,subprocess.SubprocessError) as exc:
        p.error(str(exc))
    print(f'Packed {n} clips into {m} {a.packer} sheet(s): {path}')
    return 0

if __name__=='__main__':
    sys.exit(main())
