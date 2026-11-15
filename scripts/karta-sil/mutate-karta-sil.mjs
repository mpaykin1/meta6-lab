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

import {identifyActor} from './build.mjs';
async function checkActorIdentity(identify) {
  const pr={title:'Карта сил автозадач',body:'Правила для автозадач и обычного чата',head:{ref:'lab/x'}};
  assert.equal(identify(pr,'| Карта сил | lab/x | чат ChatGPT | now |'),'чат ChatGPT');
  assert.equal(identify({...pr,body:'Исполнитель: чат ChatGPT'},
    '| Задача | lab/x | MG-строитель-2 | now |'),'автозадача');
  assert.equal(identify(pr,'| Другое | lab/x-extra | MG-строитель-3 | now |'),'неизвестно');
  assert.equal(identify(pr,''),'неизвестно');
  assert.equal(identify({...pr,body:'Исполнитель: MG-строитель-1'},''),'автозадача');
  assert.equal(identify({...pr,body:'Исполнитель: чат ChatGPT'},''),'чат ChatGPT');
  assert.equal(identify({...pr,body:'Исполнитель: MG-строитель-1\nИсполнитель: чат ChatGPT'},''),'неизвестно');
}
test('исполнитель определяется по авторству, а не по теме PR про автозадачи',async()=>{
  await checkActorIdentity(identifyActor);
  const source=await fs.readFile(new URL('./build.mjs',import.meta.url),'utf8');
  const start=source.indexOf('export function identifyActor(');
  const end=source.indexOf('\nexport function statusOf(',start);
  const replacements=[
    'export function identifyActor(pr,busy) { return actors[0]; }',
    "export function identifyActor(pr,busy) { return /автозадач/i.test(pr.title)?actors[0]:actors[2]; }",
    source.slice(start,end).replace("cells[1]?.replaceAll('`','') === branch",
      "cells[1]?.includes(branch)")
  ];
  for(const replacement of replacements){
    const changed=source.slice(0,start)+replacement+source.slice(end);
    assert.notEqual(changed,source);
    const module=await import('data:text/javascript;base64,'+Buffer.from(changed).toString('base64'));
    await assert.rejects(()=>checkActorIdentity(module.identifyActor));
  }
});

async function checkCurrentSize(route) {
  const map={schema:1,status:'полная',prs:[{number:14,type:'game_fix',changedFiles:1}],
    metrics:[{type:'game_fix',actor:'автозадача',zone:'жёлтая'}]};
  for(const files of [6,7,100,-1,1.5,Infinity]) {
    assert.equal(route({id:14,changedFiles:files},map).target,'chat');
  }
  for(const files of [1,5]) {
    assert.equal(route({id:14,changedFiles:files},
      {...map,prs:[{number:14,type:'game_fix',changedFiles:12}]}).target,'auto');
  }
}
test('жёлтая карточка ограничена текущими файлами PR, а не старым снимком',async()=>{
  await checkCurrentSize(routeFor);
  const source=await fs.readFile(new URL('./route.mjs',import.meta.url),'utf8');
  const mutants=[
    source.replace('card.changedFiles ?? entry?.changedFiles','entry?.changedFiles'),
    source.replace('files <= 5','files <= 6'),
    source.replace('card.changedFiles ?? entry?.changedFiles','Math.min(card.changedFiles, 5)')
  ];
  for(const changed of mutants){
    assert.notEqual(changed,source);
    const module=await import('data:text/javascript;base64,'+Buffer.from(changed).toString('base64'));
    await assert.rejects(()=>checkCurrentSize(module.routeFor));
  }
  const dispatcher=await fs.readFile(new URL('../dispetcher/build.mjs',import.meta.url),'utf8');
  assert.match(dispatcher,/changedFiles:pr\.changed_files/);
  assert.match(dispatcher,/Number\.isInteger\(pr\.changed_files\)/);
});


import {compute} from './build.mjs';

