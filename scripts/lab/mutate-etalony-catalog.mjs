// Ловушка: каталог эталонов без одной папки должен краснеть.
import {readFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {missing} from './verify-etalony-catalog.mjs';
const root = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const text = readFileSync(join(root, 'ETALONY.md'), 'utf8');
if (missing(root, text).length) { console.error('baseline catalog incomplete'); process.exit(1); }
const victim = (text.match(/`([a-z0-9-]+)`/g) || []).map(s => s.slice(1, -1)).find(d => d.startsWith('ink-'));
const broken = text.split('\n').filter(l => !l.includes('`' + victim + '`')).join('\n');
if (!missing(root, broken).includes(victim)) { console.error('MUTATION_SURVIVED removed ' + victim); process.exit(1); }
console.log('MUTATION_KILLED catalog without ' + victim);
console.log('ETALONY_CATALOG_MUTATIONS_PASS 1');
