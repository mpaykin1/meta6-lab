import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const dir=mkdtempSync(join(tmpdir(),'three-worlds-build-'));
test('standalone index.html equals a fresh offline bundle byte for byte',()=>{
 const generated=join(dir,'index.html');
 try{
  const runner=fileURLToPath(new URL('../tools/build-offline.cjs',import.meta.url));
  const r=spawnSync(process.execPath,[runner],{env:{...process.env,THREE_WORLDS_OUTPUT:generated},timeout:40000,encoding:'utf8'});
  assert.equal(r.status,0,'npm ci in tools/ required; build failed: '+r.stdout+'\n'+r.stderr);
  const fresh=readFileSync(generated),checked=readFileSync(new URL('../index.html',import.meta.url));
  const sha=b=>createHash('sha256').update(b).digest('hex');
  assert.equal(sha(checked),sha(fresh),'index.html is stale; cd tools && npm ci && npm run build');
 }finally{rmSync(dir,{recursive:true,force:true})}
});
