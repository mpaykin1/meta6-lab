#!/usr/bin/env node
// Deterministic index of exact, owner-approved original game components.
// Does not alter existing game sources.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const dir=path.join(root,'shared/components'),target=path.join(root,'shared/index.json');
const normalize=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'').replace(/\s+/g,' ');
const gitBlob=data=>crypto.createHash('sha1').update('blob '+data.length+'\0').update(data).digest('hex');
const components=[],seen=new Map();
function readRegularFile(file){
  const entry=fs.lstatSync(file);
  if(entry.isSymbolicLink()||!entry.isFile())throw Error('Unsafe component file: '+file);
  return fs.readFileSync(file);
}
if(fs.lstatSync(dir).isSymbolicLink())throw Error('Unsafe component directory: '+dir);
for(const id of fs.readdirSync(dir).sort()){
  if(!/^[a-z0-9-]+$/.test(id))throw Error('Invalid component ID '+id);
  const folder=path.join(dir,id);
  const folderType=fs.lstatSync(folder);
  if(folderType.isSymbolicLink()||!folderType.isDirectory())
    throw Error('Unexpected component entry '+id);
  // The owner-uploaded Pod i Nad library is adapted code, not a verbatim
  // original from meta6. Keep it outside the immutable-source passport index.
  if(id==='pod-i-nad') {
    const manifest=JSON.parse(readRegularFile(path.join(folder,'library.json')).toString('utf8'));
    const source='reference/sumerek-golden/pod-i-nad-68b2ecd3.html';
    if(manifest.id!==id || manifest.registry!=='derived-owner-reference' ||
       manifest.source?.repository!=='mpaykin1/meta6-lab' ||
       manifest.source.path!==source ||
       manifest.catalog!=='shared/asset-library/catalog.json' ||
       !/^[a-f0-9]{64}$/.test(manifest.source.sha256))
      throw Error('Invalid derived component provenance '+id);
    const digest=crypto.createHash('sha256').update(readRegularFile(path.join(root,source))).digest('hex');
    if(digest!==manifest.source.sha256)throw Error('Owner reference hash changed: '+id);
    continue;
  }
  const meta=JSON.parse(readRegularFile(path.join(folder,'component.json')).toString('utf8'));
  if(meta.id!==id || !/^[a-zA-Z0-9_.-]+\.js$/.test(meta.entry) ||
     meta.source?.repository!=='mpaykin1/meta6' || !/^[a-f0-9]{40}$/.test(meta.source.commit) ||
     !/^[a-f0-9]{40}$/.test(meta.source.git_blob_sha) ||
     meta.license!=='LicenseRef-Owner-Grant-META-GAMES-2026-11-06' ||
     !Array.isArray(meta.exports) || !meta.exports.length)
    throw Error('Invalid or unlicensed component passport '+id);
  const bytes=readRegularFile(path.join(folder,meta.entry));
  if(gitBlob(bytes)!==meta.source.git_blob_sha)
    throw Error('Source bytes drifted from pinned original: '+id);
  const normalizedSha=crypto.createHash('sha256').update(normalize(bytes.toString('utf8'))).digest('hex');
  if(seen.has(normalizedSha))throw Error('Duplicate content: '+seen.get(normalizedSha)+' / '+id);
  seen.set(normalizedSha,id);
  components.push(meta);
}
const output=JSON.stringify({schema_version:1,components},null,2)+'\n';
if(process.argv.includes('--check')){
  if(!fs.existsSync(target) || fs.readFileSync(target,'utf8')!==output)
    throw Error('shared/index.json missing or out of date');
}else fs.writeFileSync(target,output);
console.log(components.length+' verified, deduplicated owner-approved shared components');
