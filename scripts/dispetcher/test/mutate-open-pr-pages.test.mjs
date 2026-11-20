import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {listOpenPullRequests} from '../build.mjs';

const pr = number => ({
  number, state: 'open', head: {sha: 'sha-' + number, ref: 'lab/' + number}
});

async function exercise(fn) {
  const original = fn;
  fn = request => original(request,{stopOnShortPage:true});
  let requests = [];
  const one = await fn(async path => {
    requests.push(path);
    assert.equal(path, '/pulls?state=open&per_page=100&page=1',
      'a partial final page must not trigger another API request');
    return [pr(17)];
  });
  assert.deepEqual([...one.keys()], [17]);
  assert.equal(requests.length, 1, 'no empty follow-up page after 1 of 100 PRs');

  requests = [];
  const full = Array.from({length: 100}, (_, i) => pr(i + 1));
  const two = await fn(async path => {
    requests.push(path);
    if (path.endsWith('page=1')) return full;
    if (path.endsWith('page=2')) return [pr(101)];
    throw Error('unexpected third API page');
  });
  assert.equal(two.size, 101, '100 entries mean another page might exist');
  assert.equal(two.get(101)?.head?.sha, 'sha-101');
  assert.equal(requests.length, 2, 'stop after short second page');

  await assert.rejects(() => fn(async () => [{...pr(19), state: 'closed'}]),
    /неполные данные/, 'invalid PR page must remain fail-closed');
}

test('dispatcher paginates completely without wasting a final API request',
  async () => exercise(listOpenPullRequests));

test('three pagination mutations are caught by actual request counts', async () => {
  const source = await readFile(new URL('../build.mjs', import.meta.url), 'utf8');
  const anchor = 'if(batch.length===0 || (stopOnShortPage && batch.length<100))return result;';
  assert.ok(source.includes(anchor), 'missing strict terminal-page rule');
  for (const [name, replacement] of [
    ['extra-page', 'if(batch.length===0)return result;'],
    ['lose-101st-pr', 'if(batch.length<=100)return result;'],
    ['stop-too-early', 'if(batch.length>0)return result;']
  ]) {
    const bad = source.replace(anchor, replacement);
    assert.notEqual(bad, source, name);
    const mod = await import('data:text/javascript;base64,' +
      Buffer.from(bad).toString('base64'));
    let caught = false;
    try { await exercise(mod.listOpenPullRequests); } catch { caught = true; }
    assert.ok(caught, 'pagination regression escaped: ' + name);
  }
});


test('legacy callers read through empty page and never trust missing second page', async () => {
 let count=0;
 const all=await listOpenPullRequests(async path=>{
  count++;
  assert.equal(path,`/pulls?state=open&per_page=100&page=${count}`);
  return count===1?[pr(1),pr(2)]:[];
 },{stopOnShortPage:false});
 assert.deepEqual([...all.keys()],[1,2]);
 assert.equal(count,2);
 count=0;
 await assert.rejects(()=>listOpenPullRequests(async()=>{count++;if(count===1)return [pr(1)];throw Error('HTTP 429');},{stopOnShortPage:false}),/429/);
 assert.equal(count,2);
});


test('duplicate PR across page boundary fails closed', async () => {
 const first=Array.from({length:100},(_,i)=>pr(i+1));
 let calls=0;
 await assert.rejects(() => listOpenPullRequests(async () => {
  calls++;
  return calls===1?first:[pr(100)];
 },{stopOnShortPage:true}), /повтор страницы/);
 assert.equal(calls,2);
});

async function exerciseLegacyDefault(fn) {
  const seen=[];
  const values=await fn(async endpoint=>{
    const page=Number(new URL(endpoint,'https://api.github.com').searchParams.get('page'));
    seen.push(page);
    assert.ok(seen.length<=24, 'bounded legacy walk');
    return page<=23 ? [pr(page)] : [];
  });
  assert.equal(values.size,23);
  assert.deepEqual(seen,Array.from({length:24},(_,i)=>i+1));
  let calls=0;
  await assert.rejects(()=>fn(async()=>{
    if(++calls===1)return [pr(1)];
    throw Error('HTTP 429');
  }),/429/);
}

test('legacy default remains complete; three opt-in leakage mutations are rejected',async()=>{
  await exerciseLegacyDefault(listOpenPullRequests);
  const source=await readFile(new URL('../build.mjs',import.meta.url),'utf8');
  for(const [name,before,after] of [
    ['default-opt-in-leak','stopOnShortPage=false','stopOnShortPage=true'],
    ['ignore-explicit-mode','stopOnShortPage && batch.length<100','batch.length<100'],
    ['forged-partial-on-api-error',"throw Error('GitHub API open PRs: нет данных: '+error.message);",'return result;']
  ]){
    assert.ok(source.includes(before),'mutation anchor: '+name);
    const code=source.replace(before,after);
    const mod=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
    await assert.rejects(()=>exerciseLegacyDefault(mod.listOpenPullRequests),undefined,name);
  }
});
