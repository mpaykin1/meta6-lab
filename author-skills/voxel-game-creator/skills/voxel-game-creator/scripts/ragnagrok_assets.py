#!/usr/bin/env python3
"""Ragnagrok MIT Project Model / Instance interchange, independent of its renderer.

This is a real bridge: 8-bit grid RLE (varint count, value) in x,z,y order.
Models authored in the Ragnagrok browser editor can be inserted into either
Three.js engine without pulling a second Three.js renderer into its render loop.
"""
from __future__ import annotations
import base64
import json
import math
import random
from pathlib import Path

from create_game import fail, SCHEMES

MAX_SIDE = 64
MAX_MODELS = 12
MAX_CELLS = 125_000
MAX_RENDER_CELLS = 22_000


def hexval(v: str) -> int:
    return int(v.lstrip('#'), 16)


def encode(cells: list[int]) -> str:
    out = bytearray()
    pos = 0
    while pos < len(cells):
        value = cells[pos]
        end = pos + 1
        while end < len(cells) and cells[end] == value:
            end += 1
        run = end - pos
        while run >= 128:
            out.append((run & 127) | 128)
            run >>= 7
        out.extend((run, value))
        pos = end
    return base64.b64encode(out).decode('ascii')


def decode(model: dict) -> list[int]:
    dims = model.get('size')
    if not isinstance(dims, list) or len(dims) != 3 or any(type(x) is not int or x < 1 or x > MAX_SIDE for x in dims):
        fail('Ragnagrok: invalid voxel model dimensions')
    count = math.prod(dims)
    if count > MAX_CELLS:
        fail('Ragnagrok: model too large; max 125000 cells')
    data = model.get('data')
    if not isinstance(data, str):
        fail('Ragnagrok: model data must be base64 RLE')
    try:
        bs = base64.b64decode(data, validate=True)
    except (ValueError, base64.binascii.Error) as err:
        fail(f'Ragnagrok: bad RLE base64 {err}')
    cells = []
    i = 0
    while i < len(bs):
        count0 = 0
        shift = 0
        while True:
            if i >= len(bs):fail('Ragnagrok: truncated RLE count')
            b = bs[i]; i += 1
            count0 |= (b & 127) << shift
            if not b & 128:break
            shift += 7
            if shift > 28:fail('Ragnagrok: absurd RLE count')
        if i >= len(bs):fail('Ragnagrok: RLE value missing')
        value = bs[i]; i += 1
        if count0 == 0 or len(cells) + count0 > count:fail('Ragnagrok: run count overflow')
        cells.extend([value] * count0)
    if len(cells) != count:fail('Ragnagrok: RLE did not fill grid')
    palette = model.get('palette')
    if not isinstance(palette,list) or len(palette) > 256 or any(type(x) is not int or x < 0 or x > 0xffffff for x in palette):
        fail('Ragnagrok: invalid palette')
    if any(x >= len(palette) for x in cells):fail('Ragnagrok: palette index out of range')
    scale = model.get('scale')
    if isinstance(scale, bool) or not isinstance(scale, (float, int)) or not 0.02 <= scale <= 1:
        fail('Ragnagrok: invalid model voxel scale')
    return cells


def make_model(mid: str, size: tuple[int,int,int], scale: float, palette: list[int], paint):
    x,y,z = size
    cells = [0] * (x*y*z)
    def setc(px:int,py:int,pz:int,k:int):
        if 0 <= px < x and 0 <= py < y and 0 <= pz < z:
            cells[px + pz*x + py*x*z]=k
    paint(setc)
    m = dict(id=mid,name=mid.replace('_',' ').title(),size=list(size),scale=scale,
             palette=[0]+palette,emissive=[3] if mid in ('vgc_crystal', 'vgc_lantern') else [],closed=False,data=encode(cells))
    assert decode(m) == cells
    return m


