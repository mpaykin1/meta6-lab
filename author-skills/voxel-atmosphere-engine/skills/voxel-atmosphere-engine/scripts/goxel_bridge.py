#!/usr/bin/env python3
"""Goxel/MagicaVoxel VOX 150 -> glTF GLB and editable Blockbench BBMODEL.

Original standalone bridge (MIT). No Goxel or Blockbench editor code embedded.
Goxel writes SIZE, XYZI and optional RGBA as verified in src/formats/vox.c.
Uses numpy, trimesh and Pillow. No network, external CLI or Goxel binary needed.
"""
from __future__ import annotations
import argparse
import base64
import io
import json
import struct
import uuid
from collections import Counter
from pathlib import Path
from itertools import product

import numpy as np
import trimesh
from PIL import Image

MAX_FILE_BYTES = 80 * 1024 * 1024
MAX_VOXELS = 250_000


def goxel_default_palette():
    """MagicaVoxel/Goxel VOX150 default palette; index 0 denotes empty."""
    levels = [255, 204, 153, 102, 51, 0]
    body = [(r, g, b, 255) for r, g, b in product(levels, repeat=3) if (r,g,b) != (0,0,0)]
    shades = [238, 221, 187, 170, 136, 119, 85, 68, 34, 17]
    body += [(v,0,0,255) for v in shades]
    body += [(0,v,0,255) for v in shades]
    body += [(0,0,v,255) for v in shades]
    body += [(v,v,v,255) for v in shades]
    assert len(body) == 255
    return [(0,0,0,0)] + body


def chunk(tag, payload=b'', children=b''):
    return tag + struct.pack('<II', len(payload), len(children)) + payload + children


def write_vox(filename: Path, cells: dict[tuple[int,int,int], tuple[int,int,int,int]]):
    """Write a single-model VOX150 supported by Goxel and other voxel editors."""
    if not cells or len(cells) > MAX_VOXELS:
        raise ValueError('Model must contain 1..250000 nonempty voxels')
    origin = tuple(min(p[k] for p in cells) for k in range(3))
    coords = {tuple(p[k]-origin[k] for k in range(3)): c for p,c in cells.items() if c[3] >= 127}
    if not coords:
        raise ValueError('No opaque voxels')
    dims = tuple(max(p[k] for p in coords)+1 for k in range(3))
    if max(dims) >= 256:
        raise ValueError('VOX coords must be smaller than 256')
    palette = list(dict.fromkeys(coords.values()))
    if len(palette) > 255:
        raise ValueError('More than 255 unique voxel colors')
    idx = {c:i+1 for i,c in enumerate(palette)}
    voxeldata = b''.join(struct.pack('BBBB', *p, idx[c]) for p,c in sorted(coords.items()))
    pal = palette + [(0,0,0,0)] * (256-len(palette))
    children = (chunk(b'SIZE', struct.pack('<III', *dims))
                + chunk(b'XYZI', struct.pack('<I', len(coords)) + voxeldata)
                + chunk(b'RGBA', b''.join(bytes(p) for p in pal)))
    filename.parent.mkdir(parents=True, exist_ok=True)
    filename.write_bytes(b'VOX ' + struct.pack('<I', 150) + chunk(b'MAIN', b'', children))


