#!/usr/bin/env python3
"""MIT Yuka autonomous *NPC* patrol bridge for real Lumenwild/Voxelize Three.js scenes.

Agents have their own authored Ragnagrok voxel or Blockbench GLB body.
They never replace or control the player; no faux physics or navmesh claims.
"""
from __future__ import annotations
import json
import math
import os
import re
import shutil
import subprocess
from pathlib import Path

import ragnagrok_assets
from create_game import fail, replace_once, save

VERSION = '0.7.8'
TYPES_VERSION = '0.7.4'
SOURCE_PIN = '10591304811222d6856020d5de129b39ef43b58d'
PACKAGE = f'yuka@{VERSION}'
TYPES_PACKAGE = f'@types/yuka@{TYPES_VERSION}'
NPC_LIMIT = 8
SAFE_ID = re.compile(r'^[a-zA-Z0-9][\w-]{0,63}$')


def ensure_watcher_model(assets: dict, spec: dict) -> None:
    """One original portable humanoid, encoded in genuine Ragnagrok RLE format."""
    if any(m['id'] == 'vgc_watcher' for m in assets['models']):
        return
    scheme = {
        **__import__('create_game').SCHEMES.get(spec.get('theme', 'ash'), __import__('create_game').SCHEMES['ash']),
        **spec.get('colors', {}),
    }
    stone = ragnagrok_assets.hexval(scheme['stone'])
    wood = ragnagrok_assets.hexval(scheme['wood'])
    leaf = ragnagrok_assets.hexval(scheme['leaves'])
    glow = ragnagrok_assets.hexval(scheme['sunset'])
    def paint(setc):
        # Head, chest, arms, legs, eyes: one consistent authored character, no procedural identity swaps.
        for x in (2, 5):
            for y in range(1, 6):
                for z in range(2, 5): setc(x, y, z, 1)
        for y in range(6, 12):
            for x in range(2, 6):
                for z in range(2, 5): setc(x, y, z, 2)
        for y in range(8, 12):
            for x in (0, 1, 6, 7):
                for z in (2, 3): setc(x, y, z, 1)
        for y in range(12, 18):
            for x in range(2, 6):
                for z in range(1, 6): setc(x, y, z, 3)
        for x in (3, 4): setc(x, 15, 5, 4)
        for x in range(2, 6): setc(x, 17, 3, 1)
    model = ragnagrok_assets.make_model('vgc_watcher', (8, 18, 7), .095,
                                       [stone, wood, leaf, glow], paint)
    model['emissive'] = [4]
    assets['models'].append(model)


def read_agents(manifest: Path | None, assets: dict, glbs: list[dict]) -> list[dict]:
    """Safe data-only manifest; no code, network URLs, or player identity changes."""
    if manifest is None:
        raw = [{'id': 'keeper-01', 'asset': 'ragnagrok:vgc_watcher',
                'path': [[5, 3], [9, 3], [10, 8], [5, 8]], 'speed': 0.9, 'loop': True}]
    else:
        try: obj = json.loads(manifest.read_text(encoding='utf-8'))
        except (OSError, ValueError) as exc: fail('NPC manifest unreadable: '+str(exc))
        if not isinstance(obj, dict) or not isinstance(obj.get('agents'), list):
            fail('NPC manifest must contain an agents array')
        raw = obj['agents']
    if len(raw) > NPC_LIMIT: fail('Maximum 8 patrol NPCs per game')
    model_map = {x['id']: x for x in assets['models']}
    glb_map = {x['id']: x for x in glbs}
    seen = set()
    result = []
    for item in raw:
        if not isinstance(item, dict): fail('NPC must be an object')
        aid = item.get('id')
        if not isinstance(aid, str) or not SAFE_ID.fullmatch(aid) or aid in seen:
            fail('NPC ID invalid or repeated: '+repr(aid))
        seen.add(aid)
        identifier = item.get('asset', 'ragnagrok:vgc_watcher')
        if not isinstance(identifier, str) or ':' not in identifier:
            fail('NPC asset must be ragnagrok:<model> or glb:<asset>')
        family, model_id = identifier.split(':', 1)
        if family not in ('ragnagrok', 'glb') or not SAFE_ID.fullmatch(model_id):
            fail('NPC asset family/id invalid')
        if family == 'ragnagrok' and model_id not in model_map:
            fail('NPC references unknown Ragnagrok model '+model_id)
        if family == 'glb' and model_id not in glb_map:
            fail('NPC references GLB not present in Blockbench asset list '+model_id)
        points = item.get('path')
        if (not isinstance(points, list) or not 2 <= len(points) <= 12 or
            any(not isinstance(p, list) or len(p) != 2 or any(
                type(v) not in (int, float) or not math.isfinite(v) or abs(v) > 48
                for v in p) for p in points)):
            fail('NPC path must have 2..12 finite local [x,z] waypoints within 48m')
        if any((points[i][0] - points[i+1][0]) ** 2 +
               (points[i][1] - points[i+1][1]) ** 2 < 0.04
               for i in range(len(points)-1)):
            fail('NPC path adjacent waypoints too close')
        speed = item.get('speed', 0.85)
        if type(speed) not in (float, int) or not math.isfinite(speed) or not .1 <= speed <= 2.8:
            fail('NPC speed must be between .1 and 2.8')
        if type(item.get('loop', True)) is not bool: fail('NPC loop must be boolean')
        walk = item.get('walkClip')
        if family == 'glb':
            clips = glb_map[model_id]['clips']
            if walk is not None and (not isinstance(walk, str) or walk not in clips):
                fail('NPC walkClip missing from original GLB animations: '+str(walk))
        elif walk is not None:
            fail('NPC voxel body has no glTF walkClip; use a Blockbench GLB')
        result.append(dict(id=aid, family=family, model=model_id,
                           path=[[float(v) for v in p] for p in points],
                           speed=float(speed), loop=item.get('loop', True),
                           walkClip=walk,
                           file=glb_map[model_id]['file'] if family=='glb' else None,
                           scale=float(glb_map[model_id]['scale']) if family=='glb' else 1.0,
                           yaw=float(glb_map[model_id]['yaw']) if family=='glb' else 0.0,
                           meshopt=bool(glb_map[model_id]['meshopt']) if family=='glb' else False))
    return result