async function verifyDeferredDrafts(status,aggregate) {
  const now=Date.parse('2026-11-14T00:00:00Z'),last='2026-11-11T00:00:00Z';
  const deferred={state:'open',draft:true,merged_at:null,body:'ЖДЁТ: Claude или замена'};
  assert.equal(status(deferred,last,now),'отложено');
  assert.equal(status({...deferred,body:'НУЖЕН CLAUDE: сверить эталон'},last,now),'НУЖЕН CLAUDE');
  assert.equal(status({...deferred,draft:false},last,now),'брошено');
  assert.equal(status({...deferred,state:'closed'},last,now),'закрыто');
  const metrics=aggregate([{
    type:'game_reference',actor:'автозадача',status:'отложено',
    created_at:'2026-11-11T00:00:00Z',newErrors:0,repeatedError:false
  }],dictionary);
  const row=metrics.find(m=>m.type==='game_reference'&&m.actor==='автозадача');
  assert.equal(row.deferred,1);
  assert.equal(row.abandoned,0);
  assert.equal(row.zone,'нет данных');
}
test('draft ожидающий решения не искажает красную статистику: четыре настоящие мутации',async()=>{
  await verifyDeferredDrafts(statusOf,compute);
  const source=await fs.readFile(new URL('./build.mjs',import.meta.url),'utf8');
  const key="if (pr.draft === true) return 'отложено';";
  const mutants=[
    source.replace(key,"if (false) return 'отложено';"),
    source.replace(key,"if (pr.draft === true) return 'слито';"),
    source.replace("  if (/НУЖЕН CLAUDE/i.test(pr.body || '')) return 'НУЖЕН CLAUDE';",
      "  if (pr.draft === true) return 'отложено';\n  if (/НУЖЕН CLAUDE/i.test(pr.body || '')) return 'НУЖЕН CLAUDE';"),
    source.replace("deferred: count('отложено')","deferred: 0")
  ];
  for(const [index,changed] of mutants.entries()){
    assert.notEqual(changed,source,'мутация '+index+' не изменила код');
    const module=await import('data:text/javascript;base64,'+Buffer.from(changed).toString('base64'));
    await assert.rejects(()=>verifyDeferredDrafts(module.statusOf,module.compute),undefined,
      'мутант '+index+' должен быть пойман');
  }
});

// Claude 14.11.2026: GraphQL-выборка вместо REST на каждый PR (ловушки К3).
import {toRestShape,redPushesBeforeGreen,graphqlPulls} from './build.mjs';
const gqlNode=(number,updatedAt,extra={})=>({number,url:'u'+number,state:'OPEN',isDraft:false,title:'t',body:'',
  headRefName:'lab/x'+number,headRefOid:'s'+number,createdAt:'2026-11-13T00:00:00Z',updatedAt,mergedAt:null,
  changedFiles:3,files:{nodes:[{path:'a'},{path:'b'}]},
  commits:{nodes:[{commit:{committedDate:'2026-11-13T01:00:00Z',statusCheckRollup:{state:'FAILURE'}}},
    {commit:{committedDate:'2026-11-13T02:00:00Z',statusCheckRollup:{state:'SUCCESS'}}}]},...extra});
