// Run on Node without fetching Three.js: assert the read-only geometry contract.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./three-master.js', import.meta.url), 'utf8');
async function load(src) {
  const data = 'data:text/javascript;base64,' + Buffer.from(src).toString('base64');
  return (await import(data)).inspectObject3D;
}
function vector(x, y, z) {
  return { x, y, z, distanceToSquared(v) {
    return (x - v.x) ** 2 + (y - v.y) ** 2 + (z - v.z) ** 2;
  } };
}
function attribute(values) {
  return { count: values.length, getX: i => values[i][0],
    getY: i => values[i][1], getZ: i => values[i][2] || 0 };
}
function fixture(vertices, indices, options = {}) {
  const a = vertices.map(p => [...p]);
  const geo = {
    index: { count: indices.length, getX: i => indices[i] },
    groups: [], boundingBox: null,
    getAttribute(name) {
      if (name === 'position') return attribute(a);
      if (name === 'normal' && options.normals) return attribute(options.normals);
      return null;
    },
    computeBoundingBox() {
      const min = [0, 1, 2].map(j => Math.min(...a.map(v => v[j])));
      const max = [0, 1, 2].map(j => Math.max(...a.map(v => v[j])));
      this.boundingBox = { min: vector(...min), max: vector(...max), isEmpty: () => false };
    }
  };
  const t = options.yaw || 0, c = Math.cos(t), s = Math.sin(t);
  const mesh = {
    isMesh: true, isInstancedMesh: false, name: 'model', userData: {},
    scale: { x: 1, y: 1, z: 1 }, geometry: geo,
    material: { roughness: .8, metalness: 0, opacity: 1 },
    matrixWorld: { elements: [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1] }
  };
  return { updateMatrixWorld() {}, traverse(fn) { fn(mesh); }, userData: {} };
}
const plane = [[-1, 0, 0], [1, 0, 0], [1, 2, 0], [-1, 2, 0]];
const squareIndices = [0, 1, 2, 0, 2, 3];
const cube = [[-1, 0, -1], [1, 0, -1], [1, 2, -1], [-1, 2, -1],
  [-1, 0, 1], [1, 0, 1], [1, 2, 1], [-1, 2, 1]];
const cubeIndices = [0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7,
  0, 1, 5, 0, 5, 4, 3, 7, 6, 3, 6, 2,
  0, 4, 7, 0, 7, 3, 1, 2, 6, 1, 6, 5];
const flipped = Array.from({ length: 8 }, () =>
  [[0, 0, 0], [1, 0, 0], [0, 1, 0]]).flat();
const flippedNormals = Array.from({ length: 24 }, () => [0, 0, -1]);
const ruleId = result => new Set(result.findings.map(i => i.id));

function expectations(inspect) {
  assert(ruleId(inspect(fixture(plane, squareIndices, { yaw: Math.PI / 4 }),
    { role: 'character' })).has('Q17'), 'rotated cardboard must fail');
  assert(!ruleId(inspect(fixture(cube, cubeIndices, { yaw: Math.PI / 4 }),
    { role: 'character' })).has('Q17'), 'solid cube must pass');
  assert(ruleId(inspect(fixture(plane, [0, 1, 99]),
    { role: 'prop' })).has('Q04'), 'out-of-range indices must fail');
  assert(ruleId(inspect(fixture(flipped, [...Array(24).keys()],
    { normals: flippedNormals }), { role: 'prop' })).has('Q06'),
    'reversed normals must be found');
}
expectations(await load(source));

// Three independent mutants prove the new rules cannot silently be disabled.
for (const [needle, replacement] of [
  ['flatness < .065', 'flatness < -1'],
  ["if (invalid) add('Q04'", "if (false) add('Q04'"],
  ['if (inverted > Math.max(3, count * .02))', 'if (false)']
]) {
  assert(source.includes(needle), 'mutation target missing: ' + needle);
  let detected = false;
  try {
    expectations(await load(source.replace(needle, replacement)));
  } catch (error) {
    if (error.code !== 'ERR_ASSERTION') throw error;
    detected = true;
  }
  assert(detected, 'mutant escaped: ' + needle);
}
console.log('3D Master: geometry and adversarial checks passed.');