def render_model(model: dict) -> dict:
    """Surface-only instanced geometry, derived from actual Ragnagrok voxels."""
    cells = ragnagrok_assets.decode(model)
    sx, sy, sz = model['size']
    palette = model['palette']
    def at(x: int, y: int, z: int) -> int:
        return cells[x+z*sx+y*sx*sz] if 0 <= x < sx and 0 <= y < sy and 0 <= z < sz else 0
    surface = {}
    for y in range(sy):
        for z in range(sz):
            for x in range(sx):
                col = at(x,y,z)
                if not col: continue
                if all(at(x+dx,y+dy,z+dz) for dx,dy,dz in
                       [(1,0,0),(-1,0,0),(0,1,0),(0,-1,0),(0,0,1),(0,0,-1)]):
                    continue
                label=f'{palette[col]:06x}'
                bucket=surface.setdefault(label,dict(cells=[],emissive=col in model.get('emissive',[])))
                bucket['cells'].append([x,y,z])
    return dict(size=model['size'],scale=model['scale'],groups=surface)


def dependency(client: Path, mode: str) -> tuple[bool, str]:
    if mode == 'off': return False, 'disabled'
    package = client/'package.json'
    lock = client/'package-lock.json'
    if not lock.is_file() and (client.parent.parent/'pnpm-workspace.yaml').is_file():
        from pnpm_dependency import resolve
        return resolve(client,{'yuka':VERSION,'@types/yuka':TYPES_VERSION},mode,'Yuka')
    if not package.is_file() or not lock.is_file():
        if mode == 'required': fail('Yuka requires npm package.json and package-lock.json')
        return False, 'missing-package-or-lock'
    if not shutil.which('npm'):
        if mode == 'required': fail('Yuka requires npm executable')
        return False, 'npm-unavailable'
    original={p:p.read_bytes() for p in (package,lock)}
    try:
        # Official source MIT; @types/yuka adds TS type-safe vehicle API.
        proc=subprocess.run(['npm','install','--package-lock-only','--save-exact',
               '--ignore-scripts','--no-audit','--no-fund','--fetch-retries=0',
               '--fetch-timeout=6000',PACKAGE,TYPES_PACKAGE],
               cwd=client,env={**os.environ,'CI':'true'},check=False,
               capture_output=True,text=True,timeout=45)
        if proc.returncode: raise RuntimeError((proc.stderr or proc.stdout)[-450:])
        p=json.loads(package.read_text(encoding='utf8'))
        l=json.loads(lock.read_text(encoding='utf8'))
        assert p.get('dependencies',{}).get('yuka')==VERSION
        assert p.get('dependencies',{}).get('@types/yuka')==TYPES_VERSION
        assert l['packages']['node_modules/yuka']['version']==VERSION
        assert l['packages']['node_modules/@types/yuka']['version']==TYPES_VERSION
        return True, 'npm-lock-resolved'
    except (OSError,subprocess.TimeoutExpired,ValueError,RuntimeError,KeyError,AssertionError) as exc:
        for f,data in original.items(): f.write_bytes(data)
        if mode=='required': fail('Yuka dependency resolution failed: '+str(exc))
        return False, 'unavailable (restored native npm manifest)'


