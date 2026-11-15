import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {claudeTitle} from '../build.mjs';

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
