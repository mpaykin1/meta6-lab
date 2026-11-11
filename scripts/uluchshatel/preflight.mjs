// Проверка права захватить игру. Ничего не изменяет в репозитории.
const REPO = 'mpaykin1/meta6-lab';

export function overlaps(path, game) {
  return path === game || path.startsWith(game + '/');
}

export function blockersFor({ game, branch, prs, lastCommitAt, locks = [], nowMs = Date.now() }) {
  if (!/^games\/[a-z0-9-]+$/.test(game) || !branch || !Array.isArray(prs) || !Array.isArray(locks)) {
    throw new Error('Неверные данные для захвата игры');
  }
  const blockers = [];
  for (const pr of prs) {
    if (!Array.isArray(pr.files)) throw new Error('Не получен полный список файлов открытого PR');
    if (pr.branch === branch && pr.repo === REPO) continue;
    if (pr.files.some(path => overlaps(path, game))) {
      blockers.push('Открытый PR #' + pr.number + ' изменяет игру: ' + pr.url);
    }
  }
  if (typeof lastCommitAt !== 'string' || !Number.isFinite(Date.parse(lastCommitAt))) {
    throw new Error('Нет точной даты последнего изменения игры');
  }
  const ageMinutes = (nowMs - Date.parse(lastCommitAt)) / 60000;
  if (ageMinutes < 60) {
    blockers.push('Последний коммит игры менее 60 минут назад (' + lastCommitAt + ')');
  }
  for (const lock of locks) {
    if (lock.game === game && !lock.free && lock.branch !== branch) {
      blockers.push('Игра занята в ZANYATO.md: ' + lock.branch);
    }
  }
  return blockers;
}

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
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
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

if (process.argv[1] && import.meta.url.endsWith('/' + process.argv[1].split(/[\\/]/).at(-1))) {
  main().catch(error => {
    console.error('НЕ ВИЖУ: ' + error.message);
    process.exitCode = 2;
  });
}
