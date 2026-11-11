'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const a = require('./audit.cjs');
const patterns = ['scripts/meta-bot/**', '.github/workflows/**', 'rules/09-platforma/FINISH.md'];
const cases = [
 ['scripts/meta-bot/strategy.mjs',true],
 ['.github/workflows/deploy.yml',true],
 ['rules/09-platforma/FINISH.md',true],
 ['scripts/meta-bot-v2/new.mjs',false],
 ['games/new-level/index.html',false],
 ['.github/auditor/audit.cjs',false]
];
test('protected paths: exact and folder boundaries', () => {
  for (const [path, expected] of cases) assert.equal(a.matchProtected(path,patterns),expected,path);
});
test('three mutations, including deceptive prefix match, are detected', () => {
  const mutations = [
    () => false, // missed protected path
    () => true, // false positive on every path
    (p) => p.startsWith('scripts/meta-bot') || p.startsWith('.github/workflows') // deceptive prefix
  ];
  for (const mutant of mutations) {
    assert.ok(cases.some(([p,e]) => mutant(p) !== e), 'mutation must be killed');
  }
});
test('role parsing and PR attribution have source links', () => {
  const rows = a.parseTable('# ZADACHI\n| статус | задача | проект | кто | ветка | PR | UTC | last |\n' +
    '| взято | Fix | МГЛ | MG-строитель-1 | `lab/auto-one` | [#12](https://github.com/mpaykin1/meta6-lab/pull/12) | 2026-11-11 12:05 | — |\n' +
    '| взято | Other | МГЛ | чат ChatGPT | — | — | — | — |');
  assert.equal(rows.length,1);
  assert.equal(rows[0].role,'MG-строитель-1');
  assert.equal(rows[0].pr,12);
  assert.match(rows[0].evidence,/ZADACHI.md#L3/);
});
test('plan requires explicit formulation, not generic next step', () => {
  assert.equal(a.isPlan('NEXT: run CI'), false);
  assert.equal(a.isPlan('Следующее улучшение: закрыть CI'), true);
});
test('execution stays unverified if multiple workers touched same branch', () => {
  const now = Date.now();
  const target = {role:'MG-строитель-1',branch:'lab/shared',takenAt:now};
  const other = {role:'MG-ремонтник',branch:'lab/shared',takenAt:now};
  const pr = {branch:'lab/shared', commits:[{commit:{committer:{date:new Date(now).toISOString()}}}]};
  assert.equal(a.recentOwnWork(target,[target,other],now-10000,pr),false);
  assert.equal(a.recentOwnWork(target,[target],now-10000,pr),true);
});

test('source task table must not use rate-limited GitHub contents API', () => {
  const fs = require('node:fs');
  const source = fs.readFileSync('.github/auditor/audit.cjs', 'utf8');
  assert.match(source, /fs\.readFileSync\(config\.sources\.task_table/);
  assert.doesNotMatch(source, /github\.rest\.repos\.getContent/);
});
