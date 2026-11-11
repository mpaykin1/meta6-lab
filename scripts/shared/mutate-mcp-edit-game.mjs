// Four permanent faults (including the hardcoded-allowlist deception) must be caught by the verifier.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
const modulePath=join(root,'shared/approved/tools/edit-game.mjs');
const verifier=join(root,'scripts/shared/verify-mcp-edit-game.mjs');
const source=readFileSync(modulePath,'utf8');
function run(path){
 const args=[verifier];if(path)args.push('--edit-module',path);
 const env={...process.env};delete env.GITHUB_TOKEN;delete env.GH_TOKEN;
 return spawnSync(process.execPath,args,{cwd:root,env,encoding:'utf8',timeout:90000});
}
const baseline=run();
assert.equal(baseline.status,0,'M3/M5 baseline failed:\n'+baseline.stdout+baseline.stderr);
const mutations=[
 {name:'duplicate-occurrence',from:'if(occurrences!==1)',to:'if(false)',caught:'Unexpected accepted missing-old'},
 {name:'hardcoded-listed-games',from:'const games=listGames().filter(game=>game.id===id);',
  to:"const games=[{id,path:'games/'+id}];",caught:'Unexpected accepted allowlist-deception'},
 {name:'ignore-dirty-worktree',from:'if(!committedBytes.equals(onDisk))',
  to:'if(false && !committedBytes.equals(onDisk))',caught:'Unexpected accepted dirty-worktree'},
 {name:'wrong-repository-accepted',from:'if(!/^(?:https:',to:'if(false && !/^(?:https:',caught:'Unexpected accepted wrong-repository'}
];
for(const mutation of mutations){
 assert.ok(source.includes(mutation.from),'Missing mutation anchor '+mutation.name);
 const dir=mkdtempSync(join(tmpdir(),'mcp-edit-mutant-'));
 try{
  const file=join(dir,'edit-game.mjs');
  writeFileSync(file,source.replace(mutation.from,mutation.to));
  const result=run(file);
  assert.equal(result.status,1,'Mutation escaped '+mutation.name+'\n'+result.stdout+result.stderr);
  assert.ok(result.stderr.includes(mutation.caught),
   'Mutation failed for wrong reason '+mutation.name+'\n'+result.stdout+result.stderr);
  console.log('MUTATION_CAUGHT '+mutation.name);
 }finally{rmSync(dir,{recursive:true,force:true})}
}
console.log('MCP_EDIT_GAME_MUTATION_PASS four faults including hardcoded allowlist deception');
