#!/usr/bin/env python3
"""Vesper Street MIT edition: playable source + voxel/GLB art, or Blockwild weather.

No second WebGL renderer, no replacement character, no automatic gameplay actions.
The source is fetched at the exact pinned commit when the generator is run.
"""
from __future__ import annotations
import argparse
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile

from create_game import fail
from create_blockwild import colored_voxels
import create_blockwild
import ragnagrok_assets
import blockbench_bridge

REPO = 'https://github.com/winchxyz/vesper-street.git'
PIN = 'fcc2f6eda84311194c0834de6cd7081c2965086f'
LICENSE = 'MIT License\n\nCopyright (c) 2026 winchxyz'
EXCLUDE = shutil.ignore_patterns('.git', 'node_modules', '.next', 'dist', '*.log', 'media')


def _run(*args: str, cwd: Path | None = None) -> None:
    subprocess.run(list(args), check=True, cwd=cwd, timeout=240)


def acquire_source(dest: Path, source: Path | None) -> Path:
    """Require immutable checked-out source; never silently use changed HEAD."""
    if dest.exists(): fail('Vesper source destination already exists')
    if source:
        s = source.resolve()
        if not s.is_dir(): fail('Vesper local source folder absent')
        try:
            rev = subprocess.check_output(['git','-C',str(s),'rev-parse','HEAD'],text=True,timeout=10).strip()
        except (OSError, subprocess.SubprocessError):
            fail('--source-vesper must be a genuine Git checkout at pinned commit')
        if rev != PIN: fail('Vesper source commit mismatch: require '+PIN)
        shutil.copytree(s,dest,ignore=EXCLUDE)
    else:
        _run('git','clone','--no-checkout','--filter=blob:none','--depth','1',REPO,str(dest))
        _run('git','-C',str(dest),'fetch','--depth','1','origin',PIN)
        _run('git','-C',str(dest),'checkout','--detach',PIN)
        rev=subprocess.check_output(['git','-C',str(dest),'rev-parse','HEAD'],text=True,timeout=10).strip()
        if rev!=PIN:fail('Vesper checkout changed unexpectedly')
        shutil.rmtree(dest/'.git',ignore_errors=True)
        shutil.rmtree(dest/'media',ignore_errors=True)
    for rel in ('LICENSE','index.html','js/main.js','js/voxel.js','js/effects.js','js/util.js','js/post.js','js/ground.js'):
        if not (dest/rel).is_file():fail('Vesper expected source missing '+rel)
    lic=(dest/'LICENSE').read_text(encoding='utf8')
    if LICENSE not in lic:fail('Vesper MIT attribution does not match the reviewed source')
    if "import * as THREE from 'three'" not in (dest/'js/effects.js').read_text(encoding='utf8'):
        fail('Vesper atmospheric shader API changed')
    return dest


