// ASSET GUARD (Claude, 18.11.2026): законы З1–З3 промпта «АССЕТЫ» v3.4 как машинная проверка.
// Чистая функция без сети: на вход ветка PR, изменённые файлы, ветки других открытых PR, факты о compare.png.
export const RULES = ['branch-name', 'only-own-pack', 'bot-no-packs', 'no-duplicate', 'compare-png'];

const SUFFIX = /-(20\d{6}|\d{4}|gpt\d*|g\d+|v\d+|batch\d+|copy|new|fix\d*)$/;
export function baseSlug(slug) {
  let s = slug, prev;
  do { prev = s; s = s.replace(SUFFIX, ''); } while (s !== prev && s);
  return s;
}
export function slugOf(branch) {
  const m = /^lab\/assets-(.+)$/.exec(branch || '');
  return m ? m[1] : null;
}
const PACK = /^asset-packs\/incoming\/([^/]+)\//;
const REPORT = /^reports\/asset-pack-bot\/[^/]+\.md$/;
const NO_COMPARE_NEEDED = /^asset-packs\/incoming\/[^/]+\/(ZAKAZ\.json|README\.md|zakaz\/.*)$/;

export function check({branch, files, otherBranches = [], compare = {}, off = new Set()}) {
  const errors = [];
  const on = r => !off.has(r);
  const slug = slugOf(branch);
  const isClaude = /^claude\//.test(branch || '');
  const isBot = /^lab\/asset-bot-/.test(branch || '');
  const packFiles = files.filter(f => PACK.test(f));
  const packs = [...new Set(packFiles.map(f => PACK.exec(f)[1]))];

  if (isClaude) return errors; // ветки Claude проверяет Claude

  if (on('bot-no-packs') && isBot && packFiles.length)
    errors.push(`З2: PR бота (${branch}) меняет ассеты ${packs.join(', ')} — ассеты только в ветке lab/assets-<игра>`);
  if (isBot) return errors;

  if (on('branch-name') && packFiles.length && !slug)
    errors.push(`З1: ассеты меняются из ветки «${branch}» — нужна ветка lab/assets-<игра>`);
  if (!slug) return errors;

  if (on('branch-name') && baseSlug(slug) !== slug)
    errors.push(`З1: ветка lab/assets-${slug} с датой/суффиксом — одна игра = одна ветка lab/assets-${baseSlug(slug)}; перенеси работу туда`);

  if (on('only-own-pack')) {
    const foreign = files.filter(f => !PACK.test(f) && !REPORT.test(f));
    if (foreign.length) errors.push(`З2: PR ассетов меняет общие файлы (${foreign.slice(0, 8).join(', ')}${foreign.length > 8 ? ' …' : ''}) — вынеси их в отдельный маленький PR`);
    if (packs.length > 1) errors.push(`З2: в одном PR несколько паков (${packs.join(', ')}) — одна игра = один PR`);
    const reports = files.filter(f => REPORT.test(f));
    if (reports.length > 1) errors.push(`З2: в одном PR несколько отчётов (${reports.join(', ')})`);
  }

  if (on('no-duplicate')) {
    const me = baseSlug(slug);
    const dups = otherBranches.filter(b => b !== branch && slugOf(b) && baseSlug(slugOf(b)) === me);
    if (dups.length) errors.push(`З1: у игры «${me}» уже есть открытый PR из ${dups.join(', ')} — сведи всё в один PR (lab/assets-${me}), дубли закрой «перенесено в #N»`);
  }

  if (on('compare-png')) {
    const needs = packFiles.some(f => !NO_COMPARE_NEEDED.test(f) && !/\/_check\//.test(f));
    if (needs) {
      if (!compare.changed) errors.push(`З3: ассеты изменены, а _check/compare.png в этом PR не обновлён — сделай настоящий снимок сравнения (шаг 3)`);
      else if (!compare.isPng) errors.push(`З3: _check/compare.png не PNG — нужен настоящий снимок из браузера`);
      else if (compare.bytes < 20000) errors.push(`З3: _check/compare.png слишком маленький (${compare.bytes} байт) — нужен крупный лист сравнения`);
    }
  }
  return errors;
}
