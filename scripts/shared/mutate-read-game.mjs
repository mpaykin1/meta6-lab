import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync,statSync,rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {join,relative,sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../../',import.meta.url));
const sourceFile=join(root,'shared/approved/mcp.mjs');
const verifier=join(root,'scripts/shared/verify-mcp-read-game.mjs');
const source=readFileSync(sourceFile,'utf8');
const verify=args=>spawnSync(process.execPath,[verifier,...args],{cwd:root,encoding:'utf8',timeout:90000});
const baseline=verify([]);
assert.equal(baseline.status,0,'M2 baseline failed:\n'+baseline.stdout+baseline.stderr);

function replaceRequired(source,needle,replacement){
 assert.ok(source.includes(needle),'Missing mutation anchor: '+needle);
 const result=source.replace(needle,replacement);
 assert.notEqual(result,source,'Mutation made no change');
 return result;
}
function queryOriginal(requests){
 const input=[
  {jsonrpc:'2.0',id:1,method:'initialize',params:{}},
  ...requests.map((request,index)=>({jsonrpc:'2.0',id:index+2,method:'tools/call',params:request}))
 ].map(x=>JSON.stringify(x)).join('\n')+'\n';
 const result=spawnSync(process.execPath,[sourceFile],{cwd:root,input,encoding:'utf8',timeout:20000});
 assert.equal(result.status,0,'Snapshot query failed: '+result.stderr);
 return result.stdout.trim().split(/\r?\n/).map(x=>JSON.parse(x)).filter(x=>x.id>1)
  .map(x=>{assert.ok(x.result?.content?.[0]?.text,'Bad snapshot response');return JSON.parse(x.result.content[0].text)});
}
function staticFileSnapshot(){
 const [games]=queryOriginal([{name:'list_games',arguments:{}}]);
 assert.ok(games.length>0,'No games for a hardcode deception');
 const [probe]=queryOriginal([{name:'list_game_files',arguments:{id:games[0].id}}]);
 assert.ok(probe.some(x=>x.file==='index.html'),'Snapshot missing index');
 // Capture a full valid response for each game before replacing the real implementation.
 const result=queryOriginal(games.map(game=>({name:'list_game_files',arguments:{id:game.id}})));
 return Object.fromEntries(games.map((game,i)=>[game.id,result[i]]));
}
const staticSnapshot=staticFileSnapshot();
const mutations=[
 {name:'no-dotdot-guard',expected:'unsafe-dotdot was accepted',transform:s=>
  replaceRequired(s,"file.includes('..')||","false||")},
 {name:'ignore-line-window',expected:'Index content mismatch',transform:s=>
  replaceRequired(s,"text:chunks.slice(start-1,start-1+count).join('')","text:chunks.join('')")},
 {name:'binary-as-text',expected:'binary marker was not rejected',transform:s=>
  replaceRequired(s,"if(binaryExtensions.has(ext))throw Error('binary: '+bytes+' bytes');",
   "if(false)throw Error('binary: '+bytes+' bytes');")},
 {name:'hardcoded-file-list',expected:'live file not discovered',transform:s=>{
  const target=/function listGameFiles\(id\)\{[\s\S]*?\n\}\n\nfunction checkedGameFile/;
  assert.match(s,target,'listGameFiles function not found');
  return s.replace(target,
   'function listGameFiles(id){\n gameDirectory(id);\n const snapshot='+JSON.stringify(staticSnapshot)+';\n return snapshot[id]||[];\n}\n\nfunction checkedGameFile');
 }},
 {name:'cwd-dependent',expected:'list_game_files call failed',transform:s=>
  replaceRequired(s,"const repositoryRoot=realpathSync(fileURLToPath(new URL('../../',import.meta.url)));",
   "const repositoryRoot=process.cwd();")}
];
for(const mutation of mutations){
 const damaged=mutation.transform(source);
 assert.notEqual(damaged,source,'No mutation: '+mutation.name);
 const mutant=join(root,'shared/approved/.mcp-read-game-mutant-'+randomUUID()+'.mjs');
 try{
  writeFileSync(mutant,damaged,{flag:'wx'});
  const result=verify(['--server',mutant]);
  assert.equal(result.status,1,'Mutation escaped verifier: '+mutation.name+'\n'+result.stdout+result.stderr);
  assert.ok(result.stderr.includes(mutation.expected),
   'Mutation failed for the wrong reason: '+mutation.name+'\n'+result.stdout+result.stderr);
  console.log('MUTATION_CAUGHT '+mutation.name);
 }finally{rmSync(mutant,{force:true})}
}
console.log('MCP_READ_GAME_MUTATION_PASS five faults including hardcoded list and cwd deception');
