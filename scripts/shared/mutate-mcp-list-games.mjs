import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../../',import.meta.url));
const mcpFile=join(root,'shared/approved/mcp.mjs');
const verifyFile=join(root,'scripts/shared/verify-mcp-list-games.mjs');
const source=readFileSync(mcpFile,'utf8');
const run=args=>spawnSync(process.execPath,[verifyFile,...args],{cwd:root,encoding:'utf8',timeout:30000});
const baseline=run([]);
assert.equal(baseline.status,0,'Unmodified MCP must pass first:\n'+baseline.stdout+baseline.stderr);

function replaceRequired(text,needle,replacement){
 assert.ok(text.includes(needle),'Mutation anchor not found: '+needle);
 return text.replace(needle,replacement);
}

// Capture the real MCP response before introducing a static array.
function currentGames(){
 const input=[
  {jsonrpc:'2.0',id:1,method:'initialize',params:{}},
  {jsonrpc:'2.0',id:2,method:'tools/call',params:{name:'list_games',arguments:{}}}
 ].map(message=>JSON.stringify(message)).join('\n')+'\n';
 const result=spawnSync(process.execPath,[mcpFile],{cwd:root,input,encoding:'utf8',timeout:10000});
 assert.equal(result.status,0,'Could not collect original list_games result: '+result.stderr);
 const replies=result.stdout.trim().split(/\r?\n/).map(line=>JSON.parse(line));
 const content=replies.find(reply=>reply.id===2)?.result?.content?.[0]?.text;
 assert.ok(content,'No list_games response for hardcode mutation');
 const games=JSON.parse(content);
 assert.ok(Array.isArray(games)&&games.length>0,'Cannot mutate an empty game catalogue');
 return games;
}

const hardcoded=currentGames();
const mutations=[
 {name:'omit-game',expected:'games missing or extra',transform:text=>replaceRequired(text,'return games;','return games.slice(1);')},
 {name:'wrong-url',expected:'URL mismatch',transform:text=>replaceRequired(text,'https://mpaykin1.github.io/meta6/','https://mpaykin1.github.io/meta6-broken/')},
 {name:'hide-tool',expected:'tools/list missing list_games',transform:text=>{
  const original=/^ \{name:'list_games'.*\}\r?\n/m;
  assert.match(text,original,'Tool definition not found');
  return text.replace(original,'');
 }},
 {name:'hardcoded-games',expected:'games missing or extra (live storefront)',transform:text=>{
  const original=/function listGames\(\)\{[\s\S]*?\n\}\n/;
  assert.match(text,original,'listGames() body not found');
  return text.replace(original,'function listGames(){\n return '+JSON.stringify(hardcoded)+';\n}\n');
 }},
 {name:'hide-unversioned-tool',expected:'tools/list missing list_games (unversioned)',transform:text=>{
  const withFlag=replaceRequired(text,'const defs=[','let legacyProbe=false;\nconst defs=[');
  const withInit=replaceRequired(withFlag,"if(msg.method==='initialize'){\n   answer(","if(msg.method==='initialize'){\n   legacyProbe=!msg.params?.protocolVersion;\n   answer(");
  return replaceRequired(withInit,"else if(msg.method==='tools/list')answer(msg.id,{tools:defs});","else if(msg.method==='tools/list')answer(msg.id,{tools:legacyProbe?defs.slice(0,4):defs});");
 }},
 {name:'cwd-dependent',expected:'MCP_LIST_GAMES_FAIL',transform:text=>replaceRequired(text,"new URL('../../meta-games/index.html',import.meta.url)","process.cwd()+'/meta-games/index.html'")}
];
for(const mutation of mutations){
 const damaged=mutation.transform(source);
 assert.notEqual(damaged,source,'Mutation not applied: '+mutation.name);
 const mutant=join(root,'shared/approved/.mcp-list-games-mutant-'+randomUUID()+'.mjs');
 try{
  writeFileSync(mutant,damaged,{flag:'wx'});
  const result=run(['--server',mutant]);
  assert.equal(result.status,1,'Mutation was not caught: '+mutation.name+'\n'+result.stdout+result.stderr);
  assert.ok(result.stderr.includes(mutation.expected),'Mutation failed for wrong reason: '+mutation.name+'\n'+result.stderr);
  console.log('MUTATION_CAUGHT '+mutation.name);
 }finally{
  rmSync(mutant,{force:true});
 }
}
console.log('MCP_LIST_GAMES_MUTATION_PASS all six faults rejected');
