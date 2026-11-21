#!/usr/bin/env python3
"""Pinned MIT Voxelcraft: one-HTML survival game + authored art + Vesper-style GPU rain.

Retains upstream game, its creative/survival physics, greedy chunks, resource
packs, UI and save. Uses original Ragnagrok RLE + embedded Blockbench GLB.
All VGC additions are non-colliding decorative scene objects. No new renderer.
"""
from __future__ import annotations
import argparse
import base64
import html
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import zipfile

from create_game import fail, SCHEMES
from create_blockwild import colored_voxels
import ragnagrok_assets
import blockbench_bridge

REPO = 'https://github.com/bridge-mind/voxelcraft.git'
PIN = '30e8a2a2f7c8be9450983fa1d57aa197e875faf6'
UPSTREAM_COPYRIGHT = 'Copyright (c) 2026 BridgeMind'
MAX_GLB_EMBED = 18 * 1024 * 1024
EXPECTED = ('index.html', 'LICENSE', 'README.md')


def run(*args: str, cwd: Path | None = None) -> None:
    subprocess.run(list(args), cwd=str(cwd) if cwd else None, check=True, timeout=240)


def checkout(destination: Path, source: Path | None) -> None:
    if destination.exists(): fail('Voxelcraft destination exists')
    if source:
        src = source.expanduser().resolve()
        if not src.is_dir(): fail('Voxelcraft source directory missing')
        try:
            sha = subprocess.check_output(['git','-C',str(src),'rev-parse','HEAD'],text=True,timeout=10).strip()
        except (OSError, subprocess.SubprocessError):
            fail('--source-voxelcraft must be a Git checkout at pinned revision')
        if sha != PIN: fail('Voxelcraft source SHA mismatch; expected '+PIN)
        shutil.copytree(src,destination,ignore=shutil.ignore_patterns('.git','node_modules','*.log'))
    else:
        if not shutil.which('git'): fail('git required to acquire Voxelcraft MIT upstream')
        run('git','init',str(destination))
        run('git','-C',str(destination),'remote','add','origin',REPO)
        run('git','-C',str(destination),'fetch','--depth','1','origin',PIN)
        run('git','-C',str(destination),'checkout','--detach','FETCH_HEAD')
        sha = subprocess.check_output(['git','-C',str(destination),'rev-parse','HEAD'],text=True,timeout=10).strip()
        if sha != PIN: fail('Voxelcraft source did not resolve to reviewed commit')
        shutil.rmtree(destination/'.git',ignore_errors=True)
    for filename in EXPECTED:
        if not (destination/filename).is_file(): fail('Voxelcraft missing upstream '+filename)
    license_text = (destination/'LICENSE').read_text(encoding='utf-8')
    if not license_text.startswith('MIT License') or UPSTREAM_COPYRIGHT not in license_text:
        fail('Voxelcraft MIT attribution unexpected; refusing to redistribute')
    page = (destination/'index.html').read_text(encoding='utf-8')
    # Exact reviewed architecture: a single inline script and a native THREE r128 scene.
    required = ('const Game = {','const Weather = {','const player = {',
                'this.scene = new THREE.Scene();','this.renderer.render(this.scene, this.camera);',
                "window.addEventListener('load', () => {",'const ResourcePack = {')
    for marker in required:
        if page.count(marker) != 1: fail('Voxelcraft upstream anchor changed: '+marker)
    if '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>' not in page:
        fail('Voxelcraft Three.js r128 entry changed')


def one(text: str, needle: str, replacement: str, what: str) -> str:
    count = text.count(needle)
    if count != 1: fail('Voxelcraft upstream changed '+what+f' (matches={count})')
    return text.replace(needle,replacement,1)