RUNTIME = r'''// Yuka 0.7.8 MIT game AI, original Voxel Game Creator authored NPC bridge.
// Autonomous NPCs ONLY. Never modifies the player, physics, combat or input.
import * as THREE from 'THREE_MODULE';
import { EntityManager, Vehicle, Path, FollowPathBehavior, Vector3 as YukaVector3 } from 'yuka';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

type Cell = [number, number, number];
type Voxel = {size:[number,number,number]; scale:number;
  groups:Record<string,{cells:Cell[];emissive:boolean}>};
type Agent = {id:string;family:'ragnagrok'|'glb';model:string;
  path:[number,number][];speed:number;loop:boolean;walkClip:string|null;
  file:string|null;scale:number;yaw:number;meshopt:boolean};
const MODELS:Record<string,Voxel> = __MODELS__;
const AGENTS:Agent[] = __AGENTS__;
const cube=new THREE.BoxGeometry(1,1,1);

/** One original Ragnagrok model body per NPC. No model replacement between states. */
function voxelBody(id:string):THREE.Group {
  const voxel=MODELS[id];
  const body=new THREE.Group();
  if(!voxel)return body;
  const [sx,_sy,sz]=voxel.size;
  const matrix=new THREE.Matrix4();
  const xyz=new THREE.Vector3();
  const q=new THREE.Quaternion();
  const scale=new THREE.Vector3(voxel.scale,voxel.scale,voxel.scale);
  for(const [hex,group] of Object.entries(voxel.groups)) {
    const color=new THREE.Color('#'+hex);
    const material=new THREE.MeshStandardMaterial({color,roughness:.85,
      emissive:group.emissive?color:new THREE.Color(0),
      emissiveIntensity:group.emissive?.8:0});
    const mesh=new THREE.InstancedMesh(cube,material,group.cells.length);
    for(let i=0;i<group.cells.length;i++){
      const [x,y,z]=group.cells[i];
      xyz.set((x-(sx-1)/2)*voxel.scale,(y+.5)*voxel.scale,(z-(sz-1)/2)*voxel.scale);
      mesh.setMatrixAt(i,matrix.compose(xyz,q,scale));
    }
    mesh.instanceMatrix.needsUpdate=true;
    mesh.castShadow=true;mesh.receiveShadow=true;
    body.add(mesh);
  }
  return body;
}

/** Yuka steering is independent from the host world's physics. No AI/player collision. */
export async function mountYukaPatrols(
  scene:THREE.Object3D, originX:number, originZ:number,
  ground:(x:number,z:number)=>number,
):Promise<THREE.Group> {
  const group=new THREE.Group(); group.name='VGC / Yuka autonomous NPCs';
  scene.add(group);
  const manager=new EntityManager();
  const state:{agent:Vehicle;root:THREE.Group;walk:THREE.AnimationMixer|null}[]=[];
  const gltfLoader=new GLTFLoader();
  if(AGENTS.some(a=>a.meshopt)) {
    const {MeshoptDecoder}=await import('three/examples/jsm/libs/meshopt_decoder.module.js');
    gltfLoader.setMeshoptDecoder(MeshoptDecoder);
  }
  for(const data of AGENTS) {
    const path=new Path();
    path.loop=data.loop;
    for(const [x,z] of data.path) path.add(new YukaVector3(x,0,z));
    const agent=new Vehicle();agent.name=data.id;
    agent.position.copy(path.current());
    agent.maxSpeed=data.speed;agent.maxForce=Math.max(2,data.speed*5);
    agent.updateOrientation=false;
    agent.steering.add(new FollowPathBehavior(path,.5));
    manager.add(agent);
    const root=new THREE.Group();root.name='vgc-npc:'+data.id;
    root.position.set(originX+agent.position.x,
        ground(originX+agent.position.x,originZ+agent.position.z),
        originZ+agent.position.z);
    let walk:THREE.AnimationMixer|null=null;
    if(data.family==='ragnagrok') {
      root.add(voxelBody(data.model));
    } else if(data.file) {
      try {
        const base=import.meta.env.BASE_URL||'/';
        const gltf=await gltfLoader.loadAsync(base+'vgc/blockbench/'+encodeURIComponent(data.file));
        const body=gltf.scene;
        body.scale.setScalar(data.scale);
        body.rotation.y=data.yaw;
        root.add(body); // One immutable model for walk/stand and every view.
        if(data.walkClip) {
          const clip=gltf.animations.find(a=>a.name===data.walkClip);
          if(clip){walk=new THREE.AnimationMixer(body);walk.clipAction(clip).play();}
        }
      } catch(err) {
        console.warn('Yuka NPC GLB failed; no replacement character',data.id,err);
        manager.remove(agent);
        continue;
      }
    }
    group.add(root);
    state.push({agent,root,walk});
  }
  if(!state.length)return group;
  // Bounded, fixed-step AI. Pause when page is hidden. All motion belongs to NPCs.
  let active=true,previous=0,accum=0;
  const tick=(now:number)=>{
    if(!active)return;
    const delta=previous?Math.min((now-previous)/1000,.08):0;
    previous=now;
    if(!document.hidden) {
      accum=Math.min(.2,accum+delta);
      while(accum>=1/30){manager.update(1/30);accum-=1/30;}
      for(const {agent,root,walk} of state) {
        const x=originX+agent.position.x,z=originZ+agent.position.z;
        root.position.set(x,ground(x,z),z);
        if(agent.velocity.squaredLength()>.005){
          root.rotation.y=Math.atan2(agent.velocity.x,agent.velocity.z);
          walk?.update(delta);
        }
      }
    }
    requestAnimationFrame(tick);
  };
  window.addEventListener('pagehide',()=>{active=false;},{once:true});
  requestAnimationFrame(tick);
  return group;
}
'''


