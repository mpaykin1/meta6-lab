import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {render,available,parseTasks,assertNotEmpty} from '../build.mjs';
test('conflict before red before stalled; dedup',()=>{
 const a=[{id:3,branch:'c',priority:2,stalled:true,problem:'🛑 ЗАВИС',action:'Продолжить',finish:false},{id:2,branch:'b',priority:1,red:true,problem:'Красная проверка',action:'Исправить',finish:false},{id:1,branch:'a',priority:0,conflict:true,problem:'Конфликт',action:'Слить main',finish:true}];
 const out=render(a);assert.ok(out.indexOf('PR #1')<out.indexOf('PR #2'));assert.ok(out.indexOf('PR #2')<out.indexOf('PR #3'));
});
test('expired chat claim becomes free if no newer commit',()=>{
 const now=Date.parse('2026-11-10T12:00:00Z');
 assert.equal(available('Взял: чат-0900 2026-11-10T09:00:00Z','2026-11-10T08:00:00Z',now),true);
 assert.match(render([{id:1,branch:'x',priority:2,stalled:true,problem:'stalled',action:'fix',finish:false,lastCommit:'2026-11-10T08:00:00Z'}],[],'### PR #1\n- Взял: чат-0900 2026-11-10T09:00:00Z',now),/Взял: —/);
});

test('ZADACHI duplicate PR rows yield one card',()=>{
 const rows='| 🛑 ЗАВИС | B2 | МГЛ | бот | `lab/a` | [#200](https://github.com/mpaykin1/meta6-lab/pull/200) | now | — |\n';
 const tasks=parseTasks(rows+rows);assert.equal(tasks.length,1);assert.equal(tasks[0].id,200);
});
test('failed check card retains the exact check name and run link',()=>{
 const url='https://github.com/mpaykin1/meta6-lab/actions/runs/123';
 const out=render([{id:12,branch:'lab/a',priority:1,red:true,stalled:false,finish:true,
   problem:'Красная проверка: protect-shared ('+url+')',action:'Исправь protect-shared, лог: '+url,
   headSha:'abc',lastCommit:'2026-11-10T08:00:00Z'}]);
 assert.match(out,/protect-shared/);assert.match(out,/actions\/runs\/123/);
});
test('FINISH tasks precede non-FINISH tasks within a priority group',()=>{
 const cs=[{id:2,branch:'b',priority:1,red:true,finish:false,problem:'red',action:'fix'},
 {id:3,branch:'a',priority:1,red:true,finish:true,problem:'red',action:'fix'}];
 const out=render(cs);assert.ok(out.indexOf('PR #3')<out.indexOf('PR #2'));
});
test('trap: stalled ZADACHI cannot produce empty dispatcher',()=>{
 assert.throws(()=>assertNotEmpty('| 🛑 ЗАВИС | stalled |',[]),/Empty dispatcher/);
 assert.doesNotThrow(()=>assertNotEmpty('| ✅ ГОТОВО | done |',[]));
 assert.doesNotThrow(()=>assertNotEmpty('Статус: 🛑 ЗАВИС означает ожидание, но строк нет',[]));
});
test('trap: workflow retries push when main moved',()=>{
 const y=fs.readFileSync(new URL('../../../.github/workflows/dispetcher.yml',import.meta.url),'utf8');
 const step=y.slice(y.indexOf('Commit queue'));
 assert.match(step,/for attempt in 1 2 3 4 5/);
 assert.match(step,/git reset --hard origin\/main\s+node scripts\/dispetcher\/run\.mjs/);
 assert.match(step,/GITHUB_TOKEN/);
});
