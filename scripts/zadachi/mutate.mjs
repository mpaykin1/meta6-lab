// Mutation traps for ZADACHI watch. Every change must be detected by verify.mjs.
import {readFileSync, writeFileSync, mkdtempSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join, dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const here=dirname(fileURLToPath(import.meta.url)),source=readFileSync(resolve(here,'watch.mjs'),'utf8');
const M=[
 ['порог зависания 3 ч', 'if (minutes < 180)', 'if (minutes < 99999)'],
 ['закрытый PR ошибочно считается готовым', "r.status='✖ ЗАКРЫТО без слияния'", "r.status='✅ ГОТОВО · слито'"],
 ['незаписанные PR исчезли из таблицы', "if(p.state!=='open'||seen.has(rp+'::'+branch))continue", "if(true)continue"],
 ['зависшие потеряли приоритет', 'rank(x.status)-rank(y.status)||', '0||'],
 ['обман: доверять слову ГОТОВО для неслитой ветки', 'noBranch(r.branch)&&/ГОТОВО/', 'true&&/ГОТОВО/'],
 ['1.1 отключён GitHub check-runs', '/check-runs?per_page=100', '/checks-ignored?per_page=100'],
 ['1.1 mergeable_state не читается', 'mergeable_state:detailed.mergeable_state', 'mergeable_state:undefined'],
 ['1.2 конфликт игнорируется', "p?.mergeable_state==='dirty'", 'false'],
 ['1.2 красные проверки игнорируются', 'p&&failedChecks(p).length', 'false'],
 ['1.3 отсутствует строка «Чинить сейчас»', '**Чинить сейчас:**', '**Не чинить:**'],
 ['1.4 МГ ошибочно считается МГЛ', "r.project==='МГ'?", 'false?'],
 ['1.5 дубли не объединяются', 'if(!id||!dedup.has(id))', 'if(true)'],
 ['1.6 старый дубль не помечается', 'p?.duplicateOf&&age>=2880', 'false&&age>=2880'],
 ['1.6 supersedes ошибочно не связывается с прежним PR', 'if(old&&old.state===\'open\')old.supersededBy=next.number', 'if(false)old.supersededBy=next.number']
];
const dir=mkdtempSync(join(tmpdir(),'zadachi-'));let failed=0;
for(const [name,from,to] of M){
 if(!source.includes(from)){console.log('MUTATION_NOT_APPLIED',name);failed++;continue;}
 const file=join(dir,'watch.mjs');writeFileSync(file,source.replace(from,to));
 const result=spawnSync(process.execPath,[resolve(here,'verify.mjs'),file],{encoding:'utf8'});
 if(result.status===0){console.log('SURVIVED',name);failed++;}else console.log('caught',name);
}
console.log(failed?'ZADACHI_MUTATE_FAIL '+failed:'ZADACHI_MUTATE_OK '+M.length+'/'+M.length);
process.exit(failed?1:0);
