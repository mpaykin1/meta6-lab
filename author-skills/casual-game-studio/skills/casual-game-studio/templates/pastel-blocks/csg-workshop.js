/** Three-BVH-CSG 0.0.18 / three-mesh-bvh 0.9.18 integration.
 * Boolean geometry runs only on explicit user commands. Rapier is the sole
 * rigid-body authority; conservative tile colliders remain unchanged.
 * CSG is experimental; failures are isolated to the requested tile.
 */
export async function createCsgCarver({THREE, onStatus}) {
  const [{Brush, Evaluator, SUBTRACTION}, {MeshBVH, acceleratedRaycast}] = await Promise.all([
    import('three-bvh-csg'), import('three-mesh-bvh')
  ]);
  if (![Brush, Evaluator, MeshBVH, acceleratedRaycast].every(Boolean) || SUBTRACTION === undefined) {
    throw new Error('Incomplete CSG/BVH runtime');
  }
  const evaluator = new Evaluator();
  evaluator.attributes = ['position', 'normal', 'uv'];
  evaluator.useGroups = false;
  const owned = new Set();
  let cuts = 0;
  const limit = 10;  // Keep the gameplay frame rate stable on mobile.
  onStatus?.('CSG · READY');

  function carve(mesh) {
    if (!mesh || !mesh.isMesh || !mesh.userData.live || mesh.userData.csgCut || cuts >= limit) {
      return false;
    }
    const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    const baseGeometry = mesh.geometry.clone();
    // Cylinder is watertight and traverses the full depth of the rounded tile.
    const drillGeometry = new THREE.CylinderGeometry(.19, .19, 1.25, 28, 1, false);
    drillGeometry.rotateX(Math.PI / 2);
    const base = new Brush(baseGeometry, material);
    const drill = new Brush(drillGeometry, material);
    base.updateMatrixWorld();
    drill.updateMatrixWorld();
    let result = null;
    try {
      // A and B are both closed solids in the tile-local coordinate system.
      result = evaluator.evaluate(base, drill, SUBTRACTION);
      const geom = result?.geometry;
      const pos = geom?.getAttribute('position');
      const tri = geom?.getIndex() ? geom.getIndex().count / 3 : (pos?.count ?? 0) / 3;
      if (!geom || !pos || tri < 12 || tri > 120000) {
        throw new Error('CSG produced empty or excessive geometry');
      }
      geom.computeBoundingBox();
      geom.computeBoundingSphere();
      // Build a fresh BVH for the *new* mesh; the shared block BVH is untouched.
      geom.boundsTree = new MeshBVH(geom, {maxLeafTris: 12});
      mesh.geometry = geom;
      mesh.material = material;
      mesh.raycast = acceleratedRaycast;
      owned.add(geom);
      mesh.userData.csgCut = true;
      cuts++;
      // Do NOT dispose the base shared geometry or any shared material.
      onStatus?.('CSG · CUT ' + cuts);
      return true;
    } catch (error) {
      // Keep an intact game tile if boolean math fails on a numeric corner case.
      if (result?.geometry && !owned.has(result.geometry)) result.geometry.dispose();
      onStatus?.('CSG · RETRY');
      console.warn('CSG subtraction skipped, original block preserved.', error);
      return false;
    } finally {
      baseGeometry.dispose();
      drillGeometry.dispose();
    }
  }

  function releaseTile(mesh) {
    const geometry = mesh?.geometry;
    if (owned.has(geometry)) {
      owned.delete(geometry);
      geometry.disposeBoundsTree?.();
      geometry.dispose();
    }
  }
  function dispose() {
    for (const geometry of owned) {
      geometry.disposeBoundsTree?.();
      geometry.dispose();
    }
    owned.clear();
  }
  return {carve, releaseTile, dispose, get cutCount(){return cuts;}};
}
