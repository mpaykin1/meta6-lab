#!/usr/bin/env python3
"""Veloren MagicaVoxel (.vox) <-> Ragnagrok project, no GPL runtime copying.

Compatible with the pinned Veloren voxel asset layout. Code in this bridge is
independently authored; user-supplied artwork retains its own original license.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import re
import struct
import urllib.request

import ragnagrok_assets as rag

REPO = 'https://github.com/veloren/veloren'
PIN = '131d1193387861d35c74655662148f303c22c5b4'
RAW = 'https://raw.githubusercontent.com/veloren/veloren/' + PIN + '/'
MAX_BYTES = 20 * 1024 * 1024
MAX_FILLED = rag.MAX_RENDER_CELLS
# These credited assets have extra CC BY-NC-SA/other special conditions. Never fetch automatically.
RESTRICTED = (
    'assets/voxygen/voxel/glider/vroom.vox',
    'assets/voxygen/voxel/sprite/wood/log/wood.vox',
    'assets/voxygen/voxel/sprite/mineral/ingot/',
)


class VoxError(ValueError):
    pass


def insist(condition: bool, message: str) -> None:
    if not condition:
        raise VoxError(message)


def parse_vox(source: bytes, *, model_index: int = 0) -> dict:
    """Parse a MagicaVoxel VOX 150/200 file; lossless RGB, single selected model.

    The input can contain multiple models. Model index must be explicitly chosen,
    and nTRN/nGRP scene transforms are *not* silently applied to that model.
    """
    insist(len(source) >= 20 and len(source) <= MAX_BYTES, 'VOX size invalid or exceeds 20 MiB')
    insist(source[:4] == b'VOX ', 'Not a MagicaVoxel VOX file')
    version = struct.unpack_from('<I', source, 4)[0]
    insist(version in (150, 200), 'Unsupported VOX version: '+str(version))
    models: list[dict] = []
    pending_size: tuple[int,int,int] | None = None
    palette: list[tuple[int,int,int,int]] | None = None
    packed_count: int | None = None
    scene_transforms = 0

    def walk(start: int, end: int) -> None:
        nonlocal pending_size, palette, packed_count, scene_transforms
        p = start
        while p < end:
            insist(p + 12 <= end, 'Truncated VOX chunk header')
            tag = source[p:p+4]
            content_len, child_len = struct.unpack_from('<II', source, p+4)
            body = p+12
            after_body = body + content_len
            after_child = after_body + child_len
            insist(after_body <= end and after_child <= end, 'VOX chunk outside parent boundary')
            content = source[body:after_body]
            if tag == b'PACK':
                insist(len(content) == 4 and packed_count is None, 'Invalid or repeated PACK')
                packed_count = struct.unpack_from('<I', content)[0]
            elif tag == b'SIZE':
                insist(len(content) == 12, 'Corrupt SIZE chunk')
                insist(pending_size is None, 'Multiple SIZE chunks without XYZI')
                pending_size = struct.unpack_from('<III', content)
            elif tag == b'XYZI':
                insist(pending_size is not None, 'XYZI chunk without SIZE')
                insist(len(content) >= 4, 'Invalid XYZI chunk')
                count = struct.unpack_from('<I', content)[0]
                insist(count > 0 and count <= MAX_FILLED, 'VOX filled voxel budget exceeded (22k)')
                insist(4 + count*4 == len(content), 'XYZI length mismatch')
                models.append({'dimensions': pending_size, 'voxels': content[4:]})
                pending_size = None
            elif tag == b'RGBA':
                insist(len(content) == 1024 and palette is None, 'Invalid or repeated RGBA palette')
                palette = [tuple(content[i:i+4]) for i in range(0, 1024, 4)]
            elif tag in (b'nTRN', b'nGRP', b'nSHP'):
                scene_transforms += 1
            if child_len:
                walk(after_body, after_child)
            p = after_child
        insist(p == end, 'VOX chunk structure incomplete')

    insist(source[8:12] == b'MAIN', 'VOX MAIN chunk missing')
    content_len, child_len = struct.unpack_from('<II', source, 12)
    insist(20 + content_len + child_len == len(source), 'VOX trailing bytes or malformed MAIN')
    walk(20 + content_len, len(source))
    insist(pending_size is None, 'Unpaired SIZE chunk')
    insist(bool(models), 'VOX has no XYZI model')
    insist(packed_count is None or packed_count == len(models), 'PACK count mismatch')
    insist(0 <= model_index < len(models), 'Model index out of bounds')
    insist(palette is not None, 'VOX palette missing; conversion refuses to invent artwork colors')
    chosen = models[model_index]
    sx, sy, sz = chosen['dimensions']
    # MagicaVoxel Z is height, Ragnagrok/Three.js Y is height.
    dims = (sx, sz, sy)
    insist(all(1 <= n <= rag.MAX_SIDE for n in dims) and sx*sy*sz <= rag.MAX_CELLS,
           'Model exceeds Ragnagrok maximum 64 per axis / 125000 cells')
    cells = [0] * (sx*sz*sy)
    seen = set()
    used = set()
    for i in range(0, len(chosen['voxels']), 4):
        x, y, z, color = chosen['voxels'][i:i+4]
        insist(x < sx and y < sy and z < sz and color != 0, 'VOX contains invalid cell')
        at = x + y*sx + z*sx*sy # Ragnagrok axis-transposed index x + zR*sx + yR*sx*zR
        insist(at not in seen, 'VOX contains duplicate occupied voxel')
        seen.add(at)
        insist(palette[color-1][3] == 255, 'VOX transparent voxels cannot be represented faithfully')
        cells[at] = color
        used.add(color)
    # Palette retains MagicaVoxel indices (1..255). 0 is required transparent by Ragnagrok.
    pal = [0] + [(r<<16) | (g<<8) | b for r,g,b,a in palette[:255]]
    model = {
        'size': list(dims), 'scale': 0.1, 'palette': pal,
        'emissive': [], 'closed': False, 'data': rag.encode(cells),
    }
    insist(rag.decode(model) == cells, 'VOX conversion failed to round-trip via Ragnagrok RLE')
    return {'model': model, 'models_found': len(models), 'scene_graph': bool(scene_transforms),
            'filled': len(seen), 'source_version': version, 'color_indices': len(used)}


def make_project(vox: Path, *, name: str = 'veloren_voxel', scale: float = 0.1,
                 model_index: int = 0, rights: str = 'own', author: str = '') -> dict:
    insist(vox.is_file(), 'VOX file not found: '+str(vox))
    insist(re.fullmatch(r'[a-z][a-z0-9_]{0,45}', name) is not None, 'Model id must be snake_case')
    insist(0.02 <= scale <= 1.0, 'Ragnagrok voxel scale must be 0.02..1.0')
    insist(rights in ('own','gpl'), 'Asset rights must be own or gpl')
    if rights == 'gpl':
        insist(bool(author.strip()), 'GPL source attribution required: provide --author')
    source = vox.read_bytes()
    parsed = parse_vox(source, model_index=model_index)
    model = {**parsed['model'], 'id': name, 'name': name.replace('_',' ').title(), 'scale': scale}
    return {
        'format': 'vgc-veloren-ragnagrok-project-v1',
        'name': 'VGC VOX Bridge', 'startScene': 'model_scene',
        'models': [model],
        'scenes': [{'id':'model_scene','name':'VOX Import','instances':[
            {'id':'model_001','model':name,'pos':[0,0,0],'rot':0,'solid':False}]}],
        'vgc_origin': {
            'file_name':vox.name,'sha256':hashlib.sha256(source).hexdigest(),
            'source_repo':REPO,'source_pin':PIN,
            'rights':rights,'author':author.strip(),
            'origin': 'Veloren content (GPL-family) if rights=gpl, otherwise user-owned VOX',
            'model_index':model_index,'models_found':parsed['models_found'],
            'scene_graph_ignored':parsed['scene_graph'],
            'orientation': 'MagicaVoxel (x,y,z vertical z) mapped to Three.js (x,z,y vertical y)',
            'limitation': 'Visual-only Ragnagrok asset; no joint animation, NPC AI, collisions or world sync',
        }
    }


def export_vox(project: Path, model_id: str, output: Path) -> None:
    data = json.loads(project.read_text(encoding='utf-8'))
    insist(isinstance(data.get('models'), list), 'Project missing models')
    matches = [m for m in data['models'] if isinstance(m,dict) and m.get('id') == model_id]
    insist(len(matches) == 1, 'Select exactly one model by its id')
    m = matches[0]
    cells = rag.decode(m)
    sx, sy, sz = m['size']
    pal = m['palette']
    occupied=bytearray()
    count=0
    for y in range(sy):
        for z in range(sz):
            for x in range(sx):
                color=cells[x + z*sx + y*sx*sz]
                if color:
                    insist(1 <= color <= 255, 'VOX color index out of range')
                    # VOX uses x/y plane and z vertical.
                    occupied.extend((x,z,y,color))
                    count += 1
    insist(0 < count <= MAX_FILLED, 'Model contains no voxels or exceeds 22k VOX budget')
    def chunk(tag: bytes, content: bytes) -> bytes:
        return tag+struct.pack('<II',len(content),0)+content
    size=chunk(b'SIZE',struct.pack('<III',sx,sz,sy))
    voxels=chunk(b'XYZI',struct.pack('<I',count)+occupied)
    palette=bytearray()
    for i in range(1,257):
        value = int(pal[i]) if i < len(pal) else 0
        palette.extend(((value>>16)&255,(value>>8)&255,value&255,255))
    rgba=chunk(b'RGBA',bytes(palette))
    children=size+voxels+rgba
    payload=b'VOX '+struct.pack('<I',150)+b'MAIN'+struct.pack('<II',0,len(children))+children
    insist(not output.exists(), 'Refusing to overwrite existing VOX output')
    output.parent.mkdir(parents=True,exist_ok=True)
    output.write_bytes(payload)


def download_asset(asset_path: str, output: Path, accept_gpl: bool) -> None:
    insist(accept_gpl, 'Veloren GPL terms require --accept-gpl')
    insist(bool(re.fullmatch(r'assets/(?:common|voxygen)/voxel/[A-Za-z0-9_./-]+\.vox',asset_path)),
           'Asset path must be inside assets/common/voxel or assets/voxygen/voxel')
    insist('..' not in asset_path.split('/'), 'Path traversal is prohibited')
    insist(not any(asset_path == x or (x.endswith('/') and asset_path.startswith(x)) for x in RESTRICTED),
           'Restricted third-party artwork; download manually and check its individual license')
    insist(not output.exists(), 'Destination exists; refusing overwrite')
    def fetch(relative: str) -> bytes:
        request=urllib.request.Request(RAW+relative,headers={'User-Agent':'VoxelGameCreator-Veloren-Vox-Bridge/0.16'})
        with urllib.request.urlopen(request,timeout=35) as stream:
            insist(stream.status == 200, 'Veloren source download failed')
            return stream.read(MAX_BYTES+1)
    content=fetch(asset_path)
    insist(len(content)<=MAX_BYTES, 'Veloren file too large')
    parse_vox(content)
    lic=fetch('LICENSE')
    credits=fetch('assets/credits.ron')
    insist(b'GNU GENERAL PUBLIC LICENSE' in lic, 'Veloren upstream GPL license missing')
    insist(b'assets' in credits and b'license:' in credits, 'Veloren credits manifest missing')
    output.parent.mkdir(parents=True,exist_ok=True)
    output.write_bytes(content)
    (output.parent/(output.name+'.LICENSE-GPL-3.0')).write_bytes(lic)
    (output.parent/(output.name+'.veloren-credits.ron')).write_bytes(credits)
    (output.parent/(output.name+'.ATTRIBUTION.txt')).write_text(
        'Veloren original voxel asset\n'
        'Source: '+REPO+'/blob/'+PIN+'/'+asset_path+'\n'
        'License: GPL-3.0-or-later unless assets/credits.ron specifies otherwise.\n'
        'Review asset-specific credits and exceptions before distribution.\n'
        'You must not assume suitability for a proprietary/closed-source game.\n',encoding='utf-8')


def main() -> None:
    p=argparse.ArgumentParser(description=__doc__)
    sub=p.add_subparsers(dest='cmd',required=True)
    imp=sub.add_parser('import',help='MagicaVoxel VOX -> Ragnagrok Project JSON')
    imp.add_argument('--vox',required=True,type=Path)
    imp.add_argument('--out',required=True,type=Path)
    imp.add_argument('--model-id',default='veloren_voxel')
    imp.add_argument('--scale',type=float,default=.1)
    imp.add_argument('--model-index',type=int,default=0)
    imp.add_argument('--rights',choices=['own','gpl'],default='own')
    imp.add_argument('--author',default='')
    exp=sub.add_parser('export',help='Ragnagrok Project JSON -> MagicaVoxel VOX')
    exp.add_argument('--project',required=True,type=Path)
    exp.add_argument('--model-id',required=True)
    exp.add_argument('--out',required=True,type=Path)
    get=sub.add_parser('fetch',help='Download pinned GPL model from Veloren + notices')
    get.add_argument('--asset-path',required=True)
    get.add_argument('--out',required=True,type=Path)
    get.add_argument('--accept-gpl',action='store_true')
    a=p.parse_args()
    try:
        if a.cmd == 'import':
            insist(not a.out.exists(), 'Output exists; refusing overwrite')
            project = make_project(a.vox,name=a.model_id,scale=a.scale,
                                   model_index=a.model_index,rights=a.rights,author=a.author)
            a.out.parent.mkdir(parents=True,exist_ok=True)
            a.out.write_text(json.dumps(project,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
            print('VOX_TO_RAGNAGROK',a.out)
        elif a.cmd=='export':
            export_vox(a.project,a.model_id,a.out)
            print('RAGNAGROK_TO_VOX',a.out)
        elif a.cmd=='fetch':
            download_asset(a.asset_path,a.out,a.accept_gpl)
            print('VELOREN_VOX_DOWNLOADED',a.out)
    except (OSError,VoxError,ValueError) as err:
        p.error(str(err))


if __name__=='__main__':main()
