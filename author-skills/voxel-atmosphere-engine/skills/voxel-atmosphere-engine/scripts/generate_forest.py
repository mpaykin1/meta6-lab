#!/usr/bin/env python3
"""Generate an original low-poly night forest GLB, without Blockbench runtime dependency.
All art geometry is authored here; trimesh is used only for glTF serialization.
"""
import argparse
import json
import math
import random
from pathlib import Path
import numpy as np
import trimesh

PALETTE = {
    'earth': (35, 44, 42, 255), 'ground': (34, 42, 40, 255),
    'bark': (51, 39, 47, 255), 'bark_alt': (64, 47, 52, 255),
    'leaves': (23, 46, 55, 255), 'leaves_2': (39, 57, 61, 255),
    'grass': (43, 67, 52, 255), 'rock': (68, 74, 80, 255),
    'water': (25, 53, 64, 255), 'mushroom': (166, 61, 49, 255),
    'mushroom_2': (207, 87, 50, 255), 'stem': (175, 145, 101, 255),
    'window': (255, 182, 93, 255), 'fire': (255, 150, 64, 255),
    'ember': (255, 221, 91, 255), 'clothes': (180, 174, 130, 255),
}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--seed', type=int, default=31415)
    args = parser.parse_args()
    out = args.out
    out.mkdir(parents=True, exist_ok=True)
    rng = random.Random(args.seed)
    scene = trimesh.Scene()
    count = 0

    def add(mesh, name, pos, color):
        nonlocal count
        mesh.visual.vertex_colors = np.tile(np.array(color, dtype=np.uint8), (len(mesh.vertices), 1))
        mesh.apply_translation(pos)
        scene.add_geometry(mesh, node_name=f'{name}_{count:04d}', geom_name=f'{name}_{count:04d}')
        count += 1

    def box(name, pos, size, color):
        add(trimesh.creation.box(extents=size), name, pos, color)

    def column(name, pos, r, h, color, sections=8):
        mesh = trimesh.creation.cylinder(radius=r, height=h, sections=sections)
        mesh.apply_transform(trimesh.transformations.rotation_matrix(math.pi/2, [1, 0, 0]))
        add(mesh, name, pos, color)

    def cone(name, pos, r, h, color, sections=8):
        mesh = trimesh.creation.cone(radius=r, height=h, sections=sections)
        mesh.apply_transform(trimesh.transformations.rotation_matrix(-math.pi/2, [1, 0, 0]))
        # generated cone rises in Y after rotation
        add(mesh, name, pos, color)

    def rock(x, z, size):
        mesh = trimesh.creation.icosphere(subdivisions=0, radius=1.0)
        mesh.apply_scale([size, size * .44, size * .77])
        add(mesh, 'rock', (x, size * .3, z), PALETTE['rock'])

    def tree(x, z, height, variant=0):
        column('tree_trunk', (x, height*.47, z), .18, height*.94, PALETTE['bark'], 5)
        for k, shift in enumerate([(-.22,.07),(.25,-.11),(0,.2)]):
            mesh=trimesh.creation.icosphere(subdivisions=1, radius=1)
            mesh.apply_scale([.82 + .18*k, .80+.15*k, .78+.1*k])
            add(mesh,'tree_crown',(x+shift[0], height+.12*k, z+shift[1]),PALETTE['leaves' if (variant+k)%2==0 else 'leaves_2'])

    def mushroom_house(x, z, scale):
        column('mushroom_stem', (x, scale*.83, z), .62*scale, 1.7*scale, PALETTE['stem'], 10)
        # layered, chunky toadstool roofs
        column('mushroom_roof_brim',(x,1.86*scale,z),1.47*scale,.32*scale,PALETTE['mushroom'],12)
        cone('mushroom_cap',(x,2.06*scale,z),1.31*scale, .75*scale,PALETTE['mushroom_2'],12)
        # door + two softly glowing windows
        box('house_door',(x, .42*scale,z+.58*scale),(.4,.8,.12),PALETTE['bark'])
        for dx in [-.34,.34]:
            box('glowing_window',(x+dx,1.22*scale,z+.53*scale),(.20,.27,.07),PALETTE['window'])
        for i in range(7):
            a=2*math.pi*i/7
            column('cap_spot',(x+math.cos(a)*.7*scale,2.12*scale,z+math.sin(a)*.7*scale),.10*scale,.12*scale,(246,210,144,255),6)

    # terrain: giant slightly faceted slab
    box('terrain',(0,-.42,0),(34,.76,28),PALETTE['ground'])
    box('pond_bed',(2.0,-.025,3.05),(5.9,.055,2.9),PALETTE['water'])
    # stepping stones and periphery, central clearing reserved
    for i in range(17):
        a=2*math.pi*i/17
        r=7.0+rng.random()*1.5
        rock(math.cos(a)*r,math.sin(a)*r,rng.uniform(.28,.7))
    for i in range(52):
        x=rng.uniform(-15,15);z=rng.uniform(-12.5,12.5)
        if math.hypot(x,z)<6.2 or (abs(x-2)<4 and abs(z-3)<2.5):continue
        h=rng.uniform(4,8.3)
        tree(x,z,h,i)
    for i in range(75):
        x=rng.uniform(-15,15);z=rng.uniform(-12.5,12.5)
        if math.hypot(x,z)<2.2:continue
        box('grass_tuft',(x,.10,z),(.08,.20,.10),PALETTE['grass'])
    mushroom_house(-5.0,-.5,1.08)
    mushroom_house(-7.2,2.3,.72)
    mushroom_house(-.5,-6.0,.65)

    # fire pit + wood; actual flame animation and lighting are rendered in Three.js
    for i in range(13):
        a=2*math.pi*i/13
        rock(math.cos(a)*.88,math.sin(a)*.88,.38)
    for angle in [-.7,0,.7]:
        mesh=trimesh.creation.cylinder(radius=.15,height=1.55,sections=6)
        mesh.apply_transform(trimesh.transformations.rotation_matrix(math.pi/2,[0,1,0]))
        mesh.apply_transform(trimesh.transformations.rotation_matrix(angle,[0,1,0]))
        add(mesh,'firewood',(0,.18,0),PALETTE['bark_alt'])
    # shafts of moonlight / lamps visible as warm emissive props later
    for x,z in [(-3.5,2.6),(4,-3.4),(7,3),(-9,-3.5)]:
        column('lantern_post',(x,1.0,z),.065,2.0,PALETTE['bark'],6)
        box('lantern_head',(x,2.05,z),(.3,.32,.3),PALETTE['window'])
        box('lantern_top',(x,2.26,z),(.45,.13,.45),PALETTE['rock'])

    scene.export(out/'night_forest.glb')
    manifest={
        'source':'Original procedural geometries designed for Voxel Atmosphere Engine',
        'format':'glTF 2.0 GLB',
        'seed':args.seed,'mesh_count':count,
        'units':'meters (Y up)',
        'hero_spawn':[0,0,5.0],
        'fire':[0,0,0],
        'house_windows':[[-5,1.3,.15],[-7.2,.86,2.7],[-.5,.78,-5.6]],
        'pond_center':[2,0,3.05],
        'blocked_regions':[{'type':'circle','x':-5,'z':-.5,'r':1.25},{'type':'circle','x':-7.2,'z':2.3,'r':.9},{'type':'circle','x':0,'z':0,'r':.95}],
    }
    (out/'forest_manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    print(f'Generated {out/"night_forest.glb"}, {count} meshes, seed={args.seed}')


if __name__=='__main__': main()
