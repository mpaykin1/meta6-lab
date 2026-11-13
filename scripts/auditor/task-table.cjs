// Compare declared task states with the existing GitHub PR snapshot; no extra API calls.
'use strict';

function auditTaskTable(source, prs, root) {
  const findings = [];
  const seen = new Set();
  const byNumber = new Map(prs.map(pr => [pr.number, pr]));
  const clean = text => String(text).replace(/[|<>\r\n]/g, ' ').slice(0, 160);
  function add(key, text) {
    if (!seen.has(key)) {
      seen.add(key);
      findings.push(text);
    }
  }
  for (const [index, line] of source.split('\n').entries()) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
    if (cells.length !== 8 || !/\d{4}-\d\d-\d\d/.test(cells[6])) continue;
    const [status, task, , , branchCell, prCell] = cells;
    const table = root + '/blob/main/ZADACHI.md#L' + (index + 1);
    const branch = branchCell.match(/`([^`]+)`/)?.[1];
    const match = prCell.match(/https:\/\/github\.com\/[^\s)]+\/pull\/(\d+)/);
    if (!match) {
      if (branch) {
        const actual = prs.find(pr => pr.head?.ref === branch && pr.state === 'open');
        const hint = actual ? ' — [PR #' + actual.number + '](' + root + '/pull/' + actual.number + ')' : '';
        add('missing:' + branch, '- 🚨 Нет ссылки на PR: [' + clean(task) + '](' + table + ')' + hint);
      }
      continue;
    }
    const number = Number(match[1]);
    if (match[0] !== root + '/pull/' + number) {
      add('foreign:' + index, '- 🚨 PR другого репозитория: [' + clean(task) + '](' + table + ')');
      continue;
    }
    const pr = byNumber.get(number);
    if (!pr) {
      add('unknown:' + number, '- ⚠️ PR #' + number + ' не попал в выборку, статус не подтверждён: ' +
        '[PR](' + root + '/pull/' + number + ')');
      continue;
    }
    const declared = /✅\s*ГОТОВО/i.test(status) ? 'merged' : /✖\s*ЗАКРЫТО/i.test(status) ? 'closed' :
      /взято|В РАБОТЕ|ЗАВИС|молчит|ЗАБРОШЕНО/i.test(status) ? 'open' : null;
    const actual = pr.merged_at ? 'merged' : pr.state;
    if (declared && declared !== actual) {
      add('status:' + number + ':' + declared, '- 🚨 Статус ZADACHI ' + clean(status) +
        ', GitHub ' + clean(actual) + ': [PR #' + number + '](' + root + '/pull/' + number +
        '), [строка](' + table + ')');
    }
  }
  return findings;
}

module.exports = { auditTaskTable };
