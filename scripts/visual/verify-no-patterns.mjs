// BEZ PATTERNOV: reject obvious repeating pigment waves, tile grids and cloned object grids.
// Run: node scripts/visual/verify-no-patterns.mjs --changed | --all | path...
import {readFileSync, existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const codeSuffix = /\.(?:js|mjs|cjs|ts|tsx|glsl|vert|frag|html)$/i;
// Include every playable root-level world linked in the live catalog, not only games/.
// For example, ashen-sumerek/ and underwater-world/ would otherwise evade the guard.
const gameRoots = new Set(['games', 'demos', 'meta-games', 'reference', 'shared', 'ink']);
const catalog = readFileSync(resolve(root, 'meta-games/index.html'), 'utf8');
for (const [anchor] of catalog.matchAll(/<a\b[^>]*>/gi)) {
  const klass = /\bclass\s*=\s*["']([^"']+)["']/i.exec(anchor)?.[1] || '';
  if (!klass.split(/\s+/).includes('game')) continue;
  const href = /\bhref\s*=\s*["']([^"']+)["']/i.exec(anchor)?.[1] || '';
  const match = /^\.\.\/([a-z0-9_-]+)\//i.exec(href);
  if (match) gameRoots.add(match[1]);
}
export const isGameSourceFile = name =>
  codeSuffix.test(name) && gameRoots.has(name.split('/')[0]) && !ignored.test(name);
const ignored = /(?:^|\/)(?:node_modules|vendor|third_party|__tests__|tests)(?:\/|$)/;

function positionWaveMatches(source) {
  const sinDot = /\b(?:sin|cos)\s*\(\s*dot\s*\(\s*(?:v\w*World|worldPos|worldPosition|vPosition|vPos|position|vUv|uv)\s*,\s*vec[234]\s*\(\s*[-+.\d,\s]+\)\s*\)/g;
  const axisWave = /\b(?:sin|cos)\s*\(\s*(?:vUv|uv|position|vPosition|worldPos|worldPosition)(?:\.[xyzw]{1,3})?\s*\*\s*(?:\d|\.)/g;
  return [...source.matchAll(sinDot), ...source.matchAll(axisWave)].sort((a, b) => a.index - b.index);
}
function sourceLine(source, i) {
  return 1 + source.slice(0, i).split('\n').length - 1;
}
export function detectNoPatterns(source, filename = '<fixture>') {
  const problems = [];
  const report = (index, rule) => problems.push(filename + ':' + sourceLine(source, index) + ': ' + rule);
  const waves = positionWaveMatches(source);
  // Two+ fixed waves in the same shader/function is a known source of wallpaper interference.
  for (let i = 1; i < waves.length; i++) {
    if (waves[i].index - waves[i - 1].index > 2200) continue;
    const passage = source.slice(Math.max(0, waves[i - 1].index - 220), waves[i].index + 750);
    if (/(?:color|pigment|wash|grain|flow|density|alpha|opacity|blot|pattern|fragmentShader)/i.test(passage)) {
      report(waves[i].index, 'PERIODIC_PIGMENT: 2+ fixed spatial sin/cos waves');
      break;
    }
  }
  // set(), setScalar() and direct repeat.x/y assignments all create the same lattice.
  // A shared rotation or merely seeded angle cannot make a periodically tiled image unique.
  const tilePatterns = [
    {regex: /\b([A-Za-z_$][\w$]*)\.repeat\??\.set\??\.?\s*\(\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\s*\)/g, values: [2, 3]},
    {regex: /\b([A-Za-z_$][\w$]*)\.repeat\??\.setScalar\??\.?\s*\(\s*(\d*\.?\d+)\s*\)/g, values: [2]},
    {regex: /\b([A-Za-z_$][\w$]*)\.repeat\??\.([xy])\s*=\s*(\d*\.?\d+)\b/g, values: [3]},
    // Three.js Vector2 supports these alternatives to repeat.set()/setScalar().
    {regex: /\b([A-Za-z_$][\w$]*)\.repeat\??\.copy\??\.?\s*\(\s*new\s+(?:THREE\.)?Vector2\s*\(\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\s*\)\s*\)/g, values: [2, 3]},
    {regex: /\b([A-Za-z_$][\w$]*)\.repeat\??\.fromArray\??\.?\s*\(\s*\[\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\s*\]\s*\)/g, values: [2, 3]},
    {regex: /\b([A-Za-z_$][\w$]*)\.repeat\??\.multiplyScalar\??\.?\s*\(\s*(\d*\.?\d+)\s*\)/g, values: [2]}
  ];
  for (const {regex, values} of tilePatterns) {
    for (const m of source.matchAll(regex)) {
      if (Math.max(...values.map(index => +m[index])) <= 2) continue;
      const nearby = source.slice(Math.max(0, m.index - 250), m.index + 450);
      // Only executable macro-scale blending avoids rejection; comments do not count.
      const executable = nearby.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
      const macroBlend = /\b(?:stochasticTiling|triplanarBlend|macroVariation|macroNoise|tileBlend)\s*\(/.test(executable);
      if (!macroBlend) report(m.index, 'REPEATED_TILE: texture repeat > 2 with no macro variation');
    }
  }
  const gridPattern = /\bfor\s*\([^)]*\)[\s\S]{0,650}?\bclone\s*\([\s\S]{0,320}?(?:position\.set|translate[XYZ])\s*\([^;\n]*(?:Math\.floor\s*\(|%\s*\d+|row\s*\*|col\s*\*)/g;
  for (const m of source.matchAll(gridPattern)) {
    const nearby = source.slice(m.index, m.index + 1400);
    if (!/\b(?:random|hash|noise|jitter|seed|vary|variation)\s*\(/i.test(nearby)) {
      report(m.index, 'CLONE_GRID: repeated cloned objects without seeded variation');
    }
  }
  // InstancedMesh can bypass clone-grid checks: one geometry, hundreds of identical
  // transforms. Only a spatially regular layout without executable per-instance
  // variation is rejected. Ignore comment-only 'hash()' decoys.
  const instancedGrid = /\bfor\s*\([^)]*\)\s*\{?[\s\S]{0,1600}?\bsetMatrixAt\s*\(/g;
  for (const m of source.matchAll(instancedGrid)) {
    const setup = m[0].replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/[^\n]*/g, '');
    const regular = /\b(?:position\.set|makeTranslation)\s*\([^;\n]*(?:Math\.floor\s*\(|%\s*\d+|\b(?:row|col)\s*\*)/i;
    if (!regular.test(setup) || !/\bsetMatrixAt\s*\(/.test(setup)) continue;
    const variation = /\b(?:random|hash|noise|jitter|seededJitter|vary|variation)\s*\(/i;
    if (!variation.test(setup)) {
      report(m.index, 'INSTANCE_GRID: repeated InstancedMesh transforms without seeded variation');
    }
  }
  const monoNoise = /\b(?:float|vec3|const|let)\s+(?:blot|pigment|wash|colorNoise|pattern|patches)\s*=\s*(?:noise|snoise)\s*\(/g;
  for (const m of source.matchAll(monoNoise)) {
    const nearby = source.slice(Math.max(0, m.index - 700), m.index + 420);
    if (!/\b(?:fbm|warp|domainWarp|octave|multiScale)\b/i.test(nearby)) {
      report(m.index, 'SINGLE_SCALE: standalone one-octave visual noise');
    }
  }
  return problems;
}
function listFiles(args) {
  if (args.length && !args[0].startsWith('--')) return args;
  if (args.includes('--all')) return execFileSync('git', ['ls-files'], {cwd: root, encoding: 'utf8'}).split('\n');
  if (args.includes('--changed')) {
    const base = process.env.PATTERN_BASE || 'origin/main';
    return execFileSync('git', ['diff', '--name-only', '--diff-filter=ACMR', base + '...HEAD'], {
      cwd: root, encoding: 'utf8'
    }).split('\n');
  }
  throw Error('Specify --changed, --all, or paths');
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const files = listFiles(process.argv.slice(2)).filter(isGameSourceFile);
  let errors = [];
  for (const name of files) {
    const full = resolve(root, name);
    if (existsSync(full) && relative(root, full).startsWith('..') === false) {
      errors.push(...detectNoPatterns(readFileSync(full, 'utf8'), name));
    }
  }
  if (errors.length) {
    for (const error of errors) console.error('BEZ_PATTERNOV FAIL: ' + error);
    process.exitCode = 1;
  } else console.log('BEZ_PATTERNOV PASS: ' + files.length + ' files checked');
}
