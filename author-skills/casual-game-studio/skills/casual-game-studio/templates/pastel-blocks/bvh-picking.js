/** Casual Game Studio — v1.1.0 Three Mesh BVH v0.9.18 (MIT).
 * Accelerate ray queries against the immutable rounded block geometry.
 * The same geometry is shared by all tiles. Rapier remains the exclusive
 * authority over rigid-body physics and Three-VRM uses its original skin.
 */
export async function enableBvhPicking({THREE, geometry, meshes, raycaster, onState}) {
  if (!geometry || !Array.isArray(meshes) || !meshes.length) throw new Error('Static board missing');
  if (geometry.boundsTree) throw new Error('BVH already initialized');
  const {computeBoundsTree, disposeBoundsTree, acceleratedRaycast, SAH} = await import('three-mesh-bvh');
  if (typeof computeBoundsTree !== 'function' || typeof acceleratedRaycast !== 'function') {
    throw new Error('Invalid three-mesh-bvh module');
  }
  // One tree per shared geometry — not one tree per block. The tree uses local
  // coordinates; individual object world transforms are applied by raycasting.
  geometry.computeBoundsTree = computeBoundsTree;
  geometry.disposeBoundsTree = disposeBoundsTree;
  try {
    geometry.computeBoundsTree({strategy: SAH, maxLeafTris: 12});
    if (!geometry.boundsTree) throw new Error('BVH builder returned no tree');
    // Instance-only override: pet mascot, VRM skinned meshes and Rapier props
    // keep their standard raycast method and their existing animations.
    for (const mesh of meshes) mesh.raycast = acceleratedRaycast;
    raycaster.firstHitOnly = true;
    onState?.('PICKING · BVH');
    return {
      enabled: true,
      triangleCount: geometry.index ? geometry.index.count / 3 : geometry.attributes.position.count / 3,
      dispose() {
        for (const mesh of meshes) delete mesh.raycast;
        if (geometry.boundsTree) geometry.disposeBoundsTree();
        delete geometry.computeBoundsTree;
        delete geometry.disposeBoundsTree;
        raycaster.firstHitOnly = false;
        onState?.('PICKING · STANDARD');
      }
    };
  } catch (error) {
    for (const mesh of meshes) delete mesh.raycast;
    if (geometry.boundsTree) geometry.disposeBoundsTree();
    delete geometry.computeBoundsTree;
    delete geometry.disposeBoundsTree;
    raycaster.firstHitOnly = false;
    throw error;
  }
}
