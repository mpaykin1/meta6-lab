// Strict guard: only archived, byte-identical, generated *-copy manifests may leave shared/.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
const exists=(sha,p)=>{try{git('cat-file','-e',sha+':'+p);return true;}catch{return false;}};
export function classifyRemoval(p){
  if(!/^shared\\/library\\/[a-z0-9][a-z0-9-]*-copy\\.json$/.test(p))return null;
  const name=p.slice('shared/library/'.length,-'.json'.length);
  return {name,archive:'archive/library-duplicates-2026-11-10/'+name+'.json'};
}
export function validateGeneratedRemoval(p,{sameBlob,sourceExists,absentFromIndex,validManifest,archiveWasAbsent}){
  return !!classifyRemoval(p)&&sameBlob&&sourceExists&&absentFromIndex&&validManifest&&archiveWasAbsent;
}
export function check(base,head){
  if(!/^[0-9a-f]{40}$/.test(base)||!/^[0-9a-f]{40}$/.test(head))throw Error('Invalid SHA');
  if(!exists(base,'shared/index.json'))throw Error('Missing protected base shared/index.json');
  if(!exists(head,'shared/index.json'))throw Error('Missing protected head shared/index.json');
  const index=JSON.parse(git('show',head+':shared/library/index.json'));
  if(!Array.isArray(index.games)||!Array.isArray(index.entries))throw Error('Invalid library index');
  const removed=git('diff','--name-only','--diff-filter=D',base,head,'--','shared/').split('\\n').filter(Boolean);
  for(const p of removed){
    const item=classifyRemoval(p);
    let validManifest=false;
    if(item){
      try{
        const manifest=JSON.parse(git('show',base+':'+p));
        validManifest=manifest.game===item.name&&manifest.source_root==='games/'+item.name;
      }catch{}
    }
    const ok=!!item&&validateGeneratedRemoval(p,{
      sameBlob:!!item&&exists(head,item.archive)&&git('rev-parse',base+':'+p)===git('rev-parse',head+':'+item.archive),
      sourceExists:!!item&&exists(head,'games/'+item.name+'/index.html'),
      absentFromIndex:!!item&&!index.games.some(g=>g.game===item.name)&&!index.entries.some(e=>e.game===item.name),
      validManifest,
      archiveWasAbsent:!!item&&!exists(base,item.archive)
    });
    if(!ok)throw Error('Protected shared deletion rejected: '+p);
    console.log('Approved exact archival of generated duplicate: '+p);
  }
  console.log('Shared source protection PASS');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{check(process.argv[2],process.argv[3]);}catch(e){console.error(e.message);process.exitCode=1;}
}
