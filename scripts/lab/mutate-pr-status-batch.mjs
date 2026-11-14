import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {numbersFromTable,queryFor,classify,parseResponse,requestBatch} from './pr-status-batch.mjs';
const example='| #3 | эталон | x |\n| #87 | код | x |\n| #3 | повтор | x |';
function suite(m){
 assert.deepEqual(m.numbersFromTable(example),[3,87]);
 assert.match(m.queryFor('mpaykin1/meta6-lab',[3]),/p3:pullRequest\(number:3\)/);
 assert.equal(m.classify({state:'MERGED',merged:true,mergeable:'UNKNOWN'}),'merged');
 assert.equal(m.classify({state:'CLOSED',merged:false}),'closed');
 assert.equal(m.classify({state:'OPEN',merged:false,mergeable:'CONFLICTING'}),'open dirty');
 assert.equal(m.classify({state:'OPEN',merged:false,mergeable:'UNKNOWN'}),'open unknown');
 assert.throws(()=>m.parseResponse({p3:{state:'OPEN',merged:false,mergeable:'MERGEABLE'}},[3,87]),/нет данных/);
}
function response(status,body,remaining,reset){
 return {ok:status===200,status,headers:{get:k=>k==='x-ratelimit-remaining'?remaining:
  k==='x-ratelimit-reset'?reset:null},json:async()=>body};
}
async function retrySuite(m){
 const now=Date.parse('2026-11-14T05:00:00Z');
 const body={data:{repository:{p3:{state:'OPEN',merged:false,mergeable:'CONFLICTING'}}}};
 let calls=0,waited=0;
 const result=await m.requestBatch([3],{repository:'mpaykin1/meta6-lab',token:'fake',
  now:()=>now,wait:async ms=>{waited=ms},
  request:async()=>++calls===1?response(403,null,'0',String((now+60000)/1000)):
   response(200,body,'2','0')});
 assert.equal(calls,2);assert.equal(waited,61000);assert.equal(result[3],'open dirty');
 let skipped=0;
 await assert.rejects(()=>m.requestBatch([3],{repository:'mpaykin1/meta6-lab',token:'fake',
  now:()=>now,request:async()=>{skipped++;return response(429,null,'0',String((now+600000)/1000));}
 }),/квота до/);
 assert.equal(skipped,1);
 await assert.rejects(()=>m.requestBatch([3],{repository:'mpaykin1/meta6-lab',token:'fake',
  request:async()=>response(200,{data:{repository:{}}},'1','0')}),/нет данных/);
}
suite({numbersFromTable,queryFor,classify,parseResponse});
await retrySuite({requestBatch});
const source=await fs.readFile(new URL('./pr-status-batch.mjs',import.meta.url),'utf8');
const mutants=[
 ['forged-merged',"return 'merged';","return 'closed';"],
 ['missing-forged-closed',"if(!pr)throw Error('нет данных: отсутствует PR в ответе GraphQL');",
  "if(!pr)return 'closed';"],
 ['conflict-forged-clean',"return 'open dirty';","return 'open';"],
 ['quota-sleep-disabled',"delay>0&&delay<=8*60*1000&&attempt===0",
  "delay>0&&delay<=0&&attempt===0"]
];
for(const [name,before,after] of mutants){
 assert.ok(source.includes(before),'anchor missing: '+name);
 const mutated=source.replace(before,after);
 const m=await import('data:text/javascript;base64,'+Buffer.from(mutated).toString('base64'));
 let caught=false;
 try{suite(m);await retrySuite(m)}catch{caught=true}
 assert.ok(caught,'mutation survived: '+name);
}
const plans={
 'dispetcher.yml':'21 * * * *','zadachi-watch.yml':'11 * * * *',
 'zanyato-watch.yml':'7 * * * *','sliyanie-status.yml':'37 * * * *',
 'meta-repair-bot.yml':'47 * * * *','investigation-snapshot.yml':'13 */3 * * *',
 'auditor.yml':'43 */3 * * *'
};
function validSchedule(yaml,cron){
 const lines=yaml.match(/cron:\s*'([^']+)'/g)||[];
 return lines.length===1&&lines[0]==="cron: '"+cron+"'";
}
for(const [file,cron] of Object.entries(plans)){
 const yaml=await fs.readFile(new URL('../../.github/workflows/'+file,import.meta.url),'utf8');
 assert.ok(validSchedule(yaml,cron),'bad schedule: '+file);
 const broken=yaml.replace("cron: '"+cron+"'","cron: '11,41 * * * *'");
 assert.equal(validSchedule(broken,cron),false,'schedule mutation survived: '+file);
}
console.log('PASS GraphQL batch, fail-closed, 4 source mutations and 7 cadence mutations');
