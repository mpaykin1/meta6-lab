#!/usr/bin/env python3
"""Pinned MIT FastNoiseLite: shared, deterministic Ragnagrok vegetation/prop placement.

Only decorative static instances in native Three.js scenes. The tool never
changes the engine's authoritative blocks, cave data, player or physics.
"""
from __future__ import annotations
import json
import math
import os
import shutil
import subprocess
from pathlib import Path
from create_game import fail, save, replace_once
from yuka_bridge import render_model

VERSION='1.1.1'
SOURCE_PIN='785f37a9ad76e283586a379675085f2063ae03f7'
SOURCE='https://github.com/Auburn/FastNoiseLite'
MAX_INSTANCES=42
MAX_CELLS=160_000


def read_config(path:Path|None, assets:dict, spec:dict)->dict:
    defaults={'seed':spec.get('seed',7391),'radius':28,'spacing':4.0,
              'frequency':0.041,'density':0.65,'maxInstances':32,
              'models':{'forest':'vgc_tree','mineral':'vgc_crystal','rune':'vgc_waystone'}}
    # Other authored project: use existing user models, never swap hero/NPC visuals.
    ids={m['id'] for m in assets['models']}
    first=sorted(ids)[0] if ids else ''
    for k,mid in defaults['models'].copy().items():
        if mid not in ids:defaults['models'][k]=first
    if not ids:fail('FastNoiseLite requires at least one authored Ragnagrok model')
    if path:
        try:doc=json.loads(path.read_text(encoding='utf8'))
        except (OSError,ValueError) as e:fail('FastNoiseLite config cannot be read: '+str(e))
        if not isinstance(doc,dict) or set(doc)-set(defaults):fail('FastNoiseLite config has invalid fields')
        defaults.update(doc)
    v=defaults
    if type(v['seed']) is not int or not -2**31<=v['seed']<2**31:fail('FastNoiseLite seed must be a signed 32-bit integer')
    for name,lower,upper in (('radius',12,42),('spacing',2.5,9.0),('frequency',.005,.15),('density',0,1)):
        n=v[name]
        if type(n) not in (float,int) or not math.isfinite(n) or not lower<=n<=upper:fail('FastNoiseLite '+name+' outside limits')
    if type(v['maxInstances']) is not int or not 0<=v['maxInstances']<=MAX_INSTANCES:
        fail('FastNoiseLite maxInstances outside 0..42')
    models=v['models']
    if not isinstance(models,dict) or set(models)!={'forest','mineral','rune'} or any(
        not isinstance(mid,str) or mid not in ids for mid in models.values()):
        fail('FastNoiseLite models must refer to existing authored Ragnagrok voxels')
    return v


def dependency(client:Path,mode:str)->tuple[bool,str]:
    if mode=='off':return False,'off'
    package=client/'package.json';lock=client/'package-lock.json'
    if not lock.is_file() and (client.parent.parent/'pnpm-workspace.yaml').is_file():
        from pnpm_dependency import resolve
        return resolve(client,{'fastnoise-lite':VERSION},mode,'FastNoiseLite')
    if not package.is_file() or not lock.is_file():
        if mode=='required':fail('FastNoiseLite needs a consistent npm lockfile')
        return False,'missing-npm-lock'
    if not shutil.which('npm'):
        if mode=='required':fail('FastNoiseLite needs npm')
        return False,'npm-unavailable'
    before={p:p.read_bytes() for p in (package,lock)}
    try:
        proc=subprocess.run(['npm','install','--package-lock-only','--save-exact',
            '--ignore-scripts','--no-audit','--no-fund','--fetch-retries=0',
            '--fetch-timeout=5000','fastnoise-lite@'+VERSION],cwd=client,
            check=False,text=True,capture_output=True,timeout=45,
            env={**os.environ,'CI':'true'})
        if proc.returncode:raise RuntimeError((proc.stderr or proc.stdout)[-350:])
        manifest=json.loads(package.read_text(encoding='utf8'))
        plock=json.loads(lock.read_text(encoding='utf8'))
        if (manifest.get('dependencies',{}).get('fastnoise-lite')!=VERSION or
            plock.get('packages',{}).get('node_modules/fastnoise-lite',{}).get('version')!=VERSION):
            raise RuntimeError('FastNoiseLite package-lock resolution mismatch')
        return True,'npm-lock-resolved'
    except (OSError,subprocess.TimeoutExpired,ValueError,RuntimeError) as e:
        for path,data in before.items():path.write_bytes(data)
        if mode=='required':fail('FastNoiseLite npm install failed: '+str(e))
        return False,'npm-unavailable; lockfile restored'


