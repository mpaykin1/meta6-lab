// CLI проверки захвата игры. Не меняет игровые исходники.
import { blockersFor, taskLocksFor } from './claim.mjs';
import { allPages as paginate, allChangedPaths } from './paginate.mjs';
const REPO = 'mpaykin1/meta6-lab';

function parseLocks(markdown, game) {
  const locks = [];
  const slug = game.slice('games/'.length);
  for (const line of markdown.split('\n')) {
    if (!line.startsWith('|')) continue;
    const parts = line.split('|').map(value => value.trim());
    const title = parts[1] || '';
    const branch = (parts[2] || '').replaceAll('`', '');
    const owner = parts[3] || '';
    if (!title.split(/[^a-z0-9/-]+/).some(token => token === slug || token === game)) continue;
    locks.push({ game, branch, free: /свободно/i.test(owner) });
  }
  return locks;
}

async function api(path) {
  const token = process.env.ULUCHSHATEL_TOKEN || process.env.GH_TOKEN;
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(token ? { Authorization: 'Bearer ' + token } : {})
  };
  const response = await fetch('https://api.github.com' + path, { headers });
  if (!response.ok) throw new Error('GitHub API HTTP ' + response.status + ': ' + path);
  return response.json();
}

async function allPages(path) {
  return paginate(path, api);
}

async function main() {
  const [game, branch] = process.argv.slice(2);
  if (!game || !branch) throw new Error('Пример: node preflight.mjs games/skin-trainer lab/my-branch');
  const prefix = '/repos/' + REPO;
  const [prs, commits, lockFile, taskFile] = await Promise.all([
    allPages(prefix + '/pulls?state=open'),
    api(prefix + '/commits?path=' + encodeURIComponent(game) + '&per_page=1'),
    api(prefix + '/contents/rules/09-platforma/ZANYATO.md?ref=main'),
    api(prefix + '/contents/ZADACHI.md?ref=main')
  ]);
  if (!Array.isArray(commits) || !commits.length || !lockFile.content || !taskFile.content) {
    throw new Error('Неполные данные GitHub, захват запрещён');
  }
  const checked = await Promise.all(prs.map(async pr => ({
    number: pr.number,
    url: pr.html_url,
    branch: pr.head.ref,
    repo: pr.head.repo?.full_name,
    files: allChangedPaths(await allPages(prefix + '/pulls/' + pr.number + '/files'))
  })));
  console.log('PREFLIGHT checked ' + checked.length + ' open PRs and ' +
    checked.reduce((sum, pr) => sum + pr.files.length, 0) + ' changed paths');
  const locks = [
    ...parseLocks(Buffer.from(lockFile.content, 'base64').toString('utf8'), game),
    ...taskLocksFor(Buffer.from(taskFile.content, 'base64').toString('utf8'), game)
  ];
  const blockers = blockersFor({
    game,
    branch,
    prs: checked,
    lastCommitAt: commits[0].commit?.committer?.date,
    locks
  });
  console.log(blockers.length ? 'ЗАХВАТ ЗАПРЕЩЁН\n' + blockers.join('\n') : 'ЗАХВАТ РАЗРЕШЁН');
  if (blockers.length) process.exitCode = 2;
}

main().catch(error => {
  console.error('НЕ ВИЖУ: ' + error.message);
  process.exitCode = 2;
});
