// CLI: node scripts/asset-guard/guard.mjs — в pull_request ASSET CHECK. Падает (exit 1) при нарушении законов З1–З3.
import {execFileSync} from 'node:child_process';
import {appendFileSync} from 'node:fs';
import {check, slugOf} from './rules.mjs';

const git = (...a) => execFileSync('git', a, {encoding: 'utf8'}).trim();
const branch = process.env.HEAD_REF;
const base = process.env.BASE_SHA || 'origin/main';
const files = git('diff', '--name-only', `${base}...HEAD`).split('\n').filter(Boolean);

let otherBranches = [];
if (slugOf(branch) && process.env.GITHUB_TOKEN) {
  for (let page = 1; page <= 5; page++) {
    const r = await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/pulls?state=open&per_page=100&page=${page}`,
      {headers: {authorization: `Bearer ${process.env.GITHUB_TOKEN}`, accept: 'application/vnd.github+json'}});
    if (!r.ok) { console.error(`GitHub API ${r.status} — проверка дублей не выполнена`); process.exit(1); }
    const list = await r.json();
    otherBranches.push(...list.filter(p => String(p.number) !== process.env.PR_NUMBER).map(p => p.head.ref));
    if (list.length < 100) break;
  }
}

const packs = [...new Set(files.map(f => /^asset-packs\/incoming\/([^/]+)\//.exec(f)?.[1]).filter(Boolean))];
const errors = check({branch, files, otherBranches});
const out = errors.length
  ? `## ASSET GUARD — FAIL (${errors.length})\n\n${errors.map(e => '- ' + e).join('\n')}\n\nИсправь сам и запушь снова. Правила: automation/prompts/ASSET_PACK_BOT.md (законы З1–З3).\n`
  : `## ASSET GUARD — PASS\n\nВетка ${branch}, файлов ${files.length}, паков ${packs.length}.\n`;
console.log(out);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, out);
process.exit(errors.length ? 1 : 0);