def build_default_assets(spec: dict) -> dict:
    colors={**SCHEMES.get(spec.get('theme','ash'),SCHEMES['ash']),**spec.get('colors',{})}
    seed=spec.get('seed',7391)
    rng=random.Random(seed)
    stone,wood,leaves=hexval(colors['stone']),hexval(colors['wood']),hexval(colors['leaves'])
    accent=hexval(colors['sunset'])
    def rune(s):
        for y in range(15):
            for z in range(2,5):
                for x in range(2,5):
                    if y in (0,1,13,14) or x in (2,4) and z in (2,4):s(x,y,z,1)
            if y in (3,7,11):
                s(3,y,2,3);s(3,y,4,3);s(2,y,3,3);s(4,y,3,3)
    def crystal(s):
        for y in range(12):
            radius= max(0,4 - abs(y-4)*0.53)
            for z in range(9):
                for x in range(9):
                    if abs(x-4)+abs(z-4) <= radius+0.1:s(x,y,z,3 if y>8 else 2)
    def tree(s):
        for y in range(18):
            for x in range(8,11):
                for z in range(8,11):s(x,y,z,1)
        for y in range(12,24):
            for z in range(19):
                for x in range(19):
                    d=((x-9)/8)**2+((z-9)/8)**2+((y-17)/7)**2
                    if d<(.85 if rng.random()<.2 else 1.08):s(x,y,z,2)
    def lantern(s):
        for y in range(12):s(2,y,2,1)
        for x in range(1,4):
            for z in range(1,4):
                for y in range(8,11):s(x,y,z,3 if x==2 or z==2 else 2)
    models=[
        make_model('vgc_waystone',(7,15,7),.15,[stone,wood,accent],rune),
        make_model('vgc_crystal',(9,12,9),.13,[stone,leaves,hexval(colors['horizon'])],crystal),
        make_model('vgc_tree',(19,24,19),.10,[wood,leaves,accent],tree),
        make_model('vgc_lantern',(5,12,5),.14,[wood,stone,accent],lantern),
    ]
    # Offsets in meters from browser spawn; in studio use an adapted corner cluster.
    instances=[
        {'id':'rag_waystone','model':'vgc_waystone','pos':[8,0,2],'rot':0,'solid':False},
        {'id':'rag_crystal','model':'vgc_crystal','pos':[-7,0,5],'rot':0,'solid':False},
        {'id':'rag_tree','model':'vgc_tree','pos':[9,0,-6],'rot':0,'solid':False},
        {'id':'rag_lantern','model':'vgc_lantern','pos':[-5,0,-8],'rot':0,'solid':False},
    ]
    return {'format':'ragnagrok-models-v1','source':'Voxel Game Creator (Ragnagrok-compatible MIT project model schema)', 'models':models,'instances':instances}


def assets_from_editor(project_file: Path) -> dict:
    try:p=json.loads(project_file.read_text(encoding='utf-8'))
    except (ValueError,OSError) as e:fail('Ragnagrok project unreadable: '+str(e))
    if not isinstance(p,dict) or not isinstance(p.get('models'),list) or not isinstance(p.get('scenes'),list):
        fail('Ragnagrok file must be exported Project JSON')
    scene=next((s for s in p['scenes'] if s.get('id') == p.get('startScene')),None)
    if scene is None:fail('Ragnagrok scene not found')
    insts=scene.get('instances',[])
    # Only referenced scene prop models, never giant exterior room or unanimated figure parts.
    refs=list(dict.fromkeys(i.get('model') for i in insts if isinstance(i,dict) and i.get('model')))
    if len(refs)>MAX_MODELS:fail('Ragnagrok export has >12 referenced models; reduce placed props')
    modelmap={m.get('id'):m for m in p['models'] if isinstance(m,dict)}
    models=[]
    renamed={mid:f'vgc_import_{i:02d}' for i,mid in enumerate(refs)}
    for mid in refs:
        if mid not in modelmap:fail('Ragnagrok export: missing model '+str(mid))
        m=modelmap[mid]
        decode(m)
        models.append({**m,'id':renamed[mid]})
    total=sum(sum(c>0 for c in decode(m)) for m in models)
    if total>MAX_RENDER_CELLS:fail('Ragnagrok export exceeds 22000 filled voxels; trim models')
    # Position custom scene props into a world clearing 8m from the player; preserve proportions.
    selected=[]
    for i in insts[:32]:
        if i.get('model') not in refs:continue
        x,y,z=i.get('pos',[0,0,0]);rot=i.get('rot',0)
        if not all(isinstance(v,(int,float)) and math.isfinite(v) for v in (x,y,z,rot)):
            fail('Ragnagrok export: invalid placement')
        selected.append({'id':str(i.get('id','prop')),'model':renamed[i['model']],
                         'pos':[float(x)+7,float(y),float(z)+5],'rot':int(rot)%4,'solid':False})
    return {'format':'ragnagrok-models-v1','source':str(project_file),'models':models,'instances':selected}


def acquire_assets(spec:dict, project_file:Path|None)->dict:
    assets=assets_from_editor(project_file) if project_file else build_default_assets(spec)
    if not assets['instances']:fail('Ragnagrok: zero instances to export')
    return assets


def write_pack(folder:Path,assets:dict)->None:
    folder.mkdir(parents=True,exist_ok=True)
    (folder/'ragnagrok-assets.json').write_text(json.dumps(assets,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf8')