RUNTIME=r'''// MIT FastNoiseLite (Auburn) + original Ragnagrok authored models.
// Visual-only static landscape dressing. No fake block physics or terrain mutation.
import * as THREE from 'THREE_MODULE';
import FastNoiseLite from 'fastnoise-lite';

type Cell=[number,number,number];
type Model={size:[number,number,number];scale:number;
 groups:Record<string,{cells:Cell[];emissive:boolean}>};
type Config={seed:number;radius:number;spacing:number;frequency:number;
 density:number;maxInstances:number;models:{forest:string;mineral:string;rune:string}};
const CONFIG:Config=__CONFIG__;
const MODELS:Record<string,Model>=__MODELS__;
const MAX_CELLS=160000;

function noise(seed:number,type:Parameters<FastNoiseLite['SetNoiseType']>[0],
 frequency:number,fractal:Parameters<FastNoiseLite['SetFractalType']>[0]):FastNoiseLite{
  const n=new FastNoiseLite();
  n.SetSeed(seed);n.SetNoiseType(type);n.SetFrequency(frequency);
  n.SetFractalType(fractal);n.SetFractalOctaves(3);
  return n;
}

/** Pure deterministic 2D/3D fields. Shared config can be used by future chunk generation. */
export function makeNoiseFields(seed:number=CONFIG.seed){
  const macro=noise(seed,FastNoiseLite.NoiseType.OpenSimplex2,CONFIG.frequency,FastNoiseLite.FractalType.FBm);
  const cellular=noise(seed+17,FastNoiseLite.NoiseType.Cellular,CONFIG.frequency*1.55,FastNoiseLite.FractalType.None);
  const detail3d=noise(seed+191,FastNoiseLite.NoiseType.OpenSimplex2S,CONFIG.frequency*.95,FastNoiseLite.FractalType.Ridged);
  return {
    height:(x:number,z:number)=>macro.GetNoise(x,z),
    region:(x:number,z:number)=>cellular.GetNoise(x,z),
    density:(x:number,y:number,z:number)=>detail3d.GetNoise(x,y,z),
  };
}

/** Seed-stable selection in LOCAL space; unchanged when FPS or screen size changes. */
export function selectVgcNoiseProps(seed:number=CONFIG.seed):{type:string;x:number;z:number;yaw:number}[]{
  const f=makeNoiseFields(seed);
  const out:{type:string;x:number;z:number;yaw:number;score:number}[]=[];
  if(CONFIG.maxInstances===0||CONFIG.density===0)return []; 
  const span=Math.floor(CONFIG.radius/CONFIG.spacing);
  for(let iz=-span;iz<=span;iz++) for(let ix=-span;ix<=span;ix++){
    const x=ix*CONFIG.spacing,z=iz*CONFIG.spacing;
    if(x*x+z*z>CONFIG.radius*CONFIG.radius||x*x+z*z<196)continue;
    const a=f.height(x,z),b=f.region(x,z),c=f.density(x,2.7,z);
    const gate=(a*.43+b*.20+c*.37+1)*.5;
    if(gate<1-CONFIG.density*.84)continue;
    // Noise is based on coordinates and seed, no Math.random or nondeterministic spawn.
    const type=b<-.12?'forest':c>.3?'mineral':'rune';
    out.push({type,x,z,yaw:Math.atan2(c,a),score:gate});
  }
  // Keep the strongest biome pockets, rather than concentrating to the first grid row.
  out.sort((a,b)=>b.score-a.score||a.x-b.x||a.z-b.z);
  return out.slice(0,CONFIG.maxInstances).map(({score:_,...rest})=>rest);
}

/** Render authored voxel cells in a SMALL number of InstancedMesh draw calls. */
export function mountVgcFastNoise(
  scene:THREE.Object3D,originX:number,originZ:number,
  ground:(worldX:number,worldZ:number)=>number,
):THREE.Group {
  const group=new THREE.Group();group.name='VGC FastNoiseLite authored biome detail';
  const patches=selectVgcNoiseProps();
  const geometry=new THREE.BoxGeometry(1,1,1);
  let totalCells=0;
  const scratch=new THREE.Object3D();
  const matrix=new THREE.Matrix4();
  const sorted=new Map<string,{x:number;z:number;yaw:number}[]>();
  for(const p of patches){const id=CONFIG.models[p.type as keyof Config['models']];
    if(!sorted.has(id))sorted.set(id,[]);
    sorted.get(id)!.push(p);
  }
  for(const [id,sites] of sorted){
    const model=MODELS[id];if(!model)continue;
    const [sx,_sy,sz]=model.size;
    for(const [color,parts] of Object.entries(model.groups)){
      if(!parts.cells.length)continue;
      const count=parts.cells.length*sites.length;
      if(totalCells+count>MAX_CELLS){console.warn('VGC FastNoiseLite: instance budget reached');continue;}
      totalCells+=count;
      const tint=new THREE.Color('#'+color);
      const mat=new THREE.MeshStandardMaterial({color:tint,roughness:.91,
        emissive:parts.emissive?tint:new THREE.Color(0),
        emissiveIntensity:parts.emissive?.8:0});
      const instanced=new THREE.InstancedMesh(geometry,mat,count);
      instanced.name='FastNoiseLite:'+id+':'+color;
      let i=0;
      for(const site of sites){
        const y=ground(originX+site.x,originZ+site.z);
        if(!Number.isFinite(y))continue;
        const cs=Math.cos(site.yaw),sn=Math.sin(site.yaw);
        for(const [x,yy,z] of parts.cells){
          const lx=(x-(sx-1)/2)*model.scale,lz=(z-(sz-1)/2)*model.scale;
          scratch.position.set(originX+site.x+cs*lx-sn*lz,
            y+(yy+.5)*model.scale,originZ+site.z+sn*lx+cs*lz);
          scratch.rotation.set(0,site.yaw,0);
          scratch.scale.setScalar(model.scale);
          scratch.updateMatrix();
          matrix.copy(scratch.matrix);instanced.setMatrixAt(i++,matrix);
        }
      }
      if(!i){instanced.geometry=geometry;mat.dispose();continue;}
      instanced.count=i;instanced.instanceMatrix.needsUpdate=true;
      instanced.castShadow=false;instanced.receiveShadow=true;
      instanced.frustumCulled=false;
      group.add(instanced);
    }
  }
  scene.add(group);
  return group;
}
'''


