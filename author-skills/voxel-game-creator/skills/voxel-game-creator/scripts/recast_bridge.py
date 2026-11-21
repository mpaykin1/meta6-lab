#!/usr/bin/env python3
"""MIT Recast Navigation JS -> Yuka NPC waypoints in real Three.js clients.

Recast builds a *bounded* Detour navmesh from sampled Lumenwild terrain (or
Voxelize's existing approximate 82m decoration plane) and author-supplied
Ragnagrok/static box obstacles. Yuka then steers the same original NPC model
along the computed corridor. This is not native voxel physics or server AI.
"""
from __future__ import annotations
import json
import math
import os
import shutil
import subprocess
from pathlib import Path

from create_game import fail, save

VERSION = '0.44.0'
PIN = '8a2ece9f8b4947fcb328e17c7ac76c41744021b3'
PACKAGES = ('recast-navigation@' + VERSION, '@recast-navigation/three@' + VERSION)
MAX_OBSTACLES = 32


def obstacles(assets: dict, custom: Path | None) -> list[dict]:
    """Nav blockers are *visual footprints*, not physical engine colliders."""
    models = {m['id']:m for m in assets['models']}
    result=[]
    for item in assets['instances']:
        model=models.get(item['model'])
        if not model: continue
        sx,sy,sz=model['size']; scale=float(model['scale']); rot=int(item.get('rot',0))%4
        wx, wz = (sx*scale, sz*scale) if not rot%2 else (sz*scale, sx*scale)
        if sy*scale < .45: continue
        pos=item['pos']
        result.append({'x':float(pos[0]),'z':float(pos[2]),'w':max(.35,wx),
                       'd':max(.35,wz),'h':min(10.,sy*scale),'rise':float(pos[1]),
                       'source':'ragnagrok:'+str(item['id'])})
    if custom is not None:
        try: doc=json.loads(custom.read_text(encoding='utf-8'))
        except (OSError,ValueError) as err: fail('Recast obstacle manifest unreadable: '+str(err))
        if not isinstance(doc,dict) or not isinstance(doc.get('obstacles'),list):
            fail('Recast obstacle manifest must be {"obstacles":[...]}')
        for obj in doc['obstacles']:
            if not isinstance(obj,dict):fail('Recast obstacle must be an object')
            vals=[obj.get(k) for k in ('x','z','w','d','h')]
            if any(type(v) not in (float,int) or not math.isfinite(v) for v in vals):
                fail('Recast obstacle coordinates and dimensions must be finite numbers')
            x,z,w,d,h=map(float,vals)
            if abs(x)>48 or abs(z)>48 or not (.3<=w<=12 and .3<=d<=12 and .5<=h<=12):
                fail('Recast obstacle outside local 48m zone or size limits')
            rise=obj.get('rise',0.)
            if type(rise) not in (int,float) or not math.isfinite(rise) or abs(rise)>10:
                fail('Recast obstacle rise must be finite within 10m')
            result.append({'x':x,'z':z,'w':w,'d':d,'h':h,'rise':float(rise),'source':'manual'})
    if len(result)>MAX_OBSTACLES:fail('Recast navigation supports at most 32 static blockers')
    return result


