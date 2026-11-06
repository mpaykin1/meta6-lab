import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createAshFactory } from '../ash-assets.mjs';

class Vector3 {
  constructor(x = 0, y = 0, z = 0) { Object.assign(this, { x, y, z }); }
  normalize() {
    const length = Math.hypot(this.x, this.y, this.z) || 1;
    this.x /= length; this.y /= length; this.z /= length;
    return this;
  }
}
class Vector4 {
  constructor(x = 0, y = 0, z = 0, w = 0) { Object.assign(this, { x, y, z, w }); }
}

function staticMetrics(definition) {
  const palette = new Set();
  let voxels = 0;
  let exposedFaces = 0;
  const neighbors = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];

  for (const { grid } of definition.parts) {
    voxels += grid.count();
    for (let z = grid.z0; z <= grid.z1; z++) {
      for (let y = grid.y0; y <= grid.y1; y++) {
        for (let x = grid.x0; x <= grid.x1; x++) {
          const color = grid.get(x, y, z);
          if (!color) continue;
          palette.add(color);
          for (const [dx, dy, dz] of neighbors) {
            if (!grid.get(x + dx, y + dy, z + dz)) exposedFaces++;
          }
        }
      }
    }
  }

  return {
    parts: definition.parts.length,
    voxels,
    paletteColors: palette.size,
    triangles: exposedFaces * 2,
    drawCalls: definition.parts.length
  };
}

test('original Ash scavenger reference metrics stay reproducible', async () => {
  const THREE = { Vector3, Vector4 };
  const factory = createAshFactory(THREE);
  const scavenger = factory.models.find(model => model.id === 'scavenger');
  assert.ok(scavenger, 'original scavenger definition is present');

  assert.deepEqual(staticMetrics(scavenger), {
    parts: 8,
    voxels: 525,
    paletteColors: 14,
    triangles: 1672,
    drawCalls: 8
  });

  const source = await readFile(new URL('../ash-assets.mjs', import.meta.url));
  assert.equal(source.byteLength, 62011);
});
