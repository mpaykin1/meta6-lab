#!/usr/bin/env python3
"""Convert Blockbench *simple cube* .bbmodel models to glTF 2.0 GLB.

This adapter is original code and does NOT contain GPL Blockbench editor code.
Supported: native .bbmodel JSON, cube dimensions, pivot rotations, color indices,
visibility, and outliner order. Advanced UV, painted textures, meshes, group
transforms, animation and bones require exporting a GLB in Blockbench itself.
"""
from __future__ import annotations
import argparse
import json
import math
import pathlib
import struct

COLORS = ["fff0e5", "ffb6cf", "f38bae", "303653", "94dfcc", "cabafd", "ffe2a4", "ffffff"]
QUADS = [
    (( 1,0,0), [(1,-1,-1),(1,1,-1),(1,1,1),(1,-1,1)]),
    ((-1,0,0), [(-1,-1,1),(-1,1,1),(-1,1,-1),(-1,-1,-1)]),
    ((0, 1,0), [(-1,1,1),(1,1,1),(1,1,-1),(-1,1,-1)]),
    ((0,-1,0), [(-1,-1,-1),(1,-1,-1),(1,-1,1),(-1,-1,1)]),
    ((0,0, 1), [(1,-1,1),(1,1,1),(-1,1,1),(-1,-1,1)]),
    ((0,0,-1), [(-1,-1,-1),(-1,1,-1),(1,1,-1),(1,-1,-1)]),
]

def ensure_vector(value, key):
    if not isinstance(value, list) or len(value) != 3:
        raise ValueError(f'{key} must contain three numbers')
    result = [float(x) for x in value]
    if not all(math.isfinite(x) and abs(x)<10000 for x in result):
        raise ValueError(f'invalid coordinates in {key}')
    return result

def order_from_outliner(outliner):
    order=[]
    def walk(children):
        for child in children:
            if isinstance(child,str):order.append(child)
            elif isinstance(child,dict):
                if child.get('visibility',True) is not False:walk(child.get('children',[]))
    walk(outliner)
    return order