# Vesper Street original MIT rain is GPU instanced, anchored on the character.
# This is an adapted single-file Three.js r128 shader, not a second renderer.
# Vesper Street: https://github.com/winchxyz/vesper-street, © 2026 winchxyz.
RAIN_JS = r'''
  function createRain() {
    const capacity = 1600, radius = 20, fallHeight = 20;
    const base = new THREE.PlaneGeometry(1, 1);
    base.translate(0, 0.5, 0);
    const geometry = new THREE.InstancedBufferGeometry();
    geometry.index = base.index;
    geometry.attributes.position = base.attributes.position;
    geometry.attributes.uv = base.attributes.uv;
    const offsets = new Float32Array(capacity * 3);
    const seeds = new Float32Array(capacity);
    // Stable distribution; no CPU particle simulation in the frame loop.
    let seed = 0x5f3759df;
    function rnd(){seed ^= seed << 13;seed ^= seed >>> 17;seed ^= seed << 5;return (seed >>> 0) / 4294967296;}
    for (let i = 0; i < capacity; i++) {
      const a = rnd() * 6.2831853, r = Math.sqrt(rnd()) * radius;
      offsets[i*3] = Math.cos(a)*r; offsets[i*3+1] = rnd()*fallHeight;
      offsets[i*3+2] = Math.sin(a)*r; seeds[i] = rnd();
    }
    geometry.setAttribute('aOffset', new THREE.InstancedBufferAttribute(offsets, 3));
    geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1));
    geometry.instanceCount = capacity;
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: {value:0}, uCenter:{value:new THREE.Vector3()},
        uIntensity:{value:0}, uDaylight:{value:0.25},
      },
      vertexShader: `
        attribute vec3 aOffset; attribute float aSeed;
        uniform float uTime; uniform vec3 uCenter;
        varying float vAlpha;
        void main() {
          float speed = 10.0 * (0.75 + 0.5*aSeed);
          float fall = mod(aOffset.y - uTime*speed, 20.0);
          vec3 dir = normalize(vec3(1.0,-speed,0.4));
          vec3 p = vec3(uCenter.x+aOffset.x, uCenter.y-4.0+fall, uCenter.z+aOffset.z);
          p.xz += vec2(1.0,0.4)*(20.0-fall)/speed;
          vec3 right = vec3(viewMatrix[0][0],viewMatrix[1][0],viewMatrix[2][0]);
          p += right * position.x * 0.035 + dir * position.y * (0.35 + 0.4*aSeed);
          vec4 mv = viewMatrix * vec4(p,1.0);
          vAlpha = (1.0-smoothstep(0.65,1.0,length(aOffset.xz)/20.0))
            * smoothstep(0.0,1.8,fall) * (1.0-smoothstep(18.0,20.0,fall));
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform float uIntensity;uniform float uDaylight;
        varying float vAlpha;
        void main() {
          float shade = mix(0.3,0.95,clamp(uDaylight,0.0,1.0));
          vec3 col = vec3(0.55,0.64,0.76)*shade;
          gl_FragColor = vec4(col,vAlpha*uIntensity*0.45);
        }`,
      transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
      side:THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    mesh.visible = false;
    mesh.name = 'VGC Vesper / GPU rain';
    return {mesh,geometry,material,capacity};
  }
'''