def _place_assets(assets: dict, glbs: list[dict]) -> str:
    specs={m['id']:colored_voxels(m) for m in assets['models']}
    positions=[{'model':it['model'],'pos':it['pos'],'rot':it.get('rot',0)} for it in assets['instances']]
    glb=[{k:item[k] for k in ('id','file','position','scale','yaw','idleClip','meshopt')} for item in glbs]
    data=json.dumps({'models':specs,'places':positions,'glbs':glb},separators=(',',':'),ensure_ascii=False)
    return r'''// Voxel Game Creator; authentic Ragnagrok model grids in Vesper Street's single Three.js scene.
// Decorative only: native Vesper collision, story, saves, player and action logic remain unchanged.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const CONTENT = __CONTENT__;
const cube = new THREE.BoxGeometry(1,1,1);
export function mountVgcDecor(scene) {
  const root = new THREE.Group(); root.name='VGC authored Ragnagrok voxel art'; scene.add(root);
  for (const item of CONTENT.places) {
    const model=CONTENT.models[item.model]; if(!model)continue;
    const obj = new THREE.Group(); obj.position.set(...item.pos);
    obj.rotation.y=(item.rot%4)*Math.PI/2;
    const [w,_h,d]=model.size;
    const glow=new Set(model.emissive.map(String));
    for (const [color,cells] of Object.entries(model.groups)) {
      const c = new THREE.Color(Number(color));
      const index=String(model.colors[color]);
      const material = new THREE.MeshStandardMaterial({color:c,roughness:.92,
        emissive:glow.has(index)?c:0x000000,emissiveIntensity:glow.has(index)?.85:0});
      const mesh=new THREE.InstancedMesh(cube,material,cells.length);
      const p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3(model.scale,model.scale,model.scale),m=new THREE.Matrix4();
      for (let i=0;i<cells.length;i++) {
        const [x,y,z]=cells[i];p.set((x-(w-1)/2)*model.scale,(y+.5)*model.scale,(z-(d-1)/2)*model.scale);
        mesh.setMatrixAt(i,m.compose(p,q,s));
      }
      mesh.instanceMatrix.needsUpdate=true; mesh.castShadow=true;mesh.receiveShadow=true;
      obj.add(mesh);
    }
    root.add(obj);
  }
  if(CONTENT.glbs.length) void (async()=>{
    const loader=new GLTFLoader();
    if(CONTENT.glbs.some(a=>a.meshopt)) {
      const {MeshoptDecoder}=await import('three/addons/libs/meshopt_decoder.module.js');
      loader.setMeshoptDecoder(MeshoptDecoder);
    }
    const mixers=[];
    for(const item of CONTENT.glbs) {
      try {
        const file=new URL('../vgc/blockbench/'+encodeURIComponent(item.file),import.meta.url).href;
        const gltf=await loader.loadAsync(file);
        const obj=gltf.scene; obj.name='VGC GLB '+item.id;
        obj.position.set(...item.position);obj.rotation.y=item.yaw;obj.scale.setScalar(item.scale);
        root.add(obj);
        if(item.idleClip) {
          const clip=gltf.animations.find(c=>c.name===item.idleClip);
          if(clip) {const m=new THREE.AnimationMixer(obj);m.clipAction(clip).play();mixers.push(m);}
        }
      }catch(error){console.error('VGC Vesper GLB asset failed',item.id,error);}
    }
    if(mixers.length) {
      let last=0;
      const tick=(t)=>{if(!root.parent)return;
        if(last && !document.hidden)for(const mixer of mixers)mixer.update(Math.min((t-last)/1000,.05));
        last=t;requestAnimationFrame(tick);};
      requestAnimationFrame(tick);
    }
  })().catch(console.error);
  return root;
}
'''.replace('__CONTENT__',data)


def build_vesper(spec: dict, out: Path, source: Path | None, project: Path | None,
                 models_dir: Path | None, manifest: Path | None) -> None:
    if not isinstance(spec,dict): fail('Vesper spec must be a JSON object')
    assets=ragnagrok_assets.acquire_assets(spec,project)
    glbs=blockbench_bridge.manifest_items(manifest,models_dir)
    out=out.resolve()
    if out.exists():fail('Vesper output exists; refusing overwrite '+str(out))
    out.parent.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='.vgc-vesper-',dir=out.parent) as tmp:
        src=acquire_source(Path(tmp)/'game',source)
        index=src/'index.html'
        page=index.read_text(encoding='utf8')
        original='"three": "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js"'
        if page.count(original)!=1:fail('Vesper Three.js import map changed')
        page=page.replace(original,original+', "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/"',1)
        index.write_text(page,encoding='utf8')
        entry=src/'js/main.js';txt=entry.read_text(encoding='utf8')
        anchor='const scene = new THREE.Scene();'
        if txt.count(anchor)!=1:fail('Vesper scene creation anchor changed')
        txt="import { mountVgcDecor } from './vgc-decor.js';\n"+txt
        txt=txt.replace(anchor,anchor+'\nmountVgcDecor(scene);',1)
        entry.write_text(txt,encoding='utf8')
        (src/'js/vgc-decor.js').write_text(_place_assets(assets,glbs),encoding='utf8')
        glbroot=src/'vgc/blockbench';glbroot.mkdir(parents=True,exist_ok=True)
        for it in glbs:shutil.copy2(it['source'],glbroot/it['file'])
        (src/'VGC_ASSETS.json').write_text(json.dumps({
            'upstream':REPO,'pinned_commit':PIN,'license':'MIT',
            'shared_voxel_models':len(assets['models']),'shared_instances':len(assets['instances']),
            'blockbench_glb':len(glbs),'rendering':'native Three.js InstancedMesh + GLTFLoader',
            'physics':'Vesper collision unchanged; art is visual only',
            'play':'python3 -m http.server 8801 (then open localhost:8801)',
        },indent=2,ensure_ascii=False)+'\n',encoding='utf8')
        os.replace(src,out)
    print('GENERATED',out)


