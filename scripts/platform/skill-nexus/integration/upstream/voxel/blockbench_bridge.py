#!/usr/bin/env python3
"""Blockbench .glb -> real Three.js content in Lumenwild and Voxelize.

Blockbench itself is GPL-3.0 and is NOT bundled or linked into the MIT runtimes.
Only original user-created, self-contained glTF 2.0 .glb assets enter generated games.
"""
from __future__ import annotations
import json
import re
import shutil
import struct
from pathlib import Path

from create_game import fail, replace_once, save

MAX_BYTES = 24 * 1024 * 1024
MAX_MODELS = 24
MAX_NODES = 15000
NAME = re.compile(r'^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$')

# The actual game uses a native GLTFLoader, Three.js scene graph and AnimationMixer.
RUNTIME = '''// Voxel Game Creator v0.4. Blockbench glTF 2.0 models in native Three.js.
// Source models, hierarchy, materials, UVs and glTF animations preserved.
import * as THREE from "THREE_MODULE";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VGC_BLOCKBENCH_ASSETS } from "./blockbench-assets";

// The original MIT meshoptimizer decoder is bundled by Three.js and lazy-loaded
// only if a GLB actually uses EXT_meshopt_compression.
const loader = new GLTFLoader();
const mixers: THREE.AnimationMixer[] = [];
let lastFrame = 0;
let active = false;

function animate(now: number) {
  if (!active) return;
  const delta = lastFrame ? Math.min((now - lastFrame) / 1000, 0.05) : 0;
  lastFrame = now;
  if (!document.hidden) for (const mixer of mixers) mixer.update(delta);
  requestAnimationFrame(animate);
}

/** No extra WebGL renderer or simulation. Instances are visual, not physics colliders. */
export async function attachBlockbenchAssets(
  scene: THREE.Object3D,
  originX: number,
  originZ: number,
  ground: (x: number, z: number) => number,
): Promise<THREE.Group> {
  if (VGC_BLOCKBENCH_ASSETS.some(item => item.meshopt)) {
    const { MeshoptDecoder } = await import("three/examples/jsm/libs/meshopt_decoder.module.js");
    loader.setMeshoptDecoder(MeshoptDecoder);
  }
  const group = new THREE.Group();
  group.name = 'Voxel Game Creator / Blockbench glTF';
  scene.add(group);
  const errors: string[] = [];
  // Vite takes care of relative base paths, including GitHub Pages subpaths.
  const base = import.meta.env.BASE_URL || '/';
  for (const item of VGC_BLOCKBENCH_ASSETS) {
    try {
      const gltf = await loader.loadAsync(base + 'vgc/blockbench/' + item.file);
      const object = gltf.scene;
      object.name = 'vgc-glb:' + item.id;
      const px = originX + item.position[0];
      const pz = originZ + item.position[2];
      object.position.set(px, ground(px, pz) + item.position[1], pz);
      object.rotation.y = item.yaw;
      object.scale.setScalar(item.scale);
      object.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.SkinnedMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          for (const m of materials) {
            if (m && 'map' in m && m.map && m.map instanceof THREE.Texture) {
              m.map.magFilter = THREE.NearestFilter;
              m.map.needsUpdate = true;
            }
          }
        }
      });
      group.add(object);
      // Only the explicitly selected idle animation is autonomous.
      // An action animation (attack/jump/etc.) MUST be triggered by gameplay input.
      if (item.idleClip && gltf.animations.length > 0) {
        const clip = gltf.animations.find(c => c.name === item.idleClip);
        if (clip) {
          const mixer = new THREE.AnimationMixer(object);
          mixer.clipAction(clip).play();
          mixers.push(mixer);
        }
      }
    } catch (error) {
      errors.push(item.id + ': ' + String(error));
      console.error('Blockbench asset could not load', item.id, error);
    }
  }
  if (errors.length) {
    const warning = document.createElement('div');
    warning.textContent = 'Some Blockbench assets failed: ' + errors.join(' · ');
    warning.style.cssText = 'position:fixed;bottom:12px;left:12px;z-index:999;color:#fff;background:#712b3a;padding:9px;border-radius:6px;font:12px system-ui;max-width:80vw';
    document.body.appendChild(warning);
  }
  if (mixers.length && !active) { active = true; requestAnimationFrame(animate); }
  return group;
}
'''


