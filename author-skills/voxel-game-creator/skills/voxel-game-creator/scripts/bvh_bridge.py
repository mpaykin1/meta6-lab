#!/usr/bin/env python3
"""three-mesh-bvh (MIT) for actual user GLB raycasts inside both game clients.

Leaves native terrain/voxel raycasting and player physics untouched. Only STATIC
Blockbench geometry has a BVH. Original glTF clips and animated meshes remain
fully functional and are never touched by the tree builder.
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
from pathlib import Path

from create_game import fail, replace_once, save

PACKAGE = 'three-mesh-bvh'
VERSION = '0.9.18'
SPECIFIER = f'{PACKAGE}@{VERSION}'
PIN = '0375ada0d674af3a4a169c4ad890239cf3d60cda'


RUNTIME = '''// Original MIT three-mesh-bvh integration by Voxel Game Creator.
// Accelerates precise ray hits on STATIC imported glTF meshes only.
// Neither terrain physics nor articulated hero animation is modified.
import * as THREE from 'THREE_MODULE';
import { MeshBVH, acceleratedRaycast } from 'three-mesh-bvh';

type IndexedGeometry = THREE.BufferGeometry & { boundsTree?: MeshBVH };
const trees = new WeakSet<THREE.BufferGeometry>();

export function indexImportedStaticMeshes(root: THREE.Object3D): number {
  let indexed = 0;
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh) || object instanceof THREE.SkinnedMesh) return;
    const mesh = object as THREE.Mesh;
    // Vertex deformation invalidates a static triangle BVH. Keep native raycasting.
    if (mesh.morphTargetInfluences?.length) return;
    const geometry = mesh.geometry as IndexedGeometry | undefined;
    if (!geometry || !geometry.isBufferGeometry) return;
    if (Object.values(geometry.morphAttributes).some(attributes => attributes.length > 0)) return;
    const positions = geometry.getAttribute('position');
    if (!positions || positions.count < 3 || positions.count > 300_000) return;
    try {
      if (!trees.has(geometry)) {
        // Indirect mode retains the source index ordering and vertex IDs.
        geometry.boundsTree = new MeshBVH(geometry, { indirect: true });
        trees.add(geometry);
      }
      // No global prototype patching: voxel raycasters retain native semantics.
      mesh.raycast = acceleratedRaycast;
      indexed++;
    } catch (error) {
      console.warn('VGC: static asset BVH unavailable, using Three.js raycast', error);
    }
  });
  return indexed;
}

export interface VgcPropHit {
  id: string;
  point: THREE.Vector3;
  distance: number;
  object: THREE.Object3D;
}

/** Real triangle hit query. MeshBVH uses firstHitOnly; animated meshes fall back. */
export function pickImportedProp(group: THREE.Group, camera: THREE.Camera,
                                  maximumDistance = 5): VgcPropHit | null {
  camera.updateWorldMatrix(true, false);
  const raycaster = new THREE.Raycaster();
  raycaster.far = Math.max(0.05, maximumDistance);
  (raycaster as THREE.Raycaster & { firstHitOnly: boolean }).firstHitOnly = true;
  raycaster.ray.origin.setFromMatrixPosition(camera.matrixWorld);
  camera.getWorldDirection(raycaster.ray.direction);
  const hits = raycaster.intersectObjects(group.children, true);
  for (const hit of hits) {
    let object: THREE.Object3D = hit.object;
    while (object.parent && object.parent !== group) object = object.parent;
    if (object.parent !== group || !object.name.startsWith('vgc-glb:')) continue;
    return { id: object.name.slice('vgc-glb:'.length),
             point: hit.point.clone(), distance: hit.distance, object };
  }
  return null;
}

/** Nothing occurs without a human pressing J. Installs no ongoing frame loop. */
export function installPropInspection(group: THREE.Group, camera: THREE.Camera): void {
  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.code !== 'KeyJ' || event.repeat || event.altKey || event.metaKey || event.ctrlKey) return;
    if (document.hidden) return;
    const input = event.target as HTMLElement | null;
    if (input && (input.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(input.tagName))) return;
    const hit = pickImportedProp(group, camera, 5);
    if (!hit) return;
    // Visible confirmation without altering character state or physics.
    let tag = document.getElementById('vgc-prop-inspection');
    if (!tag) {
      tag = document.createElement('div');
      tag.id = 'vgc-prop-inspection';
      tag.style.cssText = 'position:fixed;top:16%;left:50%;transform:translateX(-50%);pointer-events:none;z-index:1000;padding:7px 12px;background:#10151cdd;color:#e8eadb;border:1px solid #7c9a9b88;border-radius:5px;font:13px system-ui;max-width:85vw';
      document.body.appendChild(tag);
    }
    tag.textContent = hit.id + ' · ' + hit.distance.toFixed(1) + ' m';
    const current = tag;
    const seq = Number(current.dataset.seq || '0') + 1;
    current.dataset.seq = String(seq);
    window.setTimeout(() => { if (current.dataset.seq === String(seq)) current.remove(); }, 2200);
  });
}
'''


def configure_dependency(client: Path, *, mode: str) -> tuple[bool, str]:
    """Modify BOTH npm package.json and lockfile atomically; never ship an unsatisfiable npm ci."""
    if mode not in ('off', 'auto', 'required'):
        fail('three-mesh-bvh mode must be off|auto|required')
    if mode == 'off':
        return False, 'off'
    package = client/'package.json'
    lock = client/'package-lock.json'
    if not package.is_file() or not lock.is_file():
        if mode == 'required': fail('three-mesh-bvh requires package.json and npm package-lock.json')
        return False, 'missing-npm-project-or-lock'
    if not shutil.which('npm'):
        if mode == 'required': fail('three-mesh-bvh requires npm')
        return False, 'npm-not-installed'
    originals = {path: path.read_bytes() for path in (package, lock)}
    # npm resolves the existing transitive dependencies and updates the lock to
    # keep `npm ci` reliable. No install scripts, arbitrary shell, or network on runtime.
    cmd = ['npm', 'install', '--package-lock-only', '--save-exact', '--ignore-scripts',
           '--no-audit', '--no-fund', '--fetch-retries=0', '--fetch-timeout=6500',
           SPECIFIER]
    try:
        proc = subprocess.run(cmd, cwd=client, text=True, capture_output=True,
                              check=False, timeout=70, env={**os.environ, 'CI': 'true'})
        if proc.returncode != 0:
            raise RuntimeError((proc.stderr or proc.stdout)[-650:])
        pkg = json.loads(package.read_text(encoding='utf-8'))
        lck = json.loads(lock.read_text(encoding='utf-8'))
        if pkg.get('dependencies', {}).get(PACKAGE) != VERSION:
            raise RuntimeError('package.json was not pinned to three-mesh-bvh@'+VERSION)
        installed = lck.get('packages', {}).get('node_modules/three-mesh-bvh', {})
        if installed.get('version') != VERSION:
            raise RuntimeError('package-lock.json missing three-mesh-bvh@'+VERSION)
        return True, 'resolved-in-lockfile'
    except (OSError, subprocess.TimeoutExpired, ValueError, RuntimeError) as e:
        for path, data in originals.items(): path.write_bytes(data)
        if mode == 'required': fail('three-mesh-bvh dependency install failed: '+str(e))
        return False, 'unavailable ('+str(e)[-140:]+')'


def install(target: Path, engine: str, *, mode: str='auto') -> dict:
    """Called AFTER Blockbench Three.js GLB injection, and BEFORE publishing game."""
    if engine not in ('browser', 'server'): fail('BVH supported only in browser/server')
    folder = target/('src/vgc' if engine == 'browser' else 'examples/client/src/vgc')
    generated = folder/'blockbench-gltf.ts'
    if not generated.is_file():
        return {'mode': mode, 'status':'no-glb-assets'}
    client = target if engine == 'browser' else target/'examples/client'
    enabled, status = configure_dependency(client,mode=mode)
    if not enabled:
        return {'mode':mode, 'status':status, 'version':VERSION}

    # A separate module ensures that NONE of the native chunk, physics or
    # gameplay raycast implementations are changed.
    module = folder/'asset-bvh.ts'
    save(module,RUNTIME.replace('THREE_MODULE', 'three' if engine=='browser' else 'three/webgpu'))
    raw = generated.read_text(encoding='utf8')
    raw = "import { indexImportedStaticMeshes, installPropInspection } from './asset-bvh';\n" + raw
    raw = replace_once(raw,
       '  ground: (x: number, z: number) => number,\n): Promise<THREE.Group> {',
       '  ground: (x: number, z: number) => number,\n  camera?: THREE.Camera,\n): Promise<THREE.Group> {',
       'BVH optional camera')
    raw = replace_once(raw,'      group.add(object);',
       '      group.add(object);\n      indexImportedStaticMeshes(object);',
       'BVH index newly loaded static GLB meshes')
    raw = replace_once(raw,'  return group;\n}',
       '  if (camera) installPropInspection(group, camera);\n  return group;\n}',
       'BVH inspection hook')
    save(generated,raw)
    main=client/'src/main.ts'
    txt=main.read_text(encoding='utf8')
    if engine=='browser':
        anchor='(x,z) => vgcBlockbenchGround(Math.floor(x),Math.floor(z)).terrainHeight+1);'
        replacement='(x,z) => vgcBlockbenchGround(Math.floor(x),Math.floor(z)).terrainHeight+1, camera);'
    else:
        anchor='void attachBlockbenchAssets(world, 0, 0, (_x,_z) => 82);'
        replacement='void attachBlockbenchAssets(world, 0, 0, (_x,_z) => 82, camera);'
    txt=replace_once(txt,anchor,replacement,'BVH inspection camera binding')
    save(main,txt)
    return {'mode':mode, 'status':status, 'version':VERSION,
            'static_bvh':'mesh BVH per imported, non-skinned, non-morph static GLB mesh',
            'picking':'KeyJ line-of-sight mesh raycast, max 5m',
            'physical_collision':'not enabled; native voxel engine physics unchanged'}
