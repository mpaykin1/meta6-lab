// Постоянная ловушка (OSHIBKI 1154): сторож не должен коммитить сводку, если изменились только время/SHA.
import {execFileSync, spawnSync} from 'node:child_process';
import {mkdtempSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const script = resolve(fileURLToPath(new URL('./meaningful-diff.sh', import.meta.url)));
const dir = mkdtempSync(join(tmpdir(), 'mdiff-'));
const git = (...a) => execFileSync('git', a, {cwd: dir, stdio: 'pipe'});
git('init', '-q'); git('config', 'user.email', 't@t'); git('config', 'user.name', 't');
const base = 'Сторож проверил: 2026-11-17 06:34 UTC\nUTC: 2026-11-17T06:34:58Z | МГЛ: aaa\n{\n  "generated_at": "1",\n  "lab": "aaa",\n  "run": "x"\n}\n**Итог:** зависло 39\n';
writeFileSync(join(dir, 'S.md'), base); git('add', '.'); git('commit', '-qm', 'base');
const run = () => spawnSync('bash', [script], {cwd: dir}).status;
let fails = 0;
const check = (name, text, want) => {
  writeFileSync(join(dir, 'S.md'), text);
  const got = run();
  if (got !== want) { console.error('MUTATION_SURVIVED ' + name + ' got ' + got + ' want ' + want); fails++; }
  else console.log('MUTATION_KILLED ' + name);
  git('checkout', '-q', '--', 'S.md');
};
check('only timestamps and SHA', base.replace('06:34 UTC', '06:35 UTC').replace('06:34:58', '06:52:45').replace(/"generated_at": "1"/, '"generated_at": "2"').replace(/"lab": "aaa"/, '"lab": "bbb"').replace('"run": "x"', '"run": "y"'), 1);
check('real change in summary', base.replace('зависло 39', 'зависло 40'), 0);
check('timestamp plus real change', base.replace('06:34 UTC', '06:35 UTC').replace('зависло 39', 'зависло 38'), 0);
check('no change at all', base, 1);
if (fails) process.exit(1);
console.log('MEANINGFUL_DIFF_MUTATIONS_PASS 4');