def dependency(client:Path, mode:str)->tuple[bool,str]:
    if mode=='off':return False,'off'
    package, lock = client/'package.json',client/'package-lock.json'
    if not lock.is_file() and (client.parent.parent/'pnpm-workspace.yaml').is_file():
        from pnpm_dependency import resolve
        return resolve(client,{'recast-navigation':VERSION,'@recast-navigation/three':VERSION},mode,'Recast')
    if not package.is_file() or not lock.is_file():
        if mode=='required':fail('Recast requires package.json and package-lock.json')
        return False,'missing-package-or-lock'
    if not shutil.which('npm'):
        if mode=='required':fail('Recast requires npm')
        return False,'npm-unavailable'
    original={p:p.read_bytes() for p in (package,lock)}
    try:
        cmd=['npm','install','--package-lock-only','--save-exact','--ignore-scripts',
             '--no-audit','--no-fund','--fetch-retries=0','--fetch-timeout=6000',*PACKAGES]
        p=subprocess.run(cmd,cwd=client,check=False,text=True,capture_output=True,
                         timeout=48,env={**os.environ,'CI':'true'})
        if p.returncode:raise RuntimeError((p.stderr or p.stdout)[-400:])
        manifest=json.loads(package.read_text(encoding='utf-8'))
        lockfile=json.loads(lock.read_text(encoding='utf-8'))
        for name in ('recast-navigation','@recast-navigation/three'):
            if manifest.get('dependencies',{}).get(name)!=VERSION:
                raise RuntimeError('Recast package not pinned exactly '+name)
            if lockfile.get('packages',{}).get('node_modules/'+name,{}).get('version')!=VERSION:
                raise RuntimeError('Recast package-lock is not pinned '+name)
        return True,'npm-lock-resolved'
    except (OSError,subprocess.TimeoutExpired,ValueError,RuntimeError,KeyError) as err:
        for p,raw in original.items():p.write_bytes(raw)
        if mode=='required':fail('Recast dependency unavailable: '+str(err))
        return False,'unavailable; original npm manifests restored'


