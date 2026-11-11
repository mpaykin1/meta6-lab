// Claude e997e672, 9d56c4f1, 29da9060: safe LAB Pages deployment.
import assert from 'node:assert/strict';

function block(source, job) {
  const lines = source.split(/\r?\n/);
  const start = lines.findIndex(s => s === '  ' + job + ':');
  assert.notEqual(start, -1, 'Missing LAB Pages job: ' + job);
  let end = start + 1;
  while (end < lines.length && !/^  [\w-]+:\s*$/.test(lines[end])) end++;
  return lines.slice(start, end);
}

export function verifyClaudePages(source) {
  const deploy = block(source, 'deploy');
  const kick = block(source, 'kick-main');
  const condition = deploy.find(x => /^\s{4}if:\s*/.test(x)) || '';
  assert.match(condition, /^\s{4}if:\s*github\.ref\s*==\s*'refs\/heads\/main'\s*&&\s*!/,
    'only trusted main may deploy; duplicate event must be excluded');
  assert.match(condition, /github\.event_name\s*==\s*'workflow_run'/,
    'secondary workflow_run events must be de-duplicated');
  assert.match(condition, /META GAMES guard/,
    'do not deploy twice for main guard');
  assert.ok(deploy.some(x => /^    concurrency:\s*$/.test(x)),
    'concurrency must be at deployment job level');
  assert.ok(deploy.some(x => /^      group:\s*lab-pages\s*$/.test(x)),
    'deployment jobs must be serialized');
  assert.ok(deploy.some(x => /^      cancel-in-progress:\s*false\s*$/.test(x)),
    'skip kicks must never cancel a real deploy');
  assert.ok(!source.split(/\r?\n/).some(x => /^concurrency:\s*$/.test(x)),
    'top-level concurrency may cancel valid deployment');
  const kickCondition = kick.find(x => /^\s{4}if:\s*/.test(x)) || '';
  assert.match(kickCondition, /github\.ref\s*!=\s*'refs\/heads\/main'/,
    'lab branch should request rebuild, not publish directly');
  assert.ok(kick.some(x => /gh workflow run lab-pages\.yml --ref main\b/.test(x)),
    'branch previews must kick trusted main');
  assert.ok(deploy.some(x => /actions\/deploy-pages@/.test(x)),
    'a real Pages publish job is mandatory');
}
