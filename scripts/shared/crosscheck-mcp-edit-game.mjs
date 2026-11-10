// Independent MG-builder-1 cross-review for FINISH M3/M5 (not the author's mutate file).
// Each mutation is applied to a temporary module; the original working tree is untouched.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../../',import.meta.url));
const moduleFile=join(root,'shared/approved/tools/edit-game.mjs');
const verifier=join(root,'scripts/shared/verify-mcp-edit-game.mjs');
const source=readFileSync(moduleFile,'utf8');

function verify(modulePath){
  const args=[verifier];
  if(modulePath)args.push('--edit-module',modulePath);
  const env={...process.env};
  delete env.GITHUB_TOKEN;
  delete env.GH_TOKEN;
  const run=spawnSync(process.execPath,args,{cwd:tmpdir(),env,encoding:'utf8',timeout:90000});
  if(run.error)throw run.error;
  return run;
}

const clean=verify();
assert.equal(clean.status,0,'Baseline check must pass:\n'+clean.stdout+'\n'+clean.stderr);
const mutations=[
  {
    name:'follow-symlink',
    before:"if(info.isSymbolicLink())throw Error('Symlink forbidden');",
    after:"if(false && info.isSymbolicLink())throw Error('Symlink forbidden');",
    signal:'symlink incorrect rejection'
  },
  {
    name:'allow-text-in-binary-extension',
    before:"if(denyBinary.test(file))throw Error('Binary files are forbidden');",
    after:"if(false && denyBinary.test(file))throw Error('Binary files are forbidden');",
    signal:'binary-extension incorrect rejection'
  },
  {
    name:'deception-whitelist-test-fixture-dirty-state',
    before:"if(!committedBytes.equals(onDisk))throw Error('Game file differs from HEAD; refuse uncommitted edits');",
    after:"if(!committedBytes.equals(onDisk) && !onDisk.toString('utf8').includes('Local variant'))throw Error('Game file differs from HEAD; refuse uncommitted edits');",
    signal:'Unexpected accepted dirty-worktree'
  }
];
for(const mutation of mutations){
  assert.equal(source.split(mutation.before).length,2,'Anchor missing/ambiguous: '+mutation.name);
  const dir=mkdtempSync(join(tmpdir(),'mg-builder1-cross-'));
  try{
    const copy=join(dir,'edit-game.mjs');
    writeFileSync(copy,source.replace(mutation.before,mutation.after));
    const result=verify(copy);
    assert.equal(result.status,1,mutation.name+' survived verifier\n'+result.stdout+'\n'+result.stderr);
    assert.ok(result.stderr.includes(mutation.signal),mutation.name+' failed for unrelated reason:\n'+result.stderr);
    console.log('CROSSCHECK_CAUGHT '+mutation.name);
  }finally{rmSync(dir,{recursive:true,force:true})}
}
console.log('M3_M5_CROSSCHECK_PASS 3 independent mutations, 1 fixture-dependent deception');