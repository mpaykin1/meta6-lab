// Shared, deterministic policies; no GitHub token, filesystem or network access.
export const THREE_DAYS = 72 * 60 * 60 * 1000;
export const CUTOFF = Date.parse('2026-11-12T00:00:00Z');

export function reconcileSection(content, key, entries) {
  const start = '<!-- STOROZHA:' + key + ':BEGIN -->';
  const end = '<!-- STOROZHA:' + key + ':END -->';
  const unique = [...new Map(entries.map(entry => [entry.id, entry.text])).values()];
  const block = start + '\n' + unique.join('\n') + (unique.length ? '\n' : '') + end;
  const first = content.indexOf(start);
  const last = content.indexOf(end);
  if ((first < 0) !== (last < 0)) throw Error('Malformed DLYA_CLAUDE markers for ' + key);
  if (first >= 0) {
    if (last <= first || content.indexOf(start, first + 1) >= 0) {
      throw Error('Duplicated or inverted DLYA_CLAUDE section ' + key);
    }
    return content.slice(0, first) + block + content.slice(last + end.length);
  }
  return content.replace(/\s*$/, '') + '\n\n' + block + '\n';
}

export function conflictFiles(output) {
  const paths = [];
  for (const line of output.split(/\r?\n/)) {
    const conflict = /^CONFLICT \([^)]+\): (?:Merge conflict in |(.+?) (?:deleted|added) in )(.+)?$/.exec(line);
    if (conflict) paths.push((conflict[2] || conflict[1] || '').trim());
    if (/^CONFLICT /.test(line) && !conflict) {
      const fallback = line.match(/(?: in |^CONFLICT \([^)]+\): )(.+)$/);
      if (fallback) paths.push(fallback[1].trim());
    }
  }
  return [...new Set(paths.filter(p => p && !/[\n\r|]/.test(p)))].sort();
}

export function alive(pr, now = Date.now()) {
  const timestamp = Date.parse(pr.lastCommitAt || '');
  return Number.isFinite(timestamp) && now - timestamp < THREE_DAYS && timestamp <= now;
}

export function staleDecision(pr, now = Date.now()) {
  const date = Date.parse(pr.lastCommitAt || '');
  const close = pr.state === 'open' && Number.isFinite(date) &&
    date <= now && now - date >= THREE_DAYS;
  return {close, deleteBranch: false};
}

export function quota(prs, number, now = Date.now()) {
  const living = prs.filter(p => alive(p, now))
    .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at) || a.number - b.number);
  const pr = prs.find(p => p.number === number);
  const selected = living.slice(0, 5);
  // Claude 11.11.2026: ремонт красного main (ветки lab/remont-main-*) лимитом не блокируется —
  // пока бот-проходчик красный на main, ни одну игровую работу нельзя честно принять.
  const repair = /^lab\/remont-main-/.test(pr?.head?.ref || '');
  const reject = Boolean(pr && !repair && Date.parse(pr.created_at) > CUTOFF &&
    living.length > 5 && !selected.some(p => p.number === number));
  return {reject, living: living.length, oldest: selected.map(p => p.number),
    message: reject ? 'Сначала доведи старые PR: ' + selected.map(p => '#' + p.number).join(', ') : ''};
}

export function referenceGate(files, existingPaths, protectedPaths = []) {
  const errors = [], additions = [];
  const existing = new Set(existingPaths);
  const paths = [...existing];
  for (const file of files) {
    const p = file.filename, status = file.status;
    // GitHub reports a rename once: the old protected path must be checked as a removal.
    if (file.previous_filename && file.previous_filename !== p) {
      errors.push(...referenceGate([
        {filename: file.previous_filename, status: 'removed'}
      ], existingPaths, protectedPaths));
    }
    if (protectedPaths.some(root => p === root || p.startsWith(root + '/'))) {
      errors.push(p + ': защищённый путь из реестра — только Claude');
    }
    if (/^reference\//.test(p)) {
      if (status !== 'added') errors.push(p + ': существующий эталон нельзя изменять или удалять');
      else additions.push(p);
    }
    const protectedScript = /^scripts\/(?:meta-bot\/|kontur\/|meta-games-guard\.sh$|storozha\/)/.test(p) ||
      /^scripts\/.*(?:guard|bot)(?:[/._-]|$)/i.test(p);
    const protectedTest = /(?:^|\/)(?:__tests?__|tests?|specs?)\//i.test(p) ||
      /(?:^|\/)(?:mutate-|verify-|selftest|test[-.])[^/]*\.[cm]?[jt]s$/i.test(p) ||
      /\.(?:test|spec)\.[cm]?[jt]sx?$/i.test(p);
    if (/^\.github\/workflows\//.test(p) || (protectedScript || protectedTest) && status !== 'added') {
      errors.push(p + ': изменение защищённого workflow/охранника/бота/теста — только Claude');
    }
  }
  if (additions.length) {
    if (files.length !== additions.length) errors.push('Новый эталон: PR должен только добавлять файлы');
    const folders = new Set(additions.map(p => p.split('/').slice(0, 2).join('/')));
    if (folders.size !== 1 || additions.some(p => p.split('/').length < 3)) {
      errors.push('Новый эталон: ровно одна новая папка reference/<имя>/');
    }
    for (const folder of folders) {
      if (paths.some(p => p === folder || p.startsWith(folder + '/'))) {
        errors.push(folder + ': папка эталона уже существует на main');
      }
    }
  }
  return [...new Set(errors)];
}