RUNTIME = r'''// Voxel Game Creator: Recast Navigation JS 0.44.0 + Yuka 0.7.8.
// Samples a BOUNDED terrain patch and existing author-made static visual blockers.
// This is local NPC navigation, NOT a physical collider, save format or server AI.
import * as THREE from 'THREE_MODULE';
export type LocalPoint=[number,number];
export type LocalNpc={id:string;path:LocalPoint[];loop:boolean};
export type NavBlocker={x:number;z:number;w:number;d:number;h:number;rise:number;source:string};
const BLOCKERS:NavBlocker[]=__BLOCKERS__;

/** Navmesh path (or explicit failure); Yuka retains all actor models and state. */
export async function recastRoutes(
 originX:number,originZ:number,ground:(x:number,z:number)=>number,
 npcs:LocalNpc[],
):Promise<Map<string,LocalPoint[]|null>|null> {
 if(!npcs.length)return new Map();
 const samples=npcs.flatMap(n=>n.path);
 if(!samples.length)return new Map();
 const xx=samples.map(v=>v[0]),zz=samples.map(v=>v[1]);
 const minX=Math.floor(Math.min(...xx)-6), maxX=Math.ceil(Math.max(...xx)+6);
 const minZ=Math.floor(Math.min(...zz)-6), maxZ=Math.ceil(Math.max(...zz)+6);
 // A local, intentionally bounded Recast job; no giant scene traversal per frame.
 if(maxX-minX>70||maxZ-minZ>70){console.warn('VGC Recast: patrol zone too large');return null;}
 const grid=1;
 const nx=Math.ceil((maxX-minX)/grid),nz=Math.ceil((maxZ-minZ)/grid);
 const px:number[]=[],indices:number[]=[];
 for(let z=0;z<=nz;z++)for(let x=0;x<=nx;x++){
   const wx=originX+minX+x*grid,wz=originZ+minZ+z*grid;
   px.push(wx,ground(wx,wz),wz);
 }
 for(let z=0;z<nz;z++)for(let x=0;x<nx;x++){
   const a=z*(nx+1)+x,b=a+1,c=a+(nx+1),d=c+1;
   // Both triangles face +Y, making the terrain walkable to Recast.
   indices.push(a,c,b,b,c,d);
 }
 const geo=new THREE.BufferGeometry();
 geo.setAttribute('position',new THREE.Float32BufferAttribute(px,3));geo.setIndex(indices);
 const mat=new THREE.MeshBasicMaterial();
 const terrain=new THREE.Mesh(geo,mat);
 const meshes:THREE.Mesh[]=[terrain];
 for(const o of BLOCKERS){
   if(o.x+o.w/2<minX||o.x-o.w/2>maxX||o.z+o.d/2<minZ||o.z-o.d/2>maxZ)continue;
   const box=new THREE.Mesh(new THREE.BoxGeometry(o.w,o.h,o.d),mat);
   box.position.set(originX+o.x,ground(originX+o.x,originZ+o.z)+o.rise+o.h/2,originZ+o.z);
   meshes.push(box);
 }
 try {
   const [{init,NavMeshQuery},{threeToSoloNavMesh}]=await Promise.all([
     import('recast-navigation'),import('@recast-navigation/three')]);
   await init();
   const generated=threeToSoloNavMesh(meshes,{cs:0.28,ch:0.15,walkableHeight:12,
     walkableClimb:3,walkableRadius:2,walkableSlopeAngle:43,minRegionArea:3,
     mergeRegionArea:8,maxVertsPerPoly:6});
   if(!generated.success||!generated.navMesh){
     console.warn('VGC Recast: navmesh unavailable', generated.success?'unknown':generated.error);
     return null;
   }
   const navmesh=generated.navMesh;
   const query=new NavMeshQuery(navmesh);
   try {
     const result=new Map<string,LocalPoint[]|null>();
     const localPoint=(p:{x:number;z:number}):LocalPoint=>[p.x-originX,p.z-originZ];
     const snap=(p:LocalPoint)=>{
       const wx=originX+p[0],wz=originZ+p[1];
       const q=query.findClosestPoint({x:wx,y:ground(wx,wz),z:wz},
         {halfExtents:{x:1.4,y:3,z:1.4}});
       if(!q.success||!q.polyRef||Math.hypot(q.point.x-wx,q.point.z-wz)>1.3)return null;
       return q.point;
     };
     for(const npc of npcs){
       const nodes:LocalPoint[]=[];
       const list=npc.path;
       let safe=true;
       for(let k=0;k<(npc.loop?list.length:list.length-1);k++){
         const p0=snap(list[k]),p1=snap(list[(k+1)%list.length]);
         if(!p0||!p1){safe=false;break;}
         const queryPath=query.computePath(p0,p1,{maxPathPolys:256,maxStraightPathPoints:256});
         if(!queryPath.success||!queryPath.path?.length){safe=false;break;}
         const segment=queryPath.path;
         if(Math.hypot(segment[segment.length-1].x-p1.x,
                       segment[segment.length-1].z-p1.z)>1.2){safe=false;break;}
         for(const waypoint of segment){
           const point=localPoint(waypoint);
           if(!nodes.length||Math.hypot(nodes[nodes.length-1][0]-point[0],
                                       nodes[nodes.length-1][1]-point[1])>.12)nodes.push(point);
         }
       }
       // Yuka follows this Detour corridor; never silently substitute a straight line
       // for a failed route around a blocked path.
       if(npc.loop&&nodes.length>2&&Math.hypot(nodes[0][0]-nodes[nodes.length-1][0],
          nodes[0][1]-nodes[nodes.length-1][1])<.3)nodes.pop();
       result.set(npc.id,safe&&nodes.length>=2&&nodes.length<=256?nodes:null);
     }
     return result;
   }finally{query.destroy();navmesh.destroy();}
 }catch(err){
   console.warn('VGC Recast: failed; original authored patrol path remains available',err);
   return null;
 }finally{
   for(const mesh of meshes){if(mesh!==terrain)mesh.geometry.dispose();}
   geo.dispose();mat.dispose();
 }
}
'''