def install(target:Path,engine:str,assets:dict,spec:dict,*,mode:str='auto',config:Path|None=None)->dict:
    if engine not in ('browser','server'):fail('FastNoiseLite scene bridge only supports Lumenwild and Voxelize')
    if mode not in ('auto','off','required'):fail('FastNoiseLite mode must be auto|off|required')
    if mode=='off':return {'mode':mode,'status':'off'}
    cfg=read_config(config,assets,spec)
    client=target if engine=='browser' else target/'examples/client'
    enabled,status=dependency(client,mode)
    if not enabled:return {'mode':mode,'status':status}
    ids=set(cfg['models'].values())
    models={m['id']:render_model(m) for m in assets['models'] if m['id'] in ids}
    runtime=RUNTIME.replace('THREE_MODULE','three' if engine=='browser' else 'three/webgpu')
    runtime=runtime.replace('__CONFIG__',json.dumps(cfg,ensure_ascii=False,separators=(',',':')))
    runtime=runtime.replace('__MODELS__',json.dumps(models,ensure_ascii=False,separators=(',',':')))
    (client/'src/vgc').mkdir(parents=True,exist_ok=True)
    save(client/'src/vgc/fastnoise-biomes.ts',runtime)
    entry=client/'src/main.ts'
    code=entry.read_text(encoding='utf8')
    code='import { mountVgcFastNoise } from "./vgc/fastnoise-biomes";\n'+code
    if engine=='browser':
        anchor='  const startZ = saved?.z ?? spawn.z;'
        extra='''  // FastNoiseLite: reproducible decorative biomes from original voxel art only.
  if (webgl) {
    const fNoiseGround=createColumnSampler(SEED);
    mountVgcFastNoise(webgl.scene,startX,startZ,
      (x,z)=>fNoiseGround(Math.floor(x),Math.floor(z)).terrainHeight+1);
  }
'''
    else:
        anchor='  await setupWorld(world);'
        extra='''  // Local atmosphere only: never modifies Voxelize authoritative block/terrain state.
  mountVgcFastNoise(world,0,0,(_x,_z)=>82);
'''
    code=replace_once(code,anchor,anchor+'\n'+extra,'FastNoiseLite scene bridge')
    save(entry,code)
    save(target/'VGC_FASTNOISE.json',json.dumps({'source':SOURCE,'pin':SOURCE_PIN,
        'version':VERSION,'seed':cfg['seed'],'frequency':cfg['frequency'],
        'mode':mode,'status':status,'maxInstances':cfg['maxInstances'],
        'runtime':'original FastNoiseLite JS noise + Ragnagrok surface InstancedMesh',
        'collision':'none; original voxel terrain and physics unchanged'},indent=2))
    return {'mode':mode,'status':status,'seed':cfg['seed'],
        'models':sorted(ids),'maxInstances':cfg['maxInstances'],'physics':'unchanged'}
