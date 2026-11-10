import { execFileSync } from 'node:child_process';
const IGNORE = new Set(['STATUS.md', 'reports/LAST_RUN.md']);
export const git = (...args) => execFileSync('git', args, {encoding:'utf8'}).trim();
export function contentRevision(ref = 'HEAD') {
  const commits = git('rev-list', '--max-count=1000', ref).split('\n').filter(Boolean);
  for (const sha of commits) {
    const paths = git('diff-tree', '--root', '--no-commit-id', '--name-only', '-r', sha).split('\n').filter(Boolean);
    if (paths.some(p => !IGNORE.has(p))) return sha;
  }
  throw Error('Cannot locate substantive main commit');
}
export function finishCount(data) {
  const rows = data.split(/\r?\n/).filter(s=>/^\| (M[1-6]|B[1-7]|L[1-4]|P1) \|/.test(s));
  if (rows.length!==18) throw Error('FINISH.md requires exactly 18 rows, got '+rows.length);
  return rows.filter(s=>/\| ЗЕЛЁНАЯ\s*—\s*\[прогон\]\(https:\/\/github\.com\/[^)]+\/actions\/runs\/\d+\)/.test(s)).length;
}
