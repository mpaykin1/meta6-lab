// Ловушки (К2): каждая порча watch.mjs обязана ронять verify.mjs. Последняя — «обман» (верить слову «ГОТОВО» без слияния).
import {readFileSync, writeFileSync, mkdtempSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join, dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const here = dirname(fileURLToPath(import.meta.url)), src = readFileSync(resolve(here, 'watch.mjs'), 'utf8');
const M = [
  ['порог зависания 3 ч убран', 'if (minutes < 180)', 'if (minutes < 99999)'],
  ['закрытый PR считается готовым', "r.status = '✖ ЗАКРЫТО без слияния'", "r.status = '✅ ГОТОВО · слито'"],
  ['сторож не добавляет незаписанные PR', "if (p.state === 'open' && !seen.has(branch))", 'if (false)'],
  ['зависшие не поднимаются наверх', 'rank(x.status) - rank(y.status) ||', ''],
  ['обман: верить «ГОТОВО» без слияния', 'noBranch(r.branch) && /ГОТОВО/.test(r.status)', '/ГОТОВО/.test(r.status)'],
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
