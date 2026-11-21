#!/usr/bin/env python3
"""Minecraft-W v9 MIT Three.js full engine + VGC Ragnagrok/GLB bridge.

The native survival simulation, Three.js renderer, save system, weather clock,
player identity, controls and collision model are not replaced. Optional original
Vesper Street GLSL rain/mist consume Minecraft-W's native weather state.
"""
from __future__ import annotations
import argparse
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

from create_game import fail, SCHEMES
from create_blockwild import colored_voxels
import blockbench_bridge
import ragnagrok_assets
import gltf_transform_bridge

REPO = 'https://github.com/Xollonox/Minecraft.git'
PIN = '1ca40b195bf40b4c19336cdfeb22df6ad33a9c9e'
EXCLUDES = shutil.ignore_patterns('.git','node_modules','dist','build','.cache','coverage','*.log')


def run(*args: str, cwd: Path | None = None) -> None:
    subprocess.run(list(args),check=True,cwd=str(cwd) if cwd else None,timeout=240)


def source_checkout(dest:Path, local_source:Path|None) -> Path:
    if dest.exists(): fail('Minecraft-W source destination already exists')
    if local_source is not None:
        source=local_source.resolve()
        if not source.is_dir(): fail('Minecraft-W local source directory missing')
        try:
            revision=subprocess.check_output(['git','-C',str(source),'rev-parse','HEAD'],text=True,timeout=10).strip()
        except (OSError,subprocess.SubprocessError):
            fail('--source-minecraft must be a Git checkout at pinned commit')
        if revision!=PIN: fail('Minecraft-W checkout must match reviewed SHA '+PIN)
        shutil.copytree(source,dest,ignore=EXCLUDES)
    else:
        run('git','clone','--filter=blob:none','--no-checkout',REPO,str(dest))
        run('git','-C',str(dest),'fetch','--depth','1','origin',PIN)
        run('git','-C',str(dest),'checkout','--detach',PIN)
        revision=subprocess.check_output(['git','-C',str(dest),'rev-parse','HEAD'],text=True,timeout=10).strip()
        if revision!=PIN: fail('Minecraft-W immutable checkout failed')
        shutil.rmtree(dest/'.git',ignore_errors=True)
    for name in ('LICENSE','README.md','package-lock.json','package.json','src/Game.js','src/main.js','src/world/World.js','vite.config.js'):
        if not (dest/name).is_file(): fail('Minecraft-W expected original file missing: '+name)
    lic=(dest/'LICENSE').read_text(encoding='utf8')
    if not lic.startswith('MIT License\n\nCopyright (c) 2026 Voxel Sandbox Contributors'):
        fail('Minecraft-W expected MIT attribution not present')
    pack=json.loads((dest/'package.json').read_text(encoding='utf8'))
    if pack.get('name')!='voxel-sandbox' or pack.get('dependencies',{}).get('three')!='^0.185.1' or pack.get('version')!='9.0.0':
        fail('Minecraft-W pinned engine or Three.js manifest does not match reviewed version')
    return dest


def replace_exact(data:str, old:str, new:str, label:str) -> str:
    count=data.count(old)
    if count!=1: fail(f'Minecraft-W upstream anchor changed: {label} (count {count})')
    return data.replace(old,new,1)