def read_vox(filename: Path):
    """Read bounded single/multi SIZE-XYZI payloads, palette colors, no scene graphs.
    Reject scene-graph transforms rather than silently placing models incorrectly.
    """
    payload = filename.read_bytes()
    if len(payload) > MAX_FILE_BYTES or len(payload) < 20 or payload[:4] != b'VOX ':
        raise ValueError('Not a valid bounded VOX file')
    version = struct.unpack_from('<I',payload,4)[0]
    if version != 150:
        raise ValueError(f'Unsupported VOX version {version}; expected 150')
    if payload[8:12] != b'MAIN':
        raise ValueError('Missing MAIN chunk')
    main_size, main_children = struct.unpack_from('<II',payload,12)
    cursor = 20 + main_size
    end = cursor + main_children
    if end != len(payload):
        raise ValueError('Invalid MAIN size')
    dims = None
    frames = []
    palette = goxel_default_palette()
    graph_nodes = set()
    while cursor < end:
        if cursor + 12 > end:
            raise ValueError('Truncated VOX chunk header')
        name = payload[cursor:cursor+4]
        size, children = struct.unpack_from('<II',payload,cursor+4)
        start = cursor + 12
        stop = start + size
        after = stop + children
        if after > end:
            raise ValueError('VOX chunk exceeds data boundary')
        data = payload[start:stop]
        if name == b'SIZE':
            if size < 12: raise ValueError('Malformed SIZE')
            dims = struct.unpack_from('<III',data)
            if min(dims) == 0 or max(dims) > 256:
                raise ValueError('Invalid VOX dimensions')
        elif name == b'XYZI':
            if dims is None or size < 4: raise ValueError('XYZI without SIZE')
            n = struct.unpack_from('<I',data)[0]
            if n > MAX_VOXELS or size != 4 + 4 * n:
                raise ValueError('Malformed/oversized XYZI')
            items = []
            for x,y,z,c in struct.iter_unpack('BBBB',data[4:]):
                if x >= dims[0] or y >= dims[1] or z >= dims[2]:
                    raise ValueError('Voxel outside SIZE bounds')
                if c:
                    items.append(((x,y,z),c))
            frames.append((dims,items))
            dims=None
        elif name == b'RGBA':
            if size != 1024:
                raise ValueError('RGBA palette must contain 256 colors')
            pal = [tuple(data[k*4:(k+1)*4]) for k in range(256)]
            palette = [(0,0,0,0)] + pal[:255]
        elif name in (b'nTRN',b'nGRP',b'nSHP'):
            graph_nodes.add(name.decode())
        cursor = after
    if graph_nodes:
        raise ValueError('VOX has scene-graph transforms: first export a flattened model in Goxel')
    if len(frames) != 1:
        raise ValueError('Only one SIZE/XYZI model is supported; export each Goxel layer/model separately')
    dimensions, items = frames[0]
    return dimensions, {p:palette[c] for p,c in items if palette[c][3] > 0}


def world_coord(p, dims, scale):
    # Three.js uses Y-up. Maintain right-handed basis via x,z,-y.
    return np.array(((p[0]-dims[0]*.5)*scale, p[2]*scale, -(p[1]-dims[1]*.5)*scale),dtype=float)


def to_glb(dims, voxels, target, scale=0.12):
    vertices=[]; faces=[]; rgba=[]
    dirs=[(-1,0,0),(1,0,0),(0,-1,0),(0,1,0),(0,0,-1),(0,0,1)]
    def corners(x,y,z,d):
        if d[0]:
            a=x+(d[0]>0)
            return [(a,y,z),(a,y+1,z),(a,y+1,z+1),(a,y,z+1)]
        if d[1]:
            a=y+(d[1]>0)
            return [(x,a,z),(x+1,a,z),(x+1,a,z+1),(x,a,z+1)]
        a=z+(d[2]>0)
        return [(x,y,a),(x+1,y,a),(x+1,y+1,a),(x,y+1,a)]
    for (x,y,z),color in voxels.items():
        for d in dirs:
            neighbor=(x+d[0],y+d[1],z+d[2])
            if neighbor in voxels: continue
            cs=np.array([world_coord(pt,dims,scale) for pt in corners(x,y,z,d)])
            outward=world_coord(d,(0,0,0),1)
            normal=np.cross(cs[1]-cs[0],cs[2]-cs[0])
            if np.dot(normal,outward)<0: cs=cs[[0,3,2,1]]
            offset=len(vertices)
            vertices.extend(cs.tolist())
            rgba.extend([color]*4)
            faces.extend([[offset,offset+1,offset+2],[offset,offset+2,offset+3]])
    if not vertices:
        raise ValueError('No visible voxels')
    mesh=trimesh.Trimesh(vertices=np.array(vertices),faces=np.array(faces),process=False)
    mesh.visual.vertex_colors=np.array(rgba,dtype=np.uint8)
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_bytes(trimesh.exchange.gltf.export_glb(trimesh.Scene(mesh)))
    return len(vertices),len(faces)


