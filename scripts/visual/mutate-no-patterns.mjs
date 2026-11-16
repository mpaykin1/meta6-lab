// Adversarial mutations for BEZ PATTERNOV. Every poisoned fixture must be rejected.
import assert from 'node:assert/strict';
import {detectNoPatterns, isGameSourceFile} from './verify-no-patterns.mjs';

const mutants = [
  {
    name: 'legacy-ink-sine-interference',
    source: 'float wcFlow1=sin(dot(vWcWorld,vec3(1.73,2.11,.87)));' +
      'float wcFlow2=sin(dot(vWcWorld,vec3(-2.37,.91,1.41)));' +
      'float wcFlow=(wcFlow1+wcFlow2)/2.; diffuseColor.rgb*=wcFlow;',
    mustReport: 'PERIODIC_PIGMENT'
  },
  {
    name: 'repeat-seven-wallpaper',
    source: 'const texture=new THREE.CanvasTexture(canvas);' +
      'texture.wrapS=texture.wrapT=THREE.RepeatWrapping;' +
      'texture.repeat?.set?.(7,7);',
    mustReport: 'REPEATED_TILE'
  },
  {
    name: 'uniform-rotation-still-tiled',
    source: 'const tex=new THREE.CanvasTexture(canvas);' +
      'tex.repeat?.set?.(7,7);tex.rotation=Math.PI/4;',
    mustReport: 'REPEATED_TILE'
  },
  {
    name: 'seeded-global-rotation-still-tiled',
    source: 'const tex=new THREE.CanvasTexture(canvas);' +
      'tex.repeat?.set?.(8,8);tex.rotation=hash(seed);',
    mustReport: 'REPEATED_TILE'
  },
  {
    // Deception: a macroVariation call mentioned only in a comment is not a blend.
    name: 'fake-macro-blend-in-comment',
    source: 'const tex=new THREE.CanvasTexture(canvas);' +
      'tex.repeat?.set?.(9,9);// macroVariation(tex,uv)',
    mustReport: 'REPEATED_TILE'
  },
  {
    name: 'repeat-set-scalar-seven',
    source: 'const tex=new THREE.CanvasTexture(canvas);tex.repeat.setScalar(7);',
    mustReport: 'REPEATED_TILE'
  },
  {
    name: 'repeat-optional-set-scalar',
    source: 'const tex=new THREE.CanvasTexture(canvas);tex.repeat?.setScalar?.(8);',
    mustReport: 'REPEATED_TILE'
  },
  {
    name: 'repeat-direct-one-axis',
    source: 'const tex=new THREE.CanvasTexture(canvas);' +
      'tex.repeat.x=7;tex.repeat.y=1;tex.rotation=hash(seed);',
    mustReport: 'REPEATED_TILE'
  },
  {
    name: 'repeat-copy-vector-two',
    source: 'const tex=new THREE.CanvasTexture(canvas);' +
      'tex.repeat.copy(new THREE.Vector2(7,8));',
    mustReport: 'REPEATED_TILE'
  },
  {
    name: 'repeat-from-array',
    source: 'const tex=new THREE.CanvasTexture(canvas);' +
      'tex.repeat?.fromArray?.([9,6]);',
    mustReport: 'REPEATED_TILE'
  },
  {
    // Deception: a seeded angle still leaves the repeated tiles identical.
    name: 'repeat-multiply-scalar-seeded-angle',
    source: 'const tex=new THREE.CanvasTexture(canvas);' +
      'tex.repeat.multiplyScalar(8);tex.rotation=hash(seed);' +
      '// macroVariation(tex,uv)',
    mustReport: 'REPEATED_TILE'
  },
  {
    // Deception: split the obvious visual expression into two intermediate aliases.
    name: 'alias-obfuscation',
    source: 'float aliasA=sin(uv.x*14.); float aliasB=cos(uv.y*19.);' +
      'float wash=aliasA*.7+aliasB*.3; diffuseColor.rgb=vec3(wash);',
    mustReport: 'PERIODIC_PIGMENT'
  },
  {
    name: 'identical-clone-grid',
    source: 'for(let i=0;i<64;i++){const tree=proto.clone();' +
      'tree.position.set((i%8)*3,0,Math.floor(i/8)*3);scene.add(tree);}',
    mustReport: 'CLONE_GRID'
  },
  {
    name: 'one-noise-octave',
    source: 'float pigment=noise(position*.2); diffuseColor.rgb*=pigment;',
    mustReport: 'SINGLE_SCALE'
  }
];
for (const mutant of mutants) {
  const actual = detectNoPatterns(mutant.source, mutant.name);
  assert.ok(actual.some(error => error.includes(mutant.mustReport)),
    'Undetected mutation: ' + mutant.name + ': ' + actual.join('; '));
  console.log('CAUGHT ' + mutant.name);
}
const clean = String.raw`float wcHash(vec3 p){return fract(p.x*13.);}
float wcNoise(vec3 p){return wcHash(p);}
float wcFbm(vec3 p){float s=wcNoise(p)*.57;s+=wcNoise(p*2.07)*.29;return s;}
float wcBloom=wcFbm(vWcWorld*.27+wcNoise(vWcWorld*.13));`;
assert.deepEqual(detectNoPatterns(clean, 'fixed-ink'), []);
const genuineMacroBlend = 'const tex=new THREE.CanvasTexture(canvas);' +
  'tex.repeat?.set?.(7,7);const color=macroVariation(tex,uv);';
assert.deepEqual(detectNoPatterns(genuineMacroBlend, 'stochastic-tiling'), []);
const scalarMacroBlend = 'const tex=new THREE.CanvasTexture(canvas);' +
  'tex.repeat.setScalar(7);const color=macroVariation(tex,uv);';
assert.deepEqual(detectNoPatterns(scalarMacroBlend, 'scalar-stochastic-tiling'), []);
const copyMacroBlend = 'const tex=new THREE.CanvasTexture(canvas);' +
  'tex.repeat.copy(new THREE.Vector2(7,7));const color=macroVariation(tex,uv);';
assert.deepEqual(detectNoPatterns(copyMacroBlend, 'copy-stochastic-tiling'), []);
const nonTiledAxis = 'const tex=new THREE.CanvasTexture(canvas);' +
  'tex.repeat.x=2;tex.repeat.y=1;';
assert.deepEqual(detectNoPatterns(nonTiledAxis, 'safe-tile-frequency'), []);

console.log('BEZ_PATTERNOV MUTATIONS PASS (' + mutants.length + ' catches; clean 0)');

const gameSourceMutants = [
  'ashen-sumerek/terrain.js',
  'underwater-world/underwater-runtime.js',
  'observer-world-en-v7/index.html',
  'three-worlds-game/index.html'
];
for (const file of gameSourceMutants) {
  assert.ok(isGameSourceFile(file), 'ROOT-CATALOG escaped pattern scan: ' + file);
}
for (const file of ['docs/ashen-sumerek/terrain.js', 'scripts/visual/scan.mjs',
  'underwater-world/vendor/legacy.js']) {
  assert.ok(!isGameSourceFile(file), 'ROOT-CATALOG scan scope contaminated: ' + file);
}
console.log('ROOT-CATALOG MUTATIONS PASS: 4 playable roots included; 3 exclusions');