async function checkGraphql(mod){
  const now=new Date().toISOString(), old='2020-01-01T00:00:00Z';
  const shaped=mod.toRestShape(gqlNode(5,now,{state:'MERGED',mergedAt:now}));
  assert.equal(shaped.pr.state,'closed'); assert.equal(shaped.pr.merged_at,now);
  assert.equal(shaped.changedFiles,3); assert.equal(shaped.failedBeforeGreen,1);
  assert.equal(shaped.lastCommit,'2026-11-13T02:00:00Z');
  assert.equal(mod.redPushesBeforeGreen(['FAILURE','ERROR','SUCCESS','FAILURE']),2);
  assert.equal(mod.redPushesBeforeGreen([null,null]),null);
  assert.throws(()=>mod.toRestShape({...gqlNode(6,now),commits:{nodes:[]}}),/нет данных/);
  let calls=0;
  const pages=[{data:{repository:{pullRequests:{pageInfo:{hasNextPage:true,endCursor:'c'},nodes:[gqlNode(1,now)]}}}},
    {data:{repository:{pullRequests:{pageInfo:{hasNextPage:true,endCursor:'d'},nodes:[gqlNode(2,now),gqlNode(3,old)]}}}}];
  const got=await mod.graphqlPulls(async()=>pages[calls++]);
  assert.deepEqual(got.map(x=>x.pr.number),[1,2]); assert.equal(calls,2);
  await assert.rejects(()=>mod.graphqlPulls(async()=>({errors:[{message:'rate'}]})),/нет данных/);
}
test('GraphQL-карта: форма PR, красные пуши до зелёного, остановка на 14 днях, ошибка API не пустота',async()=>{
  const mod=await import('./build.mjs');
  await checkGraphql(mod);
  const source=await fs.readFile(new URL('./build.mjs',import.meta.url),'utf8');
  for(const [label,from,to] of [
    ['слитый PR считается открытым',"state:node.state === 'OPEN' ? 'open' : 'closed'","state:'open'"],
    ['ошибка GraphQL как пустой список',"throw new Error('GitHub GraphQL: нет данных ' +","return out; (''+"],
    ['не останавливается на 14 днях','if (Date.parse(node?.updatedAt) < since.getTime()) return out;',''],
    ['красные после зелёного тоже считаются','states.slice(0, firstGreen < 0 ? states.length : firstGreen)','states']
  ]){
    assert.ok(source.includes(from),'якорь мутации: '+label);
    const changed=source.replace(from,to);
    const module=await import('data:text/javascript;base64,'+Buffer.from(changed).toString('base64'));
    await assert.rejects(()=>checkGraphql(module),undefined,label);
  }
});

// Claude 14.11.2026: публикация карты не должна теряться на гонке push с main (OSHIBKI).
function checkPublishRetry(yml){
  const step=yml.slice(yml.indexOf('- name: Publish only real changes'));
  assert.match(step,/for attempt in 1 2 3 4 5; do/,'нужно несколько попыток push');
  assert.match(step,/git push && exit 0/,'успешный push завершает шаг');
  assert.match(step,/git pull --rebase origin main \|\| \{ git rebase --abort; exit 1; \}/,'перед повтором rebase на main');
  assert.match(step,/done\n\s*exit 1/,'после всех попыток — ошибка, а не тишина');
}
test('карта сил: push повторяется после rebase, а не теряется',async()=>{
  const yml=await fs.readFile(new URL('../../.github/workflows/karta-sil.yml',import.meta.url),'utf8');
  checkPublishRetry(yml);
  for(const [label,from,to] of [
    ['один push без повтора','for attempt in 1 2 3 4 5; do','for attempt in 1; do'],
    ['повтор без rebase','git pull --rebase origin main','true'],
    ['тихий выход после неудач',"          done\n          exit 1\n","          done\n          exit 0\n"]
  ]){
    assert.ok(yml.includes(from),'якорь: '+label);
    assert.throws(()=>checkPublishRetry(yml.replace(from,to)),undefined,label);
  }
});

