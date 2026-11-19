import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import {currentClaudeMarker,routeFor} from './route.mjs';

function exercise(marker, route) {
  const cases=[
    ['CLAUDE: одобрить ядро',true],
    ['НУЖЕН CLAUDE: решение',true],
    ['ЖДЁТ: CI\nНУЖЕН CLAUDE: история',false],
    ['ГОТОВ К ПРОВЕРКЕ: CI\nНУЖЕН CLAUDE: старое',false],
    ['История #248\nНУЖЕН CLAUDE: архив',false],
    ['Обычный PR',false]
  ];
  for (const [body,want] of cases) assert.equal(marker(body),want,body);
  assert.equal(route({id:248,body:cases[2][0],changedFiles:2},null).target,'chat');
  assert.equal(route({id:277,body:cases[0][0],changedFiles:2},null).target,'claude');
  assert.equal(route({
    id:300,body:'ЖДЁТ: CI\nНУЖЕН CLAUDE: история\nКАРТА СИЛ: CHAT FAIL #1 a\nКАРТА СИЛ: CHAT FAIL #2 b'
  },null).target,'claude');
}
test('first-line Claude marker preserves current requests and ignores history',()=>{
  exercise(currentClaudeMarker,routeFor);
});
test('three regressions, including hardcoded PR 248, are rejected',async()=>{
  const original=await readFile(new URL('./route.mjs',import.meta.url),'utf8');
  const markerLine="  return /^CLAUDE:\\s*\\S/i.test(first) || /^НУЖЕН CLAUDE(?:[:\\s]|$)/i.test(first);";
  assert.ok(original.includes(markerLine));
  const mutants=[
    original.replace('currentClaudeMarker(card.body))',"/НУЖЕН CLAUDE/i.test(card.body || ''))"),
    original.replace(markerLine,"  return /НУЖЕН CLAUDE/i.test(String(body || ''));"),
    original.replace(markerLine,"  return /CLAUDE/i.test(first) && /248/.test(first);")
  ];
  for(const code of mutants){
    assert.notEqual(code,original);
    const mod=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
    assert.throws(()=>exercise(mod.currentClaudeMarker,mod.routeFor));
  }
});