WEATHER_TS=r'''// Vesper Street's original GPU-instanced rain and layered GLSL mist.
// No second WebGL context and no edit to Blockwild's player, physics or inventory.
import * as THREE from 'three';
import { makeRain, makeMist, lightU } from './effects.js';
export function mountVesperAtmosphere(
  scene: THREE.Scene, getPosition: () => THREE.Vector3,
): () => void {
  const rain=makeRain(1400,{radius:29,height:19,speed:10,bright:1.4});
  const mist=makeMist(new THREE.Color(0x101723));
  rain.name='Vesper Street rain';mist.name='Vesper Street mist';
  // Vesper uses camera layer 1; Blockwild uses native layer 0.
  rain.layers.set(0);
  mist.traverse(obj=>obj.layers.set(0));
  scene.add(rain,mist);
  const origin=performance.now();
  let disposed=false, frame=0, last=0, samples=0, sum=0, probe=0;
  const tmp=new THREE.Vector3();
  function next(now:number) {
    if(disposed)return;
    const dt=last ? Math.min((now-last)/1000,.05) : 0;
    last=now;
    if (!document.hidden) {
      const center=getPosition();
      if(center && Number.isFinite(center.x)) {
        tmp.copy(center);
        rain.userData.update((now-origin)/1000,tmp);
        mist.userData.update((now-origin)/1000,tmp);
        lightU.uFlashPos.value.copy(tmp).add(new THREE.Vector3(0,2,0));
        lightU.uFlashDir.value.set(0,-1,0);
        lightU.uFlashInt.value=.23;
      }
      const nativeFog=scene.fog;
      const near=nativeFog instanceof THREE.Fog?nativeFog.near:10;
      const far=nativeFog instanceof THREE.Fog?nativeFog.far:110;
      for (const obj of [rain,...mist.children]) {
        const mat=(obj as THREE.Mesh).material as THREE.ShaderMaterial;
        if(mat.uniforms?.fogNear)mat.uniforms.fogNear.value=near;
        if(mat.uniforms?.fogFar)mat.uniforms.fogFar.value=far;
      }
      // Same adaptive rendering philosophy as Vesper: scale particles down at low FPS.
      if(dt>0 && dt<.05) {sum+=dt;samples++;}
      if(now-probe>4000) {
        if(samples>10) {
          const fps=samples/sum;
          (rain.geometry as THREE.InstancedBufferGeometry).instanceCount=
            fps<32?450:fps<45?800:1400;
        }
        sum=0;samples=0;probe=now;
      }
    }
    frame=requestAnimationFrame(next);
  }
  frame=requestAnimationFrame(next);
  return ()=>{
    if(disposed)return;disposed=true;cancelAnimationFrame(frame);
    scene.remove(rain,mist);
    for(const o of [rain,...mist.children]) {
      const mesh=o as THREE.Mesh;
      mesh.geometry?.dispose();
      const mats=Array.isArray(mesh.material)?mesh.material:[mesh.material];
      for(const material of mats)material?.dispose();
    }
  };
}
'''

WEATHER_TYPES="""import type * as THREE from 'three';
export const lightU: {
  uFlashPos:{value:THREE.Vector3}; uFlashDir:{value:THREE.Vector3};
  uFlashInt:{value:number}; [key:string]:any;
};
export function makeRain(count:number,options?:Record<string,unknown>): THREE.Mesh;
export function makeMist(color:THREE.Color): THREE.Group;
"""


