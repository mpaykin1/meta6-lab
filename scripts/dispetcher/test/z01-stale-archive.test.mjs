import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { archiveCandidate } from '../build.mjs';

const now = Date.parse('2026-11-17T02:00:00Z');
const old = new Date(now - 49 * 3600_000).toISOString();
const recent = new Date(now - 47 * 3600_000).toISOString();
const red = [{name:'KONTUR Guard',url:'https://github.com/acme/repo/actions/runs/100'}];
const quota = [{name:'Vercel',url:'https://vercel.com/improve-world?upgradeToPro=build-rate-limit'}];
const pr = {state:'open',draft:true,title:'Draft experiment',body:'Needs review'};

function exercise(classify) {
 const base = {pr,lastCommit:old,failed:red,isFinish:false,now};
 assert.equal(classify(base),true,'truly abandoned red draft is nominated');
 assert.equal(classify({...base,lastCommit:recent}),false,'recent commits are not abandoned');
 assert.equal(classify({...base,lastCommit:new Date(now - 48*3600_000).toISOString()}),false,'exactly 48 h is not older than 48 h');
 assert.equal(classify({...base,isFinish:true}),false,'FINISH work cannot be archived as experiment');
 assert.equal(classify({...base,pr:{...pr,title:'INK · robot — OWNER PASS'}}),false,'accepted visual reference cannot be archived');
 assert.equal(classify({...base,pr:{...pr,body:'OWNER PASS reference'}}),false,'owner acceptance in PR body is protected');
 assert.equal(classify({...base,pr:{...pr,draft:false}}),false,'ready PR is not an abandoned draft');
 assert.equal(classify({...base,failed:quota}),false,'external Vercel quota is not a code failure');
 assert.equal(classify({...base,failed:[]}),false,'without a failed check there is no archive evidence');
 assert.throws(()=>classify({...base,lastCommit:'not-a-date'}),/нет данных/);
 assert.throws(()=>classify({...base,failed:null}),/нет данных/);
}

test('Z01 archive nomination is fail-closed and requires 48 h of actual commit age',()=>exercise(archiveCandidate));

test('Z01: three negative mutations, including OWNER PASS and quota deception',async()=>{
 const source=await readFile(new URL('../build.mjs',import.meta.url),'utf8');
 const mutations=[
  ['ignore-fresh-commit','const stale = now - date > 48 * 60 * 60 * 1000;','const stale = true;'],
  ['skip-owner-acceptance','if (isFinish || ownerPass) return false;','if (isFinish) return false;'],
  ['pretend-vercel-quota-is-red',"return failed.some(({url}) => !/build-rate-limit|api-deployments-free-per-day/i.test(String(url || '')));","return failed.length > 0;"]
 ];
 for(const [label,anchor,replacement] of mutations){
  assert.ok(source.includes(anchor),'missing mutation anchor '+label);
  const mutated=source.replace(anchor,replacement);
  const url='data:text/javascript;base64,'+Buffer.from(mutated).toString('base64');
  const {archiveCandidate:broken}=await import(url);
  assert.throws(()=>exercise(broken),label);
 }
});
