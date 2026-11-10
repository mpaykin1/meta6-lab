// Ловушки (К2): каждая порча watch.mjs обязана ронять verify.mjs. Новые сценарии охраняют конфликты, checks, приоритет слияния, meta6 и ретраи.
import {readFileSync, writeFileSync, mkdtempSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join, dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const here = dirname(fileURLToPath(import.meta.url)), src = readFileSync(resolve(here, 'watch.mjs'), 'utf8');
const M = [
  ['порог зависания 3 ч убран', 'if (minutes < 180)', 'if (minutes < 99999)'],
  ['закрытый PR считается готовым', "r.status = '✖ ЗАКРЫТО без слияния'", "r.status = '✅ ГОТОВО · слито'"],
  ['сторож не добавляет незаписанные PR', "if (p.state !== 'open' || seen.has(key(project, branch))) continue;", 'if (true) continue;'],
  ['зависшие не поднимаются наверх', 'rank(x.status) - rank(y.status) ||', ''],
  ['обман: верить «ГОТОВО» без слияния', 'noBranch(r.branch) && /ГОТОВО/.test(r.status)', '/ГОТОВО/.test(r.status)'],
  ['игнорировать конфликт', "p?.mergeable_state === 'dirty'", "p?.mergeable_state === 'clean'"],
  ['скрыть упавшие проверки', 'else if (p?.failedChecks?.length)', 'else if (false)'],
  ['красный слитый PR перестал считаться ГОТОВО', 'if (p?.merged) r.status =', 'if (false && p?.merged) r.status ='],
  ['исключить meta6 из реестра', "['МГ', data.mgPulls]", "['МГ', {}]"],
  ['не повторять запрос mergeable=null', 'attempt < 3', 'attempt < 1'],
];
const dir = mkdtempSync(join(tmpdir(), 'zadachi-')); let bad = 0;
for (const [name, from, to] of M) {
  if (!src.includes(from)) { console.log('MUTATION_NOT_APPLIED', name); bad++; continue; }
  const f = join(dir, 'watch.mjs'); writeFileSync(f, src.replace(from, to));
  const res = spawnSync(process.execPath, [resolve(here, 'verify.mjs'), f], {encoding: 'utf8'});
  if (res.status === 0) { console.log('SURVIVED', name); bad++; } else console.log('caught', name);
}
console.log(bad ? `ZADACHI_MUTATE_FAIL ${bad}` : `ZADACHI_MUTATE_OK ${M.length}/${M.length}`);
process.exit(bad ? 1 : 0);
