// Independent sabotage fixtures for scripts/kontur/guard.mjs.
import assert from 'node:assert/strict';
import {mkdtempSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const guard=fileURLToPath(new URL('./guard.mjs',import.meta.url));
const workspace=mkdtempSync(join(tmpdir(),'kontur-sabotage-'));
function diff(path,lines,oldCount=1,newCount=1){
 return 'diff --git a/'+path+' b/'+path+'\n'+
  '--- a/'+path+'\n+++ b/'+path+'\n'+
  '@@ -1,'+oldCount+' +1,'+newCount+' @@\n'+lines.join('\n')+'\n';
}
const scenarios=[
 {
  name:'assert-removed',
  title:'Add refactoring',
  body:'',
  patch:diff('scripts/shared/verify-example.mjs',['-assert.equal(tools.length,5);','+console.log(tools.length);']),
  reason:/assert|ПРОВЕРКА ИЗМЕНЕНА/
 },
 {
  name:'legacy-client-deception',
  title:'MCP tools',
  body:'',
  patch:diff('shared/approved/mcp.mjs',['-const tools=[];','+let legacyClient=false;']),
  reason:/legacyClient|legacy-флаг/
 },
 {
  name:'repair-without-journal',
  title:'fix MCP response',
  body:'',
  patch:diff('shared/approved/mcp.mjs',['-export const ready=false;','+export const ready=true;']),
  reason:/OSHIBKI\.md/
 },
 {
  name:'honest-change',
  title:'MCP: new method',
  body:'New method, no old assertions affected.',
  patch:diff('shared/approved/mcp.mjs',['-export const ready=false;','+export const ready=true;']),
  pass:true
 }
];
try{
 for(const scenario of scenarios){
  const id=scenario.name;
  const diffFile=join(workspace,id+'.diff');
  const titleFile=join(workspace,id+'.title');
  const bodyFile=join(workspace,id+'.body');
  writeFileSync(diffFile,scenario.patch);
  writeFileSync(titleFile,scenario.title);
  writeFileSync(bodyFile,scenario.body);
  const run=spawnSync(process.execPath,[guard,'--diff-file',diffFile,
   '--title-file',titleFile,'--body-file',bodyFile,'--policy-only'],{
   cwd:workspace,encoding:'utf8',timeout:15000
  });
  const transcript=run.stdout+'\n'+run.stderr;
  if(scenario.pass){
   assert.equal(run.status,0,'Honest case rejected:\n'+transcript);
   assert.match(transcript,/KONTUR_POLICY_PASS/);
  }else{
   assert.equal(run.status,1,'Sabotage escaped: '+id+'\n'+transcript);
   assert.match(transcript,scenario.reason,'Rejected for wrong reason: '+id+'\n'+transcript);
  }
  console.log('KONTUR_MUTATION_CAUGHT '+id);
 }
 console.log('MUTATE_KONTUR_GUARD_PASS all three traps caught and honest case accepted');
}finally{
 rmSync(workspace,{recursive:true,force:true});
}
