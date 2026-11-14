// Exercise the real STATUS consumer offline; do not infer readiness from progress.json.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const source = fs.readFileSync(new URL('./build.mjs', import.meta.url), 'utf8');
const first = fs.readFileSync(new URL('../../rules/09-platforma/FINISH.md', import.meta.url), 'utf8');
const second = fs.readFileSync(new URL('../../rules/09-platforma/FINISH_2.md', import.meta.url), 'utf8');
const ids = [...first.matchAll(/^\|\s*([MBLP]\d+)\s*\|/gm)].map(match => match[1]);
assert.equal(ids.length, 18);
const link = 'https://github.com/mpaykin1/meta6-lab/actions/runs/123';
const table = status => ids.map(id => `| ${id} | check | verify | ${status} |`).join('\n');
const green = table(`ЗЕЛЁНАЯ — [прогон](${link})`);
const waiting = table('НЕТ');
const passed = { id: 123, head_branch: 'main', event: 'push', status: 'completed', conclusion: 'success' };

async function integration(module) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'status-finish-'));
  const previousDirectory = process.cwd();
  const previousFetch = globalThis.fetch;
  try {
    process.chdir(directory);
    fs.mkdirSync('rules/09-platforma', { recursive: true });
    fs.mkdirSync('meta-games');
    fs.writeFileSync('meta-games/index.html', '');
    fs.writeFileSync('rules/09-platforma/FINISH_2.md', second);
    globalThis.fetch = async input => {
      const url = String(input);
      let body = {};
      if (url.includes('/branches/main')) body = { commit: { sha: 'a'.repeat(40) } };
      else if (url.includes('/actions/runs/123')) body = passed;
      else if (url.includes('/actions/')) body = { workflow_runs: [] };
      else if (url.includes('/contents/games') || url.includes('/pulls?')) body = [];
      return { ok: true, json: async () => body };
    };
    for (const [document, readyCount] of [[waiting, 0], [green, 18]]) {
      fs.writeFileSync('rules/09-platforma/FINISH.md', document);
      // Deliberately use the real producer's schema, with unrelated percentages.
      fs.writeFileSync('progress.json', JSON.stringify({ parts: { MCP: { percent: 100 } } }));
      await module.build();
      const output = JSON.parse(fs.readFileSync('automation/status.json', 'utf8'));
      assert.equal(output.finish.ready.length, readyCount, 'actual build reads the wrong producer');
      const markdown = fs.readFileSync('automation/STATUS.md', 'utf8');
      assert.ok(Buffer.byteLength(markdown) <= 8192);
      assert.ok(markdown.split('\n').length <= 150);
    }
  } finally {
    globalThis.fetch = previousFetch;
    process.chdir(previousDirectory);
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

async function suite(candidate) {
  const module = await import('data:text/javascript;base64,' + Buffer.from(candidate).toString('base64'));
  assert.equal(await module.finishSummary(null, second), 'нет данных');
  assert.equal(await module.finishSummary('', second), 'нет данных');
  assert.equal(await module.finishSummary(green + '\n' + green, second), 'нет данных');
  const unready = await module.finishSummary(waiting, null, () => { throw Error('must not fetch'); });
  assert.equal(unready.ready.length, 0);
  assert.equal(unready.pending.length, 18, 'stage two leaked before first-stage completion');
  assert.ok(unready.pending.every(row => row.value === 'не готов'));
  const noLink = await module.finishSummary(table('ЗЕЛЁНАЯ'), second, async () => passed);
  assert.equal(noLink.ready.length, 0);
  const foreign = await module.finishSummary(green.replaceAll('mpaykin1/meta6-lab', 'other/repo'), second,
    async () => passed);
  assert.equal(foreign.ready.length, 0, 'foreign evidence accepted');
  let calls = 0;
  const result = await module.finishSummary(green, second, async path => {
    assert.equal(path, '/repos/mpaykin1/meta6-lab/actions/runs/123');
    calls++;
    return passed;
  });
  assert.equal(calls, 1, 'same run fetched more than once');
  assert.deepEqual(result.ready, ids);
  assert.equal(result.proofs[ids[0]], link);
  assert.equal(result.pending.length, 10);
  const historical = { ...passed, event: 'pull_request', head_branch: 'lab/accepted', workflow_id: 42 };
  const latest = { ...passed, id: 456, workflow_id: 42 };
  const callsByPath = [];
  const fromMain = await module.finishSummary(green, second, async path => {
    callsByPath.push(path);
    return path.includes('/workflows/') ? { workflow_runs: [latest] } : historical;
  });
  assert.deepEqual(fromMain.ready, ids);
  assert.equal(fromMain.proofs[ids[0]], link.replace('/123', '/456'));
  assert.equal(callsByPath.length, 2, 'shared historical and main evidence must be cached');
  assert.equal(callsByPath[1],
    '/repos/mpaykin1/meta6-lab/actions/workflows/42/runs?branch=main&status=completed&per_page=1');
  for (const batch of [[], [{ ...latest, conclusion: 'failure' }],
    [{ ...latest, head_branch: 'lab/other' }], [{ ...latest, workflow_id: 99 }]]) {
    const rejected = await module.finishSummary(green, second, async path =>
      path.includes('/workflows/') ? { workflow_runs: batch } : historical);
    assert.equal(rejected.ready.length, 0, 'unrelated or failed main workflow accepted');
  }
  for (const changes of [
    { head_branch: 'lab/candidate' }, { event: 'pull_request' }, { id: 999 },
    { status: 'in_progress' }, { conclusion: 'failure' }, { conclusion: 'cancelled' },
    { conclusion: 'skipped' }, { conclusion: null }
  ]) {
    const invalid = await module.finishSummary(green, second, async () => ({ ...passed, ...changes }));
    assert.equal(invalid.ready.length, 0, 'false green: ' + JSON.stringify(changes));
    assert.equal(invalid.pending.length, 18);
    assert.ok(invalid.pending.every(row => row.reason.includes(link)));
  }
  const offline = await module.finishSummary(green, second, async () => { throw Error('GitHub 403'); });
  assert.equal(offline.ready.length, 0);
  assert.ok(offline.pending.every(row => row.reason.includes('GitHub недоступен')));
  const stageTwo = `| Л1 | lore | ЗЕЛЁНАЯ — [прогон](${link}) | — |`;
  assert.equal((await module.finishSummary(green, stageTwo, async () => passed)).ready.length, 19);
  await integration(module);
}

await suite(source);
console.log('FINISH_SUMMARY_PASS: real consumer, main evidence, API failure, stage gating and deduplication');
const mutations = [
  ['branch ignored', "run.head_branch === 'main'", 'true'],
  ['failed run accepted', "run.conclusion === 'success'", 'true'],
  ['foreign-link deception', 'evidence?.repo !== LAB', '!evidence'],
  ['wrong run identity', 'String(run?.id) === evidence.run', 'true'],
  ['progress schema deception', "read('rules/09-platforma/FINISH.md'), read('rules/09-platforma/FINISH_2.md')",
    "json('progress.json')"],
  ['stage two premature', 'if (!pending.length) {', 'if (true) {'],
  ['unrelated green workflow deception', 'run?.workflow_id === workflow', 'true']
];
for (const [name, from, to] of mutations) {
  assert.ok(source.includes(from), 'mutation anchor missing: ' + name);
  let caught = false;
  try { await suite(source.replace(from, to)); } catch { caught = true; }
  assert.ok(caught, 'mutation survived: ' + name);
  console.log('FINISH_SUMMARY_MUTATION_CAUGHT ' + name);
}