def install(target:Path,engine:str,assets:dict,agents:list[dict], *, mode:str='auto')->dict:
    if engine not in ('browser','server'): fail('Yuka only supports Three.js browser/server clients')
    if mode not in ('auto','off','required'): fail('Yuka mode must be auto|off|required')
    if mode=='off' or not agents: return {'mode':mode,'status':'off-or-no-agents'}
    client=target if engine=='browser' else target/'examples/client'
    enabled,status=dependency(client,mode)
    if not enabled:return {'mode':mode,'status':status}
    src=client/'src'
    module=src/'vgc/npc-yuka.ts';module.parent.mkdir(parents=True,exist_ok=True)
    names={a['model'] for a in agents if a['family']=='ragnagrok'}
    art={m['id']:render_model(m) for m in assets['models'] if m['id'] in names}
    payload=[a for a in agents]
    generated=RUNTIME.replace('THREE_MODULE','three' if engine=='browser' else 'three/webgpu')
    generated=generated.replace('__MODELS__',json.dumps(art,ensure_ascii=False,separators=(',',':')))
    generated=generated.replace('__AGENTS__',json.dumps(payload,ensure_ascii=False,separators=(',',':')))
    save(module,generated)
    entry=src/'main.ts'
    code=entry.read_text(encoding='utf-8')
    code='import { mountYukaPatrols } from "./vgc/npc-yuka";\n'+code
    if engine=='browser':
        anchor='  const startZ = saved?.z ?? spawn.z;'
        extra='''  // Yuka NPCs use the very same authored Ragnagrok geometry and terrain sampler.
  const npcTerrain = createColumnSampler(SEED);
  if(webgl) void mountYukaPatrols(webgl.scene,startX,startZ,
    (x,z)=>npcTerrain(Math.floor(x),Math.floor(z)).terrainHeight+1);
'''
    else:
        anchor='  await setupWorld(world);'
        extra='''  // AI patrols are local decorations, not authoritative multiplayer combatants.
  void mountYukaPatrols(world,0,0,(_x,_z)=>82);
'''
    code=replace_once(code,anchor,anchor+'\n'+extra,'Yuka NPC scene injection')
    save(entry,code)
    save(target/'VGC_NPCS.json',json.dumps({'source':'MIT Yuka', 'source_revision':SOURCE_PIN,
       'version':VERSION,'agents':payload,'physics':'none (autonomous visual NPCs only)',
       'navmesh':'none (authored local patrol waypoints)',
       'player_controls':'unchanged'},indent=2,ensure_ascii=False))
    return {'mode':mode,'status':status,'version':VERSION,'agents':len(agents),
            'steering':'FollowPathBehavior fixed step 30Hz',
            'visuals':'original Ragnagrok authored voxel or user GLB',
            'multiplayer':'local NPC visuals only; no server sync'}
