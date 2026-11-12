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

async function exercise(script, eventName, pinnedInitially = true, pinAllowed = true, malformedPinQuery = false,
  approvalRequired = false) {
  let isPinned = pinnedInitially;
  const pendingSha = 'abcdefabcdefabcdefabcdefabcdefabcdefabcd';
  const pendingPR = { ...examplePRs[0], number: 242, title: 'MG-строитель-2',
    updated_at: new Date().toISOString(),
    head: { ref: 'lab/approval', sha: pendingSha } };
  const commitDate = new Date(Date.now() - 30000).toISOString();
  const stats = { pulls: 0, issueUpdates: 0, issueCreates: 0, pins: 0, pinChecks: 0, report: '' };
  const github = {
    rest: {
      repos: {
        getContent: async ({ path }) => ({
          data: { content: Buffer.from(path.endsWith('config.yml')
            ? JSON.stringify(config) : '# sample task table\n').toString('base64') }
        })
      },
      pulls: {
        list: async () => { stats.pulls++; return {
          data: approvalRequired ? [pendingPR, ...examplePRs.slice(1)] : examplePRs
        }; },
        listCommits: async () => ({ data: [{
          sha: pendingSha, commit: {
            message: 'feat: real PR work', committer: { date: commitDate }
          }
        }] }),
        listFiles: async () => ({ data: [] })
      },
      checks: { listForRef: async () => ({ data: { check_runs: [] } }) },
      actions: { listWorkflowRunsForRepo: async () => ({ data: {
        workflow_runs: [{ id: 43204251493, head_sha: pendingSha, status: 'completed',
          conclusion: 'action_required',
          html_url: 'https://github.com/example/repo/actions/runs/43204251493' }]
      } }) },
      issues: {
        listForRepo: async () => ({ data: [
          {
            number: config.issue_number, node_id: 'ISSUE253', title: 'Legacy cycle index',
            body: config.roles.map(role => role.role_marker).join(' '),
            html_url: 'https://github.com/example/repo/issues/' + config.issue_number,
            updated_at: '2099-01-01T00:00:00Z'
          },
          {
            number: 250, title: config.issue_title,
            body: config.roles.map(role => role.role_marker).join(' '),
            html_url: 'https://github.com/example/repo/issues/250',
            updated_at: '2099-01-01T00:00:00Z'
          }
        ] }),
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
    graphql: async (query) => {
      if (query.includes('pinnedIssues')) {
        stats.pinChecks++;
        if (malformedPinQuery) return { repository: { pinnedIssues: { nodes: null } } };
        return { repository: { pinnedIssues: {
          nodes: isPinned ? [{ issue: { number: config.issue_number } }] : []
        } } };
      }
      if (query.includes('pinIssue')) {
        stats.pins++;
        if (!pinAllowed) throw new Error('pin blocked by permissions');
        isPinned = true;
        return {};
      }
      throw new Error('Unexpected GraphQL query');
    }
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
  if (eventName === 'pull_request') {
    assert(stats.report.includes('⚠️ не проверено (PR preview)'),
      'PR preview must not claim a verified pin');
    assert.equal(stats.pinChecks, 0, 'PR preview must not run a pin query');
  } else if (malformedPinQuery) {
    assert(stats.report.includes('⚠️ не подтверждено (ошибка GraphQL)'),
      'malformed GraphQL pin payload must be unknown, not green or red');
    assert(stats.pinChecks >= 1, 'malformed pin payload must be observed');
  } else {
    const expectedPinned = pinnedInitially || pinAllowed;
    assert(stats.report.includes(expectedPinned
      ? '✅ закреплено (GraphQL)' : '❌ не закреплено (GraphQL)'),
      'reported pin state does not match GraphQL');
    assert(stats.pinChecks >= 1, 'trusted main must verify pinnedIssues via GraphQL');
  }
  if (approvalRequired) {
    const row = stats.report.split('\n').find(line => line.startsWith('| MG-строитель-2 |'));
    assert(row && row.includes('CI ⚠️ action_required'),
      'unapproved Actions is waiting for approval, not a failed or green CI run');
    assert(!row.includes('CI ❌') && !row.includes('CI ✅'),
      'approval-required run must never be reported as a test outcome');
  }
  for (const role of config.roles) {
    assert(stats.report.includes(role.name), 'role is absent from run summary: ' + role.name);
    const line = stats.report.split('\n').find(row => row.startsWith('| ' + role.name + ' |'));
    assert(line, 'missing report row for ' + role.name);
    const plan = line.split('|')[3] || '';
    assert(!plan.includes('Issue #253') && !plan.includes('Issue #250'),
      'auditor issue is falsely counted as a role planning cycle: ' + role.name);
  }
  return stats;
}

await exercise(original, 'pull_request');
await exercise(original, 'push');
await exercise(original, 'push', false, true);
await exercise(original, 'push', false, false);
await exercise(original, 'push', false, false, true);
await exercise(original, 'push', true, true, false, true);
const mutants = [
  {
    name: 'approval-as-failure',
    source: original.replace("'CI ⚠️ action_required'", "'CI ❌'"),
    event: 'push', approvalRequired: true
  },
  {
    name: 'deception-approval-as-success',
    source: original.replace("pendingApproval ? 'CI ⚠️ action_required'",
      "pendingApproval ? 'CI ✅'"),
    event: 'push', approvalRequired: true
  },
  {
    name: 'approval-silently-unknown',
    source: original.replace("d.runs.some(r => r.conclusion === 'action_required')", 'false'),
    event: 'push', approvalRequired: true
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
  },
  {
    name: 'self-issue-as-plan',
    source: original.replace('i.number !== cfg.issue_number', 'true'),
    event: 'push'
  },
  {
    name: 'duplicate-audit-as-plan',
    source: original.replace('i.title !== cfg.issue_title', 'true'),
    event: 'push'
  },
  {
    name: 'deception-audit-exclusion-or',
    source: original.replace(
      'i.number !== cfg.issue_number && i.title !== cfg.issue_title',
      'i.number !== cfg.issue_number || i.title !== cfg.issue_title'),
    event: 'push'
  },
  {
    name: 'deception-pinned-true',
    source: original.replace('nodes.some(n => n.issue?.number === cfg.issue_number)', 'true'),
    event: 'push', pinnedInitially: false, pinAllowed: false
  },
  {
    name: 'pinned-false',
    source: original.replace('nodes.some(n => n.issue?.number === cfg.issue_number)', 'false'),
    event: 'push', pinnedInitially: true
  },
  {
    name: 'pinned-wrong-issue',
    source: original.replace('n.issue?.number === cfg.issue_number', 'n.issue?.number === 250'),
    event: 'push', pinnedInitially: true
  },
  {
    name: 'malformed-pin-as-unpinned',
    source: original.replace("throw new Error('Missing pinnedIssues nodes in GraphQL response');", 'return false;'),
    event: 'push', pinnedInitially: false, pinAllowed: false, malformedPinQuery: true
  },
  {
    name: 'deception-malformed-pin-as-green',
    source: original.replace("let pinStatus = '⚠️ не подтверждено (ошибка GraphQL)';",
      "let pinStatus = '✅ закреплено (GraphQL)';"),
    event: 'push', pinnedInitially: false, pinAllowed: false, malformedPinQuery: true
  },
  {
    name: 'malformed-pin-as-red',
    source: original.replace("let pinStatus = '⚠️ не подтверждено (ошибка GraphQL)';",
      "let pinStatus = '❌ не закреплено (GraphQL)';"),
    event: 'push', pinnedInitially: false, pinAllowed: false, malformedPinQuery: true
  }
];
for (const mutant of mutants) {
  assert.notEqual(mutant.source, original, 'mutation not applied: ' + mutant.name);
  await assert.rejects(exercise(mutant.source, mutant.event,
    mutant.pinnedInitially ?? true, mutant.pinAllowed ?? true, mutant.malformedPinQuery ?? false,
    mutant.approvalRequired ?? false),
    undefined, 'escaped mutant: ' + mutant.name);
  process.stdout.write('TRAP ' + mutant.name + ' PASS\n');
}
process.stdout.write('AUDITOR MUTATIONS PASS: 15/15\n');
