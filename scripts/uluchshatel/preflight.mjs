// CLI проверки захвата игры. Не меняет игровые исходники.
import { blockersFor } from './claim.mjs';
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
  const results = [];
  for (let page = 1; page <= 20; page++) {
    const separator = path.includes('?') ? '&' : '?';
    const items = await api(path + separator + 'per_page=100&page=' + page);
    if (!Array.isArray(items)) throw new Error('GitHub API вернул неполную страницу: ' + path);
    results.push(...items);
    if (items.length < 100) return results;
  }
  throw new Error('GitHub API: пагинация превысила 20 страниц, захват запрещён');
}

async function main() {
  const [game, branch] = process.argv.slice(2);
  if (!game || !branch) throw new Error('Пример: node preflight.mjs games/skin-trainer lab/my-branch');
  const prefix = '/repos/' + REPO;
  const [prs, commits, lockFile] = await Promise.all([
    allPages(prefix + '/pulls?state=open'),
    api(prefix + '/commits?path=' + encodeURIComponent(game) + '&per_page=1'),
    api(prefix + '/contents/rules/09-platforma/ZANYATO.md?ref=main')
  ]);
  if (!commits.length || !lockFile.content) throw new Error('Неполные данные GitHub, захват запрещён');
  const checked = await Promise.all(prs.map(async pr => ({
    number: pr.number,
    url: pr.html_url,
    branch: pr.head.ref,
    repo: pr.head.repo?.full_name,
    files: (await allPages(prefix + '/pulls/' + pr.number + '/files')).map(file => file.filename)
  })));
  const locks = parseLocks(Buffer.from(lockFile.content, 'base64').toString('utf8'), game);
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
