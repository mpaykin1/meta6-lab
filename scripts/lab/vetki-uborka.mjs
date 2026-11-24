// Уборка веток МГЛ (владелец 24.11.2026): лишние lab/* сначала копируются в archive/lab/*, потом удаляются,
// чтобы сайт МГЛ (preview/ всех lab/*) не разрастался. Ничего не теряется: архив на сайт не попадает.
// Запуск: node scripts/lab/vetki-uborka.mjs [--apply] [--age-days N]
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

export function decide(b, ctx) {
  // b = {name, sha, ageDays}; ctx = {openHeads:Set, mergedHeads:Set, closedHeads:Set, protectedSafe:Set, ageDays}
  const safe = b.name.replace(/^lab\//, '').replace(/\//g, '-');
  if (ctx.openHeads.has(b.name)) return 'keep:open-pr';
  if (ctx.protectedSafe.has(safe)) return 'keep:linked';
  if (b.ageDays <= 1) return 'keep:fresh';
  if (ctx.mergedHeads.has(b.name)) return 'delete:merged';
  if (b.ageDays <= ctx.ageDays) return 'keep:recent';
  return ctx.closedHeads.has(b.name) ? 'delete:closed' : 'delete:stale';
}

const gh = (...a) => execFileSync('gh', a, { encoding: 'utf8', maxBuffer: 64 << 20 });
function main() {
  const apply = process.argv.includes('--apply');
  const i = process.argv.indexOf('--age-days');
  const ageDays = i > 0 ? Number(process.argv[i + 1]) : 7;
  const repo = process.env.GITHUB_REPOSITORY || 'mpaykin1/meta6-lab';
  const prs = JSON.parse(gh('api', '--paginate', '--slurp', `repos/${repo}/pulls?state=all&per_page=100`)).flat();
  const openHeads = new Set(prs.filter(p => p.state === 'open').map(p => p.head.ref));
  const mergedHeads = new Set(prs.filter(p => p.merged_at).map(p => p.head.ref));
  const closedHeads = new Set(prs.filter(p => p.state === 'closed' && !p.merged_at).map(p => p.head.ref));
  // Защищены превью, на которые есть ссылка в LINKS.txt или где-либо в main.
  const refs = execFileSync('bash', ['-c', "grep -rhoI 'meta6-lab/preview/[A-Za-z0-9._-]*' --exclude-dir=.git . || true"], { encoding: 'utf8', maxBuffer: 64 << 20 });
  const protectedSafe = new Set(refs.split('\n').filter(Boolean).map(s => s.replace(/.*\/preview\//, '')));
  const branches = JSON.parse(gh('api', '--paginate', '--slurp', `repos/${repo}/branches?per_page=100`)).flat()
    .filter(b => b.name.startsWith('lab/'));
  const counts = {};
  for (const br of branches) {
    const c = JSON.parse(gh('api', `repos/${repo}/commits/${br.commit.sha}`, '--jq', '{d:.commit.committer.date}'));
    const b = { name: br.name, sha: br.commit.sha, ageDays: (Date.now() - Date.parse(c.d)) / 864e5 };
    const verdict = decide(b, { openHeads, mergedHeads, closedHeads, protectedSafe, ageDays });
    counts[verdict] = (counts[verdict] || 0) + 1;
    if (!verdict.startsWith('delete') || !apply) continue;
    const arc = `archive/${b.name}`;
    let have = '';
    try { have = JSON.parse(gh('api', `repos/${repo}/git/ref/heads/${arc}`)).object.sha; } catch {}
    if (have !== b.sha) {
      if (have) gh('api', '-X', 'PATCH', `repos/${repo}/git/refs/heads/${arc}`, '-f', `sha=${b.sha}`, '-F', 'force=true');
      else gh('api', '-X', 'POST', `repos/${repo}/git/refs`, '-f', `ref=refs/heads/${arc}`, '-f', `sha=${b.sha}`);
    }
    const check = JSON.parse(gh('api', `repos/${repo}/git/ref/heads/${arc}`)).object.sha;
    if (check !== b.sha) throw new Error('archive mismatch ' + b.name);
    gh('api', '-X', 'DELETE', `repos/${repo}/git/refs/heads/${b.name}`);
  }
  console.log((apply ? 'APPLIED ' : 'DRY ') + JSON.stringify(counts));
}
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) main();
