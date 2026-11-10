import {test} from 'node:test';
import assert from 'node:assert/strict';
import {render,available} from '../build.mjs';
test('conflict before red before stalled; dedup',()=>{
 const a=[{id:3,branch:'c',priority:2,stalled:true,problem:'🛑 ЗАВИС',action:'Продолжить',finish:false},{id:2,branch:'b',priority:1,red:true,problem:'Красная проверка',action:'Исправить',finish:false},{id:1,branch:'a',priority:0,conflict:true,problem:'Конфликт',action:'Слить main',finish:true}];
 const out=render(a);assert.ok(out.indexOf('PR #1')<out.indexOf('PR #2'));assert.ok(out.indexOf('PR #2')<out.indexOf('PR #3'));
});
test('expired chat claim becomes free if no newer commit',()=>{
 const now=Date.parse('2026-11-10T12:00:00Z');
 assert.equal(available('Взял: чат-0900 2026-11-10T09:00:00Z','2026-11-10T08:00:00Z',now),true);
 assert.match(render([{id:1,branch:'x',priority:2,stalled:true,problem:'stalled',action:'fix',finish:false,lastCommit:'2026-11-10T08:00:00Z'}],[],'### PR #1\n- Взял: чат-0900 2026-11-10T09:00:00Z',now),/Взял: —/);
});
