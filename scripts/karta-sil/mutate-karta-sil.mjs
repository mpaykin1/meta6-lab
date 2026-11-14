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

// Проверяем реальные функции обеих очередей и испорченные копии их исходников.
import fs from 'node:fs/promises';
import {listOpenPullRequests} from '../dispetcher/build.mjs';
import {allPages} from './build.mjs';

const paginationItem = number => ({number,state:'open',head:{sha:'sha-'+number,ref:'lab/'+number}});
async function checkPagination(load) {
  const seen=[];
  const items=await load(async endpoint=>{
    const params=new URL(endpoint,'https://api.github.com').searchParams;
    assert.equal(params.get('per_page'),'100');
    const page=Number(params.get('page'));
    seen.push(page);
    assert.ok(seen.length<=24,'повтор страницы');
    return page<=23 ? [paginationItem(page)] : [];
  });
  assert.equal(items.length,23);
  assert.deepEqual(seen,Array.from({length:24},(_,i)=>i+1));
  for (const status of [403,429]) {
    await assert.rejects(()=>load(async endpoint=>{
      const page=new URL(endpoint,'https://api.github.com').searchParams.get('page');
      if(page==='1')return [paginationItem(17)];
      throw Error('HTTP '+status);
    }),new RegExp('нет данных.*'+status));
  }
  await assert.rejects(()=>load(async()=>null),/нет данных/);
}

for (const [name,path,wrap] of [
  ['dispatcher','../dispetcher/build.mjs',module=>async request=>
    [...(await module.listOpenPullRequests(request)).values()]],
  ['karta','./build.mjs',module=>request=>module.allPages('/pulls?state=all',undefined,request)]
]) {
  test(name+': все страницы до пустой; 403/429/null не являются пустым списком',async()=>{
    await checkPagination(wrap({listOpenPullRequests,allPages}));
    const source=await fs.readFile(new URL(path,import.meta.url),'utf8');
    const mutations=[
      ['только первая страница',source.replace(/(?:batch|chunk)\.length\s*===\s*0/,'page >= 1')],
      ['ошибка API как пустая страница',source.replace(
        /throw (?:new )?Error\('GitHub API[^\n]*error\.message\);/,
        name==='dispatcher' ? 'return result;' : 'return items;')],
      ['обман: всегда page=1',source.replace(/page='\s*\+\s*page/,"page=' + 1")]
    ];
    for (const [label,changed] of mutations) {
      assert.notEqual(changed,source,'мутация должна изменить код: '+label);
      const module=await import('data:text/javascript;base64,'+Buffer.from(changed).toString('base64'));
      await assert.rejects(()=>checkPagination(wrap(module)),undefined,label);
    }
  });
}

async function checkEscalation(route) {
  const body='КАРТА СИЛ: CHAT FAIL #1 https://github.com/x\n'+
    'КАРТА СИЛ: CHAT FAIL #2 https://github.com/y';
  for (const zone of ['зелёная','жёлтая','красная']) {
    const map={schema:1,status:'полная',prs:[{number:11,type:'game_fix',changedFiles:1}],
      metrics:[{type:'game_fix',actor:'автозадача',zone}]};
    assert.equal(route({id:11,body},map).target,'claude');
    assert.equal(route({id:11,body:'НУЖЕН CLAUDE'},map).target,'claude');
  }
  assert.equal(route({id:11,body},null).target,'claude');
}
test('две неудачи чата имеют приоритет над зелёной картой и отсутствием данных',async()=>{
  await checkEscalation(routeFor);
  const source=await fs.readFile(new URL('./route.mjs',import.meta.url),'utf8');
  const mutants=[
    source.replace('failures >= 2','failures >= 3'),
    source.replace("target:'claude'","target:'auto'"),
    source.replace('  const reports =',
      "  if(map?.metrics?.[0]?.zone === 'зелёная') return {target:'auto'};\n  const reports =")
  ];
  for(const changed of mutants){
    assert.notEqual(changed,source);
    const module=await import('data:text/javascript;base64,'+Buffer.from(changed).toString('base64'));
    await assert.rejects(()=>checkEscalation(module.routeFor));
  }
});
