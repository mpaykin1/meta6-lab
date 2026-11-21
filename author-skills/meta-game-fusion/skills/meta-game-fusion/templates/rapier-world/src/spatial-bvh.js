/** META GAME FUSION spatial queries: static triangle geometry only.
 * Three.js raycast/picking / optional NPC visibility probe; never drives Rapier
 * rigid bodies or replaces authoritative Recast/Detour pathfinding.
 * No global prototype patches. Never touches active character/skinned animations.
 */
import * as THREE from 'three';
import { MeshBVH, acceleratedRaycast } from 'three-mesh-bvh';

const finite3 = v => v && ['x', 'y', 'z'].every(k => Number.isFinite(v[k]));
const triangles = geo => Math.floor((geo.index?.count ?? geo.attributes.position?.count ?? 0) / 3);

export class FusionSpatialBVH {
  constructor({ maxMeshes = 6000, maxTriangles = 2_000_000 } = {}) {
    this.meshes = new Set();
    this.original = new Map();
    this.geometries = new Map();
    this.maxMeshes = maxMeshes;
    this.maxTriangles = maxTriangles;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this._origin = new THREE.Vector3();
    this._end = new THREE.Vector3();
    this.enabled = true;
    this.stats = { meshes: 0, trees: 0, triangles: 0, skippedAnimated: 0 };
  }

  register(root, { occluder = false, minTriangles = 12 } = {}) {
    if (!root?.traverse) return 0;
    let added = 0;
    root.updateMatrixWorld(true);
    root.traverse(mesh => {
      if (!mesh.isMesh || !mesh.geometry?.isBufferGeometry || this.meshes.has(mesh)) return;
      if (mesh.isSkinnedMesh || mesh.morphTargetInfluences?.length || mesh.userData.mgfDynamic ||
          mesh.userData.mgfAnimated || mesh.userData.mgfBVHExclude) {
        this.stats.skippedAnimated++;
        return;
      }
      // Only explicitly designated immobile meshes may be indexed.
      if (mesh.userData.mgfStatic !== true && !root.userData?.mgfStatic) return;
      const geometry = mesh.geometry;
      const count = triangles(geometry);
      if (!Number.isFinite(count) || count < minTriangles || count > this.maxTriangles ||
          this.meshes.size >= this.maxMeshes || !geometry.attributes.position) return;
      try {
        const tracked = this.geometries.get(geometry);
        if (tracked) tracked.refs++;
        else {
          const owner = !geometry.boundsTree;
          if (owner) geometry.boundsTree = new MeshBVH(geometry, { maxLeafTris: 12 });
          this.geometries.set(geometry, { refs: 1, owner, triangles: count });
          if (owner) { this.stats.trees++; this.stats.triangles += count; }
        }
        this.original.set(mesh, {
          own: Object.prototype.hasOwnProperty.call(mesh, 'raycast'),
          raycast: mesh.raycast,
          priorOccluder: mesh.userData.mgfOccluder,
        });
        mesh.raycast = acceleratedRaycast;
        if (occluder) mesh.userData.mgfOccluder = true;
        this.meshes.add(mesh);
        added++;
      } catch (e) {
        // Bad third-party geometry must not prevent starting the physics world.
        console.warn('MGF BVH: cannot index geometry', mesh.name || '(unnamed)', e);
      }
    });
    this.stats.meshes = this.meshes.size;
    return added;
  }

  /** Returns nearest geometric hit or null; selection is informational only. */
  pick(clientX, clientY, camera, canvas, { maxDistance = 200 } = {}) {
    if (!this.enabled || !camera || !canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    this.pointer.set(((clientX - rect.left) / rect.width) * 2 - 1,
                     -((clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, camera);
    this.raycaster.near = 0.02;
    this.raycaster.far = maxDistance;
    this.raycaster.firstHitOnly = true;
    return this.raycaster.intersectObjects([...this.meshes].filter(m => m.visible && m.parent), false)[0] ?? null;
  }

  /** Static *visual* visibility only; NPC navigation and Rapier collision remain authoritative. */
  lineOfSight(from, to, { occludersOnly = true } = {}) {
    if (!this.enabled || !finite3(from) || !finite3(to)) return null;
    this._origin.set(from.x, from.y, from.z);
    this._end.set(to.x, to.y, to.z);
    const dir = this._end.clone().sub(this._origin);
    const dist = dir.length();
    if (dist < 0.09) return true;
    dir.multiplyScalar(1 / dist);
    this.raycaster.set(this._origin, dir);
    this.raycaster.near = 0.04;
    this.raycaster.far = Math.max(0.04, dist - 0.08);
    this.raycaster.firstHitOnly = true;
    const objects = [...this.meshes].filter(m => m.visible && m.parent &&
      (!occludersOnly || m.userData.mgfOccluder === true));
    return this.raycaster.intersectObjects(objects, false).length === 0;
  }

  unregister(root) {
    if (!root?.traverse) return;
    root.traverse(mesh => {
      const saved = this.original.get(mesh);
      if (!saved) return;
      if (saved.own) mesh.raycast = saved.raycast;
      else delete mesh.raycast;
      if (saved.priorOccluder === undefined) delete mesh.userData.mgfOccluder;
      else mesh.userData.mgfOccluder = saved.priorOccluder;
      const geom = mesh.geometry, entry = this.geometries.get(geom);
      if (entry && --entry.refs === 0) {
        if (entry.owner) {
          // Index belongs to this module, but Three.js geometry and materials do not.
          geom.boundsTree = null;
          this.stats.trees--;
          this.stats.triangles -= entry.triangles;
        }
        this.geometries.delete(geom);
      }
      this.meshes.delete(mesh);
      this.original.delete(mesh);
    });
    this.stats.meshes = this.meshes.size;
  }

  destroy() {
    for (const mesh of [...this.meshes]) this.unregister(mesh);
    this.meshes.clear();
    this.geometries.clear();
  }
}
