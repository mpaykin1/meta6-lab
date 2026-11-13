// Permanent auditor traps: API budget, singleton issue, and read-only PR previews.
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
            ? JSON.stringify(config) : '# sample task table\n').toString('base64') }
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
  const run = new AsyncFunction('github', 'context', 'core', script);
  await run(github, context, core);
  assert.equal(stats.pulls, 1, 'API budget exceeded: auditor must not scan multiple PR pages');
  assert.equal(stats.issueCreates, 0, 'auditor must never create duplicate issues');
  assert.equal(stats.issueUpdates, eventName === 'pull_request' ? 0 : 1,
    'PR preview must be read-only; trusted main must update exactly one Issue');
  for (const role of config.roles) {
    assert(stats.report.includes(role.name), 'role is absent from run summary: ' + role.name);
  }
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
  }
];
for (const mutant of mutants) {
  assert.notEqual(mutant.source, original, 'mutation not applied: ' + mutant.name);
  await assert.rejects(exercise(mutant.source, mutant.event),
    undefined, 'escaped mutant: ' + mutant.name);
  process.stdout.write('TRAP ' + mutant.name + ' PASS\n');
}
process.stdout.write('AUDITOR MUTATIONS PASS: 3/3\n');

await import("./mutate-auditor-truthful.mjs");

await import("./mutate-auditor-stall.mjs");

await import("./mutate-auditor-stale-pr.mjs");