def make_glb(src:pathlib.Path, dst:pathlib.Path,scale:float=.065):
    if not (0<scale<=1):raise ValueError('scale must be between zero and one')
    if src.stat().st_size>5_000_000:raise ValueError('.bbmodel is too large')
    model=json.loads(src.read_text('utf-8'))
    if not isinstance(model,dict) or not isinstance(model.get('meta'),dict):raise ValueError('not a Blockbench .bbmodel file')
    if not isinstance(model.get('elements'),list):raise ValueError('model contains no elements')
    elems=model['elements'];by_uuid={c.get('uuid'):c for c in elems if isinstance(c,dict)}
    ids=order_from_outliner(model.get('outliner',[]))
    # Native outliner governs inclusion and ordering if present. Otherwise all cubes.
    chosen=[by_uuid[k] for k in ids if k in by_uuid] if ids else elems
    chosen=[c for c in chosen if isinstance(c,dict) and c.get('type','cube')=='cube' and c.get('visibility',True)!=False]
    if len(chosen)>300:raise ValueError('maximum 300 cube elements')
    if not chosen:raise ValueError('no visible cubes found')
    colors=[]
    for val in COLORS:
        colors.append([int(val[i:i+2],16)/255 for i in (0,2,4)]+[1.])
    gltf={'asset':{'version':'2.0','generator':'Casual Game Studio Blockbench-to-GLB Bridge 0.4'},
          'scenes':[{'nodes':[]}],'scene':0,'nodes':[],'meshes':[],'materials':[],
          'buffers':[],'bufferViews':[],'accessors':[]}
    for i, rgba in enumerate(colors):
        gltf['materials'].append({'name':f'pastel_{i}','pbrMetallicRoughness':{'baseColorFactor':rgba,'metallicFactor':0.02,'roughnessFactor':0.78},'doubleSided':False})
    chunks=[];byte_len=0
    def push(raw:bytes,target:int):
        nonlocal byte_len
        pad=(-byte_len)%4
        if pad:chunks.append(b'\0'*pad);byte_len+=pad
        gltf['bufferViews'].append({'buffer':0,'byteOffset':byte_len,'byteLength':len(raw),'target':target})
        chunks.append(raw);byte_len+=len(raw)
        return len(gltf['bufferViews'])-1
    for c in chosen:
        a=ensure_vector(c.get('from'), 'from');b=ensure_vector(c.get('to'),'to')
        if any(b[i]<=a[i] for i in range(3)):continue
        center=[(a[i]+b[i])*scale/2 for i in range(3)]
        half=[(b[i]-a[i])*scale/2 for i in range(3)]
        vertices=[];normals=[];indices=[]
        for normal,quad in QUADS:
            base=len(vertices)//3
            for signs in quad:
                vertices.extend([half[i]*signs[i] for i in range(3)])
                normals.extend(normal)
            indices.extend([base,base+1,base+2,base,base+2,base+3])
        vview=push(struct.pack('<%sf'%len(vertices),*vertices),34962)
        nview=push(struct.pack('<%sf'%len(normals),*normals),34962)
        iview=push(struct.pack('<%sH'%len(indices),*indices),34963)
        def accessor(view,ctype,count,typ,**kwargs):
            gltf['accessors'].append({'bufferView':view,'componentType':ctype,'count':count,'type':typ,**kwargs})
            return len(gltf['accessors'])-1
        vp=accessor(vview,5126,len(vertices)//3,'VEC3',min=[-v for v in half],max=half)
        vn=accessor(nview,5126,len(normals)//3,'VEC3')
        ii=accessor(iview,5123,len(indices),'SCALAR')
        mesh_id=len(gltf['meshes'])
        col=c.get('color',0)
        material=col if isinstance(col,int) and 0<=col<len(colors) else 0
        gltf['meshes'].append({'name':c.get('name','Cube'),'primitives':[{'attributes':{'POSITION':vp,'NORMAL':vn},'indices':ii,'material':material}]})
        node={'name':c.get('name','Part'),'mesh':mesh_id,'translation':center}
        if c.get('rotation') and any(c['rotation']):
            rot=ensure_vector(c['rotation'],'rotation');axis=sum(abs(x)>0.0001 for x in rot)
            if axis>1:raise ValueError('multi-axis cube rotation needs Blockbench native GLB export')
            origin=ensure_vector(c.get('origin',[x/scale for x in center]),'origin')
            pivot=[x*scale for x in origin]
            # Place cube beneath a pivot transform, preserving rotation around origin.
            parent={'name':str(c.get('name','Cube'))+'_pivot','translation':pivot}
            ang=[math.radians(v)/2 for v in rot]
            qx,qy,qz=math.sin(ang[0]),math.sin(ang[1]),math.sin(ang[2]);
            # One-axis rotations only, quaternion is unambiguous.
            parent['rotation']=[qx,qy,qz,math.cos(sum(abs(v) for v in ang))]
            node['translation']=[center[i]-pivot[i] for i in range(3)]
            parent['children']=[len(gltf['nodes'])+1]
            gltf['scenes'][0]['nodes'].append(len(gltf['nodes']))
            gltf['nodes'].append(parent)
            gltf['nodes'].append(node)
        else:
            gltf['scenes'][0]['nodes'].append(len(gltf['nodes']))
            gltf['nodes'].append(node)
    blob=b''.join(chunks)
    gltf['buffers']=[{'byteLength':len(blob)}]
    payload=json.dumps(gltf,ensure_ascii=False,separators=(',',':')).encode('utf-8')
    payload+=b' ' *((-len(payload))%4)
    blob+=b'\0' *((-len(blob))%4)
    header=struct.pack('<III',0x46546C67,2,12+8+len(payload)+8+len(blob))
    result=header+struct.pack('<II',len(payload),0x4E4F534A)+payload+struct.pack('<II',len(blob),0x004E4942)+blob
    dst.parent.mkdir(parents=True,exist_ok=True)
    dst.write_bytes(result)
    print(f'Exported {len(gltf["meshes"])} cube parts: {dst} ({len(result)} bytes)')

if __name__=='__main__':
    parser=argparse.ArgumentParser(description='Blockbench .bbmodel cube JSON to game GLB')
    parser.add_argument('--src',required=True,type=pathlib.Path)
    parser.add_argument('--out',required=True,type=pathlib.Path)
    parser.add_argument('--scale',type=float,default=.065)
    x=parser.parse_args();make_glb(x.src,x.out,x.scale)
