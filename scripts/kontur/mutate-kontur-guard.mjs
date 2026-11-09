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
function addedFile(path,lines){
 return 'diff --git a/'+path+' b/'+path+'\nnew file mode 100644\n'+
  '--- /dev/null\n+++ b/'+path+'\n@@ -0,0 +1,'+lines.length+' @@\n'+
  lines.map(line=>'+'+line).join('\n')+'\n';
}
const freshVerifier=addedFile('scripts/shared/verify-k7-sample.mjs',[
 "import assert from 'node:assert/strict';","assert.ok(true);"
]);
function freshMutant(names,baseline=true){
 const statements=baseline?["const baseline={status:0};","assert.equal(baseline.status,0);"]:[];
 return addedFile('scripts/shared/mutate-k7-sample.mjs',[
  "import assert from 'node:assert/strict';",
  ...statements,
  "const mutations=["+names.map(name=>"{name:'"+name+"'}").join(',')+"];"
 ]);
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
  name:'trap-file-deleted',
  title:'Cleanup',
  body:'',
  patch:'diff --git a/scripts/shared/mutate-example.mjs b/scripts/shared/mutate-example.mjs\ndeleted file mode 100644\n--- a/scripts/shared/mutate-example.mjs\n+++ /dev/null\n@@ -1,2 +0,0 @@\n-import assert from \'node:assert/strict\';\n-assert.equal(result.status,1);\n',
  reason:/удалён файл проверки/
 },
 {
  name:'github-actions-env-deception',
  title:'MCP tools',
  body:'',
  patch:diff('shared/approved/mcp.mjs',['-const tools=[];','+if(process.env.GITHUB_ACTIONS){defs.length=4}']),
  reason:/GITHUB_ACTIONS/
 },
 // K7 family #1,#6: CI/client deceptions, including previously invisible aliases.
 {
  name:'optional-ci-env',
  title:'MCP capability update',
  body:'',
  patch:diff('shared/approved/mcp.mjs',['-const tools=[];','+if(process?.env?.GITHUB_ACTIONS){defs.length=4}']),
  reason:/K7:.*GITHUB_ACTIONS/
 },
 {
  name:'destructured-ci-env',
  title:'MCP capability update',
  body:'',
  patch:diff('shared/approved/mcp.mjs',['-const tools=[];','+const {GITHUB_ACTIONS: gha}=process.env;']),
  reason:/K7:.*GITHUB_ACTIONS/
 },
 {
  name:'test-mode-alias',
  title:'MCP capability update',
  body:'',
  patch:diff('shared/approved/mcp.mjs',['-const tools=[];','+if(testMode){defs.length=4}']),
  reason:/K7:.*переключатель/
 },
 // K7 family #2,#4: inventory snapshots and incomplete enumeration.
 {
  name:'hardcoded-inventory',
  title:'MCP inventory',
  body:'',
  patch:diff('shared/approved/mcp.mjs',['-function listGames(){return readCatalog();}','+function listGames(){return [{id:"only-one"}]}']),
  reason:/K7:.*статический список/
 },
 {
  name:'snapshot-file-list',
  title:'MCP inventory',
  body:'',
  patch:diff('shared/approved/mcp.mjs',['-function listGameFiles(id){return walk(id);}','+function listGameFiles(id){const snapshot={x:[{file:"index.html"}]};return snapshot[id]||[]}']),
  reason:/K7:.*статический список/
 },
 {
  name:'disabled-recursive-walk',
  title:'MCP inventory',
  body:'',
  patch:diff('shared/approved/mcp.mjs',['-if(entry.isDirectory())walk(full);','+if(false)walk(full);']),
  reason:/K7:.*отключён вложенный/
 },
 {
  name:'cwd-relative-repository',
  title:'MCP inventory',
  body:'',
  patch:diff('shared/approved/mcp.mjs',['-const root=fromModule();','+const root=process.cwd();']),
  reason:/K7:.*cwd/
 },
 // K7 family #2,#3,#4,#5: weak new verifiers cannot omit deceptive mutation coverage.
 {
  name:'verifier-without-mutations',
  title:'New verifier',
  body:'',
  patch:freshVerifier,
  reason:/K7:.*без парного mutate/
 },
 {
  name:'verifier-with-one-mutation',
  title:'New verifier',
  body:'',
  patch:freshVerifier+freshMutant(['hardcoded-games']),
  reason:/K7:.*менее трёх/
 },
 {
  name:'verifier-without-deception',
  title:'New verifier',
  body:'',
  patch:freshVerifier+freshMutant(['drop-game','wrong-url','no-recursion']),
  reason:/K7:.*нет ловушки-обмана/
 },
 {
  name:'verifier-without-positive-control',
  title:'New verifier',
  body:'',
  patch:freshVerifier+freshMutant(['hardcoded-games','drop-game','no-recursion'],false),
  reason:/K7:.*положительного контроля/
 },
 // Unmodified honest cases for all three K7 classes.
 {
  name:'honest-environment-agnostic',
  title:'MCP new method',
  body:'',
  patch:diff('shared/approved/mcp.mjs',['-const apiVersion=1;','+const apiVersion=2;']),
  pass:true
 },
 {
  name:'honest-live-inventory',
  title:'MCP inventory',
  body:'',
  patch:diff('shared/approved/mcp.mjs',['-function listGames(){return oldRead();}','+function listGames(){return readCatalogFromModule();}']),
  pass:true
 },
 {
  name:'honest-new-verifier',
  title:'New verifier',
  body:'',
  patch:freshVerifier+freshMutant(['hardcoded-games','drop-game','no-recursion']),
  pass:true
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
 console.log('MUTATE_KONTUR_GUARD_PASS '+scenarios.filter(x=>!x.pass).length+' sabotage cases and '+scenarios.filter(x=>x.pass).length+' honest cases');
}finally{
 rmSync(workspace,{recursive:true,force:true});
}
