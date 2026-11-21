#!/usr/bin/env python3
"""Render authentic Ragnagrok voxel Model data as native instanced Three.js props.

Keeps Voxelize and Lumenwild physics, players, collision and engine render loops
unchanged. Ragnagrok editor projects are an interchange format for decorative
assets, not a claim of shared voxel world simulation or animated rig transfer.
"""
from __future__ import annotations
import json
from pathlib import Path

from create_game import fail, replace_once, save
from ragnagrok_assets import write_pack

BRIDGE = '''// Voxel Game Creator v0.3 — Ragnagrok voxel Model -> native Three.js InstancedMesh.
// MIT source format © Ragnagrok 2026. Decorative assets; no collision promises.
import * as THREE from "THREE_IMPORT";
import { VGC_RAGNAGROK_ASSETS } from "./ragnagrok-assets";

type V3 = [number,number,number];
type RagModel = { id: string; name: string; size: V3; scale: number; palette: number[]; emissive: number[]; closed: boolean; data: string };
type RagInstance = { id: string; model: string; pos: V3; rot: number; solid: boolean };
type RagPack = { format:string; models:RagModel[]; instances:RagInstance[] };

function decode(model: RagModel): Uint8Array {
  const [sx,sy,sz]=model.size;
  const count=sx*sy*sz;
  if (!Number.isInteger(count) || count<1 || count>125000) throw new Error('Ragnagrok asset too large');
  const binary=atob(model.data);
  const out=new Uint8Array(count);
  let at=0, written=0;
  while (at<binary.length) {
    let run=0, shift=0, byte=0;
    do {
      if (at>=binary.length || shift>28) throw new Error('Corrupt Ragnagrok run');
      byte=binary.charCodeAt(at++);
      run|=(byte&127)<<shift;
      shift+=7;
    } while (byte&128);
    if (at>=binary.length || run<1 || written+run>count) throw new Error('Bad Ragnagrok model length');
    const color=binary.charCodeAt(at++);
    if (color>=model.palette.length) throw new Error('Invalid Ragnagrok palette index');
    out.fill(color,written,written+run);
    written+=run;
  }
  if (written!==count) throw new Error('Incomplete Ragnagrok voxel model');
  return out;
}

function modelGroup(model:RagModel):THREE.Group {
  const root=new THREE.Group();
  const [sx,sy,sz]=model.size;
  const cells=decode(model);
  const idx=(x:number,y:number,z:number)=>x+z*sx+y*sx*sz;
  const cell=(x:number,y:number,z:number)=>x<0||y<0||z<0||x>=sx||y>=sy||z>=sz ? 0 : cells[idx(x,y,z)];
  const visible=new Map<number,V3[]>();
  for(let y=0;y<sy;y++) for(let z=0;z<sz;z++) for(let x=0;x<sx;x++) {
    const c=cell(x,y,z); if(c===0)continue;
    if(cell(x+1,y,z)&&cell(x-1,y,z)&&cell(x,y+1,z)&&cell(x,y-1,z)&&cell(x,y,z+1)&&cell(x,y,z-1))continue;
    const dest=visible.get(c)||[];dest.push([x,y,z]);visible.set(c,dest);
  }
  const cube=new THREE.BoxGeometry(1,1,1);
  const dummy=new THREE.Object3D();
  for(const [color,coords] of visible) {
    const hex=model.palette[color];
    const isGlow=model.emissive.includes(color);
    const mat=new THREE.MeshStandardMaterial({
      color:hex,roughness:0.86,metalness:0.04,
      emissive:isGlow?hex:0x000000,emissiveIntensity:isGlow?1.2:0,
    });
    const mesh=new THREE.InstancedMesh(cube,mat,coords.length);
    mesh.name=model.id+'-'+color;
    for(let i=0;i<coords.length;i++) {
      const [x,y,z]=coords[i];
      dummy.position.set((x+.5-sx/2)*model.scale,(y+.5)*model.scale,(z+.5-sz/2)*model.scale);
      dummy.scale.setScalar(model.scale);
      dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate=true;
    mesh.castShadow=true;mesh.receiveShadow=true;
    root.add(mesh);
  }
  return root;
}

/** Shared art from Ragnagrok; game engines retain their own block/chunk formats. */
export function createVgcDecorationGroup(originX:number,originZ:number,ground:(x:number,z:number)=>number): THREE.Group {
  const assets=VGC_RAGNAGROK_ASSETS as RagPack;
  const root=new THREE.Group();root.name='VGC: Ragnagrok authentic voxel props';
  const lookup=new Map(assets.models.map(m=>[m.id,m]));
  for (const item of assets.instances) {
    const model=lookup.get(item.model);
    if(!model)throw new Error('Missing Ragnagrok model: '+item.model);
    const g=modelGroup(model);
    const x=originX+item.pos[0],z=originZ+item.pos[2];
    g.position.set(x,ground(x,z)+item.pos[1],z);
    g.rotation.y=(item.rot%4)*Math.PI/2;
    root.add(g);
  }
  return root;
}
'''


def install_bridge(target:Path, engine:str, assets:dict)->None:
    if engine not in ('browser','server'):fail('Ragnagrok bridge unknown engine '+engine)
    if not target.is_dir():fail('Game engine target missing: '+str(target))
    src=target/'src' if engine=='browser' else target/'examples/client/src'
    if not (src/'main.ts').exists():fail('Game client main.ts missing')
    assetdir=src/'vgc';assetdir.mkdir(exist_ok=True)
    # Ragnagrok models are embedded as a typed TS const for native Vite builds.
    save(assetdir/'ragnagrok-assets.ts','// Generated from Ragnagrok Project Model JSON.\nexport const VGC_RAGNAGROK_ASSETS = '+json.dumps(assets,ensure_ascii=False,separators=(',',':'))+';\n')
    save(assetdir/'ragnagrok-props.ts',BRIDGE.replace('THREE_IMPORT','three' if engine=='browser' else 'three/webgpu'))
    write_pack(target/'assets',assets)
    path=src/'main.ts';txt=path.read_text(encoding='utf8')
    txt='import { createVgcDecorationGroup } from "./vgc/ragnagrok-props";\n'+txt
    if engine=='browser':
        needle='  const startZ = saved?.z ?? spawn.z;'
        addition='''  const sampleRagTerrain = createColumnSampler(SEED);
  if (webgl) {
    webgl.scene.add(createVgcDecorationGroup(startX,startZ,
      (x,z)=>sampleRagTerrain(Math.floor(x),Math.floor(z)).terrainHeight+1));
  }
'''
    else:
        needle='  await setupWorld(world);'
        # Voxelize's terrain is a server-owned simulation; props are purely visual.
        # Render as floating cairns over approximate spawn height, not physics colliders.
        addition='''  world.add(createVgcDecorationGroup(0,0,(_x,_z)=>82));
'''
    txt=replace_once(txt,needle,needle+'\n'+addition,'Ragnagrok art scene attachment')
    save(path,txt)
