import * as T from 'three';

// Join static strokes by pigment properties and spatial cell. The input models remain the source.
export function batchInk(root, {exclude = new Set(), cellSize = 0} = {}) {
  root.updateWorldMatrix(true, true);
  const inverse = root.matrixWorld.clone().invert(), groups = new Map(), meshes = [];
  function collect(o) {
    if (exclude.has(o)) return;
    if (o.isMesh && !o.isInstancedMesh && !Array.isArray(o.material) && !o.material.map) meshes.push(o);
    else for (const child of o.children) collect(child);
  }
  collect(root);
  for (const o of meshes) {
    const mat = o.material;
    if (!mat.isMeshStandardMaterial && !mat.isMeshBasicMaterial) continue;
    const matrix = inverse.clone().multiply(o.matrixWorld);
    const center = new T.Vector3().setFromMatrixPosition(matrix);
    const cell = cellSize ? `${Math.floor(center.x / cellSize)},${Math.floor(center.z / cellSize)}` : '0';
    const key = [cell, mat.type, mat.opacity, mat.transparent, mat.side,
      mat.roughness, mat.metalness, o.userData.watercolorOutline !== false,
      !!o.userData.watercolorSkipWash].join('/');
    if (!groups.has(key)) groups.set(key, {positions: [], normals: [], colors: [], mat,
      outline: o.userData.watercolorOutline !== false, skip: !!o.userData.watercolorSkipWash});
    const bucket = groups.get(key);
    const geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    geo.applyMatrix4(matrix);
    const p = geo.getAttribute('position'), n = geo.getAttribute('normal');
    const color = geo.getAttribute('color');
    for (let i = 0; i < p.count; i++) {
      bucket.positions.push(p.getX(i), p.getY(i), p.getZ(i));
      bucket.normals.push(n?.getX(i) || 0, n?.getY(i) || 0, n?.getZ(i) || 0);
      bucket.colors.push(mat.color.r * (color ? color.getX(i) : 1),
        mat.color.g * (color ? color.getY(i) : 1), mat.color.b * (color ? color.getZ(i) : 1));
    }
    geo.dispose(); o.removeFromParent();
  }
  for (const b of groups.values()) {
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.Float32BufferAttribute(b.positions, 3));
    geo.setAttribute('normal', new T.Float32BufferAttribute(b.normals, 3));
    geo.setAttribute('color', new T.Float32BufferAttribute(b.colors, 3));
    geo.computeBoundingSphere();
    const material = b.mat.clone(); material.color.set('#ffffff'); material.vertexColors = true;
    const mesh = new T.Mesh(geo, material);
    mesh.name = 'ink-pigment-batch';
    mesh.userData.watercolorOutline = b.outline; mesh.userData.watercolorSkipWash = b.skip;
    root.add(mesh);
  }
}
