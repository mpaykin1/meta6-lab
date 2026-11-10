import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {ROOT,rangeBytes} from './machine.mjs';
import {isOriginalGameSource,MIN_SYSTEM_LINES} from './source-policy.mjs';
import {linkedAssets} from './asset-links.mjs';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
export function verifyCatalog(root=ROOT){
 const file=path.join(root,'shared/library/catalog-solutions.json');
 const catalog=JSON.parse(fs.readFileSync(file,'utf8'));
 if(!Array.isArray(catalog.solutions)||catalog.solutions.length!==catalog.solution_count)throw Error('Invalid catalog count');
 const ids=new Set();
 const assetFile=path.join(root,'shared/library/index.json');
 const indexed=fs.existsSync(assetFile)?JSON.parse(fs.readFileSync(assetFile,'utf8')).entries||[]:null;
 const indexedById=new Map((indexed||[]).map(asset=>[asset.id,asset]));
 for(const s of catalog.solutions){
  if(!s.id||ids.has(s.id))throw Error('Duplicate solution');
  if(s.assembly_target==='main'||s.assembly_target==='refs/heads/main')throw Error('Assembly must never write to main');
  ids.add(s.id);
  if(!s.source_path||!s.source_path.startsWith('games/'+s.game+'/')&&!s.source_path.startsWith('observer-world-en-v7/')&&!s.source_path.startsWith('ashen-sumerek/')&&!s.source_path.startsWith('underwater-world/')&&!s.source_path.startsWith('three-worlds-game/')&&!s.source_path.startsWith('meta-games-worlds/veil-terraces/'))throw Error('Source not allowlisted');
  if(!Array.isArray(s.lines)||!s.lines.length)throw Error('Missing source ranges');
  let total=0;
  const chunks=[];
  for(const r of s.lines){
   if(!r.source_path||r.source_path.startsWith('/')||r.source_path.split('/').includes('..'))throw Error('Unsafe source path');
   const absolute=path.resolve(root,r.source_path);
   if(!absolute.startsWith(root+path.sep))throw Error('Path escaped root');
   const source=fs.readFileSync(absolute,'utf8');
   if(!isOriginalGameSource(r.source_path,source))throw Error('Vendor source: '+r.source_path);
   total+=r.end-r.start+1;
   chunks.push(rangeBytes(source,r.start,r.end));
  }
  if(total<MIN_SYSTEM_LINES)throw Error('Tiny function is not a system: '+s.id);
  if(sha(Buffer.concat(chunks))!==s.sha256)throw Error('Truncated or modified source: '+s.id);
  if(!s.how_to_connect?.entrypoint)throw Error('Missing entrypoint: '+s.id);
  if(s.load_ok===true&&!s.load_evidence?.chromium_run)throw Error('Unverified load_ok: '+s.id);
  if(!Array.isArray(s.depends_on))throw Error('Missing dependencies: '+s.id);
  if(!Array.isArray(s.asset_ids))throw Error('Missing asset_ids: '+s.id);
  if(s.standalone===false&&s.load_ok===true)throw Error('Non-standalone cannot load_ok: '+s.id);
  if(s.standalone===false&&!s.load_error)throw Error('Non-standalone must state precise reason: '+s.id);
  if(indexed){
   const expected=linkedAssets(Buffer.concat(chunks).toString('utf8'),s.game,indexed).ids;
   const actual=[...new Set(s.asset_ids)].sort();
   if(actual.length!==s.asset_ids.length)throw Error('Duplicate linked asset: '+s.id);
   for(const id of actual){
    const asset=indexedById.get(id);
    if(!asset||asset.kind==='solution'||asset.game!==s.game)throw Error('Invalid linked asset: '+s.id+' '+id);
   }
   if(JSON.stringify(actual)!==JSON.stringify(expected))
    throw Error('Referenced assets missing or invented for '+s.id+
     ': expected '+expected.join(',')+', got '+actual.join(','));
  }
 }
 if(catalog.load_evidence_type&&catalog.solutions.length>=3&&
  !catalog.solutions.some(s=>s.load_ok===true))
  throw Error('No real Chromium-loaded systems: all load_ok=false');
 for(const s of catalog.solutions)for(const d of s.depends_on)if(!ids.has(d))throw Error('Missing dependency '+d);
 return {systems:ids.size};
}
if(process.argv[1]&&path.resolve(process.argv[1])===new URL(import.meta.url).pathname){
 console.log(JSON.stringify(verifyCatalog()));
}
