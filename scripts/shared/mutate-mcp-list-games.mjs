import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,unlinkSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../../',import.meta.url));
const mcpFile=join(root,'shared/approved/mcp.mjs');
const verifyFile=join(root,'scripts/shared/verify-mcp-list-games.mjs');
const source=readFileSync(mcpFile,'utf8');
const run=(args)=>spawnSync(process.execPath,[verifyFile,...args],{cwd:root,encoding:'utf8',timeout:30000});
const baseline=run([]);
assert.equal(baseline.status,0,'Unmodified MCP must pass first:\n'+baseline.stdout+baseline.stderr);

const mutations=[
 {name:'omit-game',expected:'games missing or extra',transform:text=>text.replace('return games;','return games.slice(1);')},
 {name:'wrong-url',expected:'URL mismatch',transform:text=>text.replace('https://mpaykin1.github.io/meta6/','https://mpaykin1.github.io/meta6-broken/')},
 {name:'hide-tool',expected:'tools/list missing list_games',transform:text=>text.replace(/^ \{name:'list_games'.*\}\r?\n/m,'')}
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
  unlinkSync(mutant);
 }
}
console.log('MCP_LIST_GAMES_MUTATION_PASS all three faults rejected');
