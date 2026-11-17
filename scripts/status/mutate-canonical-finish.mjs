// Mutations for the STATUS projection: FINISH verdict != availability of Actions API.
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('./build.mjs', import.meta.url), 'utf8');
const ids = [...fs.readFileSync(new URL('../../rules/09-platforma/FINISH.md', import.meta.url), 'utf8')
  .matchAll(/^\|\s*([MBLP]\d+)\s*\|/gm)].map(match => match[1]);
assert.equal(ids.length, 18);
const evidence = 'https://github.com/mpaykin1/meta6-lab/actions/runs/123';
const table = ids.map(id => `| ${id} | check | verify | ЗЕЛЁНАЯ — [прогон](${evidence}) |`).join('\n');
const apiError = { ready: [], pending: ids.map(id => ({
  id, value: 'не подтверждено', reason: 'GitHub недоступен: ' + evidence
})), proofs: {} };

async function suite(candidate) {
  const m = await import('data:text/javascript;base64,' + Buffer.from(candidate).toString('base64'));
  assert.equal(m.canonicalFinish('', apiError), 'нет данных');
  assert.equal(m.canonicalFinish(table + '\n' + table, apiError), 'нет данных');
  const result = m.canonicalFinish(table, apiError);
  assert.deepEqual(result.ready, ids, 'API outage must not rewrite FINISH acceptance');
  assert.equal(result.pending.length, 0);
  assert.equal(result.proofs[ids[0]], evidence);
  assert.equal(result.verification[ids[0]].value, 'нет данных');
  assert.match(result.verification[ids[0]].url, /^https:\/\/api\.github\.com\//);
  assert.match(result.verification[ids[0]].reason, /GitHub недоступен/);

  const withoutLink = m.canonicalFinish(table.replace(evidence, 'no-link'), apiError);
  assert.equal(withoutLink.ready.length, 17, 'missing evidence cannot be green');
  assert.equal(withoutLink.pending.length, 1);
  const foreign = m.canonicalFinish(table.replace(evidence, evidence.replace('mpaykin1/meta6-lab', 'other/repo')),
    apiError);
  assert.equal(foreign.ready.length, 17, 'foreign evidence cannot be green');

  const verified = m.canonicalFinish(table, {
    ready: [ids[0]], proofs: { [ids[0]]: evidence.replace('123', '456') },
    pending: ids.slice(1).map(id => ({
      id, value: 'не подтверждено', reason: 'нет успешного завершённого прогона main: ' + evidence
    }))
  });
  assert.equal(verified.verification[ids[0]].value, 'подтверждено');
  assert.equal(verified.verification[ids[1]].value, 'не подтверждено');
  assert.equal(verified.ready.length, 18, 'check failure must not overwrite accepted FINISH');
  assert.equal(m.canonicalFinish(ids.map(id =>
    `| ${id} | check | verify | НЕТ |`).join('\n'), apiError).ready.length, 0);
}

await suite(source);
const mutations = [
  ['green-without-evidence', "const isGreen = /^ЗЕЛЁНАЯ(?:\\s|$)/.test(status) && evidence?.repo === LAB;",
    "const isGreen = /^ЗЕЛЁНАЯ(?:\\s|$)/.test(status);"],
  ['api-outage-erases-accepted', '      ready.push(id);', '      pending.push({ id, value: UNKNOWN, reason: UNKNOWN });'],
  ['api-outage-falsely-confirmed', "value: apiUnavailable ? UNKNOWN : 'не подтверждено'",
    "value: 'подтверждено'"]
];
for (const [name, from, to] of mutations) {
  assert.ok(source.includes(from), 'mutation anchor missing: ' + name);
  let caught = false;
  try { await suite(source.replace(from, to)); } catch { caught = true; }
  assert.ok(caught, 'mutation survived: ' + name);
  console.log('CANONICAL_FINISH_MUTATION_CAUGHT ' + name);
}
console.log('CANONICAL_FINISH_PASS: authoritative verdicts, honest API errors, 3 mutations');