def read_glb(path: Path, *, allow_meshopt: bool = False) -> dict:
    if not path.is_file() or not path.suffix.lower() == '.glb':
        fail('Blockbench asset must be existing .glb: ' + str(path))
    size = path.stat().st_size
    if size < 32 or size > MAX_BYTES:
        fail('Blockbench GLB must be 32 bytes..24 MiB: ' + str(path))
    with path.open('rb') as f:
        h = f.read(20)
        magic, version, length, chunk_len, chunk_type = struct.unpack('<4sIIII', h)
        if magic != b'glTF' or version != 2 or length != size or chunk_type != 0x4E4F534A:
            fail('Invalid glTF 2.0 GLB header: ' + str(path))
        if chunk_len > 1024 * 1024 or chunk_len % 4 or chunk_len + 20 > size:
            fail('Invalid GLB JSON chunk: ' + str(path))
        try: data = json.loads(f.read(chunk_len).rstrip(b'\x20\x00'))
        except (ValueError, UnicodeDecodeError): fail('Invalid GLB JSON content')
    if data.get('asset', {}).get('version') != '2.0': fail('Expected glTF 2.0')
    if len(data.get('nodes', [])) > MAX_NODES: fail('GLB has too many nodes')
    for field in ('buffers', 'images'):
        if any('uri' in item for item in data.get(field, [])):
            fail('External/data URI '+field+' are not allowed: export embedded GLB')
    unsupported = {'KHR_draco_mesh_compression', 'KHR_texture_basisu'}
    if not allow_meshopt: unsupported.add('EXT_meshopt_compression')
    if unsupported.intersection(data.get('extensionsRequired', [])):
        fail('GLB requires an unavailable compressed-texture/mesh extension')
    if not data.get('meshes'):
        fail('GLB contains no mesh geometry')
    clips = [a.get('name', '') for a in data.get('animations', [])]
    return {'clips': clips, 'nodes': len(data.get('nodes', [])), 'meshes': len(data['meshes']),
            'meshopt': 'EXT_meshopt_compression' in data.get('extensionsRequired', [])}


def manifest_items(manifest: Path | None, directory: Path | None) -> list[dict]:
    if manifest is None and directory is None: return []
    if manifest:
        try: doc = json.loads(manifest.read_text(encoding='utf8'))
        except (OSError, ValueError) as e: fail('Bad Blockbench manifest: '+str(e))
        if not isinstance(doc, dict) or not isinstance(doc.get('assets'), list):fail('Expected manifest {"assets": [...]}')
        base = directory if directory else manifest.parent
        raw = doc['assets']
    else:
        base = directory
        if base is None or not base.is_dir(): fail('Blockbench source directory missing')
        raw = [{'file': p.name, 'id': p.stem} for p in sorted(base.iterdir()) if p.suffix.lower() == '.glb']
    if not raw: fail('Blockbench manifest has no .glb assets')
    if len(raw) > MAX_MODELS:fail('Too many Blockbench models; max 24')
    out=[]; seen=set()
    for item in raw:
        if not isinstance(item, dict):fail('Each Blockbench asset must be an object')
        name=item.get('file')
        if not isinstance(name, str) or not NAME.fullmatch(name.removesuffix('.glb')) or not name.endswith('.glb'):
            fail('Invalid Blockbench asset filename: '+repr(name))
        asset_id=item.get('id',name[:-4]);
        if not isinstance(asset_id,str) or not NAME.fullmatch(asset_id) or asset_id in seen:
            fail('Invalid/duplicate Blockbench model id: '+repr(asset_id))
        seen.add(asset_id)
        src=(base/name).resolve()
        if not src.is_relative_to(base.resolve()):fail('Asset path escapes its directory')
        metadata=read_glb(src,allow_meshopt=True)
        pos=item.get('position', [0,0,0]); scale=item.get('scale',1); yaw=item.get('yaw',0)
        if not isinstance(pos,list) or len(pos)!=3 or any(type(n) not in (int,float) or not -50000<=n<=50000 for n in pos):
            fail('Bad position for '+asset_id)
        if type(scale) not in (int,float) or not 0.001<=scale<=100:fail('Bad scale for '+asset_id)
        if type(yaw) not in (int,float) or not -100<=yaw<=100:fail('Bad yaw for '+asset_id)
        clip=item.get('idleClip')
        if clip is not None and (not isinstance(clip,str) or clip not in metadata['clips']):
            fail('idleClip not found in GLB: '+str(clip))
        out.append({'id':asset_id,'file':name,'position':pos,'scale':scale,'yaw':yaw,
                    'idleClip':clip, 'source':src, 'clips':metadata['clips'], 'meshopt':metadata['meshopt']})
    return out