def art_js(models: dict, glbs: list[dict], gpu_rain: bool) -> str:
    payload = {
        'models': {m['id']: colored_voxels(m) for m in models['models']},
        'instances':[{'model':x['model'],'pos':x['pos'],'rot':x.get('rot',0)} for x in models['instances']],
        # All GLB data embeds directly into the one HTML, preserving local file:// play.
        'glb': [{**{k:x[k] for k in ('id','file','position','scale','yaw','idleClip')},
                 'data':base64.b64encode(Path(x['source']).read_bytes()).decode('ascii')} for x in glbs],
        'rain':bool(gpu_rain),
    }
    # Prevent a user-authored JSON string from prematurely terminating <script>.
    data=json.dumps(payload,separators=(',',':'),ensure_ascii=False).replace('<','\\u003c')
    return r'''/* Voxel Game Creator: MIT Ragnagrok RLE art, Blockbench GLB, Vesper GPU rain.
   Original Voxelcraft physics, source gameplay, saves and input are unchanged.
   Visual decorations do not claim hitboxes, breakable blocks or save syncing. */
const VGC = (() => {
  const DATA = __DATA__;
  const geometry = new THREE.BoxGeometry(1,1,1);
  const materials = new Map();
  let root = null, rain = null, generation = 0, frame = 0, t = 0, fps = 60;
  let mixers = [];
  let active = false;
  function material(col, glowing){
    const key=col+':'+Number(glowing);
    if(!materials.has(key)){
      const color=new THREE.Color(Number(col));
      materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.88,
        emissive:glowing?color:0x000000,emissiveIntensity:glowing?1:0}));
    }
    return materials.get(key);
  }
  function disposeModelTree(node){
    if(!node)return;
    node.traverse(obj=>{
      if(obj.geometry && obj.geometry!==geometry)obj.geometry.dispose();
      if(obj.material){
        for(const mat of Array.isArray(obj.material)?obj.material:[obj.material]){
          if(!mat || [...materials.values()].includes(mat))continue;
          for(const val of Object.values(mat))if(val && val.isTexture)val.dispose();
          mat.dispose();
        }
      }
    });
  }
  function reset(scene){
    ++generation;
    if(root){disposeModelTree(root); if(root.parent)root.parent.remove(root);}
    if(rain && rain.mesh.parent)rain.mesh.parent.remove(rain.mesh);
    for(const mx of mixers)mx.stopAllAction();
    mixers=[];root=null;active=false;t=0;fps=60;
    if(rain){rain.geometry.dispose();rain.material.dispose();rain=null;}
    geometry.dispose();
    for(const mat of materials.values())mat.dispose();materials.clear();
  }
  function mount(scene,avatar,w){
    reset(scene);
    const token=generation;
    root = new THREE.Group();root.name='VGC: authored voxel + GLB';scene.add(root);
    const origin={x:avatar.x,y:avatar.y,z:avatar.z};
    const level=(x,z)=>{
      const y=w.getHeight(Math.floor(x),Math.floor(z));
      return Number.isFinite(y) && y>=0 ? y : origin.y;
    };
    const q=new THREE.Quaternion(),matrix=new THREE.Matrix4();
    for(const item of DATA.instances){
      const mod=DATA.models[item.model];if(!mod)continue;
      const obj=new THREE.Group(),[sx,_sy,sz]=mod.size;
      const px=origin.x+item.pos[0],pz=origin.z+item.pos[2];
      obj.position.set(px,level(px,pz)+item.pos[1],pz);
      obj.rotation.y=Number(item.rot)*Math.PI/2;
      const glowing=new Set(mod.emissive.map(String));
      for(const [hex,cells] of Object.entries(mod.groups)){
        if(!cells.length)continue;
        const mesh=new THREE.InstancedMesh(geometry,material(hex,glowing.has(String(mod.colors[hex]))),cells.length);
        const size=new THREE.Vector3(mod.scale,mod.scale,mod.scale),p=new THREE.Vector3();
        for(let i=0;i<cells.length;i++){
          const [x,y,z]=cells[i];
          p.set((x-(sx-1)/2)*mod.scale,(y+0.5)*mod.scale,(z-(sz-1)/2)*mod.scale);
          mesh.setMatrixAt(i,matrix.compose(p,q,size));
        }
        mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=true;mesh.receiveShadow=true;
        mesh.frustumCulled=false;obj.add(mesh);
      }
      root.add(obj);
    }
    if(DATA.rain){rain=createRain();scene.add(rain.mesh);}
    if(DATA.glb.length){
      if(typeof THREE.GLTFLoader!=='function')console.warn('VGC: glTF loader CDN missing. Voxel models still work.');
      else{
        const loader=new THREE.GLTFLoader();
        for(const item of DATA.glb){
          try {
            const str=atob(item.data), bytes=new Uint8Array(str.length);
            for(let i=0;i<str.length;i++)bytes[i]=str.charCodeAt(i);
            loader.parse(bytes.buffer, '', (gltf)=>{
              if(token!==generation){disposeModelTree(gltf.scene);return;}
              const obj=gltf.scene;
              const px=origin.x+item.position[0],pz=origin.z+item.position[2];
              obj.position.set(px,level(px,pz)+item.position[1],pz);
              obj.rotation.y=item.yaw;obj.scale.setScalar(item.scale);
              obj.name='VGC Blockbench: '+item.id;
              obj.traverse(child=>{if(child.isMesh){child.castShadow=true;child.receiveShadow=true;}});
              root.add(obj);
              if(item.idleClip){const clip=gltf.animations.find(c=>c.name===item.idleClip);
                if(clip){const mixer=new THREE.AnimationMixer(obj);mixer.clipAction(clip).play();mixers.push(mixer);}}
            },(err)=>console.error('VGC: GLB parse failed',item.id,err));
          }catch(err){console.error('VGC: GLB decode failed',item.id,err);}
        }
      }
    }
    active=true;
  }
  __RAIN_JS__
  function update(dt,game){
    if(!active)return;
    t+=dt;
    for(const mixer of mixers)mixer.update(dt);
    if(!rain)return;
    const wet=game.running && game.ready && !game.paused &&
      Weather.amount>0.05 && !Weather.snowMode;
    const x=player.x,z=player.z;
    const cover=world.getHeight(Math.floor(x),Math.floor(z))>player.y+2;
    rain.mesh.visible=wet && !cover;
    if(!rain.mesh.visible)return;
    const u=rain.material.uniforms;
    u.uTime.value=t;
    u.uCenter.value.set(x,player.y,z);
    u.uIntensity.value=Math.max(0,Math.min(1,Weather.amount));
    u.uDaylight.value=Math.max(0,Math.min(1,Sky.dayFactor));
    if(dt>0.001){fps += (1/Math.max(dt,0.001)-fps)*0.015;}
    const quota=fps<28?0.3:fps<43?0.6:1;
    rain.geometry.instanceCount=Math.floor(rain.capacity*quota);
  }
  return {mount,reset,update,useVesperRain:DATA.rain};
})();
'''.replace('__DATA__',data).replace('__RAIN_JS__',RAIN_JS if gpu_rain else '')