def color_boxes(voxels):
    """Merge same-color filled voxels to editable, nonoverlapping rectangular boxes."""
    pending=dict(voxels)
    boxes=[]
    while pending:
        (x,y,z), c=min(pending.items())
        xend=x+1
        while pending.get((xend,y,z))==c: xend+=1
        yend=y+1
        while all(pending.get((i,yend,z))==c for i in range(x,xend)): yend+=1
        zend=z+1
        while all(pending.get((i,j,zend))==c for i in range(x,xend) for j in range(y,yend)): zend+=1
        for i in range(x,xend):
            for j in range(y,yend):
                for k in range(z,zend): pending.pop((i,j,k))
        boxes.append(((x,y,z),(xend,yend,zend),c))
    return boxes


def to_bbmodel(dims, voxels, target, name='Goxel Voxel Model', limit=14000):
    """Native Generic Model BBMODEL with PNG palette atlas and editable cubes."""
    boxes=color_boxes(voxels)
    if len(boxes)>limit: raise ValueError(f'{len(boxes)} cubes exceed Blockbench edit limit {limit}')
    colors=list(dict.fromkeys(col for _,_,col in boxes))
    if len(colors)>255: raise ValueError('Palette overflow')
    atlas=Image.new('RGBA',(16,16),(0,0,0,0))
    for i,c in enumerate(colors): atlas.putpixel((i%16,i//16),c)
    bitmap=io.BytesIO();atlas.save(bitmap,format='PNG')
    texture_id=str(uuid.uuid5(uuid.NAMESPACE_URL,f'voxel-atmosphere:{name}:palette'))
    elements=[];outliner=[]
    dirs=('north','east','south','west','up','down')
    for n,(start,stop,col) in enumerate(boxes):
        a=(start[0]-dims[0]/2, start[2], -(stop[1]-dims[1]/2))
        b=(stop[0]-dims[0]/2, stop[2], -(start[1]-dims[1]/2))
        # Generic Model BBMODEL uses coordinates in its native editor unit scale.
        ix=colors.index(col); px=ix%16;py=ix//16
        uid=str(uuid.uuid5(uuid.NAMESPACE_URL,f'voxel-atmosphere:{name}:cube:{n}'))
        elements.append({'name':f'{name}_voxel_{n:04d}','type':'cube','uuid':uid,
            'from':[round(v,3) for v in a], 'to':[round(v,3) for v in b],
            'origin':[0,0,0],'rotation':[0,0,0], 'color':n%8,
            'faces':{d:{'uv':[px,py,px+1,py+1],'texture':0} for d in dirs}})
        outliner.append(uid)
    model={'meta':{'format_version':'4.10','model_format':'free','box_uv':False},
      'name':name,'resolution':{'width':16,'height':16},'elements':elements,'outliner':outliner,
      'textures':[{'name':'goxel_palette.png','folder':'','namespace':'','id':'0',
        'source':'data:image/png;base64,'+base64.b64encode(bitmap.getvalue()).decode('ascii'),
        'uuid':texture_id,'visible':True, 'mode':'bitmap','saved':True}]}
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(json.dumps(model,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
    return len(boxes)


def convert(source, outdir, scale=0.12):
    dims,voxels=read_vox(source)
    outdir.mkdir(parents=True,exist_ok=True)
    glb=outdir/(source.stem+'.glb')
    bb=outdir/(source.stem+'.bbmodel')
    v,f=to_glb(dims,voxels,glb,scale)
    blocks=to_bbmodel(dims,voxels,bb,name=source.stem)
    data={'source':source.name,'dimensions':dims,'voxels':len(voxels),
      'merged_editable_boxes':blocks,'glb':glb.name,'blockbench':bb.name,'glb_faces':f,
      'scale':scale,'basis':'Goxel XYZ -> Three.js X,Z,-Y; ground at Y=0'}
    (outdir/(source.stem+'.json')).write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
    return data


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--input',type=Path,required=True,help='Goxel MagicaVoxel .vox export')
    p.add_argument('--out',type=Path,required=True,help='GLB/BBMODEL output directory')
    p.add_argument('--scale',type=float,default=.12)
    args=p.parse_args()
    if not 0.001 <= args.scale <= 10:
        p.error('--scale must be 0.001..10')
    print(json.dumps(convert(args.input,args.out,args.scale),ensure_ascii=False))

if __name__=='__main__':main()
