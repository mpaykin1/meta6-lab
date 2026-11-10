// ZANYATO watcher (Claude, 09.11.2026): no AI needed. Marks hung work and frees it so the next
// hourly autotask picks it up. Rows: | пункт | ветка | кто | время |.
import {readFileSync, writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';

const file = 'rules/09-platforma/ZANYATO.md';
const now = Date.parse(process.env.WATCH_NOW || new Date().toISOString());
const lastCommit = branch => {
  try {
    execFileSync('git', ['fetch', '-q', '--depth=1', 'origin', branch], {stdio: 'ignore'});
    return Date.parse(execFileSync('git', ['log', '-1', '--format=%cI', 'FETCH_HEAD']).toString().trim());
  } catch { return null; }
};
const lines = readFileSync(file, 'utf8').split('\n');
let changed = false;
for (let i = 0; i < lines.length; i++) {
  const cols = lines[i].split('|').map(s => s.trim());
  if (cols.length < 6 || !/^lab\//.test(cols[2] || '')) continue;
  const [, item, branch, who] = cols;
  if (/^свободно/.test(who)) continue;
  const at = lastCommit(branch) ?? Date.parse(cols[4].replace(' ', 'T') + ':00Z');
  if (!Number.isFinite(at)) continue;
  const minutes = Math.round((now - at) / 60000);
  let status = who.replace(/\s*⚠.*$/, '');
  if (minutes >= 180) status = 'свободно (зависло ' + Math.round(minutes / 60) + ' ч, было: ' + status + ')';
  else if (minutes >= 60) status = status + ' ⚠ нет коммитов ' + minutes + ' мин';
  if (status !== who) { lines[i] = `| ${item} | ${branch} | ${status} | ${cols[4]} |`; changed = true; }
}
if (changed) writeFileSync(file, lines.join('\n'));
console.log(changed ? 'ZANYATO_UPDATED' : 'ZANYATO_OK');
