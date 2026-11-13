// Permanent auditor traps: API budget, singleton issue, and read-only PR previews.
import { createRequire } from 'node:module';
globalThis.require = createRequire(import.meta.url);
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const yaml = readFileSync(resolve(root, '.github/workflows/auditor.yml'), 'utf8');
const config = JSON.parse(readFileSync(resolve(root, '.github/auditor/config.yml'), 'utf8'));
const sentinel = '          script: |\n';
assert(yaml.includes(sentinel), 'auditor workflow must contain a github-script block');
const original = yaml.slice(yaml.indexOf(sentinel) + sentinel.length)
  .split('\n').map(line => line.startsWith('            ') ? line.slice(12) : line).join('\n');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const examplePRs = Array.from({ length: 100 }, (_, i) => ({
  number: i + 1, title: 'unattributed task', body: '', labels: [],
  state: i < 4 ? 'open' : 'closed',
  created_at: i < 4 ? '2020-01-01T00:00:00Z' : null,
  updated_at: '2020-01-01T00:00:00Z',
  head: { ref: 'lab/unattributed', sha: String(i + 1).padStart(40, '0') }
}));

async function exercise(script, eventName) {
  const stats = { pulls: 0, issueUpdates: 0, issueCreates: 0, pins: 0, report: '' };
  const github = {
    rest: {
      repos: {
        getContent: async ({ path }) => ({
          data: { content: Buffer.from(path.endsWith('config.yml')
            ? JSON.stringify(config) : '# sample task table\n').toString('base64') }
        })
      },
      pulls: {
        list: async () => { stats.pulls++; return { data: examplePRs }; },
        get: async ({ pull_number }) => ({
          data: {
            head: { sha: examplePRs[pull_number - 1].head.sha },
            mergeable_state: pull_number === 1 ? 'dirty' : 'clean'
          }
        })
      },
      checks: {
        listForRef: async ({ ref }) => ({
          data: { check_runs: [{
            name: 'browser-open-all',
            status: 'completed',
            conclusion: ref === examplePRs[1].head.sha ? 'failure' : 'success',
            html_url: 'https://github.com/example/repo/actions/runs/123'
          }] }
        })
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
  const run = new AsyncFunction('github', 'context', 'core', script);
  await run(github, context, core);
  assert.equal(stats.pulls, 1, 'API budget exceeded: auditor must not scan multiple PR pages');
  assert.equal(stats.issueCreates, 0, 'auditor must never create duplicate issues');
  assert.equal(stats.issueUpdates, eventName === 'pull_request' ? 0 : 1,
    'PR preview must be read-only; trusted main must update exactly one Issue');
  for (const role of config.roles) {
    assert(stats.report.includes(role.name), 'role is absent from run summary: ' + role.name);
  }
  assert(stats.report.includes('PR #1') && stats.report.includes('конфликт с main'),
    'stale PR merge conflict must appear with its link and reason');
  assert(stats.report.includes('PR #2') && stats.report.includes('красная проверка'),
    'stale PR failed check must appear with its link and reason');
  assert(!stats.report.includes('PR #3'), 'clean PR must not be marked failing');
  return stats;
}

await exercise(original, 'pull_request');
await exercise(original, 'push');
const mutants = [
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
  },
  {
    name: 'stale-pr-age-reversed',
    source: original.replace('now.getTime() - Date.parse(pr.created_at) > 86400000',
      'now.getTime() - Date.parse(pr.created_at) < 86400000'),
    event: 'push'
  },
  {
    name: 'stale-merge-conflict-ignored',
    source: original.replace("detail.data.mergeable_state === 'dirty'", 'false'),
    event: 'push'
  },
  {
    name: 'deception-failed-ci-replaced-with-success',
    source: original.replace("['failure','timed_out','action_required'].includes(check.conclusion)",
      "['success'].includes(check.conclusion)"),
    event: 'push'
  }
];
for (const mutant of mutants) {
  assert.notEqual(mutant.source, original, 'mutation not applied: ' + mutant.name);
  await assert.rejects(exercise(mutant.source, mutant.event),
    undefined, 'escaped mutant: ' + mutant.name);
  process.stdout.write('TRAP ' + mutant.name + ' PASS\n');
}
process.stdout.write('AUDITOR MUTATIONS PASS: 6/6\n');
