import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('./claim.mjs', import.meta.url), 'utf8');
const old = '2026-11-11T10:00:00Z';
const nowMs = Date.parse('2026-11-11T14:30:00Z');
const pr = files => ({ number: 210, url: 'https://github.com/mpaykin1/meta6-lab/pull/210',
  repo: 'mpaykin1/meta6-lab', branch: 'lab/skin-factory', files });
const setup = (game = 'games/skin-trainer') => ({
  game, branch: 'lab/uluchshatel-preflight', prs: [], lastCommitAt: old, locks: [], nowMs
});
const expr = 'if (pr.files.some(path => overlaps(path, game))) {';
const mutants = [
  ['ignores-PR', expr, 'if (false) {', {
    ...setup(), prs: [pr(['games/skin-trainer/index.html'])]
  }],
  ['ignores-recent-commit', 'if (ageMinutes < 60) {', 'if (false) {', {
    ...setup(), lastCommitAt: '2026-11-11T14:20:00Z'
  }],
  ['ignores-lock', 'if (lock.game === game && !lock.free && lock.branch !== branch) {',
    'if (false) {', {
      ...setup(), locks: [{ game: 'games/skin-trainer', branch: 'lab/skin-factory', free: false }]
    }],
  ['hardcoded-game-cheat', expr,
    "if (pr.files.some(path => overlaps(path, 'games/skin-trainer'))) {", {
      ...setup('games/veil-terraces'), prs: [pr(['games/veil-terraces/index.html'])]
    }]
];
for (const [name, original, replacement, scenario] of mutants) {
  assert.ok(source.includes(original), 'mutation target missing: ' + name);
  const changed = source.replace(original, replacement);
  const uri = 'data:text/javascript;charset=utf-8,' + encodeURIComponent(changed);
  const { blockersFor } = await import(uri);
  assert.equal(blockersFor(scenario).length, 0, 'mutant survived: ' + name);
  console.log('caught:', name);
}
console.log('mutate-preflight: 4/4 mutants detected by the blocking contract');