def install(target:Path,engine:str,assets:dict,agents:list[dict], *,mode:str='auto',
            custom_obstacles:Path|None=None, npc_status:str='') -> dict:
    if engine not in ('browser','server'):fail('Recast bridge supports Lumenwild/Voxelize only')
    if mode not in ('auto','off','required'):fail('Recast mode must be auto|off|required')
    if mode=='off' or not agents:
        return {'mode':mode,'status':'off-or-no-agents'}
    if npc_status not in ('npm-lock-resolved','pnpm-lock-resolved'):
        if mode=='required':fail('Recast navigation requires active Yuka NPC dependency')
        return {'mode':mode,'status':'Yuka unavailable; no Recast bridge'}
    client=target if engine=='browser' else target/'examples/client'
    enabled,status=dependency(client,mode)
    if not enabled:return {'mode':mode,'status':status}
    blockers=obstacles(assets,custom_obstacles)
    module=client/'src/vgc/recast-nav.ts'
    source=RUNTIME.replace('THREE_MODULE','three' if engine=='browser' else 'three/webgpu')
    source=source.replace('__BLOCKERS__',json.dumps(blockers,ensure_ascii=False,separators=(',',':')))
    save(module,source)
    # The upstream Recast documentation recommends excluding its WASM module
    # from Vite's dev prebundler; preserve every existing plugin and alias.
    vite=client/('vite.config.ts' if engine=='browser' else 'vite.config.js')
    if vite.is_file():
        config=vite.read_text(encoding='utf-8')
        block="['recast-navigation', '@recast-navigation/core', '@recast-navigation/generators', '@recast-navigation/wasm']"
        if engine=='browser':
            anchor='  worker: {'
            if config.count(anchor)!=1:fail('Lumenwild Vite config changed; cannot safely exclude Recast prebundle')
            config=config.replace(anchor, '  optimizeDeps: { exclude: '+block+' },\n'+anchor,1)
        else:
            anchor='    force: true,'
            if config.count(anchor)!=1:fail('Voxelize Vite config changed; cannot safely exclude Recast prebundle')
            config=config.replace(anchor,anchor+'\n    exclude: '+block+',',1)
        save(vite,config)
    yuka=client/'src/vgc/npc-yuka.ts'
    if not yuka.is_file():fail('Cannot attach Recast without Yuka runtime')
    code=yuka.read_text(encoding='utf-8')
    before="import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';"
    if code.count(before)!=1:fail('Yuka GLTFLoader import anchor changed')
    code=code.replace(before,before+'\nimport { recastRoutes } from "./recast-nav";',1)
    anchor='  for(const data of AGENTS) {'
    if code.count(anchor)!=1:fail('Yuka NPC loop anchor changed')
    code=code.replace(anchor,'''  // Recast plans local NPC-only paths from actual terrain heights and static author props.
  const routes=await recastRoutes(originX,originZ,ground,AGENTS);
'''+anchor,1)
    marker='    for(const [x,z] of data.path) path.add(new YukaVector3(x,0,z));'
    if code.count(marker)!=1:fail('Yuka path integration anchor changed')
    code=code.replace(marker,'''    const planned=routes ? routes.get(data.id) : data.path;
    if(!planned||planned.length<2){
      console.warn('VGC Recast: no safe route for NPC',data.id);
      continue;
    }
    for(const [x,z] of planned) path.add(new YukaVector3(x,0,z));''',1)
    save(yuka,code)
    save(target/'VGC_RECAST.json',json.dumps({'repo':'https://github.com/isaac-mason/recast-navigation-js',
        'revision':PIN,'version':VERSION,'mode':mode,'status':status,'agent_count':len(agents),
        'obstacles':blockers,'terrain':'local procedural heightmap in Lumenwild, approximate 82m plane in Voxelize',
        'pipeline':'Recast+Detour local navmesh and waypoint route -> Yuka Vehicle/FollowPathBehavior',
        'limitations':'static local nav; no voxel/dynamic obstacle sync, no authoritative NPC physics'},
        indent=2,ensure_ascii=False))
    return {'mode':mode,'status':status,'version':VERSION,'agents':len(agents),
            'obstacles':len(blockers),'pathing':'Recast Detour -> Yuka steering',
            'network':'local client only; not server-authoritative'}
