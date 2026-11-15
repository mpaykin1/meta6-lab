import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {claudeTitle, needsClaude, checkedClaudeDecision} from '../build.mjs';
import {routeFor, currentClaudeMarker} from '../../karta-sil/route.mjs';

const cases = [
  [{id:248,title:'Доводчик PR'}, {head:{ref:'lab/248'}}, 'Доводчик PR'],
  [{id:277,title:'Три сторожа'}, {title:undefined,head:{ref:'lab/277'}}, 'Три сторожа'],
  [{id:325,title:'Монстр'}, {title:'Заголовок GitHub'}, 'Заголовок GitHub'],
  [{id:248,title:'Реальная задача'}, {title:'undefined'}, 'Реальная задача']
];
function exercise(fn) {
  for (const [task, opened, title] of cases) {
    assert.equal(fn(task, opened), title);
    assert.notEqual(fn(task, opened), 'undefined');
  }
  assert.throws(() => fn({id:999}, {head:{ref:'lab/999'}}), /нет данных/);
}

test('Claude PR titles fall back to the task row when GraphQL omits title', () => {
  exercise(claudeTitle);
});

test('three title mutations fail, including hardcoded PR 248 deception', async () => {
  const source = await readFile(new URL('../build.mjs', import.meta.url), 'utf8');
  const anchor = "const title = fromPr && fromPr !== 'undefined' ? fromPr : fromTask;";
  assert.ok(source.includes(anchor));
  const mutations = [
    ['trust-undefined', 'const title = String(opened?.title);'],
    ['drop-task-fallback', "const title = fromPr || '';"],
    ['hardcode-one-pr', "const title = fromPr || 'PR #248';"]
  ];
  for (const [name, replacement] of mutations) {
    const mutated = source.replace(anchor, replacement);
    const url = 'data:text/javascript;base64,' + Buffer.from(mutated).toString('base64');
    const {claudeTitle: badTitle} = await import(url);
    assert.throws(() => exercise(badTitle), name);
  }
});


const routingCases = [
  [{id:248,status:'🙋 НУЖЕН CLAUDE'}, {body:'CLAUDE: Разрешить ядро (да/нет)?\nНУЖЕН CLAUDE'}, true],
  [{id:261,status:'🙋 НУЖЕН CLAUDE'}, {body:'ЖДЁТ: STOROZHA\nНУЖЕН CLAUDE: старая сводка'}, false],
  [{id:260,status:'🙋 НУЖЕН CLAUDE'}, {body:'ЖДЁТ: конфликт\nНУЖЕН CLAUDE: история'}, false],
  [{id:218,status:'🙋 НУЖЕН CLAUDE'}, {body:'ЖДЁТ: merge main'}, false],
  [{id:277,status:'🙋 НУЖЕН CLAUDE'}, {body:'НУЖЕН CLAUDE: ядро STOROZHA'}, true],
  [{id:99,status:'🙋 НУЖЕН CLAUDE'}, {body:'Нерешённый вопрос'}, true],
  [{id:42,status:'в работе'}, {body:'Проверено\nНУЖЕН CLAUDE: история'}, false],
  [{id:43,status:'в работе'}, {body:'ГОТОВ К ПРОВЕРКЕ: зелёное\nНУЖЕН CLAUDE: история'}, false]
];
function exerciseRouting(fn) {
  for (const [task, pr, expected] of routingCases) assert.equal(fn(task, pr), expected, 'PR #' + task.id);
}
test('current first-line status overrides historical Claude mentions', () => {
  exerciseRouting(needsClaude);
});
test('three Claude-routing mutations fail, including hardcoded PR 261 deception', async () => {
  const source = await readFile(new URL('../build.mjs', import.meta.url), 'utf8');
  const mutations = [
    [
      'hardcode-one-PR',
      'if (/^(?:ЖДЁТ|ГОТОВ К ПРОВЕРКЕ):/i.test(first)) return false;',
      'if (task?.id === 261) return false;'
    ],
    [
      'trust-historical-body',
      "return /НУЖЕН CLAUDE/.test(task?.status || '');",
      "return /НУЖЕН CLAUDE/.test((pr?.body || '') + (task?.status || ''));"
    ],
    [
      'silence-protected-request',
      'if (/^CLAUDE:\\s*\\S/i.test(first)) return true;',
      'if (/^CLAUDE:\\s*\\S/i.test(first)) return false;'
    ]
  ];
  for (const [name, anchor, replacement] of mutations) {
    assert.ok(source.includes(anchor), 'missing mutation anchor: ' + name);
    const mutated = source.replace(anchor, replacement);
    const url = 'data:text/javascript;base64,' + Buffer.from(mutated).toString('base64');
    const {needsClaude: invalid} = await import(url);
    assert.throws(() => exerciseRouting(invalid), name);
  }
});


