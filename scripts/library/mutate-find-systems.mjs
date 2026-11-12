import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {fileURLToPath} from 'node:url';
import {rankSystems} from './find-systems.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const example = (game, name, purpose, id) => ({
  kind: 'solution', game, id, name, purpose, sha256: 'a'.repeat(64),
  source_path: 'games/' + game + '/index.html', lines: [10, 20],
});
const data = {
  games: ['island-a', 'island-b', 'broken-city-copy', 'skin-trainer', 'rain-world', 'sandbox']
    .map(game => ({game})),
  entries: [
    example('island-a', 'followCamera', ['camera'], 'cam1'),
    example('island-b', 'orbitCamera', ['camera'], 'cam2'),
    example('broken-city-copy', 'copyCamera', ['camera'], 'bad-copy'),
    example('skin-trainer', 'trainingCamera', ['camera'], 'bad-training'),
    example('rain-world', 'makeFog', ['weather'], 'fog'),
    example('sandbox', 'spawnItem', ['gameplay'], 'other'),
  ],
};

function verify(find) {
  const camera = find(data, 'нужна камера от третьего лица', {
    repositoryUrl: 'https://github.com/example/source',
  });
  assert.equal(camera.total, 2, 'camera discovery must span two independent games');
  assert.deepEqual(new Set(camera.results.map(row => row.game)),
    new Set(['island-a', 'island-b']));
  assert.ok(camera.results.every(row => row.verification === 'source_only'));
  assert.ok(camera.results.every(row => row.source_link ===
    'https://github.com/example/source/blob/main/' +
      row.source_path + '#L10-L20'));
  const weather = find(data, 'погодный туман');
  assert.equal(weather.total, 1, 'weather intent must not be hardcoded as camera');
  assert.equal(weather.results[0].id, 'fog');
  assert.throws(() => find(data, ''), /intent/);
  assert.throws(() => find(data, 'камера', {limit: 101}), /limit/);
  assert.throws(() => find(data, 'камера', {repositoryUrl: 'javascript:bad'}), /repository/);
}

export async function verifyFindSystemsAndMutations() {
  verify(rankSystems);
  const source = fs.readFileSync(path.join(HERE, 'find-systems.mjs'), 'utf8');
  const mutants = [
    ['drop-solution-filter', s => s.replace("entry.kind !== 'solution'",
      "entry.kind === 'solution'")],
    ['deception-admit-duplicates', s => s
      .replace('excludes(entry.game, excluded)', 'false')
      .replace('!excludes(game.game, excluded)', 'true')],
    ['accept-unrelated-systems', s => s.replace('if (score <= 0) return null;',
      'if (false) return null;')],
    ['deception-hardcode-camera-intent', s => s.replace(
      'INTENTS.filter(intent => intent.match.test(query))',
      "INTENTS.filter(intent => intent.tag === 'camera')")],
    ['deception-fake-verified-state', s => s.replace(
      "verification: 'source_only'", "verification: 'passed'")],
  ];
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'meta-library-systems-'));
  try {
    for (const [name, change] of mutants) {
      const mutated = change(source);
      assert.notEqual(mutated, source, 'mutation anchor missing: ' + name);
      const filename = path.join(tmp, name + '.mjs');
      fs.writeFileSync(filename, mutated);
      let caught = false;
      try {
        const module = await import(pathToFileURL(filename).href);
        verify(module.rankSystems);
      } catch (error) {
        if (error instanceof assert.AssertionError || error.message?.includes('intent') ||
            error.message?.includes('limit') || error.message?.includes('repository')) {
          caught = true;
        } else throw error;
      }
      if (!caught) throw Error('SYSTEM SEARCH MUTATION ESCAPED: ' + name);
    }
  } finally {
    fs.rmSync(tmp, {recursive: true, force: true});
  }
  return mutants.length;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  verifyFindSystemsAndMutations().then(
    count => console.log('SYSTEM DISCOVERY PASS; mutations caught ' + count + '/' + count),
    error => { console.error(error.stack); process.exitCode = 1; },
  );
}