import {watchdogClosed} from './build.mjs';
function checkClosedAbandoned(status, watchdog) {
  const last = '2026-11-13T00:00:00Z';
  const base = {state:'closed',merged_at:null,closed_at:'2026-11-13T12:00:00Z',comments:[]};
  const comments = [{author:{login:'github-actions[bot]'},
    body:'закрыт сторожем как заброшенный'}];
  assert.equal(status(base,last),'закрыто');
  assert.equal(status({...base,closed_at:'2026-11-14T00:00:01Z'},last),'брошено');
  assert.equal(status({...base,closed_at:'2026-11-14T00:00:00Z'},last),'закрыто');
  assert.equal(watchdog(comments),true);
  assert.equal(status({...base,comments},last),'брошено');
  assert.equal(status({...base,comments:[{...comments[0],author:{login:'other'}}]},last),
    'закрыто');
  assert.equal(status({...base,merged_at:'2026-11-13T11:00:00Z',comments},last),'слито');
}
test('закрытые без слияния: комментарий сторожа или 24ч без коммитов',async()=>{
  checkClosedAbandoned(statusOf,watchdogClosed);
  const source=await fs.readFile(new URL('./build.mjs',import.meta.url),'utf8');
  const mutants=[
    source.replace("if (watchdogClosed(pr.comments || [])) return 'брошено';",
      "if (watchdogClosed(pr.comments || [])) return 'закрыто';"),
    source.replace('Date.parse(lastCommitTime) > 86400000)',
      'Date.parse(lastCommitTime) > 172800000)'),
    source.replace("return comments.some(comment =>",
      "return comments.length > 0 || comments.some(comment =>")
  ];
  for(const [index,changed] of mutants.entries()){
    assert.notEqual(changed,source,'мутация должна изменить код: '+index);
    const module=await import('data:text/javascript;base64,'+Buffer.from(changed).toString('base64'));
    assert.throws(()=>checkClosedAbandoned(module.statusOf,module.watchdogClosed),
      undefined,'мутант '+index+' не должен пройти');
  }
});

import {attributedErrors} from './build.mjs';

function checkJournalAttribution(match) {
  const head = 'abcdef1234567890abcdef1234567890abcdef12';
  const pr = {number:301,head:{sha:head}};
  const rows = [
    '| 1 | 14.11.2026 | SHA abcdef1234 | доказательство | ловушка |',
    '| 2 | 14.11.2026 | SHA ffffffff99 | доказательство | ловушка |',
    '| 3 | 14.11.2026 | PR #301 сломался | доказательство | ловушка |',
    '| 4 | 14.11.2026 | /pull/301 сломался | доказательство | ловушка |',
    '| 5 | 14.11.2026 | /actions/runs/12345678901 упал | доказательство | ловушка |',
    '| 6 | 14.11.2026 | /actions/runs/12345678902 упал | доказательство | ловушка |',
    '| 7 | 14.11.2026 | PR #3010 чужой | доказательство | ловушка |'
  ].join('\n');
  const found=match(rows,pr,[],new Map([
    ['12345678901',head],
    ['12345678902','ffffffffffffffffffffffffffffffffffffffff']
  ]));
  assert.equal(found.length,4);
  assert.ok(found.some(line=>line.includes('abcdef1234')));
  assert.ok(!found.some(line=>line.includes('ffffffff99')));
  assert.ok(!found.some(line=>line.includes('12345678902')));
  const other=match('| 9 | 14.11.2026 | PR #302 | факт | ловушка |',
    {...pr,number:302},[],new Map());
  assert.equal(other.length,1);
}
test('Карта сил: ошибки привязываются к PR по номеру, SHA или проверенному run ID',async()=>{
  checkJournalAttribution(attributedErrors);
  const source=await fs.readFile(new URL('./build.mjs',import.meta.url),'utf8');
  const mutations=[
    source.replace("sha.startsWith(match[0].toLowerCase())","false"),
    source.replace("runs.some(match => commits.has(String(runToSha.get(match[1]) || '').toLowerCase()))",
      "runs.length > 0"),
    source.replace("Number(match[1]) === pr.number","Number(match[1]) === 301")
  ];
  for(const [i,changed] of mutations.entries()){
    assert.notEqual(changed,source,'мутация '+i+' должна менять код');
    const mod=await import('data:text/javascript;base64,'+Buffer.from(changed).toString('base64'));
    assert.throws(()=>checkJournalAttribution(mod.attributedErrors),undefined,
      'мутант '+i+' не должен выжить');
  }
});

