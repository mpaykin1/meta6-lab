#!/usr/bin/env python3
"""Connect Pixelorama authored palette to Goxel .vox while retaining 3D geometry and alpha."""
from pathlib import Path
import argparse, json, math
from goxel_bridge import read_vox,write_vox,convert

def parse_colors(palette:Path):
    obj=json.loads(palette.read_text(encoding='utf-8'))
    entries=obj.values() if isinstance(obj,dict) else obj
    def color(value):
        if isinstance(value,str) and value.startswith('#') and len(value)==7:
            return tuple(int(value[i:i+2],16) for i in (1,3,5))+(255,)
        if isinstance(value,(list,tuple)) and len(value) in (3,4):
            return tuple(value[:3])+(255,)
        raise ValueError('Unsupported palette color')
    result=[color(p) for p in entries]
    if not 1<=len(result)<=255:raise ValueError('palette must contain 1..255 colors')
    return result

def recolor(vox:Path,palette:Path,out:Path,scale:float=0.12):
    dims,cells=read_vox(vox)
    colors=parse_colors(palette)
    def nearest(col):
        # Weighted perceptual-ish RGB distance; transparent VOX voxels are already skipped.
        return min(colors,key=lambda p:3*(col[0]-p[0])**2+4*(col[1]-p[1])**2+2*(col[2]-p[2])**2)
    lookup={c:nearest(c) for c in set(cells.values())}
    recolored={position:lookup[col] for position,col in cells.items()}
    out.mkdir(parents=True,exist_ok=True)
    target=out/(vox.stem+'_pixelorama.vox')
    write_vox(target,recolored)
    return convert(target,out,scale=scale)

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--input',type=Path,required=True)
    p.add_argument('--palette',type=Path,required=True);p.add_argument('--out',type=Path,required=True)
    p.add_argument('--scale',type=float,default=.12)
    a=p.parse_args();print(recolor(a.input,a.palette,a.out,a.scale))
