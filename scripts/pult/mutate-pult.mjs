import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
const verify = join(root, 'scripts/pult/verify-pult.mjs');
const page = readFileSync(join(root, 'meta-games/pult/index.html'), 'utf8');
const finish = readFileSync(join(root, 'rules/09-platforma/FINISH.md'), 'utf8');
const snapshot = /<script id="pult-data" type="application\/json">([\s\S]*?)<\/script>/;
const match = snapshot.exec(page);
assert.ok(match, 'Generated pult metadata missing');
const baseline = JSON.parse(match[1]);
const run = args => spawnSync(process.execPath, [verify, ...args], { cwd: root, encoding: 'utf8', timeout: 180000 });
const first = run([]);
assert.equal(first.status, 0, 'Baseline verify must pass before mutation:\n' + first.stdout + first.stderr);

function replaceMetadata(html, metadata) {
  assert.match(html, snapshot);
  return html.replace(snapshot, '<script id="pult-data" type="application/json">' +
    JSON.stringify(metadata).replace(/</g, '\\u003c') + '</script>');
}
function injectedCard(html, card) {
  const marker = '<div class="play-grid">';
  assert.ok(html.includes(marker), 'Game grid not found');
  const extra = '<article class="play-card" data-game-path="' + card.path + '" data-kind="' + card.kind + '">' +
    '<div class="play-inner"><h3>' + card.title + '</h3><a class="go" data-play="1" href="' + card.url +
    '">Играть</a></div></article>';
  return html.replace(marker, marker + extra);
}
function shouldFail(name, pageSource, expected, rootOverride) {
  const dir = mkdtempSync(join(tmpdir(), 'owner-pult-mutant-'));
  try {
    const mutant = join(dir, 'mutant.html');
    writeFileSync(mutant, pageSource);
    const args = ['--page', mutant, ...(rootOverride ? ['--root', rootOverride] : [])];
    const result = run(args);
    assert.equal(result.status, 1, 'Mutation was NOT caught: ' + name + '\n' + result.stdout + result.stderr);
    assert.ok(result.stderr.includes(expected), 'Mutation failed for wrong reason: ' + name + '\n' + result.stderr);
    console.log('PULT_MUTATION_CAUGHT ' + name);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

// 1. Hardcoded readiness: an unchanged page must be rejected if the actual FINISH source changes.
{
  const dir = mkdtempSync(join(tmpdir(), 'owner-pult-finish-'));
  try {
    const target = join(dir, 'rules/09-platforma');
    mkdirSync(target, { recursive: true });
    const changed = finish.replace(/^\| M1 \|.*$/m, line => line.replace('ЗЕЛЁНАЯ', 'НЕТ'));
    assert.notEqual(changed, finish, 'Cannot flip current finish status');
    writeFileSync(join(target, 'FINISH.md'), changed);
    writeFileSync(join(target, 'FINISH_2.md'), readFileSync(join(root, 'rules/09-platforma/FINISH_2.md'), 'utf8'));
    mkdirSync(join(dir, 'meta-games'), { recursive: true });
    writeFileSync(join(dir, 'meta-games/index.html'), readFileSync(join(root, 'meta-games/index.html'), 'utf8'));
    shouldFail('hardcoded-finish-count', page, 'Visible stage 1 number differs from FINISH', dir);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

// 2. A playable game absent from the real storefront must never be shown.
{
  const bad = { path: 'games/ghost-' + randomUUID().slice(0, 8), kind: 'main', title: 'Призрачный мир',
    url: '../../games/nonexistent/' , branch: null };
  const fake = replaceMetadata(injectedCard(page, bad), { ...baseline, games: [bad, ...baseline.games] });
  shouldFail('game-outside-storefront', fake, 'Game not in storefront');
}

// 3. DECEPTION: a correctly shaped branch preview URL is not proof of HTTP 200.
{
  const storefront = readFileSync(join(root, 'meta-games/index.html'), 'utf8');
  const firstGame = /<a class="game" href="\.\.\/([^"]+)"[^>]*>[\s\S]*?<h3>([^<]+)<\/h3>/.exec(storefront);
  assert.ok(firstGame, 'Need a real storefront game to fake its preview');
  const branch = 'lab/ghost-preview-' + randomUUID().slice(0, 8);
  const url = 'https://mpaykin1.github.io/meta6-lab/preview/' + branch.slice(4) + '/' + firstGame[1];
  const bad = { path: firstGame[1].replace(/\/$/, ''), kind: 'preview', title: firstGame[2], url, branch };
  const fake = replaceMetadata(injectedCard(page, bad), { ...baseline, games: [bad, ...baseline.games] });
  shouldFail('deceptive-preview-404', fake, 'Play link is not HTTP 200');
}
console.log('PULT_MUTATION_PASS three independent defects rejected');
