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
function checkParents(file){
  const relative=path.relative(root,file);
  if(!relative || relative==='..' || relative.startsWith('..'+path.sep) || path.isAbsolute(relative))
    throw Error('Unsafe component path: '+file);
  let parent=root;
  for(const segment of relative.split(path.sep).slice(0,-1)){
    parent=path.join(parent,segment);
    const entry=fs.lstatSync(parent);
    if(entry.isSymbolicLink()||!entry.isDirectory())
      throw Error('Unsafe component directory: '+parent);
  }
}
function readRegularFile(file){
  checkParents(file);
  const entry=fs.lstatSync(file);
  if(entry.isSymbolicLink()||!entry.isFile())throw Error('Unsafe component file: '+file);
  return fs.readFileSync(file);
}
checkParents(dir);
const dirType=fs.lstatSync(dir);
if(dirType.isSymbolicLink()||!dirType.isDirectory())throw Error('Unsafe component directory: '+dir);
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
  // External owners' code is admitted only with an explicit commercial MIT grant,
  // pinned original bytes for every module, and the unchanged license notice.
  // The existing owner-source branch below retains all of its original checks.
  if(id==='patch-pixelfx'){
    if(meta.id!==id || meta.registry!=='third-party-mit' ||
       meta.license!=='MIT' || meta.license_file!=='LICENSE' ||
       meta.entry!=='entry.js' ||
       meta.source?.repository!=='patch-gg/pixelfx' ||
       !/^[a-f0-9]{40}$/.test(meta.source.commit) ||
       !/^[a-f0-9]{40}$/.test(meta.source.git_blob_sha) ||
       !/^[a-f0-9]{40}$/.test(meta.source.adapter_blob_sha) ||
       !/^[a-f0-9]{40}$/.test(meta.source.license_git_blob_sha) ||
       !Array.isArray(meta.exports) || !meta.exports.length ||
       !Array.isArray(meta.effects) || meta.effects.length!==3 ||
       !Array.isArray(meta.source.files) || meta.source.files.length!==20)
      throw Error('Invalid external MIT component passport '+id);
    const license=readRegularFile(path.join(folder,'LICENSE'));
    if(gitBlob(license)!==meta.source.license_git_blob_sha ||
       !license.toString('utf8').includes('Permission is hereby granted') ||
       !license.toString('utf8').includes('Copyright (c) 2026 Hugo Duprez'))
      throw Error('External MIT notice changed '+id);
    const files=new Set();
    for(const file of meta.source.files){
      if(typeof file.path!=='string' ||
         !/^src\/(?:core|fx\/(?:fire|explosions|lightning))\/[a-z0-9_-]+\.js$/.test(file.path) ||
         !/^[a-f0-9]{40}$/.test(file.git_blob_sha) || files.has(file.path))
        throw Error('Invalid external source path or checksum '+id);
      files.add(file.path);
      const bytes=readRegularFile(path.join(folder,file.path));
      if(gitBlob(bytes)!==file.git_blob_sha)
        throw Error('External original bytes drifted: '+file.path);
      const code=bytes.toString('utf8');
      if(/\bimport\s*\(/.test(code))throw Error('Unexpected dynamic import: '+file.path);
      for(const match of code.matchAll(/(?:^|\n)\s*(?:import|export)\s+[^\n]*?from\s*["']([^"']+)["']/g)){
        if(!match[1].startsWith('.'))throw Error('External network/package import: '+file.path);
        const dep=path.posix.normalize(path.posix.join(path.posix.dirname(file.path),match[1]));
        if(!meta.source.files.some(other=>other.path===dep))
          throw Error('Unpinned external dependency '+file.path+' -> '+dep);
      }
    }
    if(meta.source.files.find(file=>file.path===meta.source.path)?.git_blob_sha!==meta.source.git_blob_sha ||
       gitBlob(readRegularFile(path.join(folder,meta.entry)))!==meta.source.adapter_blob_sha ||
       !meta.effects.every(effect=>files.has(effect)))
      throw Error('External entry/effects are not pinned '+id);
    components.push(meta);
    continue;
  }
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
checkParents(target);
const targetType=fs.lstatSync(target,{throwIfNoEntry:false});
if(targetType && (targetType.isSymbolicLink()||!targetType.isFile()))
  throw Error('Unsafe index target: '+target);
if(process.argv.includes('--check')){
  if(!targetType || readRegularFile(target).toString('utf8')!==output)
    throw Error('shared/index.json missing or out of date');
  // --check validates the security contract too; fixture subprocesses run in write mode.
  await import('./mutate-build-index-symlinks.mjs');
}else{
  const flags=fs.constants.O_WRONLY|fs.constants.O_CREAT|fs.constants.O_TRUNC|fs.constants.O_NOFOLLOW;
  const fd=fs.openSync(target,flags,0o644);
  try{fs.writeFileSync(fd,output);}finally{fs.closeSync(fd);}
}
console.log(components.length+' verified, deduplicated owner-approved shared components');
