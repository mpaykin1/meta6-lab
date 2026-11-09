import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ROOT} from './machine.mjs';

export function searchLibrary(filters={},root=ROOT){
  const {game,kind,purpose,q,limit=30,offset=0}=filters;
  if(!Number.isInteger(limit)||limit<1||limit>100||!Number.isInteger(offset)||offset<0)throw Error('limit 1..100, offset >= 0');
  const file=path.join(root,'shared/library/index.json');
  const index=JSON.parse(fs.readFileSync(file,'utf8'));
  const matches=index.entries.filter(entry=>{
    if(game&&entry.game!==game)return false;
    if(kind&&entry.kind!==kind)return false;
    if(purpose&&!entry.purpose.some(value=>value.toLowerCase().includes(purpose.toLowerCase())))return false;
    if(q&&!([entry.game,entry.kind,entry.name||'',entry.source_path,...entry.purpose].join(' ').toLowerCase().includes(q.toLowerCase())))return false;
    return true;
  });
  return {total:matches.length,offset,results:matches.slice(offset,offset+limit)};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const filters={};
    for(const arg of process.argv.slice(2)){
      const match=/^--?(game|kind|purpose|q|limit|offset)=(.*)$/.exec(arg);
      if(!match)throw Error('Usage: node scripts/library/search.mjs --game=... --kind=... --purpose=... --q=... --limit=30 --offset=0');
      filters[match[1]]=['limit','offset'].includes(match[1])?Number(match[2]):match[2];
    }
    console.log(JSON.stringify(searchLibrary(filters),null,2));
  }catch(error){console.error(error.stack||error);process.exitCode=1;}
}
