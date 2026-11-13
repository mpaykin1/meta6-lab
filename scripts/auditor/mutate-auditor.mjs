// Permanent auditor traps: API budget, singleton issue, and read-only PR previews.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(import.meta.url);
const yaml = readFileSync(resolve(root, '.github/workflows/auditor.yml'), 'utf8');
const config = JSON.parse(readFileSync(resolve(root, '.github/auditor/config.yml'), 'utf8'));
const sentinel = '          script: |\n';
assert(yaml.includes(sentinel), 'auditor workflow must contain a github-script block');
const original = yaml.slice(yaml.indexOf(sentinel) + sentinel.length)
  .split('\n').map(line => line.startsWith('            ') ? line.slice(12) : line).join('\n');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const examplePRs = Array.from({ length: 100 }, (_, i) => ({
  number: i + 1, title: 'unattributed task', body: '', labels: [],
  state: 'open', merged_at: null,
  updated_at: '2020-01-01T00:00:00Z',
  head: { ref: 'lab/unattributed', sha: '0123456789abcdef' }
}));

async function exercise(script, eventName) {
  const stats = { pulls: 0, issueUpdates: 0, issueCreates: 0, pins: 0, report: '' };
  const github = {
    rest: {
      repos: {
        getContent: async ({ path }) => ({
          data: { content: Buffer.from(path.endsWith('config.yml')
            ? JSON.stringify(config) : [
              '| ✅ ГОТОВО | false-ready | МГЛ | ревизор | `lab/unattributed` | ' +
                '[PR](https://github.com/example/repo/pull/1) | 2026-11-13 08:00 | — |',
              '| взято | missing-pr | МГЛ | ревизор | `lab/missing` | — | 2026-11-13 08:00 | — |'
            ].join('\n')).toString('base64') }
        })
      },
      pulls: {
        list: async () => { stats.pulls++; return { data: examplePRs }; }
      },
      issues: {
        listForRepo: async () => ({ data: [] }),
        update: async () => {
          stats.issueUpdates++;
          return { data: { node_id: 'ISSUE123', html_url: 'https://github.com/example/repo/issues/253' } };
        },
        create: async () => {
          stats.issueCreates++;
          return { data: { node_id: 'CREATED', html_url: 'https://github.com/example/repo/issues/254' } };
        }
      }
    },
    graphql: async () => { stats.pins++; return {}; }
  };
  const summary = {
    addRaw(text) { stats.report = text; return this; },
    async write() {}
  };
  const core = { summary, info() {}, warning() {} };
  const context = {
    eventName, runId: 123,
    repo: { owner: 'example', repo: 'repo' },
    payload: { pull_request: { head: { sha: 'abcdef1234' } } }
  };
  const run = new AsyncFunction('github', 'context', 'core', 'require', script);
  await run(github, context, core, require);
  assert.equal(stats.pulls, 1, 'API budget exceeded: auditor must not scan multiple PR pages');
  assert.equal(stats.issueCreates, 0, 'auditor must never create duplicate issues');
  assert.equal(stats.issueUpdates, eventName === 'pull_request' ? 0 : 1,
    'PR preview must be read-only; trusted main must update exactly one Issue');
  assert(stats.report.includes('GitHub open'), 'task mismatch must reach the report');
  assert(stats.report.includes('Нет ссылки на PR'), 'missing PR must reach the report');
  for (const role of config.roles) {
    assert(stats.report.includes(role.name), 'role is absent from run summary: ' + role.name);
  }
  return stats;
}

await exercise(original, 'pull_request');
await exercise(original, 'push');
const mutants = [
  {
    name: 'task-findings-removed-from-report',
    source: original.replace('auditTaskTable(source, prs, root)', '[]'),
    event: 'push'
  },
  {
    name: 'excessive-api-pages',
    source: original.replace('page <= 1', 'page <= 15'),
    event: 'push'
  },
  {
    name: 'duplicate-issue',
    source: original.replace('github.rest.issues.update', 'github.rest.issues.create'),
    event: 'push'
  },
  {
    name: 'deception-pr-issue-write',
    source: original.replace("if (context.eventName === 'pull_request')",
      "if (false && context.eventName === 'pull_request')"),
    event: 'pull_request'
  }
];
for (const mutant of mutants) {
  assert.notEqual(mutant.source, original, 'mutation not applied: ' + mutant.name);
  await assert.rejects(exercise(mutant.source, mutant.event),
    undefined, 'escaped mutant: ' + mutant.name);
  process.stdout.write('TRAP ' + mutant.name + ' PASS\n');
}
process.stdout.write('AUDITOR MUTATIONS PASS: ' + mutants.length + '/' + mutants.length + '\n');

const tableSource = readFileSync(resolve(root, 'scripts/auditor/task-table.cjs'), 'utf8');
function checkTable(code) {
  const target = { exports: {} };
  new Function('module', code)(target);
  const audit = target.exports.auditTaskTable;
  const url = 'https://github.com/example/repo';
  const row = (status, branch, pr) =>
    `| ${status} | task | МГЛ | ревизор | \`${branch}\` | ${pr} | 2026-11-13 08:00 | — |`;
  for (const number of [17, 321]) {
    const pr = { number, state: 'open', merged_at: null, head: { ref: 'lab/task' } };
    const link = `[PR](${url}/pull/${number})`;
    assert.equal(audit(row('взято', 'lab/task', link), [pr], url).length, 0);
    assert.match(audit(row('взято', 'lab/task', '—'), [pr], url).join('\n'), /Нет ссылки на PR/);
    assert.match(audit(row('✅ ГОТОВО', 'lab/task', link), [pr], url).join('\n'), /GitHub open/);
    assert.match(audit(row('взято', 'lab/task', link), [{ ...pr, merged_at: '2026-11-13' }], url)
      .join('\n'), /GitHub merged/);
    assert.match(audit(row('взято', 'lab/task', link), [{ ...pr, state: 'closed' }], url)
      .join('\n'), /GitHub closed/);
    const unknown = audit(row('✅ ГОТОВО', 'lab/task', link), [], url).join('\n');
    assert.match(unknown, /⚠️/);
    assert(!unknown.includes('🚨'), 'partial API snapshot must not imply violation');
    assert.equal(audit(row('✅ ГОТОВО', 'lab/task', link),
      [{ ...pr, state: 'closed', merged_at: '2026-11-13' }], url).length, 0);
  }
}
checkTable(tableSource);
const tableMutants = [
  ['missing-pr-hidden', tableSource.replace('if (branch) {', 'if (false && branch) {')],
  ['wrong-status-hidden', tableSource.replace('declared !== actual', 'false')],
  ['deception-canonical-issue-as-pr', tableSource.replace('Number(match[1])', '253')],
  ['unknown-as-violation', tableSource.replace('- ⚠️ PR #', '- 🚨 PR #')]
];
for (const [name, code] of tableMutants) {
  assert.notEqual(code, tableSource, 'mutation not applied: ' + name);
  assert.throws(() => checkTable(code), undefined, 'escaped mutant: ' + name);
  process.stdout.write('TRAP task-table ' + name + ' PASS\n');
}
process.stdout.write('TASK TABLE MUTATIONS PASS: 4/4\n');