def patch_game(page: str, assets:dict, glbs:list[dict], *, gpu_rain:bool,title:str)->str:
    if title:
        page = re.sub(r'<title>[^<]*</title>', lambda _: '<title>'+html.escape(title,quote=False)+'</title>', page, count=1)
    if glbs:
        loader='https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js'
        page=one(page,
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>',
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>\n<script src="'+loader+'"></script>',
            'optional GLTFLoader r128 CDN')
    page=one(page,'const Game = {',art_js(assets,glbs,gpu_rain)+'\nconst Game = {','JS game injection')
    # Keep the original game loop / world and resource pack support. Decorations
    # are mounted once the world's own chunk system is ready and player settled.
    page=one(page,
        "if (this.freshSpawn) this.settleSpawn(); else if (Physics.intersects(player)) player.y = world.getHeight(floor(player.x), floor(player.z)) + 1;",
        "if (this.freshSpawn) this.settleSpawn(); else if (Physics.intersects(player)) player.y = world.getHeight(floor(player.x), floor(player.z)) + 1;\n          VGC.mount(this.scene,player,world);",
        'mount after native player spawn')
    page=one(page,
        '    this.seed = String(seed);',
        '    VGC.reset(this.scene);\n    this.seed = String(seed);',
        'new world reset')
    page=one(page,
        '    this.running = false; this.ready = false; Input.unlock(); Screens.close();',
        '    VGC.reset(this.scene);\n    this.running = false; this.ready = false; Input.unlock(); Screens.close();',
        'stop world reset')
    page=one(page,
        '    this.renderer.render(this.scene, this.camera);',
        '    VGC.update(dt,this);\n    this.renderer.render(this.scene, this.camera);',
        'single renderer frame update')
    if gpu_rain:
        # Vesper GPU rain replaces native CPU rain only in rain biomes; native
        # snow and native weather clock remain intact.
        page=one(page,
            '    this.points.visible = this.amount > 0.05;\n    if (!this.points.visible) return;',
            '    this.points.visible = this.amount > 0.05;\n'
            '    if (!this.snowMode && VGC.useVesperRain) { this.points.visible = false; return; }\n'
            '    if (!this.points.visible) return;',
            'native rain budget handoff')
    return page


def check_pack(pack: Path) -> None:
    if not pack.is_file() or pack.suffix.lower()!='.zip' or pack.stat().st_size>32*1024*1024:
        fail('Resource pack must be existing ZIP smaller than 32 MiB')
    try:
        with zipfile.ZipFile(pack) as f:
            members=f.infolist()
            if len(members)>5000 or sum(m.file_size for m in members)>128*1024*1024:
                fail('Resource pack too large or too many entries')
            if not any('assets/minecraft/textures/' in m.filename for m in members):
                fail('Resource pack has no Minecraft texture folder')
    except (zipfile.BadZipFile,OSError) as e:fail('Resource pack unreadable: '+str(e))