def art_runtime(assets:dict, glbs:list[dict]) -> str:
    # Existing MIT Ragnagrok RLE parser performs bounds and palette validation.
    models={model['id']:colored_voxels(model) for model in assets['models']}
    instances=[{'model':i['model'],'pos':i['pos'],'rot':i.get('rot',0)} for i in assets['instances']]
    models_glb=[{k:m[k] for k in ('id','file','position','scale','yaw','idleClip','meshopt')} for m in glbs]
    payload=json.dumps({'models':models,'instances':instances,'glb':models_glb},ensure_ascii=False,separators=(',',':'))
    return r'''// Generated Voxel Game Creator bridge: AUTHORED model visuals only.
// Original Minecraft-W native Three.js renderer, world physics and player are untouched.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const CONTENT = __CONTENT__;

/** Surface-culled Ragnagrok RLE voxel art and original Blockbench GLB. */
export function mountMinecraftWAssets(scene, world, playerPosition) {
  const origin = playerPosition.clone();
  const root = new THREE.Group(); root.name = 'VGC / authored voxel and GLB art';
  scene.add(root);
  let disposed=false;
  const mixers=[];
  const cube = new THREE.BoxGeometry(1,1,1);
  const temp = new THREE.Matrix4();
  const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
  const allMaterials=new Map();
  const surfaceY = (x,z) => {
    const y=world.getSurfaceY(Math.floor(x),Math.floor(z));
    return Number.isFinite(y)&&y>=0 ? y+1 : origin.y;
  };
  const material=(hex,glow)=>{
    const key=hex+':'+Number(glow);
    if(!allMaterials.has(key)) {
      const c=new THREE.Color(Number(hex));
      allMaterials.set(key,new THREE.MeshStandardMaterial({color:c,roughness:0.88,
        emissive:glow?c:new THREE.Color(0),emissiveIntensity:glow?0.9:0}));
    }
    return allMaterials.get(key);
  };
  for(const instance of CONTENT.instances) {
    const model=CONTENT.models[instance.model]; if(!model)continue;
    const [width,_height,depth]=model.size;
    const obj=new THREE.Group();
    const x=origin.x+instance.pos[0],z=origin.z+instance.pos[2];
    obj.position.set(x,surfaceY(x,z)+instance.pos[1],z);
    obj.rotation.y=Number(instance.rot)*Math.PI/2;
    const emit=new Set(model.emissive.map(String));
    for(const [hex,coords] of Object.entries(model.groups)) {
      if(!coords.length)continue;
      const mesh=new THREE.InstancedMesh(cube,material(hex,emit.has(String(model.colors[hex]))),coords.length);
      s.setScalar(model.scale);
      for(let i=0;i<coords.length;i++) {
        const [vx,vy,vz]=coords[i];
        p.set((vx-(width-1)/2)*model.scale,(vy+0.5)*model.scale,(vz-(depth-1)/2)*model.scale);
        temp.compose(p,q,s);mesh.setMatrixAt(i,temp);
      }
      mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=true;mesh.receiveShadow=true;
      mesh.frustumCulled=false;
      obj.add(mesh);
    }
    root.add(obj);
  }
  if(CONTENT.glb.length) void (async()=>{
    const loader=new GLTFLoader();
    if(CONTENT.glb.some(g=>g.meshopt)) {
      const {MeshoptDecoder}=await import('three/addons/libs/meshopt_decoder.module.js');
      if(disposed)return;
      loader.setMeshoptDecoder(MeshoptDecoder);
    }
    const base=import.meta.env.BASE_URL||'./';
    for(const item of CONTENT.glb) {
      if(disposed)break;
      try {
        const gltf=await loader.loadAsync(base+'vgc/blockbench/'+encodeURIComponent(item.file));
        if(disposed) {
          gltf.scene.traverse(o=>{o.geometry?.dispose();});
          break;
        }
        const mesh=gltf.scene;mesh.name='VGC model '+item.id;
        const x=origin.x+item.position[0],z=origin.z+item.position[2];
        mesh.position.set(x,surfaceY(x,z)+item.position[1],z);
        mesh.rotation.y=item.yaw;mesh.scale.setScalar(item.scale);
        mesh.traverse(c=>{if(c.isMesh){c.castShadow=true;c.receiveShadow=true;}});
        root.add(mesh);
        if(item.idleClip) {
          const clip=gltf.animations.find(c=>c.name===item.idleClip);
          if(clip){const mix=new THREE.AnimationMixer(mesh);mix.clipAction(clip).play();mixers.push(mix);}
        }
      }catch(error){console.error('[VGC] cannot load GLB',item.id,error);}
    }
  })().catch(error=>console.error('[VGC] GLB loader failed',error));
  return {
    update(dt){if(!disposed&&dt>0){for(const mx of mixers)mx.update(Math.min(0.05,dt));}},
    dispose(){if(disposed)return;disposed=true;scene.remove(root);
      const geoms=new Set([cube]);const mats=new Set([...allMaterials.values()]);
      root.traverse(o=>{if(o.geometry)geoms.add(o.geometry);
        if(o.material){for(const mat of (Array.isArray(o.material)?o.material:[o.material]))mats.add(mat);}});
      for(const mx of mixers)mx.stopAllAction();
      for(const geo of geoms)geo.dispose();for(const mat of mats)mat.dispose();
      root.clear();mixers.length=0;
    },
  };
}
'''.replace('__CONTENT__',payload)