test('исполнитель: исторические записи ZANYATO, приоритет подписи и отсутствие догадок',()=>{
  const pr={number:331,title:'про автозадачи',
    body:'Исполнитель: чат ChatGPT',head:{ref:'lab/mg-stroitel-2'}};
  assert.equal(identifyActor(pr,'| PR #331 | lab/mg-stroitel-2 | MG-строитель-2 | now |',
    dictionary),'чат ChatGPT');
  assert.equal(identifyActor({...pr,body:''},'',dictionary),'автозадача');
  assert.equal(identifyActor({...pr,body:'',head:{ref:'lab/neutral'}},'',dictionary),
    'неизвестно');
  assert.equal(identifyActor({...pr,number:33,body:'',head:{ref:'lab/neutral'}},
    '| PR #331 | lab/other | MG-строитель-1 | now |',dictionary),'неизвестно');
  assert.equal(identifyActor({...pr,body:'Исполнитель: MG-строитель-1\nИсполнитель: чат ChatGPT'},
    '',dictionary),'неизвестно');
});

import {recentCohort,trendFor} from './build.mjs';
function verifyCosts(aggregate) {
  const rows=[
    {type:'bot_check',actor:'неизвестно',status:'слито',created_at:'2026-11-13',
      merged_at:'2026-11-14',failedBeforeGreen:6,newErrors:0,repeatedError:false},
    {type:'bot_check',actor:'неизвестно',status:'закрыто',created_at:'2026-11-13',
      failedBeforeGreen:3,newErrors:0,repeatedError:false},
    {type:'bot_check',actor:'неизвестно',status:'брошено',created_at:'2026-11-13',
      failedBeforeGreen:0,newErrors:0,repeatedError:false}
  ];
  const m=aggregate(rows,dictionary).find(x=>x.type==='bot_check'&&x.actor==='неизвестно');
  assert.equal(m.redPerMerge,9);
  assert.equal(m.closedShare,66.7);
  assert.equal(m.action,'дробить задачи / тесты до пуша');
}
test('стоимость типов: красных на слияние и реальная доля закрытых',async()=>{
  verifyCosts(compute);
  const source=await fs.readFile(new URL('./build.mjs',import.meta.url),'utf8');
  for(const [oldPart,newPart] of [
    ['(failures / merged).toFixed(1)','(failures / (merged + closed)).toFixed(1)'],
    ['(closed + abandoned) * 100 / resolved','closed * 100 / resolved'],
    ['redPerMerge > 5','redPerMerge > 50']
  ]){
    assert.ok(source.includes(oldPart),'мутация должна иметь якорь '+oldPart);
    const changed=source.replace(oldPart,newPart);
    const mod=await import('data:text/javascript;base64,'+Buffer.from(changed).toString('base64'));
    assert.throws(()=>verifyCosts(mod.compute));
  }
});
test('3-дневная когорта не превращается в 14-дневную и не меняет зоны',()=>{
  const now=Date.parse('2026-11-15T12:00:00Z');
  const recent=[{created_at:'2026-11-14T00:00:00Z',number:1},
    {created_at:'2026-11-06T00:00:00Z',number:2}];
  assert.deepEqual(recentCohort(recent,3,now).map(x=>x.number),[1]);
  assert.equal(trendFor({merged:1,closed:0,abandoned:0},
    {merged:3,closed:1,abandoned:0}),'мало данных');
  assert.equal(trendFor({merged:3,closed:0,abandoned:0},
    {merged:6,closed:4,abandoned:0}),'↑ лучше');
  assert.equal(trendFor({merged:0,closed:3,abandoned:0},
    {merged:6,closed:4,abandoned:0}),'↓ хуже');
  assert.equal(trendFor({merged:2,closed:1,abandoned:0},
    {merged:4,closed:2,abandoned:0}),'→ так же');
});
