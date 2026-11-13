// Adversarial mutations for BEZ PATTERNOV. Every poisoned fixture must be rejected.
import assert from 'node:assert/strict';
import {detectNoPatterns} from './verify-no-patterns.mjs';

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
console.log('BEZ_PATTERNOV MUTATIONS PASS (' + mutants.length + ' catches; clean 0)');
