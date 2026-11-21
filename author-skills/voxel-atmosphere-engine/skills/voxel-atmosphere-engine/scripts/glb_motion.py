#!/usr/bin/env python3
"""Append genuine glTF 2.0 animation tracks to existing GLB meshes.

Stand-alone, Python standard library only. Used when Blender isn't installed;
Blender can import and edit the resulting animations and export a .blend source.
"""
import argparse
import json
import math
import pathlib
import struct

GLB_MAGIC=b'glTF'
JSON_CHUNK=b'JSON'
BIN_CHUNK=b'BIN\0'


def parse_glb(data):
    if len(data)<20 or data[:4]!=GLB_MAGIC:
        raise ValueError('Expected a binary glTF 2.0 .glb')
    _,version,total=struct.unpack_from('<4sII',data)
    if version!=2 or total!=len(data):
        raise ValueError('Invalid GLB version/length')
    chunks=[];offset=12
    while offset+8<=len(data):
        size,tag=struct.unpack_from('<I4s',data,offset);offset+=8
        if offset+size>len(data): raise ValueError('Truncated GLB chunk')
        chunks.append((tag,data[offset:offset+size]));offset+=size
    if offset!=len(data) or not chunks or chunks[0][0]!=JSON_CHUNK:
        raise ValueError('Invalid GLB chunk structure')
    document=json.loads(chunks[0][1].decode('utf-8'))
    if document.get('asset',{}).get('version')!='2.0':
        raise ValueError('Expected glTF 2.0 document')
    bins=[payload for tag,payload in chunks[1:] if tag==BIN_CHUNK]
    if len(bins)!=1 or len(document.get('buffers',[]))!=1:
        raise ValueError('GLB must contain exactly one embedded BIN buffer')
    return document,bytearray(bins[0])


def append_track(doc,bin_data,values,kind,frame_count):
    if len(values)%frame_count:raise ValueError('Misaligned values')
    components=len(values)//frame_count
    expected={'SCALAR':1,'VEC3':3,'VEC4':4}[kind]
    if components!=expected:raise ValueError('GLB accessor component count mismatch')
    while len(bin_data)%4:bin_data.append(0)
    off=len(bin_data);payload=struct.pack('<'+'f'*len(values),*values)
    bin_data.extend(payload)
    views=doc.setdefault('bufferViews',[])
    view_index=len(views)
    views.append({'buffer':0,'byteOffset':off,'byteLength':len(payload)})
    a={'bufferView':view_index,'componentType':5126,'count':frame_count,'type':kind}
    if kind=='SCALAR':a.update({'min':[min(values)],'max':[max(values)]})
    accessors=doc.setdefault('accessors',[])
    idx=len(accessors);accessors.append(a)
    return idx


def build_motion(source,dest,motion='hover',duration=4,amplitude=.19):
    if source.resolve()==dest.resolve():raise ValueError('Output must not overwrite the source GLB')
    if motion not in ('hover','breathe'):raise ValueError('Unsupported motion')
    doc,buf=parse_glb(source.read_bytes())
    node_id=doc.get('scenes',[{}])[doc.get('scene',0)].get('nodes',[None])[0]
    if node_id is None:raise ValueError('Source GLB has no root scene node')
    node=doc['nodes'][node_id]
    if 'matrix' in node:raise ValueError('Source root node uses a matrix; animation requires TRS')
    steps=24
    times=[duration*i/steps for i in range(steps+1)]
    trans=[];rots=[];scales=[]
    base=node.get('translation',[0.,0.,0.])
    base_scale=node.get('scale',[1.,1.,1.])
    qx,qy,qz,qw=node.get('rotation',[0.,0.,0.,1.])
    for i in range(steps+1):
        theta=2*math.pi*i/steps
        b=math.sin(theta)
        lift=amplitude*(.5-.5*math.cos(theta)) if motion=='hover' else amplitude*.1*b
        trans.extend([base[0],base[1]+lift,base[2]])
        angle=(.07 if motion=='hover' else .012)*b
        ay,aw=math.sin(angle/2),math.cos(angle/2)
        # Quaternion original * y-axis delta: preserve authored GLB rotation.
        rots.extend([qx*aw-qz*ay, qy*aw+qw*ay, qz*aw+qx*ay, qw*aw-qy*ay])
        scale=1+(.035 if motion=='hover' else .024)*b
        scales.extend([s*scale for s in base_scale])
    timeline=append_track(doc,buf,times,'SCALAR',len(times))
    tdata=append_track(doc,buf,trans,'VEC3',len(times))
    rdata=append_track(doc,buf,rots,'VEC4',len(times))
    sdata=append_track(doc,buf,scales,'VEC3',len(times))
    anim={'name':'VAE_'+motion.upper(),
          'samplers':[{'input':timeline,'output':idx,'interpolation':'LINEAR'} for idx in (tdata,rdata,sdata)],
          'channels':[{'sampler':i,'target':{'node':node_id,'path':name}}
                      for i,name in enumerate(('translation','rotation','scale'))]}
    doc.setdefault('animations',[]).append(anim)
    doc['buffers'][0]['byteLength']=len(buf)
    doc.setdefault('asset',{}).setdefault('generator','Voxel Atmosphere Engine')
    j=json.dumps(doc,separators=(',',':'),ensure_ascii=False).encode('utf8')
    j+=b' ' *((4-len(j)%4)%4)
    b=bytes(buf)+b'\0'*((4-len(buf)%4)%4)
    total=12+8+len(j)+8+len(b)
    result=struct.pack('<4sII',GLB_MAGIC,2,total)+struct.pack('<I4s',len(j),JSON_CHUNK)+j+struct.pack('<I4s',len(b),BIN_CHUNK)+b
    dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_bytes(result)
    return {'source':str(source),'output':str(dest),'animations':len(doc['animations']),'duration':duration}


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--input',type=pathlib.Path,required=True)
    p.add_argument('--out',type=pathlib.Path,required=True)
    p.add_argument('--motion',choices=['hover','breathe'],default='hover')
    p.add_argument('--duration',type=float,default=4.)
    p.add_argument('--amplitude',type=float,default=.19)
    a=p.parse_args()
    if a.duration<=0 or a.amplitude<0: p.error('Duration must be positive, amplitude non-negative')
    print(json.dumps(build_motion(a.input,a.out,a.motion,a.duration,a.amplitude)))

if __name__=='__main__':main()