const actual = [
 [261,'ЖДЁТ: STOROZHA\nНУЖЕН CLAUDE: история',false],
 [261,'CLAUDE: Код (да/нет)?',true],
 [260,'ЖДЁТ: конфликт\nНУЖЕН CLAUDE: история',false],
 [248,'CLAUDE: ядро (да/нет)?',true],
 [277,'НУЖЕН CLAUDE: ядро',true],
 [218,'ГОТОВ К ПРОВЕРКЕ: всё зелёное\nНУЖЕН CLAUDE: старое',false]
];
function exerciseRest(fn) {
 for(const [id,body,want] of actual){
  const task={id,status:'🙋 НУЖЕН CLAUDE',title:'Название задачи'};
  const listed={number:id,state:'open',head:{sha:'sha',ref:'lab/branch'}};
  const pr={...listed,title:'Текущий PR',body};
  assert.equal(fn(task,listed,pr),want,'REST PR #'+id);
 }
 const task={id:261,status:'НУЖЕН CLAUDE'},listed={number:261,head:{sha:'sha',ref:'lab/branch'}};
 assert.throws(()=>fn(task,listed,{number:261,state:'open',head:{sha:'other',ref:'lab/branch'},body:'ЖДЁТ:'}),/нет данных/);
}
test('GraphQL without body must not override current REST Claude status',()=>{
 exerciseRest(checkedClaudeDecision);
});
test('three REST mutations: no body, hardcode ID, historical decision',async()=>{
 const src=await readFile(new URL('../build.mjs',import.meta.url),'utf8');
 assert.ok(src.indexOf("let pr;try{pr=await dispatchApi('/pulls/'+t.id)}") < src.indexOf('if(checkedClaudeDecision(t,listed,pr)){'));
 assert.ok(!src.includes('if(needsClaude(t,listed)){'));
 const anchor='return needsClaude(task, pr);';
 assert.ok(src.includes(anchor));
 const broken=[
  'return needsClaude(task, listed);',
  'return task.id === 261 ? false : needsClaude(task, pr);',
  "return /НУЖЕН CLAUDE/.test(pr.body || '');"
 ];
 for(const mutation of broken){
  const mod=await import('data:text/javascript;base64,'+Buffer.from(src.replace(anchor,mutation)).toString('base64'));
  assert.throws(()=>exerciseRest(mod.checkedClaudeDecision),mutation);
 }
});
function exerciseRoute(fn) {
 const map={schema:1,status:'полная',prs:[],metrics:[]};
 const cases=[
  [261,'ЖДЁТ: STOROZHA\nНУЖЕН CLAUDE: история','chat'],
  [261,'CLAUDE: Ядро','claude'],
  [277,'НУЖЕН CLAUDE: ядро','claude'],
  [218,'ГОТОВ К ПРОВЕРКЕ: CI\nНУЖЕН CLAUDE: старое','chat'],
  [260,'ЖДЁТ: конфликт','chat'],
  [99,'ЖДЁТ: CI\nКАРТА СИЛ: CHAT FAIL #31 причина\nКАРТА СИЛ: CHAT FAIL #32 причина','claude']
 ];
 for(const [id,body,target] of cases)assert.equal(fn({id,body,changedFiles:3},map).target,target,'route #'+id);
}
test('Karta Sil ignores historical Claude notes, keeps two-fail escalation',()=>{
 exerciseRoute(routeFor);
 assert.equal(currentClaudeMarker('ЖДЁТ: проверка\nНУЖЕН CLAUDE: история'),false);
});
test('three Karta Sil mutations including hardcoded #277',async()=>{
 const src=await readFile(new URL('../../karta-sil/route.mjs',import.meta.url),'utf8');
 const broken=[
  ['currentClaudeMarker(card.body)',"/НУЖЕН CLAUDE/i.test(card.body || '')"],
  ['/^CLAUDE:\\s*\\S/i.test(first)','false'],
  ['currentClaudeMarker(card.body)','card.id === 277']
 ];
 for(const [anchor,replacement] of broken){
  assert.ok(src.includes(anchor),'missing mutation anchor '+anchor);
  const mod=await import('data:text/javascript;base64,'+Buffer.from(src.replace(anchor,replacement)).toString('base64'));
  assert.throws(()=>exerciseRoute(mod.routeFor),replacement);
 }
});