def build(spec:dict,output:Path,source:Path|None,project:Path|None,
          glb_dir:Path|None,glb_manifest:Path|None,resource_pack:Path|None,
          gpu_rain:bool)->None:
    if not isinstance(spec,dict):fail('Spec must be JSON object')
    theme=spec.get('theme','ash')
    if theme not in SCHEMES:fail('Unsupported theme '+str(theme))
    title=spec.get('title','Voxelcraft · Voxel Game Creator')
    if not isinstance(title,str) or not 1<=len(title)<=120:fail('Invalid title')
    models=ragnagrok_assets.acquire_assets(spec,project)
    glbs=blockbench_bridge.manifest_items(glb_manifest,glb_dir)
    if any(item['meshopt'] for item in glbs):
        fail('Voxelcraft uses Three.js r128: Meshopt GLB unsupported; export uncompressed GLB or --geometry-compression off in earlier engines')
    total=sum(Path(it['source']).stat().st_size for it in glbs)
    if total>MAX_GLB_EMBED:fail('Voxelcraft embeds GLBs in one HTML: total must be <=18 MiB')
    if resource_pack:check_pack(resource_pack)
    out=output.expanduser().resolve()
    if out.exists():fail('Output exists; refusing overwrite '+str(out))
    out.parent.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='.vgc-voxelcraft-',dir=out.parent) as temp:
        stage=Path(temp)/'game'
        checkout(stage,source)
        index=stage/'index.html';original=index.read_text(encoding='utf-8')
        modified=patch_game(original,models,glbs,gpu_rain=gpu_rain,title=title)
        index.write_text(modified,encoding='utf-8')
        if resource_pack:
            shutil.copy2(resource_pack,stage/'resourcepack.zip')
        # Keep the original LICENSE and README intact; generated assets from
        # Ragnagrok are MIT-compatible. Resource pack remains user-supplied.
        (stage/'VGC_VOXELCRAFT.json').write_text(json.dumps({
            'engine':'voxelcraft','source':REPO,'source_sha':PIN,'license':'MIT',
            'title':title,'theme':theme,'models':len(models['models']),
            'instances':len(models['instances']),'blockbench_glb_count':len(glbs),
            'embedded_glb_bytes':total,'resource_pack':bool(resource_pack),
            'vesper_gpu_rain':gpu_rain,
            'scene':'one native Three.js r128 WebGL scene; no additional renderer',
            'collision':'decorative imports are non-collidable; no mining of imported art',
            'save':'native voxel edit saves unchanged; decorative props not saved as block edits',
            'server':'no backend; CDNs for Three.js, JSZip and optional GLTFLoader still needed',
            'run':'open index.html in browser; optional python3 -m http.server 8765 for resourcepack.zip',
        },ensure_ascii=False,indent=2)+'\n',encoding='utf8')
        (stage/'VGC_README.md').write_text(
            '# Voxelcraft + Voxel Game Creator\n\n'
            'Source: '+REPO+' @ '+PIN+' · MIT, upstream LICENSE retained.\n\n'
            'Open index.html (native one-file browser game; JS libraries load from CDN). '
            'Serve `python3 -m http.server 8765` if you want an auto-loaded resourcepack.zip.\n\n'
            'Ragnagrok native RLE voxels and Blockbench embedded GLBs render as decorative scene models. '
            'Vesper shader rain replaces the native CPU rain while preserving native snow and weather simulation. '
            'All existing world mechanics, physics, controls, resource packs and save remain upstream. '
            'No imported decoration automatically becomes a physics collider, a block or a saved entity.\n',
            encoding='utf8')
        os.replace(stage,out)
    print('GENERATED',out)


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--spec',required=True,type=Path)
    p.add_argument('--out',required=True,type=Path)
    p.add_argument('--source-voxelcraft',type=Path)
    p.add_argument('--ragnagrok-project',type=Path)
    p.add_argument('--blockbench-assets-dir',type=Path)
    p.add_argument('--blockbench-manifest',type=Path)
    p.add_argument('--resource-pack',type=Path)
    p.add_argument('--vesper-rain',choices=['on','off'],default='on')
    a=p.parse_args()
    try:spec=json.loads(a.spec.read_text(encoding='utf8'))
    except (OSError,ValueError) as e:fail('Voxelcraft spec unreadable: '+str(e))
    build(spec,a.out,a.source_voxelcraft,a.ragnagrok_project,
          a.blockbench_assets_dir,a.blockbench_manifest,a.resource_pack,
          a.vesper_rain=='on')

if __name__=='__main__':main()
