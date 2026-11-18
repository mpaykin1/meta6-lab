// Adversarial mutations for BEZ PATTERNOV. Every poisoned fixture must be rejected.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
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
    name: 'instanced-tree-grid-with-no-variation',
    source: 'for(let i=0;i<64;i++){const col=i%8;const row=Math.floor(i/8);' +
      'dummy.position.set(col*3,0,row*3);dummy.updateMatrix();' +
      'forest.setMatrixAt(i,dummy.matrix);}',
    mustReport: 'INSTANCE_GRID'
  },
  {
    name: 'instanced-matrix-translation-grid',
    source: 'for(let i=0;i<100;i++){' +
      'dummy.matrix.makeTranslation((i%10)*4,0,Math.floor(i/10)*4);' +
      'forest.setMatrixAt(i,dummy.matrix);}',
    mustReport: 'INSTANCE_GRID'
  },
  {
    // Deception: comment promises seeded variation but matrices remain identical.
    name: 'instanced-grid-hash-in-comment-only',
    source: 'for(let i=0;i<64;i++){/* hash(i) gives variation */' +
      'dummy.position.set((i%8)*3,0,Math.floor(i/8)*3);' +
      'dummy.updateMatrix();forest.setMatrixAt(i,dummy.matrix);}',
    mustReport: 'INSTANCE_GRID'
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

const irregularInstances = 'for(let i=0;i<64;i++){' +
  'dummy.position.set((i%8)*3+jitter(seed,i),0,Math.floor(i/8)*3);' +
  'dummy.updateMatrix();forest.setMatrixAt(i,dummy.matrix);}';
assert.deepEqual(detectNoPatterns(irregularInstances, 'seeded-instanced-forest'), []);
const rotatedInstances = 'for(let i=0;i<64;i++){' +
  'dummy.position.set((i%8)*3,0,Math.floor(i/8)*3);' +
  'dummy.rotation.y=hash(seed+i)*6.28;dummy.updateMatrix();' +
  'forest.setMatrixAt(i,dummy.matrix);}';
assert.deepEqual(detectNoPatterns(rotatedInstances, 'seeded-instanced-rotation'), []);

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


// Chromium capture folders are intentionally dot-prefixed. GitHub's artifact
// uploader ignores such folders unless include-hidden-files is explicitly true.
// Permanent traps prevent a green capture job from discarding all screenshots.
function capturesAreUploaded(yaml) {
  const start = yaml.indexOf('      - name: Preserve visual comparisons');
  if (start < 0) return false;
  const next = yaml.indexOf('\n      - name:', start + 7);
  const block = yaml.slice(start, next < 0 ? undefined : next)
    .replace(/^\s*#.*$/gm, '');
  return /uses:\s*actions\/upload-artifact@v4/.test(block) &&
    /^\s*include-hidden-files:\s*true\s*$/m.test(block) &&
    /^\s*\.pattern-before\/\s*$/m.test(block) &&
    /^\s*\.pattern-after\/\s*$/m.test(block) &&
    /^\s*\.pattern-fft\.json\s*$/m.test(block);
}
const artifactWorkflow = readFileSync(
  new URL('../../.github/workflows/bez-patternov.yml', import.meta.url),
  'utf8'
);
assert.ok(capturesAreUploaded(artifactWorkflow),
  'Screenshots and FFT must be uploaded, even from hidden .pattern-* paths');
const hiddenUploadMutations = [
  artifactWorkflow.replace('include-hidden-files: true', 'include-hidden-files: false'),
  artifactWorkflow.replace('include-hidden-files: true', '# include-hidden-files: true'),
  artifactWorkflow.replace('.pattern-before/', '# .pattern-before/'),
  artifactWorkflow.replace('\n            .pattern-fft.json', '\n            # .pattern-fft.json')
];
for (const [i, mutant] of hiddenUploadMutations.entries()) {
  assert.ok(!capturesAreUploaded(mutant),
    'Artifact-upload mutation ' + (i + 1) + ' bypassed the screenshot preservation guard');
}
console.log('ARTIFACT UPLOAD MUTATIONS PASS: 4 broken upload configurations rejected');


// A probe stored only in PR HEAD cannot be served from the original main worktree.
// Both versions must use the same fixture, while loading different shader files.
function baselineProbeIsCopied(yaml) {
  const start = yaml.indexOf('      - name: Capture original INK on exact PR base');
  if (start < 0) return false;
  const end = yaml.indexOf('\n      - name:', start + 7);
  const block = yaml.slice(start, end < 0 ? undefined : end)
    .replace(/^\s*#.*$/gm, '');
  return block.includes('git worktree add --detach') &&
    block.includes('mkdir -p "$RUNNER_TEMP/no-pattern-base/scripts/visual"') &&
    block.includes('cp scripts/visual/ink-pattern-probe.html ' +
                   '"$RUNNER_TEMP/no-pattern-base/scripts/visual/"');
}
assert.ok(baselineProbeIsCopied(artifactWorkflow),
  'Original INK base must receive the same shader-probe fixture');
const copyStep='cp scripts/visual/ink-pattern-probe.html ' +
  '"$RUNNER_TEMP/no-pattern-base/scripts/visual/"';
const baselineProbeMutations = [
  artifactWorkflow.replace(copyStep, '# ' + copyStep),
  artifactWorkflow.replace(copyStep,
    'cp scripts/visual/not-a-real-probe.html ' +
    '"$RUNNER_TEMP/no-pattern-base/scripts/visual/"'),
  artifactWorkflow.replace('mkdir -p "$RUNNER_TEMP/no-pattern-base/scripts/visual"',
    '# mkdir -p "$RUNNER_TEMP/no-pattern-base/scripts/visual"')
];
for (const [i, mutant] of baselineProbeMutations.entries()) {
  assert.ok(!baselineProbeIsCopied(mutant),
    'Original baseline probe mutation ' + (i + 1) + ' was not rejected');
}
console.log('ORIGINAL INK PROBE MUTATIONS PASS: 3 broken fixtures rejected');


// The real renderer's small objects may show less than one sinusoidal period.
// Never lose the wide material probe or accidentally apply the old-negative
// threshold to the small scene in place of the actual periodic shader.
const captureSource = readFileSync(
  new URL('./capture-pattern-frames.mjs', import.meta.url), 'utf8'
);
const fftSource = readFileSync(
  new URL('./measure-pattern-fft.py', import.meta.url), 'utf8'
);
function preservesBroadSpectrumControl(capture, fft) {
  const src = capture.replace(/^\s*\/\/.*$/gm, '');
  const judge = fft.replace(/^\s*#.*$/gm, '');
  return src.includes("if (target === 'ink') games = [ink, inkProbe];") &&
    src.includes("else if (target === 'all') games = [...gameTargets(), ink, inkProbe];") &&
    src.includes('games.push(ink, inkProbe)') &&
    src.includes("game.id === 'ink-shader-probe'") &&
    judge.includes('if name == "ink-shader-probe":') &&
    judge.includes('if previous < CUTOFF:') &&
    judge.includes('if current >= previous * .85:') &&
    judge.includes('if "ink" in after and "ink-shader-probe" not in after:');
}
assert.ok(preservesBroadSpectrumControl(captureSource, fftSource),
  'INK old-negative calibration must use 3 shader-wide GPU views');
const wideProbeMutations = [
  [
    captureSource.replace("if (target === 'ink') games = [ink, inkProbe];",
      "if (target === 'ink') games = [ink];"),
    fftSource
  ],
  [
    captureSource.replace('games.push(ink, inkProbe)', 'games.push(ink)'),
    fftSource
  ],
  [
    captureSource,
    fftSource.replace('if name == "ink-shader-probe":', 'if name == "ink":')
  ],
  [
    captureSource,
    fftSource.replace('if "ink" in after and "ink-shader-probe" not in after:',
      'if "ink" in after and "ink" not in after:')
  ]
];
for (const [i, [capture, fft]] of wideProbeMutations.entries()) {
  assert.ok(!preservesBroadSpectrumControl(capture, fft),
    'Wide-probe mutation ' + (i + 1) + ' evaded detection');
}
console.log('WIDE INK SHADER PROBE MUTATIONS PASS: 4 baseline deceptions caught');
