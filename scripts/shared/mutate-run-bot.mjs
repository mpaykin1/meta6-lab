import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../../',import.meta.url));
const sourceFile=join(root,'shared/approved/tools/run-bot.mjs');
const source=readFileSync(sourceFile,'utf8');
const verifier=join(root,'scripts/shared/verify-mcp-run-bot.mjs');
function verify(args=[]){
 return spawnSync(process.execPath,[verifier,...args],{cwd:root,encoding:'utf8',timeout:30000});
}
const baseline=verify();
assert.equal(baseline.status,0,'M4 baseline failed:\n'+baseline.stdout+baseline.stderr);
function replaceRequired(text,needle,change){
 assert.ok(text.includes(needle),'Missing mutation anchor '+needle);
 return text.replace(needle,change);
}
const muts=[
 {name:'missing-adapter-skip',why:/Missing adapter must never pass|нет ручки бота/,change:s=>replaceRequired(s,
  'if(!existsSync(adapter)||!lstatSync(adapter).isFile()||realpathSync(adapter)!==adapter)',
  'if(false&&(!existsSync(adapter)||!lstatSync(adapter).isFile()||realpathSync(adapter)!==adapter))')},
 {name:'hardcoded-pass-deception',why:/Broken game passed|Zero-result deception passed/,change:s=>replaceRequired(s,
  "const passed=result.code===0&&!result.timedOut&&!result.overflow&&runs.length>0&&runs.every(run=>run.ok&&run.passed===run.levels);",
  'const passed=true;')},
 {name:'no-result-is-success',why:/Zero-result deception passed/,change:s=>replaceRequired(s,
  "const passed=result.code===0&&!result.timedOut&&!result.overflow&&runs.length>0&&runs.every(run=>run.ok&&run.passed===run.levels);",
  "const passed=result.code===0&&!result.timedOut&&!result.overflow&&runs.every(run=>run.ok&&run.passed===run.levels);")},
 {name:'discard-snapshots',why:/Bot snapshot parsing failed|snapshot/,change:s=>replaceRequired(s,
  "snapshot:message.match(/\\[снимок:[^\\]]+\\]/u)?.[0]??null",
  'snapshot:null')},
 {name:'ignore-exit-code',why:/Non-zero bot exit passed/,change:s=>replaceRequired(s,'result.code===0&&','')},
 {name:'no-time-limit',why:/Missing hard 5-minute deadline/,change:s=>replaceRequired(s,
  'export const MAX_RUN_MS=300_000;','export const MAX_RUN_MS=600_000;')},
 {name:'no-lock',why:/Concurrent call accepted|Cross-instance lock ignored/,change:s=>{
  let t=replaceRequired(s,"if(inProgress)throw Error('run_bot: уже выполняется другой запуск');",
  "if(false)throw Error('run_bot: уже выполняется другой запуск');");
  return replaceRequired(t,'unlock=lockRun();','unlock=(()=>()=>{})();');
 }}
];
for(const mut of muts){
 const next=mut.change(source);
 assert.notEqual(next,source,mut.name+' changed nothing');
 const mutant=join(root,'shared/approved/tools/.run-bot-mutant-'+randomUUID()+'.mjs');
 try{
  writeFileSync(mutant,next,{flag:'wx'});
  const test=verify(['--source',mutant]);
  assert.equal(test.status,1,'Mutation escaped verifier: '+mut.name+'\n'+test.stdout+test.stderr);
  assert.match(test.stderr,mut.why,'Mutation failed for wrong reason: '+mut.name+'\n'+test.stderr);
  console.log('MUTATION_CAUGHT '+mut.name);
 }finally{rmSync(mutant,{force:true})}
}
console.log('MCP_RUN_BOT_MUTATION_PASS six faults including hardcoded success');
