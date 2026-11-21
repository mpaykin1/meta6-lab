/**
 * Game Style Forge / three-mesh-bvh@0.9.18 integration.
 * Static, non-deforming visual geometry only; Rapier owns all physics.
 * GLTF/Meshopt decoding happens before registration; BVHs use indirect
 * indices so approved source triangles/UVs are not reordered.
 */
import * as THREE from 'three';
import { MeshBVH, acceleratedRaycast } from 'three-mesh-bvh';

const TRIANGLE_CAP = 180000;
const MESH_CAP = 100;
const _direction = new THREE.Vector3();
const _raycaster = new THREE.Raycaster();
_raycaster.firstHitOnly = true;

export function createSpatialIndex() {
  const registered = [];
  const originalRaycast = new WeakMap();
  const indexedGeometries = new Set();
  let ignored = 0;

  function registerStatic(root) {
    if (!root || !root.traverse) return 0;
    let added = 0;
    root.traverse(mesh => {
      if (!mesh.isMesh || mesh.isSkinnedMesh || mesh.isInstancedMesh ||
          mesh.morphTargetInfluences?.length || !mesh.visible ||
          mesh.userData?.heroAsset || registered.includes(mesh) ||
          registered.length >= MESH_CAP) return;
      const geo = mesh.geometry;
      const pos = geo?.getAttribute?.('position');
      if (!pos || pos.itemSize !== 3 || pos.count < 3 ||
          pos.count > TRIANGLE_CAP * 3 || geo.morphAttributes?.position?.length) {
        ignored++; return;
      }
      try {
        if (!geo.boundsTree) {
          // indirect keeps the geometry's original index ordering intact.
          geo.boundsTree = new MeshBVH(geo, {indirect:true, verbose:false});
          indexedGeometries.add(geo);
        }
        originalRaycast.set(mesh, mesh.raycast);
        mesh.raycast = acceleratedRaycast;
        registered.push(mesh);
        added++;
      } catch (error) {
        console.warn('BVH skipped invalid static mesh', error);
        ignored++;
      }
    });
    return added;
  }

  function cast(origin, direction, range = 9) {
    if (!registered.length || range <= 0) return null;
    _direction.copy(direction);
    if (_direction.lengthSq() < 1e-8) return null;
    _direction.normalize();
    _raycaster.set(origin, _direction);
    _raycaster.near = 0.09;
    _raycaster.far = Math.min(Math.max(range, 0.1), 90);
    // Imported animated nodes can move rigidly; refresh their world matrices.
    for (const mesh of registered) mesh.updateWorldMatrix(true, false);
    const hits = _raycaster.intersectObjects(registered, false);
    return hits[0] || null;
  }

  function castBetween(a, b) {
    _direction.subVectors(b, a);
    const distance = _direction.length();
    if (distance < .15) return null;
    return cast(a, _direction, distance);
  }

  function dispose() {
    for (const mesh of registered) {
      const prev = originalRaycast.get(mesh);
      if (prev) mesh.raycast = prev;
    }
    for (const geo of indexedGeometries) {
      geo.boundsTree = null;
    }
    registered.length = 0;
    indexedGeometries.clear();
  }

  return {registerStatic, cast, castBetween, dispose,
          stats: () => ({meshes:registered.length, ignored})};
}
