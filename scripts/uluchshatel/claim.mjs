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