def install_blockwild_weather(game: Path, source: Path) -> None:
    entry=game/'app/game/VoxelGame.tsx'
    if not entry.is_file():fail('Blockwild generated entry missing')
    txt=entry.read_text(encoding='utf8')
    anchors=['"use client";','    engineRef.current = engine;','      engine.dispose();']
    for anchor in anchors:
        if txt.count(anchor)!=1:fail('Cannot patch Blockwild: changed upstream lifecycle: '+anchor)
    if 'mountVesperAtmosphere' in txt:fail('Vesper atmosphere already installed')
    txt=txt.replace('"use client";','"use client";\nimport { mountVesperAtmosphere } from "./vgc-vesper/weather";',1)
    txt=txt.replace('    engineRef.current = engine;',
      '    engineRef.current = engine;\n    const stopVesperWeather = (()=>{ try {\n      return mountVesperAtmosphere(engine.scene,()=>engine.position);\n    } catch(error) { console.warn(\"Vesper weather unavailable\",error); return ()=>{}; } })();',1)
    txt=txt.replace('      engine.dispose();','      stopVesperWeather();\n      engine.dispose();',1)
    entry.write_text(txt,encoding='utf8')
    dest=entry.parent/'vgc-vesper';dest.mkdir(parents=True,exist_ok=True)
    shutil.copy2(source/'js/effects.js',dest/'effects.js')
    shutil.copy2(source/'js/util.js',dest/'util.js')
    (dest/'effects.d.ts').write_text(WEATHER_TYPES,encoding='utf8')
    (dest/'weather.ts').write_text(WEATHER_TS,encoding='utf8')
    (dest/'LICENSE').write_bytes((source/'LICENSE').read_bytes())
    (game/'VGC_VESPER.json').write_text(json.dumps({
      'upstream':REPO,'pinned_commit':PIN,'license':'MIT','engine':'Blockwild',
      'vessel':'native Three.js scene','effects':['GPU-instanced rain','three-layer GLSL mist'],
      'runtime':'one requestAnimationFrame for uniforms and adaptive instanceCount',
      'source':'upstream js/effects.js and js/util.js copied unchanged',
      'no_change':['player','physics','quests','NPC decisions','input','renderer','save-format'],
    },indent=2)+'\n',encoding='utf8')


def build_blockwild_weather(spec:dict,out:Path,blockwild_source:Path|None,
                            vesper_source:Path|None,project:Path|None,
                            models_dir:Path|None,manifest:Path|None) -> None:
    out=out.resolve()
    if out.exists():fail('Output exists; refusing overwrite')
    out.parent.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='.vgc-vesper-weather-',dir=out.parent) as scratch:
        scratch=Path(scratch)
        src=acquire_source(scratch/'vesper',vesper_source)
        game=scratch/'game'
        create_blockwild.build(spec,game,blockwild_source,project,models_dir,manifest)
        install_blockwild_weather(game,src)
        os.replace(game,out)
    print('GENERATED',out)


def main() -> None:
    p=argparse.ArgumentParser(description='Generate original Vesper Street with shared voxel/GLB visuals')
    p.add_argument('--spec',required=True,type=Path)
    p.add_argument('--out',required=True,type=Path)
    p.add_argument('--source-vesper',type=Path)
    p.add_argument('--ragnagrok-project',type=Path)
    p.add_argument('--blockbench-assets-dir',type=Path)
    p.add_argument('--blockbench-manifest',type=Path)
    a=p.parse_args()
    try:spec=json.loads(a.spec.read_text(encoding='utf8'))
    except (OSError,ValueError) as e:fail('Invalid game spec: '+str(e))
    build_vesper(spec,a.out,a.source_vesper,a.ragnagrok_project,a.blockbench_assets_dir,a.blockbench_manifest)


def weather_main() -> None:
    p=argparse.ArgumentParser(description='Generate Blockwild + original Vesper GLSL rain and mist')
    p.add_argument('--spec',required=True,type=Path)
    p.add_argument('--out',required=True,type=Path)
    p.add_argument('--source-blockwild',type=Path)
    p.add_argument('--source-vesper',type=Path)
    p.add_argument('--ragnagrok-project',type=Path)
    p.add_argument('--blockbench-assets-dir',type=Path)
    p.add_argument('--blockbench-manifest',type=Path)
    a=p.parse_args()
    try:spec=json.loads(a.spec.read_text(encoding='utf8'))
    except (OSError,ValueError) as e:fail('Invalid game spec: '+str(e))
    build_blockwild_weather(spec,a.out,a.source_blockwild,a.source_vesper,a.ragnagrok_project,a.blockbench_assets_dir,a.blockbench_manifest)

if __name__=='__main__':main()
