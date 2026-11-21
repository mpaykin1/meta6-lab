#!/usr/bin/env python3
"""Original sculpted voxel props, editable in Goxel, Blockbench and Three.js."""
import argparse
import math
import random
from pathlib import Path
from goxel_bridge import write_vox, convert

STONE=(67,83,97,255)
DARKSTONE=(47,62,74,255)
PALE=(97,119,133,255)
MOSS=(35,88,81,255)
TURQUOISE=(45,209,206,255)
CYAN=(105,245,231,255)
GLOW=(183,255,231,255)
RUST=(132,103,85,255)
SOIL=(46,61,66,255)


def gate(seed=21):
    rng=random.Random(seed);m={}
    def cell(x,y,z,c):
        if z>=0: m[(x,y,z)]=c
    def box(x0,x1,y0,y1,z0,z1,c):
        for x in range(x0,x1):
          for y in range(y0,y1):
           for z in range(z0,z1):cell(x,y,z,c)
    # Broken stepped foundation, with enough depth for a solid silhouette.
    box(0,45,2,13,0,2,DARKSTONE)
    for x in range(0,45):
     for y in range(0,15):
      if 2<y<13 and rng.random()<.09:
       cell(x,y,2,MOSS)
      elif 2<y<13 and rng.random()<.37:
       cell(x,y,2,STONE)
    for x0 in [2,35]:
      box(x0,x0+8,3,12,2,24,STONE)
      box(x0-1,x0+9,2,13,2,5,DARKSTONE)
      for z in [7,12,17,22]:
       for y in [3,11]:
        box(x0,x0+8,y,y+1,z,z+1,DARKSTONE)
      for _ in range(28):
        x=rng.randrange(x0,x0+8); y=rng.randrange(3,12);z=rng.randrange(5,26)
        cell(x,y,z,PALE if rng.random()<.6 else MOSS)
    # Ring only across the portal top. 3D thickness 6 voxels.
    for x in range(3,43):
      for z in range(16,39):
        r=math.sqrt((x-22)**2+(z-16)**2)
        if 18.3<=r<=22.1:
          for y in range(4,11):
            if rng.random()<.018 and z>27: continue
            c=STONE if (x+z//5)%5!=0 else PALE
            cell(x,y,z,c)
    # Irregular broken battlements and glowing glyph stones.
    for x in range(12,38,4):
      z=16+int(math.sqrt(max(0,21**2-(x-22)**2)))
      for y in range(4,10):
       if rng.random()<.6:
        cell(x,y,z+1,PALE)
    for x,z in [(11,28),(15,33),(21,37),(28,35),(33,30),(5,21),(40,19)]:
       for y in [10,11]:cell(x,y,z,CYAN)
       cell(x,11,z+1,GLOW)
    for x,z in [(6,3),(10,3),(36,3),(40,3)]:
       box(x,x+2,0,2,z,z+1,MOSS)
    # Hanging pale lattice crystals between stone ribs.
    for x,y,z in [(14,9,24),(30,5,25),(23,9,36)]:
     for dz in range(6):
      rr=max(1,3-dz//2)
      for dx in range(-rr,rr+1):
       for dy in range(-rr,rr+1):
        if abs(dx)+abs(dy)<=rr+1:
         cell(x+dx,y+dy,z+dz,CYAN if dz<3 else GLOW)
    return m


def crystals(seed=7):
    rng=random.Random(seed);m={}
    def v(x,y,z,c):
      if z>=0:m[(x,y,z)]=c
    for x in range(0,24):
     for y in range(0,21):
      if ((x-12)/11.3)**2+((y-10)/9.5)**2<=1.0:
       v(x,y,0,SOIL)
       if rng.random()<.22:v(x,y,1,MOSS)
    spikes=[(11,10,24,4),(6,6,18,3),(16,7,16,3),(17,15,22,3),(7,15,11,2),(12,16,14,2),(19,10,9,2)]
    for x0,y0,height,radius in spikes:
       for z in range(1,height):
        r=radius if z < height*.55 else max(1,round(radius*(height-z)/(height*.45)))
        for x in range(x0-r,x0+r+1):
         for y in range(y0-r,y0+r+1):
          if abs(x-x0)+abs(y-y0)>r+1:continue
          c=GLOW if z>=height-3 else (CYAN if (x+y+z)%3==0 else TURQUOISE)
          v(x,y,z,c)
    for x,y in [(4,10),(20,4),(4,17),(21,16),(11,3)]:
      for dx in range(-1,2):
       for dy in range(-1,2):v(x+dx,y+dy,1,RUST)
      v(x,y,2,GLOW)
    return m


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--out',type=Path,required=True)
    parser.add_argument('--seed',type=int,default=21)
    ns=parser.parse_args()
    ns.out.mkdir(parents=True,exist_ok=True)
    for name, builder, size in [('moon_gate',gate,.14),('moon_crystals',crystals,.115)]:
        path=ns.out/(name+'.vox')
        write_vox(path,builder(ns.seed if name=='moon_gate' else ns.seed+4))
        info=convert(path,ns.out,scale=size)
        print(f'{name}: {info["voxels"]} voxels -> {info["glb"]} + {info["blockbench"]}')

if __name__=='__main__':main()