def weather_runtime() -> str:
    return r'''// Original Vesper Street GPL-free MIT shader effects in Minecraft-W native Three.js scene.
// Weather is governed by Minecraft-W biome/temperature/roof model; Vesper only draws.
import * as THREE from 'three';
import { makeRain, makeMist, lightU } from './vesper/effects.js';
export function mountMinecraftWWeather(scene) {
  const rain=makeRain(900,{radius:20,height:18,speed:10,bright:1.2});
  const mist=makeMist(new THREE.Color(0x10131c));
  rain.name='VGC Vesper / rain';mist.name='VGC Vesper / mist';
  rain.layers.set(0);mist.traverse(obj=>obj.layers.set(0));
  scene.add(rain,mist);
  let t=0, disposed=false, sample=0, elapsed=0;
  const center=new THREE.Vector3();
  const meshes=[rain,...mist.children];
  const applyFog=(near,far)=>{for(const o of meshes){
    const uniforms=o.material?.uniforms;
    if(uniforms?.fogNear)uniforms.fogNear.value=near;
    if(uniforms?.fogFar)uniforms.fogFar.value=far;
  }};
  const update=(dt,game)=>{
    if(disposed||!game.player||!game.world)return;
    t+=dt;
    center.copy(game.player.position);
    const weather=game.weatherSystem;
    // Do not rain in clear weather, snow biomes or under roofs.
    const isRain=(weather?.visibleState==='rain'||weather?.visibleState==='thunder');
    const intensity=Math.max(0,Math.min(1,(weather?.intensity||0)*(game.weather?.exposure??1)));
    rain.visible=isRain&&intensity>0.02;
    if(rain.visible) {
      rain.userData.update(t,center);
      rain.material.uniforms.uBright.value=1.3*intensity;
      // Hide only native rain's mesh in favour of original Vesper GPU streaks.
      if(game.weather?._rain)game.weather._rain.visible=false;
    }
    mist.visible=true;
    mist.userData.update(t,center);
    mist.position.y=center.y-1.15;
    lightU.uFlashPos.value.copy(center).add(new THREE.Vector3(0,1.6,0));
    game.camera.getWorldDirection(lightU.uFlashDir.value);
    lightU.uFlashInt.value=.25;
    const fog=scene.fog;
    applyFog(fog instanceof THREE.Fog?fog.near:4,fog instanceof THREE.Fog?fog.far:96);
    // Adaptive GPU count without rebuilding any particle buffers.
    sample+=dt;elapsed++;
    if(sample>=4){
      const fps=elapsed/sample;
      rain.geometry.instanceCount=fps<30?250:fps<45?500:900;
      sample=0;elapsed=0;
    }
  };
  return {update,dispose(){if(disposed)return;disposed=true;scene.remove(rain,mist);
    for(const mesh of meshes){mesh.geometry?.dispose();mesh.material?.dispose();}
    mist.clear();}};
}
'''


def install_vesper_weather(game:Path, dest:Path, source:Path|None) -> None:
    import create_vesper
    vesper=create_vesper.acquire_source(dest,source)
    assets=game/'src/vgc/vesper';assets.mkdir(parents=True,exist_ok=True)
    effect=(vesper/'js/effects.js').read_text(encoding='utf8')
    # Original effect localises rain at ground Y=0. Minecraft-W spawn is Y~70.
    old='vec3 center = vec3(uCenter.x + aOffset.x, fall, uCenter.z + aOffset.z);'
    effect=replace_exact(effect,old,
      'vec3 center = vec3(uCenter.x + aOffset.x, uCenter.y + fall, uCenter.z + aOffset.z);',
      'Vesper rain vertical-origin shader')
    (assets/'effects.js').write_text(effect,encoding='utf8')
    shutil.copy2(vesper/'js/util.js',assets/'util.js')
    shutil.copy2(vesper/'LICENSE',assets/'LICENSE')
    (game/'src/vgc/vesper-weather.js').write_text(weather_runtime(),encoding='utf8')