def install_bridge(target:Path,engine:str,items:list[dict])->None:
    if not items:return
    if engine not in ('browser','server'):fail('Unknown Blockbench bridge engine: '+engine)
    src=target/('src' if engine=='browser' else 'examples/client/src')
    path=src/'main.ts';txt=path.read_text(encoding='utf8')
    p=target/('public/vgc/blockbench' if engine=='browser' else 'examples/client/public/vgc/blockbench');p.mkdir(parents=True,exist_ok=True)
    for item in items:shutil.copy2(item['source'],p/item['file'])
    folder=src/'vgc';folder.mkdir(exist_ok=True)
    clean=[{k:item[k] for k in ('id','file','position','scale','yaw','idleClip','meshopt')} for item in items]
    save(folder/'blockbench-assets.ts',
         'export type VgcGlbAsset = { id:string; file:string; position:[number,number,number]; scale:number; yaw:number; idleClip:string|null; meshopt:boolean };\n'
         + 'export const VGC_BLOCKBENCH_ASSETS: VgcGlbAsset[] = '+json.dumps(clean,ensure_ascii=False,separators=(',',':'))+';\n')
    save(folder/'blockbench-gltf.ts',RUNTIME.replace('THREE_MODULE','three' if engine=='browser' else 'three/webgpu'))
    txt='import { attachBlockbenchAssets } from "./vgc/blockbench-gltf";\n'+txt
    if engine=='browser':
        anchor='  const startZ = saved?.z ?? spawn.z;'
        insert='''  // Blockbench GLB props share the same Lumenwild-generated ground as Ragnagrok props.
  const vgcBlockbenchGround = createColumnSampler(SEED);
  if (webgl) void attachBlockbenchAssets(webgl.scene, startX, startZ,
    (x,z) => vgcBlockbenchGround(Math.floor(x),Math.floor(z)).terrainHeight+1);
'''
    else:
        anchor='  await setupWorld(world);'
        insert='''  // Voxelize authoritative physics stays server-side; model props are visual.
  void attachBlockbenchAssets(world, 0, 0, (_x,_z) => 82);
'''
    txt=replace_once(txt,anchor,anchor+'\n'+insert,'Blockbench Three.js scene injection')
    save(path,txt)
    save(target/'BLOCKBENCH_ASSETS.json',json.dumps({'assets':clean,'source':'Blockbench GPL-3.0 editor, independently exported user assets; no Blockbench code bundled'},indent=2,ensure_ascii=False))


def copy_studio_asset_pack(studio:Path,items:list[dict])->None:
    """Keep user-authored .glb alongside the separate Ragnagrok editor, no fake format conversion."""
    if not items:return
    path=studio/'public/vgc/blockbench';path.mkdir(parents=True,exist_ok=True)
    for item in items:shutil.copy2(item['source'],path/item['file'])
    save(studio/'BLOCKBENCH_ASSETS.json',json.dumps({'assets':[
        {k:item[k] for k in ('id','file','position','scale','yaw','idleClip','meshopt')}
        for item in items], 'note':'Edit .bbmodel in Blockbench; export embedded GLB for Lumenwild/Voxelize. Ragnagrok editor is separate.'},indent=2,ensure_ascii=False))
