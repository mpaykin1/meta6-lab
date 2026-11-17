// Каждая папка reference/* должна быть в ETALONY.md (единый каталог эталонов).
import {readdirSync, readFileSync, statSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
export function missing(root, catalogText) {
  const ref = join(root, 'reference');
  return readdirSync(ref).filter(d => statSync(join(ref, d)).isDirectory()).filter(d => !catalogText.includes('`' + d + '`'));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(fileURLToPath(new URL('../../', import.meta.url)));
  const miss = missing(root, readFileSync(join(root, 'ETALONY.md'), 'utf8'));
  if (miss.length) { console.error('ETALONY_CATALOG_MISSING ' + miss.join(', ') + ' — запусти python3 scripts/lab/build-etalony-catalog.py'); process.exit(1); }
  console.log('ETALONY_CATALOG_PASS');
}