def build(spec:dict,out:Path,source:Path|None,project:Path|None,
          assets_dir:Path|None,asset_manifest:Path|None,
          vesper_atmosphere:bool=False,vesper_source:Path|None=None,
          asset_optimizer:str='auto',geometry_compression:str='meshopt') ->None:
    if not isinstance(spec,dict):fail('Minecraft-W game spec must be an object')
    if spec.get('theme','ash') not in SCHEMES:fail('Invalid VGC visual theme')
    out=out.resolve()
    if out.exists():fail('Minecraft-W output already exists: '+str(out))
    out.parent.mkdir(parents=True,exist_ok=True)
    assets=ragnagrok_assets.acquire_assets(spec,project)
    glbs=blockbench_bridge.manifest_items(asset_manifest,assets_dir)
    with tempfile.TemporaryDirectory(prefix='.vgc-minecraft-w-',dir=out.parent) as temp:
        tmp=Path(temp);game=source_checkout(tmp/'game',source)
        glbs,opt_results=gltf_transform_bridge.optimize(glbs,tmp/'opt',
          policy=asset_optimizer,textures='lossless-webp',
          executable=None,geometry=geometry_compression,meshopt_level='high')
        entry=game/'src/Game.js';before=entry.read_text(encoding='utf8')
        txt="import { mountMinecraftWAssets } from './vgc/minecraft-art.js';\n"+before
        if vesper_atmosphere:
            install_vesper_weather(game,tmp/'vesper',vesper_source)
            txt="import { mountMinecraftWWeather } from './vgc/vesper-weather.js';\n"+txt
        txt=replace_exact(txt,'    this.player.attachBody(this.scene);',
          '    this.player.attachBody(this.scene);\n    this._vgcArt = mountMinecraftWAssets(this.scene, this.world, this.player.position);'+
          ('\n    this._vgcWeather = mountMinecraftWWeather(this.scene);' if vesper_atmosphere else ''),
          'player body attach before world stream')
        txt=replace_exact(txt,'    this.ui.update(dt, this._collectDebugState());',
          '    this._vgcArt?.update(dt);'+
          ('\n    this._vgcWeather?.update(dt,this);' if vesper_atmosphere else '')+
          '\n    this.ui.update(dt, this._collectDebugState());',
          'native update loop')
        txt=replace_exact(txt,'  _teardownWorld() {',
          '  _teardownWorld() {\n    this._vgcArt?.dispose(); this._vgcArt = null;'+
          ('\n    this._vgcWeather?.dispose(); this._vgcWeather = null;' if vesper_atmosphere else ''),
          'per-world disposal')
        entry.write_text(txt,encoding='utf8')
        vgc=game/'src/vgc';vgc.mkdir(exist_ok=True)
        (vgc/'minecraft-art.js').write_text(art_runtime(assets,glbs),encoding='utf8')
        public=game/'public/vgc/blockbench';public.mkdir(parents=True,exist_ok=True)
        for item in glbs:shutil.copy2(item['source'],public/item['file'])
        (game/'VGC_MINECRAFT_W.json').write_text(json.dumps({
          'mode':'minecraft-w','upstream':REPO,'commit':PIN,'license':'MIT',
          'theme':spec.get('theme','ash'),'title':spec.get('title','Voxel World'),
          'ragnagrok_models':len(assets['models']),'ragnagrok_instances':len(assets['instances']),
          'blockbench_glb':len(glbs),'asset_optimizer':{'policy':asset_optimizer,
            'geometry_compression':geometry_compression,'results':opt_results},
          'vesper_weather':vesper_atmosphere,
          'terrain':'unchanged Minecraft-W 45-biome original generator',
          'gameplay':'native Minecraft-W; independent of other engines',
          'physics':'authored Ragnagrok and GLB assets are visuals, not colliders',
          'controls':'upstream WASD/arrow keys, touch and gamepad',
          'save':'Minecraft-W IndexedDB save; authored decorative props are not persistent edit blocks',
          'run':'npm ci && npm run dev','publish':'npm ci && npm run build; publish dist/',
        },ensure_ascii=False,indent=2)+'\n',encoding='utf8')
        (game/'VGC_README.md').write_text(
          '# Minecraft-W v9 + Voxel Game Creator\n\n'
          'MIT upstream pinned at '+PIN+' ('+REPO+').\n'
          'Node.js >=22.17; run `npm ci && npm run dev`; publish built `dist/`.\n'
          'Ragnagrok and Blockbench GLBs are rendered in the same Three.js scene.\n'
          'Imported models are visual-only and not collidable. No game systems are synchronised.\n'
          'All original save/progression/controls/physics are retained.\n'
          +('Optional Vesper shader weather follows Minecraft-W live weather and uses the same camera.\n'
            if vesper_atmosphere else ''),encoding='utf8')
        os.replace(game,out)
    print('GENERATED',out)


def main()->None:
    parser=argparse.ArgumentParser(description='Minecraft-W MIT v9 game + Ragnagrok/Blockbench + optional Vesper shader weather')
    parser.add_argument('--spec',required=True,type=Path)
    parser.add_argument('--out',required=True,type=Path)
    parser.add_argument('--source-minecraft',type=Path)
    parser.add_argument('--ragnagrok-project',type=Path)
    parser.add_argument('--blockbench-assets-dir',type=Path)
    parser.add_argument('--blockbench-manifest',type=Path)
    parser.add_argument('--vesper-atmosphere',action='store_true')
    parser.add_argument('--source-vesper',type=Path)
    parser.add_argument('--asset-optimizer',choices=['off','auto','required'],default='auto')
    parser.add_argument('--geometry-compression',choices=['meshopt','off'],default='meshopt')
    a=parser.parse_args()
    try:spec=json.loads(a.spec.read_text(encoding='utf8'))
    except (OSError,ValueError) as e: fail('Cannot read Minecraft-W spec: '+str(e))
    build(spec,a.out,a.source_minecraft,a.ragnagrok_project,
          a.blockbench_assets_dir,a.blockbench_manifest,
          a.vesper_atmosphere,a.source_vesper,
          a.asset_optimizer,a.geometry_compression)

if __name__=='__main__':main()
