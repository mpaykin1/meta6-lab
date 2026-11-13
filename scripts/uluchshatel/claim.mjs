// Проверка права захватить игру. Ничего не изменяет в репозитории.
const REPO = 'mpaykin1/meta6-lab';

export function overlaps(path, game) {
  return path === game || path.startsWith(game + '/');
}

// Task rows with no PR still reserve a game. Refuse incomplete task tables.
export function taskLocksFor(markdown, game) {
  if (typeof markdown !== 'string' || !/^games\/[a-z0-9-]+$/.test(game)) {
    throw new Error('Invalid ZADACHI input');
  }
  const start = markdown.indexOf('<!-- ZADACHI:START -->');
  const end = markdown.indexOf('<!-- ZADACHI:END -->', start);
  if (start < 0 || end < start) throw new Error('Incomplete ZADACHI.md task section');
  const rows = markdown.slice(start, end).split('\n')
    .filter(line => line.startsWith('|'))
    .map(line => line.split('|').map(value => value.trim()));
  const header = rows.find(row => row[1] === 'Статус' && row[2] === 'Задача');
  if (!header || header[5] !== 'Ветка') throw new Error('Unexpected ZADACHI.md columns');
  const slug = game.slice('games/'.length);
  const locks = [];
  for (const cells of rows) {
    if (cells === header || /^-+$/.test(cells[1] || '')) continue;
    if (cells.length < header.length) throw new Error('Incomplete ZADACHI.md row');
    const taskTokens = (cells[2] || '').split(/[^a-z0-9/-]+/i);
    if (!taskTokens.includes(game) && !taskTokens.includes(slug)) continue;
    const status = cells[1] || '';
    const branch = (cells[5] || '').replaceAll('`', '').trim();
    if (!branch) throw new Error('Missing task branch in ZADACHI.md');
    const free = /✅|✖|свободно/i.test(status);
    locks.push({ game, branch, free, source: 'ZADACHI.md' });
  }
  return locks;
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
      blockers.push('Игра занята в ' + (lock.source || 'ZANYATO.md') + ': ' + lock.branch);
    }
  }
  return blockers;
}

