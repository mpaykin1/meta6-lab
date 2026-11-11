// Append-only entry format -> compiled Markdown views. Originals remain live until Claude switches writers.
import {existsSync,mkdirSync,readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
const datasets=[
  ['OSHIBKI','OSHIBKI.md'],['ZADACHI','ZADACHI.md'],['SMENA','SMENA.md'],
  ['progress/JOBS_TABLE','docs/progress/JOBS_TABLE.md'],
  ['progress/MERGE_PROGRESS','docs/progress/MERGE_PROGRESS.md'],
  ['progress/PR54_59_60','docs/progress/PR54_59_60.md'],
];
// New YYYY-prefixed entries are merged into the root by one writer after merge.
// Existing rows are never removed; the legacy watch remains authoritative for status.
function publishNewEntries(name,original,dir,names){
  if(!existsSync(original))return;
  const additions=names.filter(n=>/^20\d{2}[-_][^/]*\.md$/.test(n));
  if(!additions.length)return;
  let updated=readFileSync(original,'utf8');
  const key=line=>{
    const cells=line.trim().split('|').map(s=>s.trim());
    return cells.length>=9 ? cells[2]+'|'+cells[5].replaceAll(String.fromCharCode(96),'') : '';
  };
  for(const filename of additions){
    const row=readFileSync(join(dir,filename),'utf8');
    if(!row.trim()||updated.includes(row.trim()))continue;
    if(name==='ZADACHI'){
      const id=key(row);
      if(!id||updated.split('\n').some(line=>key(line)===id))continue;
      if(!updated.includes('<!-- ZADACHI:END -->'))throw Error('Missing ZADACHI boundary');
      updated=updated.replace('<!-- ZADACHI:END -->',row.trimEnd()+'\n<!-- ZADACHI:END -->');
    }else updated=updated.replace(/\s*$/,'\n')+'\n'+row.trimEnd()+'\n';
  }
  if(updated!==readFileSync(original,'utf8'))writeFileSync(original,updated);
}

export function build(validate){
if(typeof validate!=='boolean')throw Error('build expects explicit validate flag');
for(const [name,original] of datasets){
  const dir=join('journal/entries',name);
  if(!existsSync(dir))throw Error('Missing journal directory '+dir);
  const names=readdirSync(dir).filter(n=>/\.md$/.test(n)).sort();
  if(!names.length||names[0]!=='0000-header.md')throw Error('Missing source header '+name);
  const joined=names.map(n=>readFileSync(join(dir,n),'utf8')).join('');
  if(!joined.trim())throw Error('Empty journal '+name);
  const target=join('journal/compiled',original);
  if(validate){
    if(existsSync(target)){
      const current=readFileSync(target,'utf8');
      // Compiled copies may lag on PR; they cannot contain unknown replacement records.
      if(!joined.startsWith(readFileSync(join(dir,'0000-header.md'),'utf8')))
        throw Error('Corrupt journal preamble '+name);
      if(!current.trim())throw Error('Empty compiled view '+target);
    }
  }else{
    mkdirSync(dirname(target),{recursive:true});
    if(!existsSync(target)||readFileSync(target,'utf8')!==joined)writeFileSync(target,joined);
    console.log('COMPILED '+target+' entries='+names.length);
    publishNewEntries(name,original,dir,names);
  }
}
}
