// Search only owner-approved exact-source shared components.
// This deliberately excludes generated geometry and unverified source games.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const indexPath=path.join(root,'index.json');
const blobHash=buf=>crypto.createHash('sha1').update('blob '+buf.length+'\0').update(buf).digest('hex');
const safe=id=>typeof id==='string'&&/^[a-z0-9-]+$/.test(id);
export function approvedComponents(){
 const index=JSON.parse(fs.readFileSync(indexPath,'utf8'));
 if(index.schema_version!==1||!Array.isArray(index.components))throw Error('Unsupported approved source index');
 return index.components.map(item=>{
  if(!safe(item.id)||!item.source||item.source.repository!=='mpaykin1/meta6'||
   !/^[a-f0-9]{40}$/.test(item.source.git_blob_sha)||
   !/^[a-zA-Z0-9_.-]+\.js$/.test(item.entry)||
   item.license!=='LicenseRef-Owner-Grant-META-GAMES-2026-11-06')throw Error('Invalid component passport');
  const file=path.join(root,'components',item.id,item.entry);
  const bytes=fs.readFileSync(file);
  if(blobHash(bytes)!==item.source.git_blob_sha)throw Error('Original source drift '+item.id);
  return {...item,bytes:bytes.length,lines:bytes.toString('utf8').split(/\r?\n/).length};
 });
}
export function searchApproved(query,limit=6){
 const words=String(query||'').toLowerCase().split(/[^\p{L}\p{N}_]+/u).filter(x=>x.length>1).slice(0,8);
 if(!words.length)return [];
 const hits=[];
 for(const item of approvedComponents()){
  const file=path.join(root,'components',item.id,item.entry);
  const lines=fs.readFileSync(file,'utf8').split(/\r?\n/);
  const tags=[item.id,item.title,item.kind,...item.exports].join(' ').toLowerCase();
  let best=null;
  for(let i=0;i<lines.length;i++){
   const text=lines[i].toLowerCase();
   const score=words.reduce((sum,w)=>sum+(text.includes(w)?4:0)+(tags.includes(w)?2:0),0);
   if(score&&(!best||score>best.score))best={score,line:i+1,snippet:lines.slice(Math.max(0,i-1),Math.min(lines.length,i+2)).join('\n').slice(0,420)};
  }
  if(best)hits.push({id:item.id,source:item.source,entry:item.entry,...best});
 }
 return hits.sort((a,b)=>b.score-a.score).slice(0,Math.max(1,Math.min(20,Number(limit)||6)));
}
export function inspectApproved(id,start=1,count=25){
 const item=approvedComponents().find(x=>x.id===id);
 if(!item)throw Error('Not an owner-approved source');
 const lines=fs.readFileSync(path.join(root,'components',item.id,item.entry),'utf8').split(/\r?\n/);
 const from=Math.max(1,Math.min(lines.length,Math.trunc(Number(start)||1)));
 const size=Math.max(1,Math.min(60,Math.trunc(Number(count)||25)));
 return {id:item.id,source:item.source,lines:lines.slice(from-1,from+size-1).map((text,i)=>({line:from+i,text}))};
}

// Optional full-source retrieval for game assembly. Re-check the exact Git blob on EVERY call.
export function getApprovedSource(id){
 const component=approvedComponents().find(x=>x.id===id);
 if(!component)throw Error('Not an owner-approved source');
 const bytes=fs.readFileSync(path.join(root,'components',component.id,component.entry));
 if(bytes.length>64*1024)throw Error('Approved component exceeds full-source size limit');
 return {id:component.id,entry:component.entry,source:component.source,code:bytes.toString('utf8')};
}
