import {test} from 'node:test';
import assert from 'node:assert/strict';
import {listOpenPullRequests} from '../build.mjs';

const item=n=>({number:n,state:'open',head:{sha:'test-sha-'+n,ref:'lab/issue-'+n}});

test('повтор №1110: открытые PR выбираются до пустой страницы, закрытые не обходятся',async()=>{
 let calls=0;
 const open=await listOpenPullRequests(async endpoint=>{
  calls++;
  assert.match(endpoint,/state=open/);
  return calls===1 ? [item(301),item(303)] : [];
 });
 assert.equal(calls,2);
 assert.equal(open.size,2);
 assert.equal(open.has(302),false);
});

test('мутация: 403 API не подменяется пустым списком',async()=>{
 await assert.rejects(()=>listOpenPullRequests(async()=>{throw Error('HTTP 403');}),/403/);
 await assert.rejects(()=>listOpenPullRequests(async()=>{throw Error('HTTP 429');}),/429/);
 await assert.rejects(()=>listOpenPullRequests(async()=>null),/нет данных/);
});

test('мутация: если первая страница полна, требуется следующая страница',async()=>{
 const seen=[];
 const open=await listOpenPullRequests(async endpoint=>{
  seen.push(endpoint);
  return seen.length===1 ? Array.from({length:100},(_,i)=>item(i+1)) : seen.length===2 ? [item(101)] : [];
 });
 assert.deepEqual(seen.map(x=>new URLSearchParams(x.split('?')[1]).get('page')),['1','2','3']);
 assert.equal(open.size,101);
});

test('мутация-обман: список нельзя подменить одной захардкоженной карточкой',async()=>{
 let calls=0;
 const open=await listOpenPullRequests(async()=>calls++===0 ? [item(301),item(304)] : []);
 assert.deepEqual([...open.keys()],[301,304]);
 await assert.rejects(()=>listOpenPullRequests(async()=>[item(301),item(301)]),/неполные данные/);
 await assert.rejects(()=>listOpenPullRequests(async()=>[item(301),{number:304,state:'open'}]),
  /неполные данные/);
});
test('мутация: ошибку API на второй странице нельзя скрыть первой',async()=>{
 let calls=0;
 await assert.rejects(()=>listOpenPullRequests(async()=>{
  calls++;
  if(calls===1)return Array.from({length:100},(_,i)=>item(i+1));
  throw Error('HTTP 429');
 }),/429/);
 assert.equal(calls,2);
});
