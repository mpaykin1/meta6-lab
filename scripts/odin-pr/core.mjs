// Claude 18.11.2026: ОДИН PR НА ДЕЛО. 16–17.11 автозадачи открыли ~20 PR (#351–#407),
// почти каждый правил общий журнал automation/NADZOR.md и карточку Z01 — все PR
// конфликтовали друг с другом, ни один не сливался, и следующий запуск открывал новый.
// Правило 1: журнал и карточки задач в PR не правят — их коммитят сразу в main.
// Правило 2: новый PR не может менять тот же файл, что и другой свежий открытый PR —
// такое дело продолжают в старом PR.

export const JOURNAL = [
  /^automation\/NADZOR\.md$/,
  /^automation\/zadachi\/[^/]+\.md$/,
  /^reports\/zavaly\/PROGRESS\.md$/,
  /^reports\/avtozadachi\//
];
// Общие таблицы, куда каждый PR дописывает свою строку: совпадение по ним — не дубль.
export const SHARED_OK = new Set(['OSHIBKI.md', 'ZADACHI.md', 'TOLKNUT.md', 'SLIYANIE.md', 'DISPETCHER.md']);
export const FRESH_HOURS = 72;

export const isJournal = name => JOURNAL.some(r => r.test(name));

// files: [{filename, status}] из GitHub. Новые файлы (added) разрешены: так Claude создаёт карточки.
export function journalViolations(files) {
  return files.filter(f => f.status !== 'added' && isJournal(f.filename)).map(f => f.filename);
}

const waitsForClaude = title => /НУЖЕН\s+CLAUDE/i.test(title || '');

// self: {number, files:[name]}; others: [{number, title, updated_at, files:[name]}]
export function findDuplicate(self, others, now = Date.now(), freshHours = FRESH_HOURS) {
  const mine = new Set(self.files.filter(n => !SHARED_OK.has(n) && !isJournal(n)));
  const candidates = others
    .filter(o => o.number < self.number)
    .filter(o => !waitsForClaude(o.title))
    .filter(o => now - Date.parse(o.updated_at) <= freshHours * 3600e3)
    .sort((a, b) => a.number - b.number);
  for (const o of candidates) {
    const shared = o.files.filter(n => mine.has(n));
    if (shared.length) return {number: o.number, files: shared};
  }
  return null;
}

export function closeComment(dup) {
  return [
    `ОДИН PR НА ДЕЛО: эти же файлы уже меняет открытый PR #${dup.number} (${dup.files.join(', ')}).`,
    `Этот PR закрыт автоматически, ветка сохранена. Продолжай работу в #${dup.number}: влей туда свои изменения, почини красное, доведи до слияния.`,
    'Правило: GPT.md, раздел 0А «Один PR на дело».'
  ].join('\n\n');
}

export function journalMessage(files) {
  return 'ОДИН PR НА ДЕЛО: журнал и карточки задач в PR не правят, иначе все PR конфликтуют друг с другом.\n'
    + 'Убери из PR: ' + files.join(', ') + '\n'
    + 'Эти записи коммить сразу в main (git pull --rebase и push, до 5 повторов). GPT.md, раздел 0А.';
}
