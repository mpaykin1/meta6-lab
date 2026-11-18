// Запуск на событии pull_request. Переменные: ODIN_TOKEN, ODIN_REPO, ODIN_PR, ODIN_ACTION.
import {journalViolations, findDuplicate, closeComment, journalMessage, FRESH_HOURS} from './core.mjs';

const {ODIN_TOKEN: token, ODIN_REPO: repo, ODIN_PR: prNumber, ODIN_ACTION: action} = process.env;
if (!token || !repo || !prNumber) throw Error('ODIN_TOKEN, ODIN_REPO, ODIN_PR обязательны');

async function api(path, init = {}) {
  const r = await fetch('https://api.github.com/repos/' + repo + path, {...init,
    headers: {Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json'}});
  if (!r.ok) throw Error(`GitHub ${init.method || 'GET'} ${path} HTTP ${r.status}: ${await r.text()}`);
  return r.status === 204 ? null : r.json();
}
async function files(n) {
  const out = [];
  for (let page = 1; page <= 30; page++) {
    const chunk = await api(`/pulls/${n}/files?per_page=100&page=${page}`);
    out.push(...chunk.map(f => ({filename: f.filename, status: f.status})));
    if (chunk.length < 100) return out;
  }
  throw Error('Слишком много файлов в PR #' + n);
}

const self = {number: Number(prNumber), files: await files(prNumber)};
const bad = journalViolations(self.files);

if (action === 'opened' || action === 'reopened') {
  const open = [];
  for (let page = 1; page <= 10; page++) {
    const chunk = await api(`/pulls?state=open&base=main&per_page=100&page=${page}`);
    open.push(...chunk);
    if (chunk.length < 100) break;
  }
  const fresh = open.filter(p => p.number !== self.number && Date.now() - Date.parse(p.updated_at) <= FRESH_HOURS * 3600e3);
  const others = [];
  for (const p of fresh) others.push({number: p.number, title: p.title, updated_at: p.updated_at,
    files: (await files(p.number)).map(f => f.filename)});
  const dup = findDuplicate({number: self.number, files: self.files.map(f => f.filename)}, others);
  if (dup) {
    await api(`/issues/${self.number}/comments`, {method: 'POST', body: JSON.stringify({body: closeComment(dup)})});
    await api(`/pulls/${self.number}`, {method: 'PATCH', body: JSON.stringify({state: 'closed'})});
    console.log(`ODIN_PR_DUPLICATE #${self.number} → #${dup.number}: ${dup.files.join(', ')}`);
    process.exit(0);
  }
}
if (bad.length) {
  console.log(journalMessage(bad));
  process.exit(1);
}
console.log('ODIN_PR_OK #' + self.number);
