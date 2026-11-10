import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {buildLibrary} from './machine.mjs';
import {makeFixture,verifyLibrary} from './verify-library.mjs';
const root=makeFixture();
try{
 buildLibrary(root);
 const extra=path.join(root,'shared/library/catalog-solutions.json');
 const sentinel='{"schema_version":1,"solutions":[]}\n';
 fs.writeFileSync(extra,sentinel);
 buildLibrary(root);
 assert.equal(fs.readFileSync(extra,'utf8'),sentinel,'Library reindex must preserve AI solution catalog');
 verifyLibrary(root,{live:false});
 const malicious=path.join(root,'shared/library/catalog-fake.json');
 fs.writeFileSync(malicious,sentinel);
 assert.throws(()=>verifyLibrary(root,{live:false}),/stale or missing manifest/,'Other unexpected manifest must be rejected');
 fs.rmSync(malicious);
 const gameManifest=path.join(root,'shared/library/base.json');
 fs.rmSync(gameManifest);
 assert.throws(()=>verifyLibrary(root,{live:false}),/stale or missing manifest/,'Missing real game manifest must still be rejected');
 console.log('CAUGHT catalog deletion and two deceptive manifest variants');
}finally{fs.rmSync(root,{recursive:true,force:true});}
