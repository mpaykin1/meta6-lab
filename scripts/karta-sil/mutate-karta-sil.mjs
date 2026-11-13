import {test} from 'node:test';
import assert from 'node:assert/strict';
import {requireResponse,grade,classify,statusOf,stableJson,publishablePr,isRepeatJournalError} from './build.mjs';
import {routeFor} from './route.mjs';
import dictionary from './types.json' with {type:'json'};

test('мутация 403 как пустой список обязана упасть',()=>{
  assert.throws(()=>requireResponse({status:403,ok:false},'/pulls'),/403/);
  assert.throws(()=>requireResponse({status:429,ok:false},'/pulls'),/429/);
  assert.throws(()=>requireResponse(null,'/pulls'),/нет данных/);
});
test('мутация: заброшенный PR не считается слитым',()=>{
  const pr={state:'open',merged_at:null,body:''};
  assert.equal(statusOf(pr,'2026-11-01T00:00:00Z',Date.parse('2026-11-13T00:00:00Z')),'брошено');
  assert.equal(grade(0,0,1,0,false),'красная');
});
test('мутация: изменение только времени не меняет JSON',()=>{
  const snapshot={schema:1,metrics:[{merged:1}]};
  const before=stableJson(snapshot);
  const after=stableJson({...snapshot});
  assert.equal(before,after);
  assert.doesNotMatch(before,/generated_at|updated_at/);
});
test('мутация: хардкод типа и пустой словарь запрещены',()=>{
  assert.equal(classify({title:'unknown',head:{ref:'lab/foobar'}},
    ['reference/my-world/index.html'],dictionary),'game_reference');
  assert.throws(()=>classify({title:'reference'},[],{types:[]}),/dictionary/i);
});
test('мутация: красная зона никогда не выдаётся автозадачам',()=>{
  const map={schema:1,status:'полная',prs:[{number:10,type:'game_fix',changedFiles:2}],
    metrics:[{type:'game_fix',actor:'автозадача',zone:'красная'}]};
  assert.equal(routeFor({id:10},map).target,'chat');
  assert.equal(routeFor({id:10},{...map,status:'нет данных'}).target,'chat');
  const yellow={...map,metrics:[{type:'game_fix',actor:'автозадача',zone:'жёлтая'}]};
  assert.equal(routeFor({id:10},yellow).target,'auto');
  assert.equal(routeFor({id:10},{...yellow,prs:[{number:10,type:'game_fix',changedFiles:6}]}).target,'chat');
});
test('мутация: две документированные неудачи чата => Claude',()=>{
 const map={schema:1,status:'полная',prs:[{number:9,type:'repo_clean',changedFiles:2}],
 metrics:[{type:'repo_clean',actor:'автозадача',zone:'красная'}]};
 assert.equal(routeFor({id:9,body:'КАРТА СИЛ: CHAT FAIL #1 https://github.com/x\nКАРТА СИЛ: CHAT FAIL #2 https://github.com/y'},map).target,'claude');
});

test('мутация: время последнего коммита PR не публикуется без изменения цифр',()=>{
  const base={number:301,status:'активно',type:'summary_dispatch',merged:0,
    lastCommit:'2026-11-13T19:00:00Z'};
  const later={...base,lastCommit:'2026-11-13T19:59:59Z'};
  assert.equal(stableJson(publishablePr(base)),stableJson(publishablePr(later)));
  assert.ok(!Object.hasOwn(publishablePr(base),'lastCommit'));
});

test('мутация: регрессия прежней M1 ловушки отмечается повторной ошибкой',()=>{
 assert.equal(isRepeatJournalError('M4: вставка run_bot сломалась существующая мутация M1'),true);
 assert.equal(isRepeatJournalError('Обычное исправление интерфейса без регрессии'),false);
});
